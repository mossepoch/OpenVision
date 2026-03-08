"""
告警 Schema
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertBase(BaseModel):
    device_id: int
    alert_type: str
    severity: str = "medium"
    message: Optional[str] = None
    snapshot_url: Optional[str] = None
    confidence: Optional[float] = None


class AlertCreate(AlertBase):
    pass


class AlertResponse(AlertBase):
    id: int
    is_read: bool
    is_resolved: bool
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
