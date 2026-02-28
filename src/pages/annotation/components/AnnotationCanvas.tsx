
import { useRef, useEffect, useState, useCallback } from 'react';
import { Category } from './CategoryManager';

export interface BBox {
  id: string;
  categoryId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

type Tool = 'draw' | 'select';
type Handle = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr' | 'move' | null;

interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: BBox[];
  categories: Category[];
  selectedCategoryId: string | null;
  selectedAnnotationId: string | null;
  tool: Tool;
  onAnnotationsChange: (annotations: BBox[]) => void;
  onSelectAnnotation: (id: string | null) => void;
}

const HANDLE_SIZE = 7;

function getHandleRects(box: { x: number; y: number; w: number; h: number }) {
  const { x, y, w, h } = box;
  const hs = HANDLE_SIZE;
  return {
    tl: { x: x - hs / 2, y: y - hs / 2, w: hs, h: hs },
    tm: { x: x + w / 2 - hs / 2, y: y - hs / 2, w: hs, h: hs },
    tr: { x: x + w - hs / 2, y: y - hs / 2, w: hs, h: hs },
    ml: { x: x - hs / 2, y: y + h / 2 - hs / 2, w: hs, h: hs },
    mr: { x: x + w - hs / 2, y: y + h / 2 - hs / 2, w: hs, h: hs },
    bl: { x: x - hs / 2, y: y + h - hs / 2, w: hs, h: hs },
    bm: { x: x + w / 2 - hs / 2, y: y + h - hs / 2, w: hs, h: hs },
    br: { x: x + w - hs / 2, y: y + h - hs / 2, w: hs, h: hs },
  };
}

function hitHandle(
  mx: number,
  my: number,
  handles: ReturnType<typeof getHandleRects>
): Handle {
  for (const [key, r] of Object.entries(handles)) {
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      return key as Handle;
    }
  }
  return null;
}

export default function AnnotationCanvas({
  imageUrl,
  annotations,
  categories,
  selectedCategoryId,
  selectedAnnotationId,
  tool,
  onAnnotationsChange,
  onSelectAnnotation,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  // Drawing state
  const isDrawing = useRef(false);
  const drawStart = useRef({ x: 0, y: 0 });
  const drawCurrent = useRef({ x: 0, y: 0 });

  // Drag/resize state
  const isDragging = useRef(false);
  const activeHandle = useRef<Handle>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragOrigBox = useRef<BBox | null>(null);

  const getCatColor = useCallback(
    (catId: string) => categories.find((c) => c.id === catId)?.color ?? '#0052d9',
    [categories]
  );

  const getCatName = useCallback(
    (catId: string) => categories.find((c) => c.id === catId)?.name ?? catId,
    [categories]
  );

  // Convert normalized coords to canvas pixels
  const toCanvas = useCallback(
    (nx: number, ny: number) => ({
      x: nx * canvasSize.w,
      y: ny * canvasSize.h,
    }),
    [canvasSize]
  );

  // Convert canvas pixels to normalized coords
  const toNorm = useCallback(
    (cx: number, cy: number) => ({
      x: cx / canvasSize.w,
      y: cy / canvasSize.h,
    }),
    [canvasSize]
  );

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: MouseEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Resize canvas to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth > 0 && clientHeight > 0) {
        setCanvasSize({ w: clientWidth, h: clientHeight });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Load image
  useEffect(() => {
    setImgLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => setImgLoaded(false);
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    // Draw image
    if (imgRef.current && imgLoaded) {
      ctx.drawImage(imgRef.current, 0, 0, canvasSize.w, canvasSize.h);
    } else {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('加载图片中...', canvasSize.w / 2, canvasSize.h / 2);
    }

    // Draw annotations
    annotations.forEach((ann) => {
      const p1 = toCanvas(ann.x, ann.y);
      const p2 = toCanvas(ann.x + ann.width, ann.y + ann.height);
      const bw = p2.x - p1.x;
      const bh = p2.y - p1.y;
      const color = getCatColor(ann.categoryId);
      const isSelected = ann.id === selectedAnnotationId;

      // Box fill
      ctx.fillStyle = color + '22';
      ctx.fillRect(p1.x, p1.y, bw, bh);

      // Box border
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.setLineDash(isSelected ? [] : []);
      ctx.strokeRect(p1.x, p1.y, bw, bh);

      // Label background (fallback for browsers without roundRect)
      const label = getCatName(ann.categoryId);
      ctx.font = 'bold 11px Inter, sans-serif';
      const textW = ctx.measureText(label).width;
      const labelH = 18;
      const labelY = p1.y > labelH ? p1.y - labelH : p1.y;
      ctx.fillStyle = color;
      // Use a simple rectangle instead of roundRect for compatibility
      ctx.fillRect(p1.x, labelY, textW + 10, labelH);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, p1.x + 5, labelY + 13);

      // Handles for selected
      if (isSelected) {
        const handles = getHandleRects({ x: p1.x, y: p1.y, w: bw, h: bh });
        Object.values(handles).forEach((hr) => {
          ctx.fillStyle = '#fff';
          ctx.fillRect(hr.x, hr.y, hr.w, hr.h);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(hr.x, hr.y, hr.w, hr.h);
        });
      }
    });

    // Draw current drawing box
    if (isDrawing.current) {
      const sx = drawStart.current.x;
      const sy = drawStart.current.y;
      const ex = drawCurrent.current.x;
      const ey = drawCurrent.current.y;
      const bx = Math.min(sx, ex);
      const by = Math.min(sy, ey);
      const bw2 = Math.abs(ex - sx);
      const bh2 = Math.abs(ey - sy);
      ctx.fillStyle = 'rgba(0,82,217,0.12)';
      ctx.fillRect(bx, by, bw2, bh2);
      ctx.strokeStyle = '#0052d9';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(bx, by, bw2, bh2);
      ctx.setLineDash([]);
    }
  }, [
    annotations,
    canvasSize,
    imgLoaded,
    selectedAnnotationId,
    getCatColor,
    getCatName,
    toCanvas,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Hit test annotation
  const hitAnnotation = useCallback(
    (mx: number, my: number): string | null => {
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        const p1 = toCanvas(ann.x, ann.y);
        const p2 = toCanvas(ann.x + ann.width, ann.y + ann.height);
        if (mx >= p1.x && mx <= p2.x && my >= p1.y && my <= p2.y) {
          return ann.id;
        }
      }
      return null;
    },
    [annotations, toCanvas]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getMousePos(e);

      if (tool === 'draw') {
        if (!selectedCategoryId) return;
        isDrawing.current = true;
        drawStart.current = { x, y };
        drawCurrent.current = { x, y };
      } else {
        // Select tool: check handles first
        if (selectedAnnotationId) {
          const selAnn = annotations.find((a) => a.id === selectedAnnotationId);
          if (selAnn) {
            const p1 = toCanvas(selAnn.x, selAnn.y);
            const p2 = toCanvas(selAnn.x + selAnn.width, selAnn.y + selAnn.height);
            const handles = getHandleRects({
              x: p1.x,
              y: p1.y,
              w: p2.x - p1.x,
              h: p2.y - p1.y,
            });
            const hit = hitHandle(x, y, handles);
            if (hit) {
              activeHandle.current = hit;
              isDragging.current = true;
              dragStart.current = { x, y };
              dragOrigBox.current = { ...selAnn };
              return;
            }
            // Check move
            if (x >= p1.x && x <= p2.x && y >= p1.y && y <= p2.y) {
              activeHandle.current = 'move';
              isDragging.current = true;
              dragStart.current = { x, y };
              dragOrigBox.current = { ...selAnn };
              return;
            }
          }
        }
        // Click to select
        const hitId = hitAnnotation(x, y);
        onSelectAnnotation(hitId);
      }
    },
    [
      tool,
      selectedCategoryId,
      selectedAnnotationId,
      annotations,
      getMousePos,
      toCanvas,
      hitAnnotation,
      onSelectAnnotation,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getMousePos(e);

      if (tool === 'draw' && isDrawing.current) {
        drawCurrent.current = { x, y };
        draw();
        return;
      }

      if (
        tool === 'select' &&
        isDragging.current &&
        dragOrigBox.current &&
        selectedAnnotationId
      ) {
        const dx = (x - dragStart.current.x) / canvasSize.w;
        const dy = (y - dragStart.current.y) / canvasSize.h;
        const orig = dragOrigBox.current;
        const handle = activeHandle.current;

        let nx = orig.x,
          ny = orig.y,
          nw = orig.width,
          nh = orig.height;

        if (handle === 'move') {
          nx = Math.max(0, Math.min(1 - nw, orig.x + dx));
          ny = Math.max(0, Math.min(1 - nh, orig.y + dy));
        } else {
          if (handle === 'tl' || handle === 'ml' || handle === 'bl') {
            nx = Math.min(orig.x + orig.width - 0.01, orig.x + dx);
            nw = orig.width - dx;
          }
          if (handle === 'tr' || handle === 'mr' || handle === 'br') {
            nw = Math.max(0.01, orig.width + dx);
          }
          if (handle === 'tl' || handle === 'tm' || handle === 'tr') {
            ny = Math.min(orig.y + orig.height - 0.01, orig.y + dy);
            nh = orig.height - dy;
          }
          if (handle === 'bl' || handle === 'bm' || handle === 'br') {
            nh = Math.max(0.01, orig.height + dy);
          }
          nx = Math.max(0, nx);
          ny = Math.max(0, ny);
          nw = Math.min(1 - nx, nw);
          nh = Math.min(1 - ny, nh);
        }

        const updated = annotations.map((a) =>
          a.id === selectedAnnotationId ? { ...a, x: nx, y: ny, width: nw, height: nh } : a
        );
        onAnnotationsChange(updated);
      }
    },
    [
      tool,
      getMousePos,
      draw,
      canvasSize,
      selectedAnnotationId,
      annotations,
      onAnnotationsChange,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getMousePos(e);

      if (tool === 'draw' && isDrawing.current) {
        isDrawing.current = false;
        const sx = drawStart.current.x;
        const sy = drawStart.current.y;
        const bx = Math.min(sx, x);
        const by = Math.min(sy, y);
        const bw = Math.abs(x - sx);
        const bh = Math.abs(y - sy);

        if (bw > 10 && bh > 10 && selectedCategoryId) {
          const norm = toNorm(bx, by);
          const normW = bw / canvasSize.w;
          const normH = bh / canvasSize.h;
          const newAnn: BBox = {
            id: `ann-${Date.now()}`,
            categoryId: selectedCategoryId,
            x: Math.max(0, norm.x),
            y: Math.max(0, norm.y),
            width: Math.min(1 - norm.x, normW),
            height: Math.min(1 - norm.y, normH),
          };
          onAnnotationsChange([...annotations, newAnn]);
          onSelectAnnotation(newAnn.id);
        }
        draw();
      }

      if (isDragging.current) {
        isDragging.current = false;
        activeHandle.current = null;
        dragOrigBox.current = null;
      }
    },
    [
      tool,
      getMousePos,
      selectedCategoryId,
      toNorm,
      canvasSize,
      annotations,
      onAnnotationsChange,
      onSelectAnnotation,
      draw,
    ]
  );

  // Cursor style
  const getCursor = () => {
    if (tool === 'draw') return selectedCategoryId ? 'crosshair' : 'not-allowed';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-[#1a1a2e]"
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        style={{
          cursor: getCursor(),
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
