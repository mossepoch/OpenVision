from fastapi import APIRouter
from app.api.v1.endpoints import cameras, auth, dashboard, devices, alerts, stream, detection, datasets, training

api_router = APIRouter()
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(devices.router, prefix="/devices", tags=["设备管理"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["告警管理"])
api_router.include_router(stream.router, prefix="/stream", tags=["摄像头推流"])
api_router.include_router(detection.router, prefix="/detection", tags=["YOLO检测"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["数据集管理"])
api_router.include_router(training.router, prefix="/training", tags=["模型训练"])
