"""
YOLO 检测 API + 自动告警写入
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.services.detection_service import detection_service
from app.services.camera_service import camera_service
from app.services.alert_rules import check_alert_rules
from app.models.alert import Alert
from app.db.database import get_db

router = APIRouter()


def _save_alerts(device_id: int, boxes: list, db: Session) -> list:
    triggered = check_alert_rules(boxes)
    alert_ids = []
    for rule_hit in triggered:
        alert = Alert(
            device_id=device_id,
            alert_type=rule_hit["alert_type"],
            severity=rule_hit["severity"],
            message=rule_hit["message"],
            confidence=rule_hit["confidence"],
        )
        db.add(alert)
        db.flush()
        alert_ids.append(alert.id)
    if alert_ids:
        db.commit()
    return alert_ids


@router.get("/status")
async def detection_status():
    return detection_service.get_status()


@router.post("/snapshot/{device_id}")
async def detect_snapshot(
    device_id: int,
    conf: Optional[float] = None,
    model: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """摄像头快照检测 + 自动告警写入"""
    frame = camera_service.get_snapshot(device_id)
    if frame is None:
        raise HTTPException(status_code=404, detail=f"No frame for device {device_id}. Connect camera first.")
    try:
        result = detection_service.detect_bytes(frame, conf=conf, model_name=model)
        alert_ids = _save_alerts(device_id, result.boxes, db)
        data = result.to_dict()
        data["alert_ids"] = alert_ids
        data["alerts_triggered"] = len(alert_ids)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@router.post("/upload")
async def detect_upload(
    file: UploadFile = File(...),
    conf: Optional[float] = None,
    model: Optional[str] = None,
    device_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """
    上传图片检测。
    可选传 device_id，传了就触发告警写入（device_id=0 表示测试设备）。
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files supported")

    image_bytes = await file.read()
    try:
        result = detection_service.detect_bytes(image_bytes, conf=conf, model_name=model)
        data = result.to_dict()

        if device_id is not None:
            alert_ids = _save_alerts(device_id, result.boxes, db)
            data["alert_ids"] = alert_ids
            data["alerts_triggered"] = len(alert_ids)
        else:
            data["alert_ids"] = []
            data["alerts_triggered"] = 0

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
