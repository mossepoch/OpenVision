from fastapi import APIRouter
from app.api.v1.endpoints import cameras, auth, dashboard, devices, alerts, stream, detection, datasets, training, stations, sop, reports, inference, annotations, annotation

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
api_router.include_router(stations.router, prefix="/stations", tags=["站点管理"])
api_router.include_router(sop.router, prefix="/sop", tags=["SOP配置"])
api_router.include_router(reports.router, prefix="/reports", tags=["统计报表"])
api_router.include_router(inference.router, prefix="/inference", tags=["模型推理"])
api_router.include_router(annotations.router, prefix="/annotations", tags=["标注任务"])
api_router.include_router(annotation.router, prefix="/annotation", tags=["标注管理"])
