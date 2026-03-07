"""
摄像头流 API 测试
测试端点：/api/v1/stream/

注意: 这些测试会触发真实的 camera_service.connect()，
需要 RTSP 流可用，否则会 block。CI 环境跳过。
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.skipif(
    os.getenv("TESTING") == "1",
    reason="Stream tests require real RTSP camera, skipped in CI/TESTING mode"
)


class TestConnectCamera:
    """测试摄像头连接接口"""

    def test_connect_success(self, client: TestClient, test_device):
        """API-001: 正常连接摄像头"""
        response = client.post(f"/api/v1/stream/{test_device.id}/connect")
        
        assert response.status_code == 200
        data = response.json()
        assert "connecting" in data["message"]
        assert data["url"] == test_device.url

    def test_connect_device_not_found(self, client: TestClient):
        """API-002: 设备不存在"""
        response = client.post("/api/v1/stream/999/connect")
        
        assert response.status_code == 404

    def test_connect_inactive_device(self, client: TestClient, inactive_device):
        """API-003: 设备未激活"""
        response = client.post(f"/api/v1/stream/{inactive_device.id}/connect")
        
        assert response.status_code == 404

    def test_connect_with_custom_fps(self, client: TestClient, test_device):
        """API-005: 自定义 FPS 参数"""
        response = client.post(
            f"/api/v1/stream/{test_device.id}/connect",
            params={"target_fps": 20, "auto_connect": True}
        )
        
        assert response.status_code == 200

    def test_connect_duplicate(self, client: TestClient, test_device):
        """API-004: 重复连接"""
        # 第一次连接
        response1 = client.post(f"/api/v1/stream/{test_device.id}/connect")
        assert response1.status_code == 200
        
        # 第二次连接（应该先断开再连接）
        response2 = client.post(f"/api/v1/stream/{test_device.id}/connect")
        assert response2.status_code == 200


class TestDisconnectCamera:
    """测试摄像头断开接口"""

    def test_disconnect_success(self, client: TestClient, test_device):
        """API-101: 正常断开"""
        # 先连接
        client.post(f"/api/v1/stream/{test_device.id}/connect")
        
        # 再断开
        response = client.post(f"/api/v1/stream/{test_device.id}/disconnect")
        
        assert response.status_code == 200
        assert "disconnected" in response.json()["message"]

    def test_disconnect_not_connected(self, client: TestClient, test_device):
        """API-102: 未连接时断开"""
        response = client.post(f"/api/v1/stream/{test_device.id}/disconnect")
        
        # 应该优雅处理，不报错
        assert response.status_code == 200


class TestGetSnapshot:
    """测试快照接口"""

    def test_snapshot_not_connected(self, client: TestClient, test_device):
        """API-202: 未连接时获取快照"""
        response = client.get(f"/api/v1/stream/{test_device.id}/snapshot")
        
        assert response.status_code == 404

    # TODO: 需要 mock camera_service 来测试成功场景
    # def test_snapshot_success(self, client: TestClient, test_device):
    #     """API-201: 获取快照"""
    #     # 需要先 mock camera_service.get_snapshot 返回测试图像
    #     pass


class TestStreamStatus:
    """测试流状态接口"""

    def test_status_empty(self, client: TestClient):
        """API-301: 空状态"""
        response = client.get("/api/v1/stream/status")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)

    def test_status_fields(self, client: TestClient, test_device):
        """API-302: 状态字段完整性"""
        # 先连接
        client.post(f"/api/v1/stream/{test_device.id}/connect")
        
        response = client.get("/api/v1/stream/status")
        assert response.status_code == 200
        
        data = response.json()
        assert str(test_device.id) in data
        status = data[str(test_device.id)]
        
        # 检查必需字段
        assert "running" in status
        assert "has_frame" in status
        assert "last_ts" in status
        assert "retry_count" in status


class TestDeviceStatePersistence:
    """测试设备状态持久化"""

    def test_connect_updates_database(self, client: TestClient, db_session: Session, test_device):
        """RESTART-004: 连接后数据库状态更新"""
        response = client.post(
            f"/api/v1/stream/{test_device.id}/connect",
            params={"target_fps": 15, "auto_connect": True}
        )
        assert response.status_code == 200
        
        # 检查数据库
        db_session.refresh(test_device)
        assert test_device.status == "online"
        assert test_device.target_fps == 15
        assert test_device.auto_connect == True

    def test_disconnect_updates_database(self, client: TestClient, db_session: Session, test_device):
        """RESTART-004: 断开后数据库状态更新"""
        # 先连接
        client.post(
            f"/api/v1/stream/{test_device.id}/connect",
            params={"auto_connect": True}
        )
        
        # 再断开
        response = client.post(f"/api/v1/stream/{test_device.id}/disconnect")
        assert response.status_code == 200
        
        # 检查数据库
        db_session.refresh(test_device)
        assert test_device.status == "offline"
        assert test_device.auto_connect == False
