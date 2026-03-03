"""
应用配置
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # 基础配置
    APP_NAME: str = "OpenVision"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # 数据库
    DATABASE_URL: str = "sqlite:///./openvision.db"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24小时

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
    ]

    # 摄像头配置
    CAMERA_TIMEOUT: int = 30
    MAX_CAMERAS: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
