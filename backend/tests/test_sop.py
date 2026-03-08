"""
SOP 配置管理 API 测试
测试端点：/api/v1/sop/
"""
import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).parent.parent
SOPS_FILE = BACKEND_DIR / "data" / "sops.json"


@pytest.fixture(autouse=True)
def cleanup_sops():
    """每个测试前后清空 SOP 数据"""
    if SOPS_FILE.exists():
        backup = SOPS_FILE.read_text()
    else:
        backup = None
    SOPS_FILE.parent.mkdir(exist_ok=True)
    SOPS_FILE.write_text("[]")
    yield
    if backup is not None:
        SOPS_FILE.write_text(backup)
    elif SOPS_FILE.exists():
        SOPS_FILE.write_text("[]")


SOP_PAYLOAD = {
    "name": "安全巡检 SOP",
    "description": "每日安全巡检流程",
    "mode": "cv_only",
    "output_granularity": "step",
    "steps": [
        {"id": "s1", "type": "detection", "name": "人员检测", "config": {"label": "person"}},
        {"id": "s2", "type": "timer", "name": "等待 5 秒", "config": {"seconds": 5}},
    ],
}


class TestCreateSop:
    """创建 SOP 测试"""

    def test_create_sop(self, client: TestClient):
        """SOP-001: 正常创建"""
        response = client.post("/api/v1/sop/", json=SOP_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "安全巡检 SOP"
        assert data["mode"] == "cv_only"
        assert data["status"] == "active"
        assert len(data["steps"]) == 2
        assert "id" in data
        assert "created_at" in data

    def test_create_sop_minimal(self, client: TestClient):
        """SOP-002: 最小字段"""
        response = client.post("/api/v1/sop/", json={
            "name": "简单 SOP",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["mode"] == "cv_only"
        assert data["output_granularity"] == "step"
        assert data["steps"] == []


class TestListSops:
    """列出 SOP 测试"""

    def test_list_empty(self, client: TestClient):
        """SOP-101: 空列表"""
        response = client.get("/api/v1/sop/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_with_data(self, client: TestClient):
        """SOP-102: 多个 SOP"""
        client.post("/api/v1/sop/", json={**SOP_PAYLOAD, "name": "SOP-A"})
        client.post("/api/v1/sop/", json={**SOP_PAYLOAD, "name": "SOP-B"})

        response = client.get("/api/v1/sop/")
        assert len(response.json()) == 2


class TestGetSop:
    """获取单个 SOP 测试"""

    def test_get_sop(self, client: TestClient):
        """SOP-201: 获取存在的 SOP"""
        resp = client.post("/api/v1/sop/", json=SOP_PAYLOAD)
        sop_id = resp.json()["id"]

        response = client.get(f"/api/v1/sop/{sop_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "安全巡检 SOP"

    def test_get_not_found(self, client: TestClient):
        """SOP-202: SOP 不存在"""
        response = client.get("/api/v1/sop/nonexistent")
        assert response.status_code == 404


class TestUpdateSop:
    """更新 SOP 测试"""

    def test_update_sop(self, client: TestClient):
        """SOP-301: 更新 SOP"""
        resp = client.post("/api/v1/sop/", json=SOP_PAYLOAD)
        sop_id = resp.json()["id"]

        response = client.put(f"/api/v1/sop/{sop_id}", json={
            "name": "更新后 SOP",
            "description": "已更新",
            "mode": "cv_vl",
            "output_granularity": "segment",
            "steps": [],
        })
        assert response.status_code == 200
        assert response.json()["name"] == "更新后 SOP"
        assert response.json()["mode"] == "cv_vl"

    def test_update_not_found(self, client: TestClient):
        """SOP-302: 更新不存在的 SOP"""
        response = client.put("/api/v1/sop/nonexistent", json={
            "name": "Ghost SOP",
        })
        assert response.status_code == 404


class TestDeleteSop:
    """删除 SOP 测试"""

    def test_delete_sop(self, client: TestClient):
        """SOP-401: 正常删除"""
        resp = client.post("/api/v1/sop/", json=SOP_PAYLOAD)
        sop_id = resp.json()["id"]

        response = client.delete(f"/api/v1/sop/{sop_id}")
        assert response.status_code == 200

        assert client.get(f"/api/v1/sop/{sop_id}").status_code == 404

    def test_delete_not_found(self, client: TestClient):
        """SOP-402: 删除不存在的 SOP"""
        response = client.delete("/api/v1/sop/nonexistent")
        assert response.status_code == 404
