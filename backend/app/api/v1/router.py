from fastapi import APIRouter
from app.api.v1.endpoints import cameras

api_router = APIRouter()
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
