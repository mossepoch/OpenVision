"""
统计报表 API 测试
测试端点：/api/v1/reports/
"""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.alert import Alert


@pytest.fixture
def report_device(db_session):
    """创建报表测试设备"""
    device = Device(
        name="Report Cam",
        protocol="rtsp",
        url="rtsp://localhost/report",
        is_active=True,
        status="online",
    )
    db_session.add(device)
    db_session.commit()
    db_session.refresh(device)
    return device


class TestReportSummary:
    """告警统计摘要测试"""

    def test_summary_empty(self, client: TestClient):
        """RPT-001: 无数据时的摘要"""
        response = client.get("/api/v1/reports/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["resolved"] == 0
        assert data["pending"] == 0
        assert data["unread"] == 0
        assert data["compliance_rate"] == 100.0
        assert data["by_type"] == {}
        assert data["by_severity"] == {}

    def test_summary_with_alerts(self, client: TestClient, report_device, db_session):
        """RPT-002: 有数据时的摘要"""
        now = datetime.now()
        alerts = [
            Alert(device_id=report_device.id, alert_type="intrusion", severity="high",
                  is_read=False, is_resolved=False, created_at=now),
            Alert(device_id=report_device.id, alert_type="fire", severity="critical",
                  is_read=True, is_resolved=True, created_at=now),
            Alert(device_id=report_device.id, alert_type="intrusion", severity="medium",
                  is_read=True, is_resolved=False, created_at=now),
        ]
        db_session.add_all(alerts)
        db_session.commit()

        data = client.get("/api/v1/reports/summary").json()
        assert data["total"] == 3
        assert data["resolved"] == 1
        assert data["pending"] == 2
        assert data["unread"] == 1
        assert data["by_type"]["intrusion"] == 2
        assert data["by_type"]["fire"] == 1
        assert data["by_severity"]["high"] == 1
        assert data["by_severity"]["critical"] == 1
        assert data["by_severity"]["medium"] == 1

    def test_summary_range_today(self, client: TestClient, report_device, db_session):
        """RPT-003: 只统计今天的告警"""
        now = datetime.now()
        yesterday = now - timedelta(days=2)

        a_today = Alert(device_id=report_device.id, alert_type="intrusion",
                        severity="high", created_at=now)
        a_old = Alert(device_id=report_device.id, alert_type="fire",
                      severity="critical", created_at=yesterday)
        db_session.add_all([a_today, a_old])
        db_session.commit()

        data = client.get("/api/v1/reports/summary", params={"range": "today"}).json()
        assert data["total"] == 1

    def test_summary_range_week(self, client: TestClient, report_device, db_session):
        """RPT-004: 统计最近一周"""
        now = datetime.now()
        alerts = [
            Alert(device_id=report_device.id, alert_type="intrusion",
                  severity="high", created_at=now - timedelta(days=i))
            for i in range(10)
        ]
        db_session.add_all(alerts)
        db_session.commit()

        data = client.get("/api/v1/reports/summary", params={"range": "week"}).json()
        # timedelta(days=7) 覆盖最近 7 天，即 day 0-6，共 7 条
        # day 7/8/9 超出范围
        assert data["total"] == 7

    def test_summary_compliance_rate(self, client: TestClient, report_device, db_session):
        """RPT-005: 合规率计算"""
        now = datetime.now()
        for i in range(5):
            a = Alert(device_id=report_device.id, alert_type="intrusion",
                      severity="medium", is_resolved=(i < 2), created_at=now)
            db_session.add(a)
        db_session.commit()

        data = client.get("/api/v1/reports/summary").json()
        assert data["compliance_rate"] == 40.0


class TestReportTrend:
    """告警趋势测试"""

    def test_trend_default_7days(self, client: TestClient):
        """RPT-101: 默认 7 天趋势"""
        response = client.get("/api/v1/reports/trend")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 7
        assert "date" in data[0]
        assert "count" in data[0]

    def test_trend_custom_days(self, client: TestClient):
        """RPT-102: 自定义天数"""
        response = client.get("/api/v1/reports/trend", params={"days": 3})
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_trend_with_data(self, client: TestClient, report_device, db_session):
        """RPT-103: 有数据时的趋势"""
        now = datetime.now()
        # 今天创建 3 条告警
        for _ in range(3):
            a = Alert(device_id=report_device.id, alert_type="intrusion",
                      severity="high", created_at=now)
            db_session.add(a)
        db_session.commit()

        data = client.get("/api/v1/reports/trend", params={"days": 1}).json()
        assert len(data) == 1
        assert data[0]["count"] == 3


class TestDeviceStats:
    """设备告警统计测试"""

    def test_device_stats_empty(self, client: TestClient):
        """RPT-201: 无设备"""
        response = client.get("/api/v1/reports/device-stats")
        assert response.status_code == 200
        assert response.json() == []

    def test_device_stats_with_data(self, client: TestClient, report_device, db_session):
        """RPT-202: 设备告警统计"""
        for _ in range(5):
            a = Alert(device_id=report_device.id, alert_type="intrusion", severity="high")
            db_session.add(a)
        db_session.commit()

        data = client.get("/api/v1/reports/device-stats").json()
        assert len(data) >= 1
        cam = next(d for d in data if d["device"] == "Report Cam")
        assert cam["alert_count"] == 5

    def test_device_stats_no_alerts(self, client: TestClient, db_session):
        """RPT-203: 设备无告警"""
        device = Device(name="Silent Cam", protocol="rtsp", url="rtsp://x/silent",
                        is_active=True, status="online")
        db_session.add(device)
        db_session.commit()

        data = client.get("/api/v1/reports/device-stats").json()
        cam = next(d for d in data if d["device"] == "Silent Cam")
        assert cam["alert_count"] == 0
