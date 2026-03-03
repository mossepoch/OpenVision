"""
OpenVision Backend - FastAPI Application Entry Point
"""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.database import engine, Base

# 自动创建数据库表
import app.models.device  # noqa
import app.models.alert   # noqa
import app.models.user    # noqa
Base.metadata.create_all(bind=engine)

# 创建快照目录
SNAPSHOTS_DIR = os.path.join(os.path.dirname(__file__), "snapshots")
os.makedirs(SNAPSHOTS_DIR, exist_ok=True)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="OpenVision API",
    description="AI + 摄像头智能检测平台后端 API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务：快照截图
app.mount("/snapshots", StaticFiles(directory=SNAPSHOTS_DIR), name="snapshots")

# 路由
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def auto_reconnect_cameras():
    """启动时自动重连 auto_connect=True 的设备"""
    try:
        from app.db.database import SessionLocal
        from app.models.device import Device
        from app.services.camera_service import camera_service

        db = SessionLocal()
        devices = db.query(Device).filter(
            Device.auto_connect == True,
            Device.is_active == True
        ).all()
        db.close()

        if devices:
            logger.info(f"Auto-reconnecting {len(devices)} camera(s)...")
            for device in devices:
                camera_service.connect(device.id, device.url, target_fps=device.target_fps or 10)
        else:
            logger.info("No cameras configured for auto-connect.")
    except Exception as e:
        logger.error(f"Auto-reconnect failed: {e}")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "OpenVision API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
