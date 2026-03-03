"""
API v1 路由汇总
"""
from fastapi import APIRouter

from app.api.v1.endpoints import devices, alerts

api_router = APIRouter()

api_router.include_router(devices.router, prefix="/devices", tags=["设备管理"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["告警管理"])
