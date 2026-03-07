"""
模型训练 API 测试
测试端点：/api/v1/training/
"""
import pytest
from fastapi.testclient import TestClient


class TestTrainingJobs:
    """训练任务测试"""

    def test_list_jobs_empty(self, client: TestClient):
        """TRAIN-001: 空任务列表"""
        response = client.get("/api/v1/training/jobs")
        assert response.status_code == 200
        assert response.json() == []

    def test_start_training_invalid_dataset(self, client: TestClient):
        """TRAIN-002: 不存在的数据集"""
        response = client.post("/api/v1/training/train", json={
            "dataset_name": "nonexistent_dataset",
            "epochs": 1,
            "job_name": "test_invalid_job",
        })
        # 任务会创建但最终状态为 failed
        assert response.status_code == 200
        data = response.json()
        assert data["job_id"] == "test_invalid_job"
        assert data["status"] in ["pending", "running"]

    def test_get_job(self, client: TestClient):
        """TRAIN-003: 查询任务状态"""
        client.post("/api/v1/training/train", json={
            "dataset_name": "ghost",
            "epochs": 1,
            "job_name": "status_check_job",
        })

        response = client.get("/api/v1/training/jobs/status_check_job")
        assert response.status_code == 200
        data = response.json()
        assert data["job_id"] == "status_check_job"
        assert data["dataset"] == "ghost"
        assert "status" in data

    def test_get_job_not_found(self, client: TestClient):
        """TRAIN-004: 查询不存在的任务"""
        response = client.get("/api/v1/training/jobs/nonexistent")
        assert response.status_code == 404

    def test_delete_job(self, client: TestClient):
        """TRAIN-005: 删除任务"""
        import time
        client.post("/api/v1/training/train", json={
            "dataset_name": "ghost",
            "epochs": 1,
            "job_name": "delete_me_job",
        })

        # 等待任务结束（数据集不存在会快速 fail）
        for _ in range(10):
            time.sleep(0.5)
            status = client.get("/api/v1/training/jobs/delete_me_job").json()["status"]
            if status in ("done", "failed"):
                break

        response = client.delete("/api/v1/training/jobs/delete_me_job")
        assert response.status_code == 200

    def test_delete_job_not_found(self, client: TestClient):
        """TRAIN-006: 删除不存在的任务"""
        response = client.delete("/api/v1/training/jobs/nonexistent")
        assert response.status_code == 404

    def test_list_trained_models(self, client: TestClient):
        """TRAIN-007: 列出已训练模型"""
        response = client.get("/api/v1/training/models")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_job_fields(self, client: TestClient):
        """TRAIN-008: 任务返回字段完整性"""
        response = client.post("/api/v1/training/train", json={
            "dataset_name": "check_fields",
            "epochs": 5,
            "imgsz": 320,
            "batch": 8,
            "job_name": "fields_test",
        })
        data = response.json()

        assert "job_id" in data
        assert "dataset" in data
        assert "model_base" in data
        assert "epochs" in data
        assert "status" in data
        assert "progress" in data
        assert "message" in data
        assert data["epochs"] == 5
