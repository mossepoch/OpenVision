"""
告警推送通知服务
支持渠道: 邮件 (SMTP)
配置走 .env: SMTP_HOST/PORT/USER/PASS/TO
"""
import asyncio
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

logger = logging.getLogger(__name__)


class NotificationService:
    """推送通知服务"""

    def __init__(self):
        self._smtp_host: Optional[str] = None
        self._smtp_port: int = 587
        self._smtp_user: Optional[str] = None
        self._smtp_pass: Optional[str] = None
        self._smtp_to: Optional[str] = None
        self._enabled: bool = False
        self._load_config()

    def _load_config(self):
        """从环境变量/settings 读取配置"""
        try:
            import os
            self._smtp_host = os.getenv("SMTP_HOST")
            self._smtp_port = int(os.getenv("SMTP_PORT", "587"))
            self._smtp_user = os.getenv("SMTP_USER")
            self._smtp_pass = os.getenv("SMTP_PASS")
            self._smtp_to = os.getenv("SMTP_TO")

            self._enabled = bool(
                self._smtp_host and self._smtp_user and
                self._smtp_pass and self._smtp_to
            )
            if self._enabled:
                logger.info(f"Email notifications enabled → {self._smtp_to}")
            else:
                logger.info("Email notifications disabled (SMTP not configured)")
        except Exception as e:
            logger.warning(f"Notification config load failed: {e}")
            self._enabled = False

    def _build_email(self, subject: str, body: str) -> MIMEMultipart:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = self._smtp_user
        msg["To"] = self._smtp_to
        msg.attach(MIMEText(body, "html", "utf-8"))
        return msg

    def _send_email_sync(self, subject: str, body: str):
        """同步发送邮件（在线程池里调用）"""
        try:
            msg = self._build_email(subject, body)
            with smtplib.SMTP(self._smtp_host, self._smtp_port, timeout=10) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.login(self._smtp_user, self._smtp_pass)
                smtp.sendmail(self._smtp_user, [self._smtp_to], msg.as_string())
            logger.info(f"Email sent: {subject}")
        except Exception as e:
            logger.error(f"Email send failed: {e}")

    async def send_alert_notification(
        self,
        device_id: int,
        device_name: str,
        alert_type: str,
        severity: str,
        message: str,
        confidence: float,
        alert_id: int,
    ):
        """
        异步发送告警通知（不阻塞主流程）
        """
        if not self._enabled:
            return

        # 严重级别颜色
        color_map = {
            "critical": "#dc2626",
            "high": "#ea580c",
            "medium": "#d97706",
            "low": "#2563eb",
        }
        color = color_map.get(severity, "#6b7280")

        subject = f"[OpenVision] 告警 #{alert_id}: {alert_type} ({severity})"
        body = f"""
        <html><body style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: {color};">⚠️ OpenVision 告警通知</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>告警ID</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">#{alert_id}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>设备</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{device_name} (ID: {device_id})</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>类型</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{alert_type}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>严重级别</b></td>
                <td style="padding: 8px; border: 1px solid #ddd; color: {color};"><b>{severity.upper()}</b></td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>置信度</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{confidence:.1%}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>描述</b></td>
                <td style="padding: 8px; border: 1px solid #ddd;">{message}</td></tr>
          </table>
          <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
            OpenVision 智能监控平台 · 此邮件由系统自动发送
          </p>
        </body></html>
        """

        # 在线程池异步发送，不阻塞事件循环
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._send_email_sync, subject, body)

    @property
    def is_enabled(self) -> bool:
        return self._enabled

    def get_status(self) -> dict:
        return {
            "enabled": self._enabled,
            "smtp_host": self._smtp_host,
            "smtp_to": self._smtp_to,
        }


# 全局单例
notification_service = NotificationService()
