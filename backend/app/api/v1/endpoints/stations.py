"""
站点管理 API
"""
import json
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["站点管理"])

DATA_FILE = Path(__file__).parent.parent.parent.parent.parent / "data" / "stations.json"
DATA_FILE.parent.mkdir(exist_ok=True)


def _load():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text())
    return []


def _save(data):
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))


class StationBase(BaseModel):
    name: str
    location: str
    detection_mode: str = "cv_only"  # cv_only | cv_vl
    sop_name: Optional[str] = ""
    camera_ids: List[int] = []
    description: Optional[str] = ""


class StationCreate(StationBase):
    pass


class StationUpdate(StationBase):
    status: Optional[str] = "active"


class Station(StationBase):
    id: str
    status: str = "active"
    alert_count: int = 0


@router.get("/", response_model=List[Station])
def list_stations():
    return _load()


@router.post("/", response_model=Station)
def create_station(data: StationCreate):
    import uuid, time
    stations = _load()
    station = {
        "id": str(uuid.uuid4())[:8],
        "status": "active",
        "alert_count": 0,
        **data.dict(),
    }
    stations.append(station)
    _save(stations)
    return station


@router.get("/{station_id}", response_model=Station)
def get_station(station_id: str):
    for s in _load():
        if s["id"] == station_id:
            return s
    raise HTTPException(status_code=404, detail="Station not found")


@router.put("/{station_id}", response_model=Station)
def update_station(station_id: str, data: StationUpdate):
    stations = _load()
    for i, s in enumerate(stations):
        if s["id"] == station_id:
            stations[i] = {**s, **data.dict()}
            _save(stations)
            return stations[i]
    raise HTTPException(status_code=404, detail="Station not found")


@router.delete("/{station_id}")
def delete_station(station_id: str):
    stations = _load()
    new = [s for s in stations if s["id"] != station_id]
    if len(new) == len(stations):
        raise HTTPException(status_code=404, detail="Station not found")
    _save(new)
    return {"message": "Deleted"}
