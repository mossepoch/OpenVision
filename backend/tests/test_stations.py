"""
站点管理 API 测试
测试端点：/api/v1/stations/
"""
import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).parent.parent
STATIONS_FILE = BACKEND_DIR / "data" / "stations.json"


@pytest.fixture(autouse=True)
def cleanup_stations():
    """每个测试前后清空站点数据"""
    if STATIONS_FILE.exists():
        backup = STATIONS_FILE.read_text()
    else:
        backup = None
    STATIONS_FILE.parent.mkdir(exist_ok=True)
    STATIONS_FILE.write_text("[]")
    yield
    if backup is not None:
        STATIONS_FILE.write_text(backup)
    elif STATIONS_FILE.exists():
        STATIONS_FILE.write_text("[]")


STATION_PAYLOAD = {
    "name": "A区监控站",
    "location": "一楼大厅",
    "detection_mode": "cv_only",
    "camera_ids": [1, 2],
    "description": "测试站点",
}


class TestCreateStation:
    """创建站点测试"""

    def test_create_station(self, client: TestClient):
        """STA-001: 正常创建"""
        response = client.post("/api/v1/stations/", json=STATION_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "A区监控站"
        assert data["location"] == "一楼大厅"
        assert data["status"] == "active"
        assert "id" in data

    def test_create_station_minimal(self, client: TestClient):
        """STA-002: 最小字段"""
        response = client.post("/api/v1/stations/", json={
            "name": "简易站",
            "location": "二楼",
        })
        assert response.status_code == 200
        assert response.json()["detection_mode"] == "cv_only"


class TestListStations:
    """列出站点测试"""

    def test_list_empty(self, client: TestClient):
        """STA-101: 空列表"""
        response = client.get("/api/v1/stations/")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_with_data(self, client: TestClient):
        """STA-102: 列出多个站点"""
        client.post("/api/v1/stations/", json={**STATION_PAYLOAD, "name": "站点1"})
        client.post("/api/v1/stations/", json={**STATION_PAYLOAD, "name": "站点2"})

        response = client.get("/api/v1/stations/")
        assert len(response.json()) == 2


class TestGetStation:
    """获取单个站点测试"""

    def test_get_station(self, client: TestClient):
        """STA-201: 获取存在的站点"""
        resp = client.post("/api/v1/stations/", json=STATION_PAYLOAD)
        station_id = resp.json()["id"]

        response = client.get(f"/api/v1/stations/{station_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "A区监控站"

    def test_get_not_found(self, client: TestClient):
        """STA-202: 站点不存在"""
        response = client.get("/api/v1/stations/nonexistent")
        assert response.status_code == 404


class TestUpdateStation:
    """更新站点测试"""

    def test_update_station(self, client: TestClient):
        """STA-301: 更新站点"""
        resp = client.post("/api/v1/stations/", json=STATION_PAYLOAD)
        station_id = resp.json()["id"]

        response = client.put(f"/api/v1/stations/{station_id}", json={
            "name": "更新后站点",
            "location": "三楼",
            "detection_mode": "cv_vl",
        })
        assert response.status_code == 200
        assert response.json()["name"] == "更新后站点"
        assert response.json()["detection_mode"] == "cv_vl"

    def test_update_not_found(self, client: TestClient):
        """STA-302: 更新不存在的站点"""
        response = client.put("/api/v1/stations/nonexistent", json={
            "name": "Ghost",
            "location": "Nowhere",
        })
        assert response.status_code == 404


class TestDeleteStation:
    """删除站点测试"""

    def test_delete_station(self, client: TestClient):
        """STA-401: 正常删除"""
        resp = client.post("/api/v1/stations/", json=STATION_PAYLOAD)
        station_id = resp.json()["id"]

        response = client.delete(f"/api/v1/stations/{station_id}")
        assert response.status_code == 200

        # 确认删除
        assert client.get(f"/api/v1/stations/{station_id}").status_code == 404

    def test_delete_not_found(self, client: TestClient):
        """STA-402: 删除不存在的站点"""
        response = client.delete("/api/v1/stations/nonexistent")
        assert response.status_code == 404
