"""
统计报表 API
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.alert import Alert

router = APIRouter(tags=["统计报表"])


@router.get("/summary")
def get_summary(range: str = "today", db: Session = Depends(get_db)):
    """告警统计摘要"""
    now = datetime.now()
    if range == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif range == "week":
        start = now - timedelta(days=7)
    elif range == "month":
        start = now - timedelta(days=30)
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    alerts = db.query(Alert).filter(Alert.created_at >= start).all()
    total = len(alerts)
    resolved = sum(1 for a in alerts if a.is_resolved)
    pending = sum(1 for a in alerts if not a.is_resolved)
    unread = sum(1 for a in alerts if not a.is_read)

    # 按告警类型统计
    by_type = {}
    for a in alerts:
        t = a.alert_type or "unknown"
        by_type[t] = by_type.get(t, 0) + 1

    # 按严重程度统计
    by_severity = {}
    for a in alerts:
        s = a.severity or "low"
        by_severity[s] = by_severity.get(s, 0) + 1

    # 按小时分布（最近24小时）
    hourly = {}
    for a in alerts:
        h = a.created_at.hour if a.created_at else 0
        hourly[str(h)] = hourly.get(str(h), 0) + 1

    return {
        "range": range,
        "total": total,
        "resolved": resolved,
        "pending": pending,
        "unread": unread,
        "by_type": by_type,
        "by_severity": by_severity,
        "hourly": hourly,
        "compliance_rate": round((resolved / total * 100) if total > 0 else 100, 1),
    }


@router.get("/trend")
def get_trend(days: int = 7, db: Session = Depends(get_db)):
    """告警趋势（按天）"""
    result = []
    for i in range(days - 1, -1, -1):
        day = datetime.now() - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1)
        count = db.query(Alert).filter(
            Alert.created_at >= start,
            Alert.created_at < end
        ).count()
        result.append({
            "date": start.strftime("%m-%d"),
            "count": count,
        })
    return result


@router.get("/device-stats")
def get_device_stats(db: Session = Depends(get_db)):
    """各设备告警数量统计"""
    from app.models.device import Device
    stats = db.query(
        Device.name,
        func.count(Alert.id).label("alert_count")
    ).outerjoin(Alert, Alert.device_id == Device.id).group_by(Device.id).all()
    return [{"device": s[0], "alert_count": s[1]} for s in stats]
