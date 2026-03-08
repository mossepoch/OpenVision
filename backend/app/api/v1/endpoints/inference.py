"""
模型推理配置 API
切换当前 YOLO 检测使用的模型（默认 yolov8n.pt，或已训练的自定义模型）
"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["模型推理"])

CONFIG_FILE = Path(__file__).parent.parent.parent.parent.parent / "data" / "inference_config.json"
CONFIG_FILE.parent.mkdir(exist_ok=True)

DEFAULT_MODEL = "yolov8n.pt"


def _load_config():
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {"model_path": DEFAULT_MODEL, "device": "auto"}


def _save_config(cfg):
    CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False))


class InferenceConfig(BaseModel):
    model_path: str
    device: str = "auto"  # auto | cpu | cuda


@router.get("/active")
def get_active_model():
    """获取当前推理使用的模型"""
    cfg = _load_config()
    return {
        "model_path": cfg["model_path"],
        "device": cfg.get("device", "auto"),
        "is_custom": cfg["model_path"] != DEFAULT_MODEL,
    }


@router.post("/active")
def set_active_model(config: InferenceConfig):
    """切换推理模型"""
    path = Path(config.model_path)
    # 如果是自定义路径，验证文件存在
    if config.model_path != DEFAULT_MODEL and not path.exists():
        raise HTTPException(status_code=400, detail=f"模型文件不存在: {config.model_path}")

    _save_config({"model_path": config.model_path, "device": config.device})
    return {
        "message": "模型已切换",
        "model_path": config.model_path,
        "device": config.device,
    }


@router.post("/active/reset")
def reset_to_default():
    """重置为默认模型"""
    _save_config({"model_path": DEFAULT_MODEL, "device": "auto"})
    return {"message": "已重置为默认模型", "model_path": DEFAULT_MODEL}
