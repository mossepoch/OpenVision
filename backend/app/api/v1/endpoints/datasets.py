"""
数据集管理 API
文件系统存储: backend/datasets/{name}/images/ + labels/
"""
import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter(tags=["datasets"])

BASE_DIR = Path(__file__).parent.parent.parent.parent.parent  # backend/
DATASETS_DIR = BASE_DIR / "datasets"
DATASETS_DIR.mkdir(exist_ok=True)


class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    labels: List[str] = ["person", "car", "fire", "knife"]


class DatasetInfo(BaseModel):
    name: str
    description: str
    labels: List[str]
    image_count: int
    label_count: int


@router.get("/", response_model=List[DatasetInfo])
def list_datasets():
    datasets = []
    for d in DATASETS_DIR.iterdir():
        if d.is_dir():
            images_dir = d / "images"
            labels_dir = d / "labels"
            meta_file = d / "meta.json"
            import json
            meta = {"description": "", "labels": ["person", "car", "fire", "knife"]}
            if meta_file.exists():
                meta = json.loads(meta_file.read_text())
            datasets.append(DatasetInfo(
                name=d.name,
                description=meta.get("description", ""),
                labels=meta.get("labels", []),
                image_count=len(list(images_dir.glob("*"))) if images_dir.exists() else 0,
                label_count=len(list(labels_dir.glob("*.txt"))) if labels_dir.exists() else 0,
            ))
    return datasets


@router.post("/", response_model=DatasetInfo)
def create_dataset(data: DatasetCreate):
    import json
    ds_dir = DATASETS_DIR / data.name
    if ds_dir.exists():
        raise HTTPException(status_code=400, detail=f"Dataset '{data.name}' already exists")
    (ds_dir / "images").mkdir(parents=True)
    (ds_dir / "labels").mkdir(parents=True)
    meta = {"description": data.description, "labels": data.labels}
    (ds_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False))
    return DatasetInfo(name=data.name, description=data.description,
                       labels=data.labels, image_count=0, label_count=0)


@router.delete("/{name}")
def delete_dataset(name: str):
    ds_dir = DATASETS_DIR / name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    shutil.rmtree(ds_dir)
    return {"message": f"Dataset '{name}' deleted"}


@router.post("/{name}/images")
async def upload_image(name: str, file: UploadFile = File(...)):
    ds_dir = DATASETS_DIR / name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    images_dir = ds_dir / "images"
    dest = images_dir / file.filename
    with open(dest, "wb") as f:
        f.write(await file.read())
    return {"filename": file.filename, "path": str(dest)}


@router.get("/{name}/images")
def list_images(name: str):
    images_dir = DATASETS_DIR / name / "images"
    if not images_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    files = [f.name for f in images_dir.iterdir() if f.suffix.lower() in exts]
    return {"dataset": name, "images": sorted(files), "count": len(files)}


@router.get("/{name}/images/{filename}")
def get_image(name: str, filename: str):
    path = DATASETS_DIR / name / "images" / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)


class LabelData(BaseModel):
    labels: List[str]  # YOLO format lines: "class_id cx cy w h"


@router.post("/{name}/labels/{filename}")
def save_labels(name: str, filename: str, data: LabelData):
    stem = Path(filename).stem
    label_path = DATASETS_DIR / name / "labels" / f"{stem}.txt"
    label_path.parent.mkdir(exist_ok=True)
    label_path.write_text("\n".join(data.labels))
    return {"saved": len(data.labels), "file": f"{stem}.txt"}


@router.get("/{name}/labels/{filename}")
def get_labels(name: str, filename: str):
    stem = Path(filename).stem
    label_path = DATASETS_DIR / name / "labels" / f"{stem}.txt"
    if not label_path.exists():
        return {"labels": []}
    lines = [l for l in label_path.read_text().splitlines() if l.strip()]
    return {"labels": lines}
