"""
标注管理 API — 完全对齐前端 mock 数据结构
路径前缀: /api/v1/annotation

前端 mock 数据格式:
  图片: {id, name, url, width, height, annotationCount, status}
  标注: {id, categoryId, x, y, width, height}  (左上角 + 宽高，归一化 0~1)
  类别: {id, name, color}

后端存储仍用 YOLO 格式 (class_id cx cy w h)，接口层自动转换。
"""
import json
import uuid
import time
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(tags=["标注管理"])

BASE_DIR = Path(__file__).parent.parent.parent.parent.parent  # backend/
DATASETS_DIR = BASE_DIR / "datasets"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# 类别配置持久化
CATEGORIES_FILE = DATA_DIR / "annotation_categories.json"

# 默认类别（和前端 DEFAULT_CATEGORIES 一致）
DEFAULT_CATEGORIES = [
    {"id": "cat-1", "name": "helmet", "color": "#ef4444"},
    {"id": "cat-2", "name": "glove", "color": "#f97316"},
    {"id": "cat-3", "name": "wrench", "color": "#eab308"},
    {"id": "cat-4", "name": "bolt", "color": "#22c55e"},
    {"id": "cat-5", "name": "tool_box", "color": "#06b6d4"},
    {"id": "cat-6", "name": "engine_part", "color": "#8b5cf6"},
]


def _load_categories() -> List[dict]:
    if CATEGORIES_FILE.exists():
        return json.loads(CATEGORIES_FILE.read_text())
    return DEFAULT_CATEGORIES


def _save_categories(cats: List[dict]):
    CATEGORIES_FILE.write_text(json.dumps(cats, ensure_ascii=False, indent=2))


def _get_dataset_dir(dataset_name: str) -> Path:
    ds = DATASETS_DIR / dataset_name
    if not ds.exists():
        raise HTTPException(status_code=404, detail=f"数据集 '{dataset_name}' 不存在")
    return ds


def _yolo_to_bbox(line: str, categories: List[dict]) -> Optional[dict]:
    """YOLO 格式行 → 前端 BBox 对象"""
    parts = line.strip().split()
    if len(parts) < 5:
        return None
    class_id = int(parts[0])
    cx, cy, w, h = float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])
    # 中心坐标 → 左上角坐标
    x = cx - w / 2
    y = cy - h / 2
    # 找对应类别
    cat_id = categories[class_id]["id"] if class_id < len(categories) else f"cat-{class_id}"
    return {
        "id": f"ann-{uuid.uuid4().hex[:8]}",
        "categoryId": cat_id,
        "x": round(x, 6),
        "y": round(y, 6),
        "width": round(w, 6),
        "height": round(h, 6),
    }


def _bbox_to_yolo(bbox: dict, categories: List[dict]) -> str:
    """前端 BBox 对象 → YOLO 格式行"""
    cat_id = bbox.get("categoryId", "cat-0")
    class_id = 0
    for i, cat in enumerate(categories):
        if cat["id"] == cat_id:
            class_id = i
            break
    # 左上角 + 宽高 → 中心坐标
    x = bbox.get("x", 0)
    y = bbox.get("y", 0)
    w = bbox.get("width", 0)
    h = bbox.get("height", 0)
    cx = x + w / 2
    cy = y + h / 2
    return f"{class_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}"


# ── 接口 1: 获取图片列表（含标注状态） ──────────────────────────────────────


@router.get("/images")
def list_images(dataset: str):
    """
    GET /api/v1/annotation/images?dataset=<name>
    返回格式和前端 MOCK_ANNOTATION_IMAGES 一致
    """
    ds_dir = _get_dataset_dir(dataset)
    images_dir = ds_dir / "images"
    labels_dir = ds_dir / "labels"

    if not images_dir.exists():
        return []

    exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    result = []
    for f in sorted(images_dir.iterdir()):
        if f.suffix.lower() not in exts:
            continue
        label_file = labels_dir / f"{f.stem}.txt"
        has_labels = label_file.exists() and label_file.stat().st_size > 0
        ann_count = 0
        if has_labels:
            ann_count = len([l for l in label_file.read_text().splitlines() if l.strip()])

        result.append({
            "id": f.name,  # 用文件名作为 id
            "name": f.name,
            "url": f"/dataset-files/{dataset}/images/{f.name}",
            "width": 0,   # 需要实际读取图片才能知道，先给 0
            "height": 0,
            "annotationCount": ann_count,
            "status": "labeled" if has_labels else "unlabeled",
        })

    return result


# ── 接口 2: 获取单张图片的标注框 ─────────────────────────────────────────


@router.get("/images/{image_id}/annotations")
def get_annotations(image_id: str, dataset: str):
    """
    GET /api/v1/annotation/images/<id>/annotations?dataset=<name>
    返回格式和前端 MOCK_ANNOTATIONS[imageId] 一致
    """
    ds_dir = _get_dataset_dir(dataset)
    stem = Path(image_id).stem
    label_path = ds_dir / "labels" / f"{stem}.txt"
    categories = _load_categories()

    if not label_path.exists():
        return []

    lines = [l for l in label_path.read_text().splitlines() if l.strip()]
    annotations = []
    for line in lines:
        bbox = _yolo_to_bbox(line, categories)
        if bbox:
            annotations.append(bbox)

    return annotations


# ── 接口 3: 保存标注 ──────────────────────────────────────────────────────


class SaveAnnotationsRequest(BaseModel):
    annotations: List[dict]  # [{id, categoryId, x, y, width, height}]


@router.post("/images/{image_id}/annotations")
async def save_annotations(image_id: str, dataset: str, request: Request):
    """
    POST /api/v1/annotation/images/<id>/annotations?dataset=<name>
    请求体: [{id, categoryId, x, y, width, height}, ...]
    """
    ds_dir = _get_dataset_dir(dataset)
    stem = Path(image_id).stem
    label_path = ds_dir / "labels" / f"{stem}.txt"
    label_path.parent.mkdir(exist_ok=True)
    categories = _load_categories()

    body = await request.json()
    # 支持直接数组或 {"annotations": [...]}
    if isinstance(body, dict):
        annotations = body.get("annotations", [])
    else:
        annotations = body

    lines = []
    for bbox in annotations:
        lines.append(_bbox_to_yolo(bbox, categories))

    label_path.write_text("\n".join(lines))

    return {
        "message": f"已保存 {len(lines)} 条标注",
        "count": len(lines),
        "image_id": image_id,
    }


# ── 接口 4: 删除单个标注 ──────────────────────────────────────────────────


@router.delete("/annotations/{annotation_id}")
def delete_annotation(annotation_id: str, dataset: str, image_id: str):
    """
    DELETE /api/v1/annotation/annotations/<id>?dataset=<name>&image_id=<filename>
    通过 annotation_id 定位并删除该条标注
    注意：由于标注存在文件中，需要知道属于哪张图片
    """
    ds_dir = _get_dataset_dir(dataset)
    stem = Path(image_id).stem
    label_path = ds_dir / "labels" / f"{stem}.txt"

    if not label_path.exists():
        raise HTTPException(status_code=404, detail="标注文件不存在")

    # 读取所有标注，转为带 id 的 bbox，找到要删的那条
    categories = _load_categories()
    lines = [l for l in label_path.read_text().splitlines() if l.strip()]

    # 因为标注没有持久化 id，按行号匹配（前端需要传 index 或重新生成）
    # 更实际的做法：前端传标注内容来匹配
    # 这里我们用行号作为删除标识
    try:
        idx = int(annotation_id.replace("ann-", "").replace("line-", ""))
        if 0 <= idx < len(lines):
            lines.pop(idx)
            label_path.write_text("\n".join(lines))
            return {"message": "已删除", "remaining": len(lines)}
    except ValueError:
        pass

    # 如果 annotation_id 不是行号格式，返回错误提示
    raise HTTPException(
        status_code=400,
        detail="删除单条标注建议通过保存接口重写整组标注（POST annotations），更可靠"
    )


# ── 接口 5: 获取标注类别列表 ──────────────────────────────────────────────


@router.get("/categories")
def get_categories(dataset: Optional[str] = None):
    """
    GET /api/v1/annotation/categories?dataset=<name>
    返回格式和前端 DEFAULT_CATEGORIES 一致: [{id, name, color}]
    如果指定了 dataset，优先用该数据集 meta.json 里的 labels 生成类别
    """
    if dataset:
        ds_dir = DATASETS_DIR / dataset
        meta_file = ds_dir / "meta.json"
        if meta_file.exists():
            meta = json.loads(meta_file.read_text())
            labels = meta.get("labels", [])
            if labels:
                # 预定义颜色池
                colors = [
                    "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
                    "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#6366f1",
                    "#84cc16", "#e11d48", "#0ea5e9", "#a855f7", "#10b981",
                ]
                return [
                    {
                        "id": f"cat-{i+1}",
                        "name": name,
                        "color": colors[i % len(colors)],
                    }
                    for i, name in enumerate(labels)
                ]

    return _load_categories()


@router.post("/categories")
async def save_categories(request: Request):
    """
    POST /api/v1/annotation/categories
    请求体: [{id, name, color}, ...]
    """
    body = await request.json()
    if isinstance(body, list):
        _save_categories(body)
        return {"message": f"已保存 {len(body)} 个类别", "count": len(body)}
    raise HTTPException(status_code=400, detail="请求体应为类别数组")


# ── 接口 6: AI 预标注 ─────────────────────────────────────────────────────


class AIPredictRequest(BaseModel):
    dataset: str
    image_id: str
    confidence: float = 0.25
    classes: Optional[List[str]] = None  # 只返回指定类别


@router.post("/ai-predict")
async def ai_predict(request: Request):
    """
    POST /api/v1/annotation/ai-predict
    请求体: {dataset, image_id, confidence, classes}
    返回前端 BBox 格式的预测结果，不自动保存
    """
    body = await request.json()
    dataset_name = body.get("dataset")
    image_id = body.get("image_id")
    confidence = body.get("confidence", 0.25)
    filter_classes = body.get("classes")

    if not dataset_name or not image_id:
        raise HTTPException(status_code=400, detail="需要 dataset 和 image_id 参数")

    ds_dir = _get_dataset_dir(dataset_name)
    image_path = ds_dir / "images" / image_id
    if not image_path.exists():
        raise HTTPException(status_code=404, detail=f"图片不存在: {image_id}")

    try:
        from ultralytics import YOLO
    except ImportError:
        raise HTTPException(status_code=500, detail="YOLO 模型未安装")

    # 加载数据集类别
    categories = _load_categories()
    cat_names = [c["name"] for c in categories]

    # 运行 YOLO 检测
    model = YOLO("yolov8n.pt")
    results = model(str(image_path), conf=confidence, verbose=False)

    annotations = []
    for r in results:
        img_w, img_h = r.orig_shape[1], r.orig_shape[0]
        for box in r.boxes:
            cls_name = r.names[int(box.cls)]

            # 类别过滤
            if filter_classes and cls_name not in filter_classes:
                continue

            # 找到对应的 category
            if cls_name in cat_names:
                cat_idx = cat_names.index(cls_name)
                cat_id = categories[cat_idx]["id"]
            else:
                cat_id = f"cat-{int(box.cls)}"

            x1, y1, x2, y2 = box.xyxy[0].tolist()
            # 归一化到 0~1 并转为左上角 + 宽高
            x = x1 / img_w
            y = y1 / img_h
            w = (x2 - x1) / img_w
            h = (y2 - y1) / img_h

            annotations.append({
                "id": f"ai-{uuid.uuid4().hex[:8]}",
                "categoryId": cat_id,
                "x": round(x, 6),
                "y": round(y, 6),
                "width": round(w, 6),
                "height": round(h, 6),
                "confidence": round(float(box.conf), 4),
                "label": cls_name,
            })

    return {
        "annotations": annotations,
        "count": len(annotations),
        "model": "yolov8n.pt",
    }
