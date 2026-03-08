"""
告警管理 API 测试
测试端点：/api/v1/alerts/
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.device import Device


@pytest.fixture
def alert_device(db_session):
    """创建用于告警测试的设备"""
    device = Device(
        name="Alert Test Camera",
        protocol="rtsp",
        url="rtsp://localhost:8554/alert-test",
        is_active=True,
        status="online",
    )
    db_session.add(device)
    db_session.commit()
    db_session.refresh(device)
    return device


ALERT_PAYLOAD = {
    "alert_type": "intrusion",
    "severity": "high",
    "message": "检测到人员入侵，置信度：92.0%",
    "confidence": 0.92,
}


class TestCreateAlert:
    """创建告警测试"""

    def test_create_alert(self, client: TestClient, alert_device):
        """ALERT-A001: 正常创建告警"""
        payload = {**ALERT_PAYLOAD, "device_id": alert_device.id}
        response = client.post("/api/v1/alerts/", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["alert_type"] == "intrusion"
        assert data["severity"] == "high"
        assert data["device_id"] == alert_device.id
        assert data["is_read"] is False
        assert data["is_resolved"] is False
        assert "id" in data

    def test_create_alert_fire(self, client: TestClient, alert_device):
        """ALERT-A002: 创建火灾告警"""
        payload = {
            "device_id": alert_device.id,
            "alert_type": "fire",
            "severity": "critical",
            "message": "检测到火焰",
            "confidence": 0.78,
        }
        response = client.post("/api/v1/alerts/", json=payload)
        assert response.status_code == 200
        assert response.json()["severity"] == "critical"

    def test_create_alert_with_snapshot(self, client: TestClient, alert_device):
        """ALERT-A003: 带快照 URL 的告警"""
        payload = {
            "device_id": alert_device.id,
            "alert_type": "intrusion",
            "severity": "high",
            "snapshot_url": "/snapshots/alert_001.jpg",
        }
        response = client.post("/api/v1/alerts/", json=payload)
        assert response.status_code == 200
        assert response.json()["snapshot_url"] == "/snapshots/alert_001.jpg"

    def test_create_alert_default_severity(self, client: TestClient, alert_device):
        """ALERT-A004: 不指定 severity 使用默认值"""
        payload = {
            "device_id": alert_device.id,
            "alert_type": "behavior",
        }
        response = client.post("/api/v1/alerts/", json=payload)
        assert response.status_code == 200
        assert response.json()["severity"] == "medium"


class TestListAlerts:
    """告警列表测试"""

    def test_list_empty(self, client: TestClient):
        """ALERT-B001: 空列表"""
        response = client.get("/api/v1/alerts/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []

    def test_list_with_alerts(self, client: TestClient, alert_device):
        """ALERT-B002: 列出多个告警"""
        for i in range(3):
            client.post("/api/v1/alerts/", json={
                "device_id": alert_device.id,
                "alert_type": "intrusion",
                "severity": "high",
                "message": f"告警 {i}",
            })

        response = client.get("/api/v1/alerts/")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3

    def test_filter_by_device_id(self, client: TestClient, alert_device, db_session):
        """ALERT-B003: 按设备 ID 过滤"""
        # 创建第二个设备
        device2 = Device(name="Cam 2", protocol="rtsp", url="rtsp://x/2", is_active=True)
        db_session.add(device2)
        db_session.commit()
        db_session.refresh(device2)

        client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "intrusion",
        })
        client.post("/api/v1/alerts/", json={
            "device_id": device2.id, "alert_type": "fire",
        })

        response = client.get("/api/v1/alerts/", params={"device_id": alert_device.id})
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["device_id"] == alert_device.id

    def test_filter_by_is_read(self, client: TestClient, alert_device):
        """ALERT-B004: 按已读状态过滤"""
        resp = client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "intrusion",
        })
        alert_id = resp.json()["id"]
        # 标记第一个为已读
        client.put(f"/api/v1/alerts/{alert_id}/read")
        # 再创建一个未读的
        client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "fire",
        })

        # 只查未读
        unread = client.get("/api/v1/alerts/", params={"is_read": False}).json()
        assert unread["total"] == 1

        # 只查已读
        read = client.get("/api/v1/alerts/", params={"is_read": True}).json()
        assert read["total"] == 1

    def test_filter_by_severity(self, client: TestClient, alert_device):
        """ALERT-B005: 按严重程度过滤"""
        client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "intrusion", "severity": "high",
        })
        client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "fire", "severity": "critical",
        })

        response = client.get("/api/v1/alerts/", params={"severity": "critical"})
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["severity"] == "critical"

    def test_filter_by_alert_type(self, client: TestClient, alert_device):
        """ALERT-B006: 按告警类型过滤"""
        client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "intrusion",
        })
        client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "fire",
        })

        response = client.get("/api/v1/alerts/", params={"alert_type": "fire"})
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["alert_type"] == "fire"

    def test_list_pagination(self, client: TestClient, alert_device):
        """ALERT-B007: 分页"""
        for i in range(10):
            client.post("/api/v1/alerts/", json={
                "device_id": alert_device.id, "alert_type": "intrusion",
            })

        response = client.get("/api/v1/alerts/", params={"skip": 3, "limit": 4})
        data = response.json()
        assert data["total"] == 10
        assert len(data["items"]) == 4


class TestMarkRead:
    """标记已读测试"""

    def test_mark_read(self, client: TestClient, alert_device):
        """ALERT-C001: 正常标记已读"""
        resp = client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "intrusion",
        })
        alert_id = resp.json()["id"]

        response = client.put(f"/api/v1/alerts/{alert_id}/read")
        assert response.status_code == 200
        assert "已标记已读" in response.json()["message"]

    def test_mark_read_not_found(self, client: TestClient):
        """ALERT-C002: 告警不存在"""
        response = client.put("/api/v1/alerts/99999/read")
        assert response.status_code == 404


class TestResolveAlert:
    """标记已处理测试"""

    def test_resolve_alert(self, client: TestClient, alert_device):
        """ALERT-D001: 正常标记已处理"""
        resp = client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "fire", "severity": "critical",
        })
        alert_id = resp.json()["id"]

        response = client.put(f"/api/v1/alerts/{alert_id}/resolve")
        assert response.status_code == 200
        assert "已处理" in response.json()["message"]

    def test_resolve_not_found(self, client: TestClient):
        """ALERT-D002: 告警不存在"""
        response = client.put("/api/v1/alerts/99999/resolve")
        assert response.status_code == 404

    def test_resolve_sets_resolved_at(self, client: TestClient, alert_device, db_session):
        """ALERT-D003: 标记已处理设置 resolved_at"""
        from app.models.alert import Alert

        resp = client.post("/api/v1/alerts/", json={
            "device_id": alert_device.id, "alert_type": "intrusion",
        })
        alert_id = resp.json()["id"]

        client.put(f"/api/v1/alerts/{alert_id}/resolve")

        alert = db_session.query(Alert).filter(Alert.id == alert_id).first()
        assert alert.is_resolved is True
        assert alert.resolved_at is not None
