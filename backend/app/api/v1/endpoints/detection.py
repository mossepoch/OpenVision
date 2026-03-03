"""
YOLO 检测 API + 自动告警 + 快照存储 + 推送通知
"""
import asyncio
import logging
import os
import time
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.services.detection_service import detection_service
from app.services.camera_service import camera_service
from app.services.alert_rules import check_alert_rules
from app.services.notification_service import notification_service
from app.models.alert import Alert
from app.models.device import Device
from app.db.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

# 快照存储目录（与 main.py 保持一致）
SNAPSHOTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..", "snapshots")


def _save_snapshot(image_bytes: bytes, device_id: int) -> str:
    """
    保存快照到 snapshots/ 目录
    返回相对 URL: /snapshots/device_1_1234567890.jpg
    """
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
    filename = f"device_{device_id}_{int(time.time())}.jpg"
    filepath = os.path.join(SNAPSHOTS_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return f"/snapshots/{filename}"


async def _save_and_notify(
    device_id: int,
    boxes: list,
    db: Session,
    image_bytes: Optional[bytes] = None,
) -> list:
    """保存告警（含快照）并异步推送通知"""
    triggered = check_alert_rules(boxes)
    if not triggered:
        return []

    alert_ids = []
    device = db.query(Device).filter(Device.id == device_id).first()
    device_name = device.name if device else f"Device {device_id}"

    # 每次触发只存一张快照（所有告警共用同一帧）
    snapshot_url = None
    if image_bytes and triggered:
        try:
            snapshot_url = _save_snapshot(image_bytes, device_id)
        except Exception as e:
            logger.warning(f"Snapshot save failed: {e}")

    for rule_hit in triggered:
        alert = Alert(
            device_id=device_id,
            alert_type=rule_hit["alert_type"],
            severity=rule_hit["severity"],
            message=rule_hit["message"],
            confidence=rule_hit["confidence"],
            snapshot_url=snapshot_url,
        )
        db.add(alert)
        db.flush()
        alert_ids.append(alert.id)

        asyncio.create_task(
            notification_service.send_alert_notification(
                device_id=device_id,
                device_name=device_name,
                alert_type=rule_hit["alert_type"],
                severity=rule_hit["severity"],
                message=rule_hit["message"],
                confidence=rule_hit["confidence"],
                alert_id=alert.id,
            )
        )

    if alert_ids:
        db.commit()
        logger.info(f"Device {device_id}: {len(alert_ids)} alert(s), snapshot={snapshot_url}")

    return alert_ids


@router.get("/status")
async def detection_status():
    return {
        **detection_service.get_status(),
        "notification": notification_service.get_status(),
    }


@router.post("/snapshot/{device_id}")
async def detect_snapshot(
    device_id: int,
    conf: Optional[float] = None,
    model: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """摄像头快照检测 + 告警 + 截图存储"""
    frame = camera_service.get_snapshot(device_id)
    if frame is None:
        raise HTTPException(status_code=404, detail=f"No frame for device {device_id}.")
    try:
        result = detection_service.detect_bytes(frame, conf=conf, model_name=model)
        alert_ids = await _save_and_notify(device_id, result.boxes, db, image_bytes=frame)
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
    """上传图片检测，可选 device_id 触发告警+截图"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files supported")

    image_bytes = await file.read()
    try:
        result = detection_service.detect_bytes(image_bytes, conf=conf, model_name=model)
        data = result.to_dict()

        if device_id is not None:
            alert_ids = await _save_and_notify(device_id, result.boxes, db, image_bytes=image_bytes)
            data["alert_ids"] = alert_ids
            data["alerts_triggered"] = len(alert_ids)
        else:
            data["alert_ids"] = []
            data["alerts_triggered"] = 0

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
