"""
设备管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.device import Device
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceResponse

router = APIRouter()


@router.get("/", response_model=List[DeviceResponse])
async def list_devices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """获取设备列表"""
    devices = db.query(Device).filter(Device.is_active == True).offset(skip).limit(limit).all()
    return devices


@router.post("/", response_model=DeviceResponse)
async def create_device(
    device: DeviceCreate,
    db: Session = Depends(get_db)
):
    """添加新设备"""
    db_device = Device(**device.model_dump())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device


@router.get("/{device_id}", response_model=DeviceResponse)
async def get_device(device_id: int, db: Session = Depends(get_db)):
    """获取单个设备详情"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")
    return device


@router.put("/{device_id}", response_model=DeviceResponse)
async def update_device(
    device_id: int,
    device_update: DeviceUpdate,
    db: Session = Depends(get_db)
):
    """更新设备信息"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")
    for field, value in device_update.model_dump(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}")
async def delete_device(device_id: int, db: Session = Depends(get_db)):
    """删除设备"""
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")
    device.is_active = False
    db.commit()
    return {"message": "设备已删除"}
