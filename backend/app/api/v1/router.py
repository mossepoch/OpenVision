"""
API v1 路由汇总
"""
from fastapi import APIRouter

from app.api.v1.endpoints import devices

api_router = APIRouter()

api_router.include_router(devices.router, prefix="/devices", tags=["设备管理"])
