"""
告警推送通知服务
支持渠道:
  - 邮件 (SMTP): SMTP_HOST/PORT/USER/PASS/TO
  - 飞书 webhook: FEISHU_WEBHOOK_URL
"""
import asyncio
import logging
import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# 严重级别颜色
SEVERITY_COLOR = {
    "critical": "red",
    "high": "orange",
    "medium": "yellow",
    "low": "blue",
}
SEVERITY_EMOJI = {
    "critical": "🔴",
    "high": "🟠",
    "medium": "🟡",
    "low": "🔵",
}


class NotificationService:

    def __init__(self):
        self._smtp_host: Optional[str] = None
        self._smtp_port: int = 587
        self._smtp_user: Optional[str] = None
        self._smtp_pass: Optional[str] = None
        self._smtp_to: Optional[str] = None
        self._feishu_webhook: Optional[str] = None
        self._email_enabled: bool = False
        self._feishu_enabled: bool = False
        self._load_config()

    def _load_config(self):
        import os
        try:
            self._smtp_host = os.getenv("SMTP_HOST")
            self._smtp_port = int(os.getenv("SMTP_PORT", "587"))
            self._smtp_user = os.getenv("SMTP_USER")
            self._smtp_pass = os.getenv("SMTP_PASS")
            self._smtp_to = os.getenv("SMTP_TO")
            self._feishu_webhook = os.getenv("FEISHU_WEBHOOK_URL")

            self._email_enabled = bool(
                self._smtp_host and self._smtp_user and self._smtp_pass and self._smtp_to
            )
            self._feishu_enabled = bool(self._feishu_webhook)

            if self._feishu_enabled:
                logger.info(f"Feishu webhook enabled")
            if self._email_enabled:
                logger.info(f"Email notifications enabled → {self._smtp_to}")
            if not self._email_enabled and not self._feishu_enabled:
                logger.info("Notifications disabled (no SMTP or Feishu webhook configured)")
        except Exception as e:
            logger.warning(f"Notification config load failed: {e}")

    # ── 飞书 ──────────────────────────────────────────────────────────────────

    def _build_feishu_card(
        self,
        device_id: int, device_name: str,
        alert_type: str, severity: str,
        message: str, confidence: float, alert_id: int,
    ) -> dict:
        """飞书卡片消息格式"""
        emoji = SEVERITY_EMOJI.get(severity, "⚪")
        color = SEVERITY_COLOR.get(severity, "grey")
        return {
            "msg_type": "interactive",
            "card": {
                "header": {
                    "title": {
                        "tag": "plain_text",
                        "content": f"{emoji} OpenVision 告警 #{alert_id}"
                    },
                    "template": color,
                },
                "elements": [
                    {
                        "tag": "div",
                        "fields": [
                            {"is_short": True, "text": {"tag": "lark_md", "content": f"**设备**\n{device_name} (ID: {device_id})"}},
                            {"is_short": True, "text": {"tag": "lark_md", "content": f"**类型**\n{alert_type}"}},
                            {"is_short": True, "text": {"tag": "lark_md", "content": f"**严重级别**\n{severity.upper()}"}},
                            {"is_short": True, "text": {"tag": "lark_md", "content": f"**置信度**\n{confidence:.1%}"}},
                        ]
                    },
                    {"tag": "div", "text": {"tag": "plain_text", "content": message}},
                    {"tag": "hr"},
                    {
                        "tag": "note",
                        "elements": [{"tag": "plain_text", "content": "OpenVision 智能监控平台 · 自动告警"}]
                    }
                ]
            }
        }

    async def _send_feishu(self, payload: dict):
        """异步发送飞书 webhook"""
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    self._feishu_webhook,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )
                result = resp.json()
                if result.get("code") == 0 or result.get("StatusCode") == 0:
                    logger.info("Feishu notification sent")
                else:
                    logger.warning(f"Feishu webhook error: {result}")
        except Exception as e:
            logger.error(f"Feishu send failed: {e}")

    # ── 邮件 ──────────────────────────────────────────────────────────────────

    def _send_email_sync(self, subject: str, body: str):
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self._smtp_user
            msg["To"] = self._smtp_to
            msg.attach(MIMEText(body, "html", "utf-8"))

            with smtplib.SMTP(self._smtp_host, self._smtp_port, timeout=10) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.login(self._smtp_user, self._smtp_pass)
                smtp.sendmail(self._smtp_user, [self._smtp_to], msg.as_string())
            logger.info(f"Email sent: {subject}")
        except Exception as e:
            logger.error(f"Email send failed: {e}")

    async def _send_email(
        self, device_id, device_name, alert_type, severity, message, confidence, alert_id
    ):
        emoji = SEVERITY_EMOJI.get(severity, "⚪")
        subject = f"[OpenVision] {emoji} 告警 #{alert_id}: {alert_type} ({severity})"
        body = f"""
        <html><body style="font-family:sans-serif;padding:20px">
          <h2>{emoji} OpenVision 告警通知</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;border:1px solid #ddd"><b>告警ID</b></td><td style="padding:8px;border:1px solid #ddd">#{alert_id}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><b>设备</b></td><td style="padding:8px;border:1px solid #ddd">{device_name} (ID: {device_id})</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><b>类型</b></td><td style="padding:8px;border:1px solid #ddd">{alert_type}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><b>级别</b></td><td style="padding:8px;border:1px solid #ddd"><b>{severity.upper()}</b></td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><b>置信度</b></td><td style="padding:8px;border:1px solid #ddd">{confidence:.1%}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd"><b>描述</b></td><td style="padding:8px;border:1px solid #ddd">{message}</td></tr>
          </table>
          <p style="color:#6b7280;font-size:12px;margin-top:20px">OpenVision 智能监控平台 · 自动告警</p>
        </body></html>
        """
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._send_email_sync, subject, body)

    # ── 统一入口 ──────────────────────────────────────────────────────────────

    async def send_alert_notification(
        self,
        device_id: int, device_name: str,
        alert_type: str, severity: str,
        message: str, confidence: float, alert_id: int,
    ):
        """异步发送告警通知（所有启用渠道并发发送）"""
        tasks = []

        if self._feishu_enabled:
            payload = self._build_feishu_card(
                device_id, device_name, alert_type, severity, message, confidence, alert_id
            )
            tasks.append(self._send_feishu(payload))

        if self._email_enabled:
            tasks.append(self._send_email(
                device_id, device_name, alert_type, severity, message, confidence, alert_id
            ))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    @property
    def is_enabled(self) -> bool:
        return self._email_enabled or self._feishu_enabled

    def get_status(self) -> dict:
        return {
            "email_enabled": self._email_enabled,
            "feishu_enabled": self._feishu_enabled,
            "smtp_host": self._smtp_host,
            "smtp_to": self._smtp_to,
            "feishu_webhook_set": bool(self._feishu_webhook),
        }


# 全局单例
notification_service = NotificationService()
