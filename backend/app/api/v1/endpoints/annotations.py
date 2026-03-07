"""
标注管理 API — 独立路由
提供标注任务管理、进度查询等功能，与 datasets 中的标注存取接口互补
"""
import json
import time
from pathlib import Path
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["标注管理"])

BASE_DIR = Path(__file__).parent.parent.parent.parent.parent  # backend/
DATASETS_DIR = BASE_DIR / "datasets"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

TASKS_FILE = DATA_DIR / "annotation_tasks.json"


# ── 标注任务 ──────────────────────────────────────────────────────────────


class AnnotationTask(BaseModel):
    id: str
    dataset_name: str
    assignee: Optional[str] = None
    status: str = "pending"  # pending | in_progress | done
    created_at: Optional[float] = None
    updated_at: Optional[float] = None
    note: Optional[str] = ""


class TaskCreate(BaseModel):
    dataset_name: str
    assignee: Optional[str] = None
    note: Optional[str] = ""


def _load_tasks() -> List[dict]:
    if TASKS_FILE.exists():
        return json.loads(TASKS_FILE.read_text())
    return []


def _save_tasks(tasks: List[dict]):
    TASKS_FILE.write_text(json.dumps(tasks, ensure_ascii=False, indent=2))


@router.get("/tasks")
def list_tasks():
    """标注任务列表"""
    return _load_tasks()


@router.post("/tasks", response_model=AnnotationTask)
def create_task(data: TaskCreate):
    """创建标注任务"""
    import uuid
    ds_dir = DATASETS_DIR / data.dataset_name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{data.dataset_name}' not found")

    tasks = _load_tasks()
    task = {
        "id": str(uuid.uuid4())[:8],
        "dataset_name": data.dataset_name,
        "assignee": data.assignee,
        "status": "pending",
        "created_at": time.time(),
        "updated_at": time.time(),
        "note": data.note or "",
    }
    tasks.append(task)
    _save_tasks(tasks)
    return task


@router.put("/tasks/{task_id}")
def update_task(task_id: str, status: str = "in_progress", assignee: Optional[str] = None):
    """更新标注任务状态"""
    tasks = _load_tasks()
    for t in tasks:
        if t["id"] == task_id:
            if status:
                t["status"] = status
            if assignee is not None:
                t["assignee"] = assignee
            t["updated_at"] = time.time()
            _save_tasks(tasks)
            return t
    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/tasks/{task_id}")
def delete_task(task_id: str):
    tasks = _load_tasks()
    new = [t for t in tasks if t["id"] != task_id]
    if len(new) == len(tasks):
        raise HTTPException(status_code=404, detail="Task not found")
    _save_tasks(new)
    return {"message": "Deleted"}


# ── 标注进度汇总 ──────────────────────────────────────────────────────────


@router.get("/progress")
def overall_progress():
    """全局标注进度（所有数据集汇总）"""
    if not DATASETS_DIR.exists():
        return {"datasets": [], "total_images": 0, "total_labeled": 0, "progress": 0}

    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    datasets = []
    total_images = 0
    total_labeled = 0

    for ds_dir in DATASETS_DIR.iterdir():
        if not ds_dir.is_dir():
            continue
        images_dir = ds_dir / "images"
        labels_dir = ds_dir / "labels"
        if not images_dir.exists():
            continue
        imgs = [f for f in images_dir.iterdir() if f.suffix.lower() in exts]
        labeled = 0
        for img in imgs:
            lbl = labels_dir / f"{img.stem}.txt"
            if lbl.exists() and lbl.stat().st_size > 0:
                labeled += 1
        datasets.append({
            "name": ds_dir.name,
            "total": len(imgs),
            "labeled": labeled,
            "progress": round(labeled / len(imgs) * 100, 1) if imgs else 0,
        })
        total_images += len(imgs)
        total_labeled += labeled

    return {
        "datasets": datasets,
        "total_images": total_images,
        "total_labeled": total_labeled,
        "progress": round(total_labeled / total_images * 100, 1) if total_images else 0,
    }
