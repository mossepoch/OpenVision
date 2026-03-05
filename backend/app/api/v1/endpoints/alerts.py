"""
告警管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertResponse

router = APIRouter()


@router.get("/")
async def list_alerts(
    device_id: Optional[int] = None,
    is_read: Optional[bool] = None,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """获取告警列表，返回 {total, items}"""
    query = db.query(Alert)
    if device_id:
        query = query.filter(Alert.device_id == device_id)
    if is_read is not None:
        query = query.filter(Alert.is_read == is_read)
    if severity:
        query = query.filter(Alert.severity == severity)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    total = query.count()
    items = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


@router.post("/", response_model=AlertResponse)
async def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """创建告警（内部使用，检测服务调用）"""
    db_alert = Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


@router.put("/{alert_id}/read")
async def mark_read(alert_id: int, db: Session = Depends(get_db)):
    """标记已读"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="告警不存在")
    alert.is_read = True
    db.commit()
    return {"message": "已标记已读"}


@router.post("/test-notify")
async def test_notify(channel: str = "all"):
    """发送测试推送通知，验证邮件/飞书配置是否正常"""
    from app.services.notification_service import NotificationService
    from app.models.alert import Alert
    from datetime import datetime

    # 构造一个测试告警对象
    class FakeAlert:
        id = 0
        device_id = 999
        alert_type = "test"
        severity = "info"
        message = "这是一条测试推送通知，请忽略。"
        snapshot_url = None
        created_at = datetime.now()

    svc = NotificationService()
    results = {}
    if channel in ("all", "email"):
        try:
            await svc.send_email_alert(FakeAlert())
            results["email"] = "ok"
        except Exception as e:
            results["email"] = f"failed: {str(e)[:100]}"
    if channel in ("all", "feishu"):
        try:
            await svc.send_feishu_alert(FakeAlert())
            results["feishu"] = "ok"
        except Exception as e:
            results["feishu"] = f"failed: {str(e)[:100]}"
    return {"message": "测试推送完成", "results": results}


@router.put("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """标记已处理"""
    from datetime import datetime, timezone
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="告警不存在")
    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "告警已处理"}
