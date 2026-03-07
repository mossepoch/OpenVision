"""
数据集管理 API
文件系统存储: backend/datasets/{name}/images/ + labels/
"""
import os
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Request
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
    labels_dir = DATASETS_DIR / name / "labels"
    if not images_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    files = sorted([f.name for f in images_dir.iterdir() if f.suffix.lower() in exts])
    # 返回结构化对象，包含标注状态
    images_info = []
    for fname in files:
        stem = Path(fname).stem
        label_file = labels_dir / f"{stem}.txt"
        has_labels = label_file.exists() and label_file.stat().st_size > 0
        images_info.append({
            "filename": fname,
            "url": f"/dataset-files/{name}/images/{fname}",
            "has_labels": has_labels,
        })
    return {"dataset": name, "images": images_info, "count": len(images_info)}


@router.get("/{name}/images/{filename}")
def get_image(name: str, filename: str):
    path = DATASETS_DIR / name / "images" / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)


class YoloLabelObj(BaseModel):
    class_id: int
    cx: float
    cy: float
    w: float
    h: float


class LabelData(BaseModel):
    labels: List[str]  # YOLO format lines: "class_id cx cy w h"


@router.post("/{name}/labels/{filename}")
async def save_labels(name: str, filename: str, request: "Request"):
    """
    保存标注。支持两种格式：
    1. YoloLabel 对象数组: [{"class_id":0,"cx":0.5,"cy":0.5,"w":0.1,"h":0.2}, ...]
    2. LabelData 对象: {"labels": ["0 0.5 0.5 0.1 0.2", ...]}
    """
    from fastapi import Request as _Req  # noqa – already imported via param type
    stem = Path(filename).stem
    label_path = DATASETS_DIR / name / "labels" / f"{stem}.txt"
    label_path.parent.mkdir(exist_ok=True)

    body = await request.json()

    # 格式1: 前端发来的 YoloLabel 对象数组
    if isinstance(body, list):
        lines = []
        for item in body:
            cid = item.get("class_id", 0)
            cx = item.get("cx", 0)
            cy = item.get("cy", 0)
            w = item.get("w", 0)
            h = item.get("h", 0)
            lines.append(f"{cid} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
        label_path.write_text("\n".join(lines))
        return {"message": "ok", "count": len(lines), "file": f"{stem}.txt"}

    # 格式2: {"labels": [...]}  原有格式
    label_lines = body.get("labels", [])
    label_path.write_text("\n".join(label_lines))
    return {"message": "ok", "count": len(label_lines), "file": f"{stem}.txt"}


@router.get("/{name}/labels/{filename}")
def get_labels(name: str, filename: str, format: str = "structured"):
    """
    获取标注。
    format=structured (默认): 返回 YoloLabel 对象数组，前端直接用
    format=raw: 返回原始文本行
    """
    stem = Path(filename).stem
    label_path = DATASETS_DIR / name / "labels" / f"{stem}.txt"
    if not label_path.exists():
        return {"image": filename, "labels": [], "count": 0}
    lines = [l for l in label_path.read_text().splitlines() if l.strip()]

    if format == "raw":
        return {"image": filename, "labels": lines, "count": len(lines)}

    # 结构化输出
    structured = []
    for line in lines:
        parts = line.split()
        if len(parts) >= 5:
            structured.append({
                "class_id": int(parts[0]),
                "cx": float(parts[1]),
                "cy": float(parts[2]),
                "w": float(parts[3]),
                "h": float(parts[4]),
            })
    return {"image": filename, "labels": structured, "count": len(structured)}


@router.post("/{name}/images/{filename}/auto-label")
def auto_label(name: str, filename: str, confidence: float = 0.25):
    """
    AI 一键标注：对数据集中指定图片运行 YOLO 检测，
    自动生成 YOLO 格式标注并保存到 labels 目录。
    """
    import json
    from ultralytics import YOLO

    image_path = DATASETS_DIR / name / "images" / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    # 读取数据集类别配置
    meta_file = DATASETS_DIR / name / "meta.json"
    meta = json.loads(meta_file.read_text()) if meta_file.exists() else {}
    dataset_labels = meta.get("labels", ["person", "car", "fire", "knife"])

    # YOLO 检测
    model = YOLO("yolov8n.pt")
    results = model(str(image_path), conf=confidence, verbose=False)

    # 转换为 YOLO 格式标注
    yolo_lines = []
    detected = []
    for r in results:
        img_w, img_h = r.orig_shape[1], r.orig_shape[0]
        for box in r.boxes:
            cls_name = r.names[int(box.cls)]
            # 只保留数据集类别中存在的类别
            if cls_name in dataset_labels:
                class_id = dataset_labels.index(cls_name)
            else:
                # 不在数据集类别中的也保留，用原始class_id
                class_id = int(box.cls)
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            cx = (x1 + x2) / 2 / img_w
            cy = (y1 + y2) / 2 / img_h
            w = (x2 - x1) / img_w
            h = (y2 - y1) / img_h
            yolo_lines.append(f"{class_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
            detected.append({"label": cls_name, "confidence": round(float(box.conf), 3)})

    # 保存标注
    stem = Path(filename).stem
    label_path = DATASETS_DIR / name / "labels" / f"{stem}.txt"
    label_path.parent.mkdir(exist_ok=True)
    label_path.write_text("\n".join(yolo_lines))

    return {
        "filename": filename,
        "detected": len(yolo_lines),
        "labels": yolo_lines,
        "objects": detected,
    }


@router.post("/{name}/auto-label-all")
def auto_label_all(name: str, confidence: float = 0.25):
    """对数据集所有图片执行 AI 一键标注"""
    images_dir = DATASETS_DIR / name / "images"
    if not images_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    images = [f.name for f in images_dir.iterdir() if f.suffix.lower() in exts]

    results = []
    for img in images:
        try:
            r = auto_label(name, img, confidence)
            results.append({"image": img, "detected": r["detected"], "ok": True})
        except Exception as e:
            results.append({"image": img, "detected": 0, "ok": False, "error": str(e)})

    return {
        "total": len(images),
        "labeled": sum(1 for r in results if r["ok"]),
        "results": results,
    }


# ── 标注专属接口 ──────────────────────────────────────────────────────────


@router.get("/{name}/annotation-stats")
def annotation_stats(name: str):
    """
    数据集标注统计：已标注/未标注数量、各类别标注数量分布
    """
    import json
    ds_dir = DATASETS_DIR / name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    images_dir = ds_dir / "images"
    labels_dir = ds_dir / "labels"
    meta_file = ds_dir / "meta.json"
    meta = json.loads(meta_file.read_text()) if meta_file.exists() else {}
    label_names = meta.get("labels", [])

    exts = {".jpg", ".jpeg", ".png", ".bmp"}
    all_images = [f for f in images_dir.iterdir() if f.suffix.lower() in exts] if images_dir.exists() else []

    labeled = 0
    unlabeled = 0
    total_boxes = 0
    class_dist: dict = {}

    for img in all_images:
        label_file = labels_dir / f"{img.stem}.txt"
        if label_file.exists() and label_file.stat().st_size > 0:
            labeled += 1
            lines = [l for l in label_file.read_text().splitlines() if l.strip()]
            total_boxes += len(lines)
            for line in lines:
                parts = line.split()
                if parts:
                    cid = int(parts[0])
                    cname = label_names[cid] if cid < len(label_names) else str(cid)
                    class_dist[cname] = class_dist.get(cname, 0) + 1
        else:
            unlabeled += 1

    return {
        "dataset": name,
        "total_images": len(all_images),
        "labeled": labeled,
        "unlabeled": unlabeled,
        "total_boxes": total_boxes,
        "class_distribution": class_dist,
        "progress": round(labeled / len(all_images) * 100, 1) if all_images else 0,
    }


@router.post("/{name}/labels-batch")
async def save_labels_batch(name: str, request: Request):
    """
    批量保存标注。
    请求体: { "annotations": { "img1.jpg": [...labels], "img2.jpg": [...labels] } }
    每个 labels 可以是 YoloLabel 对象数组 或 原始字符串数组
    """
    ds_dir = DATASETS_DIR / name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    labels_dir = ds_dir / "labels"
    labels_dir.mkdir(exist_ok=True)

    body = await request.json()
    annotations = body.get("annotations", {})
    saved_count = 0

    for filename, label_data in annotations.items():
        stem = Path(filename).stem
        label_path = labels_dir / f"{stem}.txt"

        if isinstance(label_data, list) and len(label_data) > 0:
            if isinstance(label_data[0], dict):
                # YoloLabel 对象数组
                lines = []
                for item in label_data:
                    cid = item.get("class_id", 0)
                    cx = item.get("cx", 0)
                    cy = item.get("cy", 0)
                    w = item.get("w", 0)
                    h = item.get("h", 0)
                    lines.append(f"{cid} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
                label_path.write_text("\n".join(lines))
            else:
                # 原始字符串数组
                label_path.write_text("\n".join(str(l) for l in label_data))
        else:
            # 空标注 → 写空文件（或清空已有标注）
            label_path.write_text("")
        saved_count += 1

    return {"message": f"Batch saved {saved_count} files", "count": saved_count}


@router.delete("/{name}/images/{filename}")
def delete_image(name: str, filename: str):
    """删除数据集中的单张图片及其标注"""
    image_path = DATASETS_DIR / name / "images" / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    image_path.unlink()
    # 同时删除对应标注
    stem = Path(filename).stem
    label_path = DATASETS_DIR / name / "labels" / f"{stem}.txt"
    if label_path.exists():
        label_path.unlink()
    return {"message": f"Deleted {filename}"}


@router.post("/{name}/export")
def export_dataset(name: str, format: str = "yolo"):
    """
    导出数据集为压缩包（YOLO 格式）
    返回下载链接
    """
    import zipfile
    import tempfile
    import json

    ds_dir = DATASETS_DIR / name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    # 生成 data.yaml
    meta_file = ds_dir / "meta.json"
    meta = json.loads(meta_file.read_text()) if meta_file.exists() else {"labels": []}
    labels = meta.get("labels", [])

    # 创建临时 zip
    export_dir = BASE_DIR / "exports"
    export_dir.mkdir(exist_ok=True)
    zip_path = export_dir / f"{name}_yolo.zip"

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # data.yaml
        yaml_content = f"path: .\ntrain: images\nval: images\n\nnc: {len(labels)}\nnames: {labels}\n"
        zf.writestr(f"{name}/data.yaml", yaml_content)

        # images
        images_dir = ds_dir / "images"
        if images_dir.exists():
            for img in images_dir.iterdir():
                zf.write(img, f"{name}/images/{img.name}")

        # labels
        labels_dir = ds_dir / "labels"
        if labels_dir.exists():
            for lbl in labels_dir.iterdir():
                zf.write(lbl, f"{name}/labels/{lbl.name}")

    return FileResponse(
        zip_path,
        filename=f"{name}_yolo.zip",
        media_type="application/zip",
    )


@router.put("/{name}")
def update_dataset(name: str, data: DatasetCreate):
    """更新数据集元信息（描述、类别标签）"""
    import json
    ds_dir = DATASETS_DIR / name
    if not ds_dir.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")
    meta = {"description": data.description, "labels": data.labels}
    (ds_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False))
    images_dir = ds_dir / "images"
    labels_dir = ds_dir / "labels"
    return DatasetInfo(
        name=name,
        description=data.description or "",
        labels=data.labels,
        image_count=len(list(images_dir.glob("*"))) if images_dir.exists() else 0,
        label_count=len(list(labels_dir.glob("*.txt"))) if labels_dir.exists() else 0,
    )
