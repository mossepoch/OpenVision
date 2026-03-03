"""
YOLO 目标检测服务
- 单帧 snapshot 检测
- 支持懒加载模型（首次调用时加载）
- 返回标准检测结果格式
"""
import logging
import time
from typing import Optional, List, Dict, Any
import numpy as np

logger = logging.getLogger(__name__)


class DetectionResult:
    """单次检测结果"""
    def __init__(self, boxes: List[Dict], inference_ms: float, model_name: str):
        self.boxes = boxes          # [{label, confidence, bbox: [x1,y1,x2,y2]}]
        self.inference_ms = inference_ms
        self.model_name = model_name
        self.timestamp = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "boxes": self.boxes,
            "count": len(self.boxes),
            "inference_ms": round(self.inference_ms, 2),
            "model": self.model_name,
            "timestamp": self.timestamp,
        }


class DetectionService:
    """YOLO 检测服务单例"""

    def __init__(self):
        self._model = None
        self._model_name: str = "yolov8n.pt"  # 默认轻量模型
        self._conf_threshold: float = 0.5
        self._loaded = False

    def _load_model(self, model_name: Optional[str] = None):
        """懒加载模型"""
        try:
            from ultralytics import YOLO
            name = model_name or self._model_name
            logger.info(f"Loading YOLO model: {name}")
            self._model = YOLO(name)
            self._model_name = name
            self._loaded = True
            logger.info(f"YOLO model loaded: {name}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self._loaded = False
            raise

    def detect_bytes(
        self,
        image_bytes: bytes,
        conf: Optional[float] = None,
        model_name: Optional[str] = None,
    ) -> DetectionResult:
        """
        对 JPEG bytes 做目标检测
        返回 DetectionResult
        """
        if not self._loaded or (model_name and model_name != self._model_name):
            self._load_model(model_name)

        import cv2
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid image bytes")

        return self._run_detection(frame, conf)

    def detect_file(self, image_path: str, conf: Optional[float] = None) -> DetectionResult:
        """对图片文件做检测"""
        if not self._loaded:
            self._load_model()

        import cv2
        frame = cv2.imread(image_path)
        if frame is None:
            raise ValueError(f"Cannot read image: {image_path}")

        return self._run_detection(frame, conf)

    def _run_detection(self, frame: np.ndarray, conf: Optional[float] = None) -> DetectionResult:
        threshold = conf or self._conf_threshold
        t0 = time.time()

        results = self._model(frame, conf=threshold, verbose=False)
        inference_ms = (time.time() - t0) * 1000

        boxes = []
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                label = self._model.names[cls_id]
                confidence = float(box.conf[0])
                x1, y1, x2, y2 = [round(float(v), 2) for v in box.xyxy[0]]
                boxes.append({
                    "label": label,
                    "confidence": round(confidence, 4),
                    "bbox": [x1, y1, x2, y2],
                    "class_id": cls_id,
                })

        return DetectionResult(
            boxes=boxes,
            inference_ms=inference_ms,
            model_name=self._model_name,
        )

    @property
    def is_ready(self) -> bool:
        return self._loaded

    def get_status(self) -> Dict:
        return {
            "loaded": self._loaded,
            "model": self._model_name,
            "conf_threshold": self._conf_threshold,
        }


# 全局单例
detection_service = DetectionService()
