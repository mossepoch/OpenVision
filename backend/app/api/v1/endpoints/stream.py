"""
摄像头流相关接口
- GET  /api/v1/stream/{device_id}/snapshot  — 单帧快照 JPEG
- WS   /api/v1/stream/{device_id}/ws        — WebSocket 推流
- POST /api/v1/stream/{device_id}/connect   — 启动采集
- POST /api/v1/stream/{device_id}/disconnect — 停止采集
- GET  /api/v1/stream/status                 — 所有摄像头状态
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.database import get_db
from app.models.device import Device
from app.services.camera_service import camera_service

router = APIRouter()


@router.post("/{device_id}/connect")
async def connect_camera(device_id: int, target_fps: int = 10, db: Session = Depends(get_db)):
    """启动摄像头采集"""
    device = db.query(Device).filter(Device.id == device_id, Device.is_active == True).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")
    camera_service.connect(device_id, device.url, target_fps=target_fps)
    # 更新设备状态
    device.status = "online"
    db.commit()
    return {"message": f"Camera {device_id} connecting", "url": device.url}


@router.post("/{device_id}/disconnect")
async def disconnect_camera(device_id: int, db: Session = Depends(get_db)):
    """停止摄像头采集"""
    camera_service.disconnect(device_id)
    device = db.query(Device).filter(Device.id == device_id).first()
    if device:
        device.status = "offline"
        db.commit()
    return {"message": f"Camera {device_id} disconnected"}


@router.get("/{device_id}/snapshot")
async def get_snapshot(device_id: int):
    """获取单帧快照 (JPEG)"""
    frame = camera_service.get_snapshot(device_id)
    if frame is None:
        raise HTTPException(status_code=404, detail="No frame available. Is camera connected?")
    return Response(content=frame, media_type="image/jpeg")


@router.get("/status")
async def get_stream_status():
    """所有摄像头推流状态"""
    return camera_service.status()


@router.websocket("/{device_id}/ws")
async def websocket_stream(device_id: int, websocket: WebSocket, fps: int = 10):
    """
    WebSocket 摄像头推流
    消息格式: {"type": "frame", "device_id": id, "data": "base64jpeg", "ts": float}
    """
    await websocket.accept()
    try:
        await camera_service.ws_stream(device_id, websocket, target_fps=fps)
    except WebSocketDisconnect:
        pass
