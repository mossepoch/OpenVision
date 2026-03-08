"""
认证 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.user import User
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None


def get_or_create_admin(db: Session):
    """确保默认管理员存在"""
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    return admin


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录，返回 JWT token"""
    get_or_create_admin(db)  # 确保有默认管理员
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="账户已禁用")

    token = create_access_token({"sub": user.username, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "is_admin": user.is_admin},
    }


@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """注册新用户"""
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.username, "user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "is_admin": user.is_admin},
    }
