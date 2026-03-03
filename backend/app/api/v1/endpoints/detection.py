"""
YOLO 检测 API
- POST /api/v1/detection/snapshot/{device_id}  — 对摄像头当前帧做检测
- POST /api/v1/detection/upload                 — 上传图片做检测
- GET  /api/v1/detection/status                 — 模型状态
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional

from app.services.detection_service import detection_service
from app.services.camera_service import camera_service

router = APIRouter()


@router.get("/status")
async def detection_status():
    """YOLO 模型状态"""
    return detection_service.get_status()


@router.post("/snapshot/{device_id}")
async def detect_snapshot(
    device_id: int,
    conf: Optional[float] = None,
    model: Optional[str] = None,
):
    """
    对摄像头当前帧做 YOLO 检测
    需要先 POST /api/v1/stream/{id}/connect 启动摄像头
    """
    frame = camera_service.get_snapshot(device_id)
    if frame is None:
        raise HTTPException(
            status_code=404,
            detail=f"No frame available for device {device_id}. Connect camera first."
        )
    try:
        result = detection_service.detect_bytes(frame, conf=conf, model_name=model)
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@router.post("/upload")
async def detect_upload(
    file: UploadFile = File(...),
    conf: Optional[float] = None,
    model: Optional[str] = None,
):
    """上传图片做 YOLO 检测"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files supported")

    image_bytes = await file.read()
    try:
        result = detection_service.detect_bytes(image_bytes, conf=conf, model_name=model)
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
