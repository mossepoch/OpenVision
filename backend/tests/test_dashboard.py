"""
Dashboard 统计 API 测试
测试端点：/api/v1/dashboard/
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.device import Device
from app.models.alert import Alert


class TestDashboardEmpty:
    """空数据 Dashboard 测试"""

    def test_dashboard_empty(self, client: TestClient):
        """DASH-001: 无设备无告警"""
        response = client.get("/api/v1/dashboard/")
        assert response.status_code == 200
        data = response.json()

        assert data["devices"]["total"] == 0
        assert data["devices"]["online"] == 0
        assert data["devices"]["offline"] == 0
        assert data["alerts"]["total"] == 0
        assert data["alerts"]["unread"] == 0
        assert data["alerts"]["critical"] == 0
        assert data["alerts"]["resolved"] == 0
        assert data["compliance_rate"] == 100.0
        assert data["running_detections"] == 0
        assert data["recent_alerts"] == []


class TestDashboardDeviceStats:
    """设备统计测试"""

    def test_device_counts(self, client: TestClient, db_session):
        """DASH-101: 设备总数/在线/离线统计"""
        # 创建 3 个设备：2 在线 1 离线
        for name, status in [("Cam1", "online"), ("Cam2", "online"), ("Cam3", "offline")]:
            d = Device(name=name, protocol="rtsp", url=f"rtsp://x/{name}",
                       is_active=True, status=status)
            db_session.add(d)
        db_session.commit()

        response = client.get("/api/v1/dashboard/")
        data = response.json()

        assert data["devices"]["total"] == 3
        assert data["devices"]["online"] == 2
        assert data["devices"]["offline"] == 1
        assert data["devices"]["online_rate"] == round(2 / 3 * 100, 1)

    def test_excludes_inactive_devices(self, client: TestClient, db_session):
        """DASH-102: 不统计已删除设备"""
        d1 = Device(name="Active", protocol="rtsp", url="rtsp://x/1",
                     is_active=True, status="online")
        d2 = Device(name="Deleted", protocol="rtsp", url="rtsp://x/2",
                     is_active=False, status="online")
        db_session.add_all([d1, d2])
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()
        assert data["devices"]["total"] == 1

    def test_running_detections(self, client: TestClient, db_session):
        """DASH-103: 正在检测的设备数"""
        d1 = Device(name="Detecting", protocol="rtsp", url="rtsp://x/1",
                     is_active=True, status="online", detection_enabled=True)
        d2 = Device(name="Not detecting", protocol="rtsp", url="rtsp://x/2",
                     is_active=True, status="online", detection_enabled=False)
        d3 = Device(name="Offline detecting", protocol="rtsp", url="rtsp://x/3",
                     is_active=True, status="offline", detection_enabled=True)
        db_session.add_all([d1, d2, d3])
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()
        # 只有在线 + 开启检测的才算
        assert data["running_detections"] == 1


class TestDashboardAlertStats:
    """告警统计测试"""

    def test_alert_counts(self, client: TestClient, db_session):
        """DASH-201: 告警总数/未读/已处理统计"""
        device = Device(name="D1", protocol="rtsp", url="rtsp://x/1",
                        is_active=True, status="online")
        db_session.add(device)
        db_session.commit()
        db_session.refresh(device)

        # 创建告警：1 未读未处理，1 已读未处理，1 已读已处理
        a1 = Alert(device_id=device.id, alert_type="intrusion", severity="high",
                    is_read=False, is_resolved=False)
        a2 = Alert(device_id=device.id, alert_type="fire", severity="critical",
                    is_read=True, is_resolved=False)
        a3 = Alert(device_id=device.id, alert_type="vehicle", severity="medium",
                    is_read=True, is_resolved=True)
        db_session.add_all([a1, a2, a3])
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()

        assert data["alerts"]["total"] == 3
        assert data["alerts"]["unread"] == 1
        assert data["alerts"]["resolved"] == 1

    def test_critical_unresolved(self, client: TestClient, db_session):
        """DASH-202: 未处理的 critical 告警数"""
        device = Device(name="D1", protocol="rtsp", url="rtsp://x/1",
                        is_active=True, status="online")
        db_session.add(device)
        db_session.commit()
        db_session.refresh(device)

        a1 = Alert(device_id=device.id, alert_type="fire", severity="critical",
                    is_resolved=False)
        a2 = Alert(device_id=device.id, alert_type="fire", severity="critical",
                    is_resolved=True)  # 已处理的 critical 不计入
        a3 = Alert(device_id=device.id, alert_type="intrusion", severity="high",
                    is_resolved=False)  # 非 critical
        db_session.add_all([a1, a2, a3])
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()
        assert data["alerts"]["critical"] == 1

    def test_compliance_rate(self, client: TestClient, db_session):
        """DASH-203: 合规率计算"""
        device = Device(name="D1", protocol="rtsp", url="rtsp://x/1",
                        is_active=True, status="online")
        db_session.add(device)
        db_session.commit()
        db_session.refresh(device)

        # 4 个告警，3 个已处理 → 75%
        for i in range(4):
            a = Alert(device_id=device.id, alert_type="intrusion", severity="medium",
                      is_resolved=(i < 3))
            db_session.add(a)
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()
        assert data["compliance_rate"] == 75.0

    def test_recent_alerts_limit(self, client: TestClient, db_session):
        """DASH-204: 最近告警最多 5 条"""
        device = Device(name="D1", protocol="rtsp", url="rtsp://x/1",
                        is_active=True, status="online")
        db_session.add(device)
        db_session.commit()
        db_session.refresh(device)

        for i in range(10):
            a = Alert(device_id=device.id, alert_type="intrusion", severity="high",
                      message=f"Alert {i}")
            db_session.add(a)
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()
        assert len(data["recent_alerts"]) == 5

    def test_recent_alerts_fields(self, client: TestClient, db_session):
        """DASH-205: 最近告警字段完整"""
        device = Device(name="D1", protocol="rtsp", url="rtsp://x/1",
                        is_active=True, status="online")
        db_session.add(device)
        db_session.commit()
        db_session.refresh(device)

        a = Alert(device_id=device.id, alert_type="fire", severity="critical",
                  message="着火了")
        db_session.add(a)
        db_session.commit()

        data = client.get("/api/v1/dashboard/").json()
        alert = data["recent_alerts"][0]
        assert "id" in alert
        assert "device_id" in alert
        assert "alert_type" in alert
        assert "severity" in alert
        assert "message" in alert
        assert "created_at" in alert
