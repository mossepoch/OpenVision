"""
RTSP 摄像头接入服务
支持: RTSP / HTTP-FLV / ONVIF
"""
import asyncio
import base64
import logging
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Optional, Callable
import threading

logger = logging.getLogger(__name__)

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("opencv-python not installed, camera service disabled")


class CameraStream:
    """单个摄像头的采集状态"""

    def __init__(self, device_id: int, url: str, target_fps: int = 10):
        self.device_id = device_id
        self.url = url
        self.target_fps = target_fps
        self.latest_frame: Optional[bytes] = None  # JPEG bytes
        self.latest_ts: float = 0
        self.is_running = False
        self._thread: Optional[threading.Thread] = None
        self._retry_count = 0
        self._max_retries = 10
        self._lock = threading.Lock()

    def _capture_loop(self):
        """后台线程: 持续读帧，断线重连"""
        interval = 1.0 / self.target_fps
        while self.is_running:
            cap = None
            try:
                cap = cv2.VideoCapture(self.url, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
                if not cap.isOpened():
                    raise ConnectionError(f"Cannot open stream: {self.url}")
                self._retry_count = 0
                logger.info(f"Camera {self.device_id} connected: {self.url}")

                while self.is_running:
                    t0 = time.time()
                    ret, frame = cap.read()
                    if not ret:
                        logger.warning(f"Camera {self.device_id}: frame read failed")
                        break

                    # JPEG 压缩
                    _, buf = cv2.imencode(
                        ".jpg", frame,
                        [cv2.IMWRITE_JPEG_QUALITY, 75]
                    )
                    with self._lock:
                        self.latest_frame = buf.tobytes()
                        self.latest_ts = time.time()

                    # 帧率控制
                    elapsed = time.time() - t0
                    sleep_time = interval - elapsed
                    if sleep_time > 0:
                        time.sleep(sleep_time)

            except Exception as e:
                logger.error(f"Camera {self.device_id} error: {e}")
            finally:
                if cap:
                    cap.release()

            if not self.is_running:
                break

            # 指数退避重连
            self._retry_count += 1
            if self._retry_count > self._max_retries:
                logger.error(f"Camera {self.device_id}: max retries exceeded, giving up")
                self.is_running = False
                break
            wait = min(2 ** self._retry_count, 60)
            logger.info(f"Camera {self.device_id}: reconnect in {wait}s (attempt {self._retry_count})")
            time.sleep(wait)

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self._thread = threading.Thread(
            target=self._capture_loop,
            daemon=True,
            name=f"cam-{self.device_id}"
        )
        self._thread.start()

    def stop(self):
        self.is_running = False
        if self._thread:
            self._thread.join(timeout=5)

    def get_frame(self) -> Optional[bytes]:
        with self._lock:
            return self.latest_frame

    def get_frame_b64(self) -> Optional[str]:
        frame = self.get_frame()
        if frame is None:
            return None
        return base64.b64encode(frame).decode()


class CameraService:
    """摄像头管理单例"""

    def __init__(self):
        self._streams: Dict[int, CameraStream] = {}
        self._lock = threading.Lock()

    def connect(self, device_id: int, url: str, target_fps: int = 10):
        """启动摄像头采集"""
        if not CV2_AVAILABLE:
            logger.warning("opencv not available")
            return
        # 先取出旧 stream（避免嵌套锁死锁）
        old_stream = None
        with self._lock:
            old_stream = self._streams.pop(device_id, None)
        if old_stream:
            old_stream.stop()
            logger.info(f"Camera {device_id} stopped (reconnect)")
        # 创建新 stream
        stream = CameraStream(device_id, url, target_fps)
        stream.start()
        with self._lock:
            self._streams[device_id] = stream
            logger.info(f"Camera {device_id} started")

    def disconnect(self, device_id: int):
        """停止摄像头采集"""
        with self._lock:
            stream = self._streams.pop(device_id, None)
        if stream:
            stream.stop()
            logger.info(f"Camera {device_id} stopped")

    def get_frame(self, device_id: int) -> Optional[bytes]:
        """获取最新帧 (JPEG bytes)"""
        stream = self._streams.get(device_id)
        return stream.get_frame() if stream else None

    def get_snapshot(self, device_id: int) -> Optional[bytes]:
        """快照接口 - 返回单张 JPEG"""
        return self.get_frame(device_id)

    def is_connected(self, device_id: int) -> bool:
        stream = self._streams.get(device_id)
        return stream is not None and stream.is_running

    async def ws_stream(self, device_id: int, websocket, target_fps: int = 10):
        """
        WebSocket 推流
        格式: {"type": "frame", "device_id": id, "data": "base64...", "ts": timestamp}
        """
        interval = 1.0 / target_fps
        stream = self._streams.get(device_id)
        if not stream:
            await websocket.send_json({"type": "error", "message": "Camera not connected"})
            return

        try:
            while True:
                t0 = time.time()
                frame_b64 = stream.get_frame_b64()
                if frame_b64:
                    await websocket.send_json({
                        "type": "frame",
                        "device_id": device_id,
                        "data": frame_b64,
                        "ts": stream.latest_ts,
                    })
                elapsed = time.time() - t0
                await asyncio.sleep(max(0, interval - elapsed))
        except Exception as e:
            logger.info(f"WebSocket stream {device_id} closed: {e}")

    def status(self) -> dict:
        """所有摄像头状态概览"""
        return {
            device_id: {
                "running": s.is_running,
                "has_frame": s.latest_frame is not None,
                "last_ts": s.latest_ts,
                "retry_count": s._retry_count,
            }
            for device_id, s in self._streams.items()
        }


# 全局单例
camera_service = CameraService()
