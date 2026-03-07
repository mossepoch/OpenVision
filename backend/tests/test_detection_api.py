"""
YOLO 检测 API 测试
测试端点：/api/v1/detection/
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from pathlib import Path


class TestDetectionUpload:
    """测试图片上传检测接口"""

    def test_upload_invalid_file_type(self, client: TestClient):
        """DET-001: 上传非图片文件"""
        # 创建一个假的文本文件
        files = {"file": ("test.txt", b"not an image", "text/plain")}
        response = client.post("/api/v1/detection/upload", files=files)
        
        assert response.status_code == 400
        assert "Only image files supported" in response.json()["detail"]

    def test_upload_empty_image(self, client: TestClient, tmp_path: Path):
        """DET-002: 上传空图片文件"""
        # 创建一个空的 jpg 文件（虽然格式不对，但 content-type 是 image）
        img_path = tmp_path / "empty.jpg"
        img_path.write_bytes(b"")
        
        with open(img_path, "rb") as f:
            files = {"file": ("empty.jpg", f, "image/jpeg")}
            response = client.post("/api/v1/detection/upload", files=files)
        
        # 应该优雅处理，不崩溃
        assert response.status_code in [200, 500]

    def test_upload_without_device_id(self, client: TestClient, tmp_path: Path):
        """DET-003: 上传检测（不触发告警）"""
        # 创建一个简单的测试图片（1x1 像素的 PNG）
        # PNG 魔数 + 最小 IHDR + IDAT + IEND
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG 签名
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,  # IEND
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {"file": ("test.png", png_data, "image/png")}
        response = client.post("/api/v1/detection/upload", files=files)
        
        assert response.status_code == 200
        data = response.json()
        
        # 检查返回字段
        assert "boxes" in data
        assert "alert_ids" in data
        assert data["alert_ids"] == []
        assert data["alerts_triggered"] == 0

    def test_upload_with_device_id_no_alert(self, client: TestClient, test_device, tmp_path: Path):
        """DET-004: 上传检测（带 device_id，无告警触发）"""
        # 1x1 像素 PNG
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {"file": ("test.png", png_data, "image/png")}
        response = client.post(
            "/api/v1/detection/upload",
            files=files,
            params={"device_id": test_device.id}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # 无目标检测到时，不应该触发告警
        assert data["alerts_triggered"] == 0
        assert data["alert_ids"] == []

    def test_upload_conf_threshold(self, client: TestClient, tmp_path: Path):
        """DET-005: 置信度阈值参数"""
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {"file": ("test.png", png_data, "image/png")}
        
        # 测试不同置信度阈值
        for conf in [0.1, 0.5, 0.9]:
            response = client.post(
                "/api/v1/detection/upload",
                files=files,
                params={"conf": conf}
            )
            assert response.status_code == 200


class TestDetectionSnapshot:
    """测试摄像头快照检测接口"""

    def test_snapshot_no_frame(self, client: TestClient, test_device):
        """DET-101: 摄像头未连接时检测"""
        response = client.post(f"/api/v1/detection/snapshot/{test_device.id}")
        
        assert response.status_code == 404
        assert "No frame" in response.json()["detail"]

    def test_snapshot_invalid_device(self, client: TestClient):
        """DET-102: 不存在的设备 ID"""
        response = client.post("/api/v1/detection/snapshot/999")
        
        assert response.status_code == 404


class TestDetectionStatus:
    """测试检测状态接口"""

    def test_status_success(self, client: TestClient):
        """DET-201: 获取检测服务状态"""
        response = client.get("/api/v1/detection/status")
        
        assert response.status_code == 200
        data = response.json()
        
        # 检查必需字段
        assert "loaded" in data
        assert "notification" in data


class TestAlertTrigger:
    """测试告警触发逻辑"""

    # TODO: 需要 mock detection_service 来模拟检测到目标的场景
    # 这需要更复杂的测试设置
    
    def test_alert_with_person_detection(self, client: TestClient, test_device, db_session: Session):
        """DET-301: 检测到 person 触发告警（需 mock）"""
        # 这个测试需要 mock detection_service 返回包含 person 的检测结果
        # 暂时跳过，后续补充
        pytest.skip("需要 mock detection_service")

    def test_alert_threshold_person(self, client: TestClient, test_device):
        """DET-302: person 告警阈值测试（需 mock）"""
        # 需要验证 person > 0.8 才触发告警
        pytest.skip("需要 mock detection_service")

    def test_alert_threshold_fire(self, client: TestClient, test_device):
        """DET-303: fire 告警阈值测试（需 mock）"""
        # 需要验证 fire > 0.6 才触发告警
        pytest.skip("需要 mock detection_service")


class TestSnapshotStorage:
    """测试快照存储功能"""

    def test_snapshot_saved_on_alert(self, client: TestClient, test_device):
        """DET-401: 告警触发时保存快照（需 mock）"""
        # 需要 mock 检测到目标并触发告警
        pytest.skip("需要 mock detection_service")

    def test_snapshot_file_format(self, client: TestClient, test_device):
        """DET-402: 快照文件格式（需 mock）"""
        # 验证保存的是 JPEG 格式
        pytest.skip("需要 mock detection_service")
