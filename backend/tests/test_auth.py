"""
认证 API 测试
测试端点：/api/v1/auth/
"""
import pytest
from fastapi.testclient import TestClient


class TestRegister:
    """注册接口测试"""

    def test_register_success(self, client: TestClient):
        """AUTH-001: 正常注册"""
        response = client.post("/api/v1/auth/register", json={
            "username": "testuser",
            "password": "testpass123",
            "email": "test@example.com",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "testuser"
        assert data["user"]["is_admin"] is False

    def test_register_without_email(self, client: TestClient):
        """AUTH-002: 不带邮箱注册"""
        response = client.post("/api/v1/auth/register", json={
            "username": "nomail_user",
            "password": "pass123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["username"] == "nomail_user"

    def test_register_duplicate_username(self, client: TestClient):
        """AUTH-003: 重复用户名"""
        payload = {"username": "dupuser", "password": "pass123"}
        client.post("/api/v1/auth/register", json=payload)
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 400
        assert "已存在" in response.json()["detail"]

    def test_register_missing_username(self, client: TestClient):
        """AUTH-004: 缺少用户名"""
        response = client.post("/api/v1/auth/register", json={
            "password": "pass123",
        })
        assert response.status_code == 422

    def test_register_missing_password(self, client: TestClient):
        """AUTH-005: 缺少密码"""
        response = client.post("/api/v1/auth/register", json={
            "username": "nopass",
        })
        assert response.status_code == 422


class TestLogin:
    """登录接口测试"""

    def test_login_default_admin(self, client: TestClient):
        """AUTH-101: 默认管理员登录"""
        response = client.post("/api/v1/auth/login", data={
            "username": "admin",
            "password": "admin123",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "admin"
        assert data["user"]["is_admin"] is True

    def test_login_registered_user(self, client: TestClient):
        """AUTH-102: 注册后登录"""
        # 先注册
        client.post("/api/v1/auth/register", json={
            "username": "logintest",
            "password": "mypassword",
        })
        # 再登录
        response = client.post("/api/v1/auth/login", data={
            "username": "logintest",
            "password": "mypassword",
        })
        assert response.status_code == 200
        assert response.json()["user"]["username"] == "logintest"

    def test_login_wrong_password(self, client: TestClient):
        """AUTH-103: 密码错误"""
        response = client.post("/api/v1/auth/login", data={
            "username": "admin",
            "password": "wrongpassword",
        })
        assert response.status_code == 401
        assert "用户名或密码错误" in response.json()["detail"]

    def test_login_nonexistent_user(self, client: TestClient):
        """AUTH-104: 不存在的用户"""
        response = client.post("/api/v1/auth/login", data={
            "username": "ghost",
            "password": "whatever",
        })
        assert response.status_code == 401

    def test_login_returns_valid_token(self, client: TestClient):
        """AUTH-105: 返回的 token 格式正确"""
        response = client.post("/api/v1/auth/login", data={
            "username": "admin",
            "password": "admin123",
        })
        token = response.json()["access_token"]
        # JWT 由三段 base64 组成
        parts = token.split(".")
        assert len(parts) == 3


class TestTokenVerification:
    """Token 验证测试"""

    def test_token_decode(self, client: TestClient):
        """AUTH-201: Token 可正确解码"""
        from app.core.security import decode_token

        response = client.post("/api/v1/auth/login", data={
            "username": "admin",
            "password": "admin123",
        })
        token = response.json()["access_token"]
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "admin"
        assert "user_id" in payload
        assert "exp" in payload

    def test_invalid_token(self):
        """AUTH-202: 无效 Token"""
        from app.core.security import decode_token

        result = decode_token("invalid.token.here")
        assert result is None

    def test_token_contains_user_id(self, client: TestClient):
        """AUTH-203: Token 包含 user_id"""
        from app.core.security import decode_token

        # 注册新用户
        reg = client.post("/api/v1/auth/register", json={
            "username": "tokencheck",
            "password": "pass123",
        })
        user_id = reg.json()["user"]["id"]
        token = reg.json()["access_token"]

        payload = decode_token(token)
        assert payload["user_id"] == user_id
