"""
摄像头管理 API（轻量别名，底层复用 devices）
提供快速的摄像头专属操作
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.device import Device

router = APIRouter()


@router.get("/")
async def list_cameras(db: Session = Depends(get_db)):
    """列出所有激活的摄像头设备"""
    devices = db.query(Device).filter(Device.is_active == True).all()
    cameras = [
        {
            "id": d.id,
            "name": d.name,
            "protocol": d.protocol,
            "url": d.url,
            "location": d.location,
            "status": d.status,
            "detection_enabled": d.detection_enabled,
            "auto_connect": d.auto_connect,
            "target_fps": d.target_fps,
        }
        for d in devices
    ]
    return {"cameras": cameras, "total": len(cameras)}


@router.post("/")
async def add_camera(
    name: str,
    url: str,
    protocol: str = "rtsp",
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """快速添加摄像头"""
    device = Device(name=name, url=url, protocol=protocol, location=location)
    db.add(device)
    db.commit()
    db.refresh(device)
    return {
        "id": device.id,
        "name": device.name,
        "url": device.url,
        "protocol": device.protocol,
        "status": device.status,
    }
