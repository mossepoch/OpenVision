"""
告警事件模型
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.sql import func

from app.db.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)   # intrusion/fire/fall/behavior
    severity = Column(String(20), default="medium")   # low/medium/high/critical
    message = Column(Text, nullable=True)
    snapshot_url = Column(String(500), nullable=True)
    confidence = Column(Float, nullable=True)
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
