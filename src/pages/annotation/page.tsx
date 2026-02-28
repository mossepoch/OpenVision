
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AnnotationCanvas, { BBox } from './components/AnnotationCanvas';
import AnnotationPanel from './components/AnnotationPanel';
import ImageList from './components/ImageList';
import CategoryManager, { Category } from './components/CategoryManager';
import AIPreAnnotation from './components/AIPreAnnotation';
import VideoFrameExtractor from './components/VideoFrameExtractor';
import {
  MOCK_ANNOTATION_IMAGES,
  MOCK_ANNOTATIONS,
  DEFAULT_CATEGORIES,
} from '../../mocks/annotationData';

type Tool = 'draw' | 'select';

const STORAGE_KEY = 'annotation_categories';
const MAX_HISTORY = 50;

interface AnnotationImage {
  id: string;
  name: string;
  url: string;
  annotationCount: number;
  status: string;
}

/** ----------------------------------------------------------------------
 *  Local storage helpers – they now return a fallback value and never
 *  throw, making the component more robust.
 * ---------------------------------------------------------------------- */
function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Category[];
  } catch {
    // ignore parsing / storage errors
  }
  return DEFAULT_CATEGORIES;
}

function saveCategories(cats: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch {
    // ignore storage errors – UI will still work
  }
}

/** ----------------------------------------------------------------------
 *  Main annotation page
 * ---------------------------------------------------------------------- */
export default function AnnotationPage() {
  const navigate = useNavigate();

  // ---------- Images ----------
  const [images, setImages] = useState<AnnotationImage[]>(MOCK_ANNOTATION_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<string>(MOCK_ANNOTATION_IMAGES[0].id);

  // ---------- Annotations ----------
  const [allAnnotations, setAllAnnotations] = useState<Record<string, BBox[]>>(() => {
    const init: Record<string, BBox[]> = {};
    MOCK_ANNOTATION_IMAGES.forEach((img) => {
      init[img.id] = (MOCK_ANNOTATIONS[img.id] ?? []).map((a) => ({ ...a }));
    });
    return init;
  });

  // ---------- History (undo/redo) ----------
  const historyRef = useRef<Record<string, BBox[]>[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // ---------- Categories ----------
  const [categories, setCategories] = useState<Category[]>(loadCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    DEFAULT_CATEGORIES[0]?.id ?? null
  );

  // ---------- UI state ----------
  const [tool, setTool] = useState<Tool>('draw');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showVideoExtractor, setShowVideoExtractor] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  const currentAnnotations = allAnnotations[selectedImageId] ?? [];

  // ---------- History helpers ----------
  const pushHistory = useCallback((state: Record<string, BBox[]>) => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    // Deep‑clone the state to avoid accidental mutations
    newHistory.push(JSON.parse(JSON.stringify(state)));
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  // Initialise history once when component mounts
  useEffect(() => {
    historyRef.current = [JSON.parse(JSON.stringify(allAnnotations))];
    historyIndexRef.current = 0;
  }, []);

  // ---------- Toast helper ----------
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ---------- Annotation updates ----------
  const handleAnnotationsChange = useCallback(
    (annotations: BBox[]) => {
      setAllAnnotations((prev) => {
        const next = { ...prev, [selectedImageId]: annotations };
        pushHistory(next);
        return next;
      });
      // Update image status / count
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                annotationCount: annotations.length,
                status: annotations.length > 0 ? 'labeled' : 'unlabeled',
              }
            : img
        )
      );
    },
    [selectedImageId, pushHistory]
  );

  // ---------- Undo / Redo ----------
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      showToast('已到最早记录', 'info');
      return;
    }
    historyIndexRef.current -= 1;
    const state = historyRef.current[historyIndexRef.current];
    setAllAnnotations(JSON.parse(JSON.stringify(state)));
    setSelectedAnnotationId(null);
    showToast('已撤销', 'info');
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) {
      showToast('已到最新记录', 'info');
      return;
    }
    historyIndexRef.current += 1;
    const state = historyRef.current[historyIndexRef.current];
    setAllAnnotations(JSON.parse(JSON.stringify(state)));
    setSelectedAnnotationId(null);
    showToast('已重做', 'info');
  }, []);

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId) {
        handleDeleteAnnotation(selectedAnnotationId);
      }
      if (e.key === 'v') setTool('select');
      if (e.key === 'b') setTool('draw');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleUndo, handleRedo, selectedAnnotationId]);

  // ---------- Annotation manipulation ----------
  const handleDeleteAnnotation = (id: string) => {
    const next = currentAnnotations.filter((a) => a.id !== id);
    handleAnnotationsChange(next);
    setSelectedAnnotationId(null);
  };

  const handleChangeCategoryId = (annId: string, catId: string) => {
    const next = currentAnnotations.map((a) =>
      a.id === annId ? { ...a, categoryId: catId } : a
    );
    handleAnnotationsChange(next);
  };

  // ---------- Category handling ----------
  const handleAddCategory = (name: string, color: string) => {
    const newCat: Category = { id: `cat-${Date.now()}`, name, color };
    const next = [...categories, newCat];
    setCategories(next);
    saveCategories(next);
    setSelectedCategoryId(newCat.id);
  };

  const handleDeleteCategory = (id: string) => {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    saveCategories(next);
    if (selectedCategoryId === id) setSelectedCategoryId(next[0]?.id ?? null);
  };

  // ---------- AI pre‑annotation ----------
  const handleAIAnnotations = (annotations: BBox[]) => {
    const next = [...currentAnnotations, ...annotations];
    handleAnnotationsChange(next);
    showToast(`AI 检测到 ${annotations.length} 个目标`, 'success');
  };

  // ---------- Video frame extraction ----------
  const handleFramesExtracted = (
    frames: Array<{ id: string; name: string; url: string; timestamp: number }>
  ) => {
    const newImages: AnnotationImage[] = frames.map((f) => ({
      id: f.id,
      name: f.name,
      url: f.url,
      annotationCount: 0,
      status: 'unlabeled',
    }));
    setImages((prev) => [...prev, ...newImages]);
    setAllAnnotations((prev) => {
      const next = { ...prev };
      newImages.forEach((img) => {
        next[img.id] = [];
      });
      return next;
    });
    showToast(`已添加 ${frames.length} 帧到标注队列`, 'success');
  };

  // ---------- Export (YOLO format) ----------
  const handleExport = () => {
    const lines: string[] = [];
    images.forEach((img) => {
      const anns = allAnnotations[img.id] ?? [];
      anns.forEach((ann) => {
        const catIdx = categories.findIndex((c) => c.id === ann.categoryId);
        if (catIdx < 0) return;
        const cx = ann.x + ann.width / 2;
        const cy = ann.y + ann.height / 2;
        lines.push(
          `${catIdx} ${cx.toFixed(6)} ${cy.toFixed(6)} ${ann.width.toFixed(
            6
          )} ${ann.height.toFixed(6)}`
        );
      });
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations_yolo.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 YOLO 格式标注文件', 'success');
  };

  // ---------- UI helpers ----------
  const selectedImage = images.find((i) => i.id === selectedImageId);
  const totalLabeled = images.filter((i) => i.status === 'labeled').length;
  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-[#f7f8fa] overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-[52px] bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0 z-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/datasets')}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-800 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line text-[14px]"></i>
          返回数据集
        </button>
        <div className="w-px h-5 bg-gray-200"></div>

        {/* Dataset info */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center bg-[#0052d9]/10 rounded">
            <i className="ri-edit-box-line text-[#0052d9] text-[12px]"></i>
          </div>
          <span className="text-[13px] font-semibold text-gray-800">数据标注</span>
          <span className="text-[11px] text-gray-400">工位装配检测数据集 v2.1</span>
        </div>

        <div className="flex-1"></div>

        {/* Tool selector */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setTool('select')}
            title="选择工具 (V)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              tool === 'select'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-cursor-line text-[13px]"></i>选择
          </button>
          <button
            onClick={() => setTool('draw')}
            title="绘制工具 (B)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              tool === 'draw'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-bounding-box text-[13px]"></i>绘制
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <i className="ri-arrow-go-back-line text-[15px]"></i>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <i className="ri-arrow-go-forward-line text-[15px]"></i>
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200"></div>

        {/* AI Pre‑annotation */}
        <button
          onClick={() => setShowAIPanel(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[12px] font-medium rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-robot-line text-[13px]"></i>AI 预标注
        </button>

        {/* Video frame extractor */}
        <button
          onClick={() => setShowVideoExtractor(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 text-[12px] font-medium rounded-lg hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-video-line text-[13px]"></i>视频拆帧
        </button>

        {/* Category manager */}
        <button
          onClick={() => setShowCategoryManager(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-[12px] font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-price-tag-3-line text-[13px]"></i>类别管理
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0052d9] text-white text-[12px] font-medium rounded-lg hover:bg-[#0041b0] transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-download-line text-[13px]"></i>导出 YOLO
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left – Image list */}
        <div className="w-[180px] flex-shrink-0 overflow-hidden border-r border-gray-100">
          <ImageList
            images={images}
            selectedId={selectedImageId}
            onSelect={(id) => {
              setSelectedImageId(id);
              setSelectedAnnotationId(null);
            }}
          />
        </div>

        {/* Center – Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas info bar */}
          <div className="h-8 bg-[#1a1a2e] flex items-center px-4 gap-4 flex-shrink-0">
            <span className="text-[11px] text-gray-400">{selectedImage?.name}</span>
            <span className="text-[11px] text-gray-500">{currentAnnotations.length} 个标注框</span>
            <div className="flex-1"></div>

            {/* Current category indicator (only for draw mode) */}
            {tool === 'draw' && selectedCategoryId && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500">当前类别:</span>
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background:
                      categories.find((c) => c.id === selectedCategoryId)?.color ?? '#999',
                  }}
                />
                <span className="text-[11px] text-gray-300">
                  {categories.find((c) => c.id === selectedCategoryId)?.name ?? '未选择'}
                </span>
              </div>
            )}

            <span className="text-[10px] text-gray-600">
              V=选择 &nbsp; B=绘制 &nbsp; Del=删除 &nbsp; Ctrl+Z=撤销
            </span>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden">
            {selectedImage && (
              <AnnotationCanvas
                imageUrl={selectedImage.url}
                annotations={currentAnnotations}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                selectedAnnotationId={selectedAnnotationId}
                tool={tool}
                onAnnotationsChange={handleAnnotationsChange}
                onSelectAnnotation={setSelectedAnnotationId}
              />
            )}
          </div>
        </div>

        {/* Right – Panels */}
        <div className="w-[220px] flex-shrink-0 flex flex-col border-l border-gray-100 bg-white overflow-hidden">
          {/* Category quick select */}
          <div className="px-3 py-3 border-b border-gray-100">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              标注类别
            </div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setTool('draw');
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] transition-all cursor-pointer ${
                    selectedCategoryId === cat.id && tool === 'draw'
                      ? 'bg-gray-100 font-semibold text-gray-800'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                  {selectedCategoryId === cat.id && tool === 'draw' && (
                    <i className="ri-check-line text-[11px] ml-auto text-gray-500"></i>
                  )}
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-[11px] text-gray-400 text-center py-2">暂无类别</div>
              )}
            </div>
          </div>

          {/* Annotation list */}
          <div className="flex-1 overflow-hidden">
            <AnnotationPanel
              annotations={currentAnnotations}
              categories={categories}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
              onDeleteAnnotation={handleDeleteAnnotation}
              onChangeCategoryId={handleChangeCategoryId}
            />
          </div>

          {/* Stats footer */}
          <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-[15px] font-bold text-gray-800">{totalLabeled}</div>
                <div className="text-[10px] text-gray-400">已标注</div>
              </div>
              <div className="text-center">
                <div className="text-[15px] font-bold text-gray-800">{images.length - totalLabeled}</div>
                <div className="text-[10px] text-gray-400">未标注</div>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${images.length > 0 ? (totalLabeled / images.length) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="text-[10px] text-gray-400 text-center mt-1">
              {images.length > 0 ? Math.round((totalLabeled / images.length) * 100) : 0}% 完成
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setShowCategoryManager(false);
          }}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {showAIPanel && (
        <AIPreAnnotation
          categories={categories}
          onAnnotationsGenerated={handleAIAnnotations}
          onClose={() => setShowAIPanel(false)}
        />
      )}

      {showVideoExtractor && (
        <VideoFrameExtractor
          onFramesExtracted={handleFramesExtracted}
          onClose={() => setShowVideoExtractor(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-[12px] font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          <i
            className={`text-[14px] ${
              toast.type === 'success'
                ? 'ri-check-line'
                : toast.type === 'error'
                ? 'ri-error-warning-line'
                : 'ri-information-line'
            }`}
          ></i>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
