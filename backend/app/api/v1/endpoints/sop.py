"""
SOP 配置管理 API
"""
import json
from pathlib import Path
from typing import List, Optional, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["SOP配置"])

DATA_FILE = Path(__file__).parent.parent.parent.parent.parent / "data" / "sops.json"
DATA_FILE.parent.mkdir(exist_ok=True)


def _load():
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text())
    return []


def _save(data):
    DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2))


class SopStep(BaseModel):
    id: str
    type: str  # detection | timer | condition | action
    name: str
    config: dict = {}


class SopCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    mode: str = "cv_only"  # cv_only | vl_only | cv_vl
    output_granularity: str = "step"  # segment | step | task
    steps: List[dict] = []


class Sop(SopCreate):
    id: str
    status: str = "active"
    created_at: Optional[str] = ""


@router.get("/", response_model=List[Sop])
def list_sops():
    return _load()


@router.post("/", response_model=Sop)
def create_sop(data: SopCreate):
    import uuid
    from datetime import datetime
    sops = _load()
    sop = {
        "id": str(uuid.uuid4())[:8],
        "status": "active",
        "created_at": datetime.now().isoformat(),
        **data.dict(),
    }
    sops.append(sop)
    _save(sops)
    return sop


@router.get("/{sop_id}", response_model=Sop)
def get_sop(sop_id: str):
    for s in _load():
        if s["id"] == sop_id:
            return s
    raise HTTPException(status_code=404, detail="SOP not found")


@router.put("/{sop_id}", response_model=Sop)
def update_sop(sop_id: str, data: SopCreate):
    sops = _load()
    for i, s in enumerate(sops):
        if s["id"] == sop_id:
            sops[i] = {**s, **data.dict()}
            _save(sops)
            return sops[i]
    raise HTTPException(status_code=404, detail="SOP not found")


@router.delete("/{sop_id}")
def delete_sop(sop_id: str):
    sops = _load()
    new = [s for s in sops if s["id"] != sop_id]
    if len(new) == len(sops):
        raise HTTPException(status_code=404, detail="SOP not found")
    _save(new)
    return {"message": "Deleted"}
