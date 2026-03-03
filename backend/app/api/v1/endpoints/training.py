"""
模型训练 API
使用 ultralytics YOLO 在数据集上微调训练
"""
import os
import json
import time
import asyncio
import threading
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

router = APIRouter(tags=["模型训练"])

BASE_DIR = Path(__file__).parent.parent.parent.parent.parent  # backend/
DATASETS_DIR = BASE_DIR / "datasets"
MODELS_DIR = BASE_DIR / "trained_models"
MODELS_DIR.mkdir(exist_ok=True)

# 训练任务状态存储
_training_jobs: Dict[str, Dict[str, Any]] = {}


class TrainRequest(BaseModel):
    dataset_name: str
    model_base: str = "yolov8n.pt"  # 基础模型
    epochs: int = 50
    imgsz: int = 640
    batch: int = 16
    job_name: Optional[str] = None


class TrainJob(BaseModel):
    job_id: str
    dataset: str
    model_base: str
    epochs: int
    status: str  # pending/running/done/failed
    progress: float  # 0-100
    message: str
    started_at: Optional[float]
    finished_at: Optional[float]
    output_model: Optional[str]


def _run_training(job_id: str, req: TrainRequest):
    """在后台线程中执行训练"""
    job = _training_jobs[job_id]
    job["status"] = "running"
    job["started_at"] = time.time()

    try:
        from ultralytics import YOLO

        ds_dir = DATASETS_DIR / req.dataset_name
        if not ds_dir.exists():
            raise ValueError(f"Dataset '{req.dataset_name}' not found")

        # 生成 YOLO data.yaml
        meta_file = ds_dir / "meta.json"
        meta = json.loads(meta_file.read_text()) if meta_file.exists() else {"labels": ["person"]}
        labels = meta.get("labels", ["person"])

        yaml_content = f"""path: {ds_dir}
train: images
val: images

nc: {len(labels)}
names: {labels}
"""
        yaml_path = ds_dir / "data.yaml"
        yaml_path.write_text(yaml_content)

        job["message"] = f"开始训练，数据集: {req.dataset_name}，轮次: {req.epochs}"

        output_dir = MODELS_DIR / job_id
        model = YOLO(req.model_base)

        # 训练（同步）
        results = model.train(
            data=str(yaml_path),
            epochs=req.epochs,
            imgsz=req.imgsz,
            batch=req.batch,
            project=str(MODELS_DIR),
            name=job_id,
            exist_ok=True,
            verbose=False,
        )

        best_model = MODELS_DIR / job_id / "weights" / "best.pt"
        job["status"] = "done"
        job["progress"] = 100.0
        job["output_model"] = str(best_model) if best_model.exists() else None
        job["message"] = "训练完成"
        job["finished_at"] = time.time()

    except Exception as e:
        job["status"] = "failed"
        job["message"] = f"训练失败: {str(e)}"
        job["finished_at"] = time.time()


@router.post("/train", response_model=TrainJob)
def start_training(req: TrainRequest):
    import uuid
    job_id = req.job_name or f"train_{int(time.time())}"
    if job_id in _training_jobs and _training_jobs[job_id]["status"] == "running":
        raise HTTPException(status_code=400, detail="Training job already running")

    job = {
        "job_id": job_id,
        "dataset": req.dataset_name,
        "model_base": req.model_base,
        "epochs": req.epochs,
        "status": "pending",
        "progress": 0.0,
        "message": "等待启动",
        "started_at": None,
        "finished_at": None,
        "output_model": None,
    }
    _training_jobs[job_id] = job

    t = threading.Thread(target=_run_training, args=(job_id, req), daemon=True)
    t.start()

    return TrainJob(**job)


@router.get("/jobs", response_model=List[TrainJob])
def list_jobs():
    return [TrainJob(**j) for j in _training_jobs.values()]


@router.get("/jobs/{job_id}", response_model=TrainJob)
def get_job(job_id: str):
    if job_id not in _training_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return TrainJob(**_training_jobs[job_id])


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    if job_id not in _training_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    if _training_jobs[job_id]["status"] == "running":
        raise HTTPException(status_code=400, detail="Cannot delete running job")
    del _training_jobs[job_id]
    return {"message": "Job deleted"}


@router.get("/models")
def list_trained_models():
    """列出所有已训练的模型"""
    models = []
    for d in MODELS_DIR.iterdir():
        if d.is_dir():
            best = d / "weights" / "best.pt"
            last = d / "weights" / "last.pt"
            models.append({
                "name": d.name,
                "best": str(best) if best.exists() else None,
                "last": str(last) if last.exists() else None,
                "size_mb": round(best.stat().st_size / 1024 / 1024, 1) if best.exists() else None,
            })
    return models
