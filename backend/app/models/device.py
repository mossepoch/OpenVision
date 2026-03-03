"""
设备（摄像头）模型
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func

from app.db.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    protocol = Column(String(20), nullable=False)  # rtsp/onvif/http-flv/gb28181
    url = Column(String(500), nullable=False)
    username = Column(String(100), nullable=True)
    password = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    status = Column(String(20), default="offline")  # online/offline/error
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 检测配置
    detection_enabled = Column(Boolean, default=False)
    model_id = Column(Integer, nullable=True)
    confidence_threshold = Column(Float, default=0.5)
