"""
Dashboard 统计 API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.device import Device
from app.models.alert import Alert

router = APIRouter()


@router.get("/")
async def get_dashboard(db: Session = Depends(get_db)):
    """总览统计数据"""
    # 设备统计
    total_devices = db.query(func.count(Device.id)).filter(Device.is_active == True).scalar() or 0
    online_devices = db.query(func.count(Device.id)).filter(
        Device.is_active == True, Device.status == "online"
    ).scalar() or 0
    offline_devices = total_devices - online_devices

    # 告警统计
    total_alerts = db.query(func.count(Alert.id)).scalar() or 0
    unread_alerts = db.query(func.count(Alert.id)).filter(Alert.is_read == False).scalar() or 0
    critical_alerts = db.query(func.count(Alert.id)).filter(
        Alert.severity == "critical", Alert.is_resolved == False
    ).scalar() or 0

    # 最近告警
    recent_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()

    return {
        "devices": {
            "total": total_devices,
            "online": online_devices,
            "offline": offline_devices,
            "online_rate": round(online_devices / total_devices * 100, 1) if total_devices > 0 else 0,
        },
        "alerts": {
            "total": total_alerts,
            "unread": unread_alerts,
            "critical": critical_alerts,
        },
        "recent_alerts": [
            {
                "id": a.id,
                "device_id": a.device_id,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "message": a.message,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in recent_alerts
        ],
    }
