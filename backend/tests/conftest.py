"""
Pytest 配置和共享 fixtures
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.database import Base, get_db
from app.models.device import Device
from app.models.user import User      # noqa: F401 — 确保 users 表被创建
from app.models.alert import Alert    # noqa: F401 — 确保 alerts 表被创建
import sys
from pathlib import Path

# 添加 backend 目录到 Python 路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# 设置测试环境变量，跳过启动事件
os.environ["TESTING"] = "1"


# 使用内存 SQLite 数据库进行测试
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """创建测试数据库会话"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """创建测试客户端"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    from main import app
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_device(db_session):
    """创建测试设备"""
    device = Device(
        name="Test Camera",
        protocol="rtsp",
        url="rtsp://192.168.110.42:8080/h264_ulaw.sdp",
        is_active=True,
        status="offline",
        auto_connect=False,
        target_fps=10,
    )
    db_session.add(device)
    db_session.commit()
    db_session.refresh(device)
    return device


@pytest.fixture
def inactive_device(db_session):
    """创建未激活的测试设备"""
    device = Device(
        name="Inactive Camera",
        protocol="rtsp",
        url="rtsp://localhost:8554/inactive",
        is_active=False,
        status="offline",
    )
    db_session.add(device)
    db_session.commit()
    db_session.refresh(device)
    return device
