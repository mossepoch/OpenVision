"""
设备管理 API 测试
测试端点：/api/v1/devices/
"""
import pytest
from fastapi.testclient import TestClient


DEVICE_PAYLOAD = {
    "name": "测试摄像头",
    "protocol": "rtsp",
    "url": "rtsp://192.168.1.100:554/stream",
    "location": "大门口",
    "detection_enabled": False,
    "confidence_threshold": 0.5,
    "target_fps": 10,
    "auto_connect": False,
}


class TestCreateDevice:
    """创建设备测试"""

    def test_create_device(self, client: TestClient):
        """DEV-001: 正常创建设备"""
        response = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "测试摄像头"
        assert data["protocol"] == "rtsp"
        assert data["url"] == DEVICE_PAYLOAD["url"]
        assert data["is_active"] is True
        assert data["status"] == "offline"
        assert "id" in data

    def test_create_device_minimal(self, client: TestClient):
        """DEV-002: 最小必填字段创建"""
        response = client.post("/api/v1/devices/", json={
            "name": "简易摄像头",
            "protocol": "http-flv",
            "url": "http://localhost:8080/live",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "简易摄像头"
        assert data["confidence_threshold"] == 0.5  # 默认值

    def test_create_device_with_credentials(self, client: TestClient):
        """DEV-003: 带认证信息创建"""
        response = client.post("/api/v1/devices/", json={
            "name": "带密码摄像头",
            "protocol": "rtsp",
            "url": "rtsp://192.168.1.50:554/cam",
            "username": "admin",
            "password": "secret123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "admin"
        assert data["password"] == "secret123"

    def test_create_device_missing_name(self, client: TestClient):
        """DEV-004: 缺少必填字段 name"""
        response = client.post("/api/v1/devices/", json={
            "protocol": "rtsp",
            "url": "rtsp://localhost/stream",
        })
        assert response.status_code == 422

    def test_create_device_missing_protocol(self, client: TestClient):
        """DEV-005: 缺少必填字段 protocol"""
        response = client.post("/api/v1/devices/", json={
            "name": "No protocol",
            "url": "rtsp://localhost/stream",
        })
        assert response.status_code == 422

    def test_create_device_missing_url(self, client: TestClient):
        """DEV-006: 缺少必填字段 url"""
        response = client.post("/api/v1/devices/", json={
            "name": "No url",
            "protocol": "rtsp",
        })
        assert response.status_code == 422


class TestListDevices:
    """设备列表测试"""

    def test_list_empty(self, client: TestClient):
        """DEV-101: 空列表"""
        response = client.get("/api/v1/devices/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_with_devices(self, client: TestClient):
        """DEV-102: 列出多个设备"""
        client.post("/api/v1/devices/", json={**DEVICE_PAYLOAD, "name": "Camera 1"})
        client.post("/api/v1/devices/", json={**DEVICE_PAYLOAD, "name": "Camera 2"})
        client.post("/api/v1/devices/", json={**DEVICE_PAYLOAD, "name": "Camera 3"})

        response = client.get("/api/v1/devices/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        names = [d["name"] for d in data]
        assert "Camera 1" in names
        assert "Camera 2" in names
        assert "Camera 3" in names

    def test_list_excludes_deleted(self, client: TestClient):
        """DEV-103: 已删除设备不在列表中"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]
        client.delete(f"/api/v1/devices/{device_id}")

        response = client.get("/api/v1/devices/")
        assert response.status_code == 200
        assert len(response.json()) == 0

    def test_list_pagination(self, client: TestClient):
        """DEV-104: 分页参数"""
        for i in range(5):
            client.post("/api/v1/devices/", json={**DEVICE_PAYLOAD, "name": f"Cam {i}"})

        response = client.get("/api/v1/devices/", params={"skip": 2, "limit": 2})
        assert response.status_code == 200
        assert len(response.json()) == 2


class TestGetDevice:
    """获取单个设备测试"""

    def test_get_device(self, client: TestClient):
        """DEV-201: 获取存在的设备"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]

        response = client.get(f"/api/v1/devices/{device_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "测试摄像头"
        assert response.json()["id"] == device_id

    def test_get_device_not_found(self, client: TestClient):
        """DEV-202: 设备不存在"""
        response = client.get("/api/v1/devices/99999")
        assert response.status_code == 404
        assert "设备不存在" in response.json()["detail"]


class TestUpdateDevice:
    """更新设备测试"""

    def test_update_name(self, client: TestClient):
        """DEV-301: 更新设备名称"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]

        response = client.put(f"/api/v1/devices/{device_id}", json={
            "name": "新名称",
        })
        assert response.status_code == 200
        assert response.json()["name"] == "新名称"
        # 其他字段不变
        assert response.json()["protocol"] == "rtsp"

    def test_update_detection_config(self, client: TestClient):
        """DEV-302: 更新检测配置"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]

        response = client.put(f"/api/v1/devices/{device_id}", json={
            "detection_enabled": True,
            "confidence_threshold": 0.8,
        })
        assert response.status_code == 200
        assert response.json()["detection_enabled"] is True
        assert response.json()["confidence_threshold"] == 0.8

    def test_update_partial(self, client: TestClient):
        """DEV-303: 部分更新（只传一个字段）"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]

        response = client.put(f"/api/v1/devices/{device_id}", json={
            "location": "后门",
        })
        assert response.status_code == 200
        assert response.json()["location"] == "后门"
        assert response.json()["name"] == "测试摄像头"  # 未修改

    def test_update_not_found(self, client: TestClient):
        """DEV-304: 更新不存在的设备"""
        response = client.put("/api/v1/devices/99999", json={"name": "Ghost"})
        assert response.status_code == 404


class TestDeleteDevice:
    """删除设备测试"""

    def test_delete_device(self, client: TestClient):
        """DEV-401: 正常删除（软删除）"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]

        response = client.delete(f"/api/v1/devices/{device_id}")
        assert response.status_code == 200
        assert "已删除" in response.json()["message"]

        # 确认从列表消失
        list_resp = client.get("/api/v1/devices/")
        ids = [d["id"] for d in list_resp.json()]
        assert device_id not in ids

    def test_delete_still_accessible_by_id(self, client: TestClient):
        """DEV-402: 软删除后仍可通过 ID 访问"""
        resp = client.post("/api/v1/devices/", json=DEVICE_PAYLOAD)
        device_id = resp.json()["id"]

        client.delete(f"/api/v1/devices/{device_id}")

        # 直接访问仍然存在（is_active=False 但记录还在）
        response = client.get(f"/api/v1/devices/{device_id}")
        assert response.status_code == 200
        assert response.json()["is_active"] is False

    def test_delete_not_found(self, client: TestClient):
        """DEV-403: 删除不存在的设备"""
        response = client.delete("/api/v1/devices/99999")
        assert response.status_code == 404
