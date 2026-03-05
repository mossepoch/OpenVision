"""
设备 Schema
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeviceBase(BaseModel):
    name: str
    protocol: str  # rtsp/onvif/http-flv/gb28181
    url: str
    username: Optional[str] = None
    password: Optional[str] = None
    location: Optional[str] = None
    detection_enabled: bool = False
    model_id: Optional[int] = None
    confidence_threshold: float = 0.5
    target_fps: int = 10
    auto_connect: bool = False


class DeviceCreate(DeviceBase):
    pass


class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    detection_enabled: Optional[bool] = None
    model_id: Optional[int] = None
    confidence_threshold: Optional[float] = None


class DeviceResponse(DeviceBase):
    id: int
    status: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        model_config = {"protected_namespaces": ()}
        from_attributes = True
