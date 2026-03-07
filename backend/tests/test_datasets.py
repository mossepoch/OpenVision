"""
数据集管理 API 测试
测试端点：/api/v1/datasets/
"""
import pytest
import shutil
from pathlib import Path
from fastapi.testclient import TestClient

# 测试用的 datasets 目录（和应用共用同一目录）
BACKEND_DIR = Path(__file__).parent.parent
DATASETS_DIR = BACKEND_DIR / "datasets"


@pytest.fixture(autouse=True)
def cleanup_test_datasets():
    """测试前后清理测试数据集"""
    test_names = ["test_ds", "test_ds_2", "test_ds_del", "test_img_ds", "test_labels_ds"]
    # cleanup before
    for name in test_names:
        p = DATASETS_DIR / name
        if p.exists():
            shutil.rmtree(p)
    yield
    # cleanup after
    for name in test_names:
        p = DATASETS_DIR / name
        if p.exists():
            shutil.rmtree(p)


class TestCreateDataset:
    """创建数据集测试"""

    def test_create_dataset(self, client: TestClient):
        """DS-001: 正常创建数据集"""
        response = client.post("/api/v1/datasets/", json={
            "name": "test_ds",
            "description": "测试数据集",
            "labels": ["person", "car"],
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "test_ds"
        assert data["description"] == "测试数据集"
        assert data["labels"] == ["person", "car"]
        assert data["image_count"] == 0
        assert data["label_count"] == 0

    def test_create_dataset_default_labels(self, client: TestClient):
        """DS-002: 默认标签"""
        response = client.post("/api/v1/datasets/", json={
            "name": "test_ds_2",
        })
        assert response.status_code == 200
        data = response.json()
        assert "person" in data["labels"]
        assert "fire" in data["labels"]

    def test_create_duplicate(self, client: TestClient):
        """DS-003: 重复创建"""
        client.post("/api/v1/datasets/", json={"name": "test_ds"})
        response = client.post("/api/v1/datasets/", json={"name": "test_ds"})
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


class TestListDatasets:
    """列出数据集测试"""

    def test_list_datasets(self, client: TestClient):
        """DS-101: 列出数据集"""
        client.post("/api/v1/datasets/", json={"name": "test_ds"})
        client.post("/api/v1/datasets/", json={"name": "test_ds_2"})

        response = client.get("/api/v1/datasets/")
        assert response.status_code == 200
        names = [d["name"] for d in response.json()]
        assert "test_ds" in names
        assert "test_ds_2" in names


class TestDeleteDataset:
    """删除数据集测试"""

    def test_delete_dataset(self, client: TestClient):
        """DS-201: 正常删除"""
        client.post("/api/v1/datasets/", json={"name": "test_ds_del"})
        response = client.delete("/api/v1/datasets/test_ds_del")
        assert response.status_code == 200
        assert "deleted" in response.json()["message"]

        # 确认删除
        ds_list = client.get("/api/v1/datasets/").json()
        names = [d["name"] for d in ds_list]
        assert "test_ds_del" not in names

    def test_delete_not_found(self, client: TestClient):
        """DS-202: 删除不存在的数据集"""
        response = client.delete("/api/v1/datasets/nonexistent")
        assert response.status_code == 404


class TestDatasetImages:
    """数据集图片上传测试"""

    def test_upload_image(self, client: TestClient):
        """DS-301: 上传图片"""
        client.post("/api/v1/datasets/", json={"name": "test_img_ds"})

        # 1x1 PNG
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82,
        ])
        files = {"file": ("test_image.png", png_data, "image/png")}
        response = client.post("/api/v1/datasets/test_img_ds/images", files=files)
        assert response.status_code == 200
        assert response.json()["filename"] == "test_image.png"

    def test_upload_to_nonexistent_dataset(self, client: TestClient):
        """DS-302: 上传到不存在的数据集"""
        files = {"file": ("img.png", b"\x89PNG", "image/png")}
        response = client.post("/api/v1/datasets/ghost_ds/images", files=files)
        assert response.status_code == 404

    def test_list_images(self, client: TestClient):
        """DS-303: 列出数据集图片"""
        client.post("/api/v1/datasets/", json={"name": "test_img_ds"})

        # 上传两张图
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82,
        ])
        for name in ["a.png", "b.png"]:
            files = {"file": (name, png_data, "image/png")}
            client.post("/api/v1/datasets/test_img_ds/images", files=files)

        response = client.get("/api/v1/datasets/test_img_ds/images")
        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 2
        filenames = [img["filename"] for img in data["images"]]
        assert "a.png" in filenames
        assert "b.png" in filenames

    def test_list_images_not_found(self, client: TestClient):
        """DS-304: 列出不存在数据集的图片"""
        response = client.get("/api/v1/datasets/ghost/images")
        assert response.status_code == 404


class TestDatasetLabels:
    """数据集标注测试"""

    def test_save_and_get_labels(self, client: TestClient):
        """DS-401: 保存并读取标注"""
        client.post("/api/v1/datasets/", json={"name": "test_labels_ds"})

        # 保存标注（格式2: {"labels": [...]}）
        labels = ["0 0.5 0.5 0.3 0.4", "1 0.2 0.8 0.1 0.15"]
        response = client.post("/api/v1/datasets/test_labels_ds/labels/image01.jpg", json={
            "labels": labels,
        })
        assert response.status_code == 200
        assert response.json()["count"] == 2

        # 读取标注
        response = client.get("/api/v1/datasets/test_labels_ds/labels/image01.jpg")
        assert response.status_code == 200
        assert response.json()["count"] == 2

    def test_save_labels_object_array(self, client: TestClient):
        """DS-403: 保存标注（YoloLabel 对象数组格式）"""
        client.post("/api/v1/datasets/", json={"name": "test_labels_ds"})

        yolo_labels = [
            {"class_id": 0, "cx": 0.5, "cy": 0.5, "w": 0.3, "h": 0.4},
            {"class_id": 1, "cx": 0.2, "cy": 0.8, "w": 0.1, "h": 0.15},
        ]
        response = client.post("/api/v1/datasets/test_labels_ds/labels/img02.jpg", json=yolo_labels)
        assert response.status_code == 200
        assert response.json()["count"] == 2

    def test_get_labels_empty(self, client: TestClient):
        """DS-402: 无标注返回空"""
        client.post("/api/v1/datasets/", json={"name": "test_labels_ds"})
        response = client.get("/api/v1/datasets/test_labels_ds/labels/nofile.jpg")
        assert response.status_code == 200
        assert response.json()["count"] == 0
