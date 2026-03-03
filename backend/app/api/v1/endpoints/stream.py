"""
摄像头流接口
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.device import Device
from app.services.camera_service import camera_service

router = APIRouter()


@router.post("/{device_id}/connect")
async def connect_camera(
    device_id: int,
    target_fps: int = 10,
    auto_connect: bool = True,
    db: Session = Depends(get_db)
):
    """启动摄像头采集，并将 auto_connect 持久化到数据库"""
    device = db.query(Device).filter(Device.id == device_id, Device.is_active == True).first()
    if not device:
        raise HTTPException(status_code=404, detail="设备不存在")

    # 持久化连接配置
    device.auto_connect = auto_connect
    device.target_fps = target_fps
    device.status = "online"
    db.commit()

    camera_service.connect(device_id, device.url, target_fps=target_fps)
    return {"message": f"Camera {device_id} connecting", "url": device.url}


@router.post("/{device_id}/disconnect")
async def disconnect_camera(device_id: int, db: Session = Depends(get_db)):
    """停止采集，清除 auto_connect"""
    camera_service.disconnect(device_id)
    device = db.query(Device).filter(Device.id == device_id).first()
    if device:
        device.status = "offline"
        device.auto_connect = False
        db.commit()
    return {"message": f"Camera {device_id} disconnected"}


@router.get("/{device_id}/snapshot")
async def get_snapshot(device_id: int):
    """单帧快照 JPEG"""
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
    """WebSocket 推流"""
    await websocket.accept()
    try:
        await camera_service.ws_stream(device_id, websocket, target_fps=fps)
    except WebSocketDisconnect:
        pass
