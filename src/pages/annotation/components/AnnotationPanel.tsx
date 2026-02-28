
import { Category } from './CategoryManager';
import { BBox } from './AnnotationCanvas';

interface AnnotationPanelProps {
  annotations: BBox[];
  categories: Category[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onDeleteAnnotation: (id: string) => void;
  onChangeCategoryId: (annId: string, catId: string) => void;
}

export default function AnnotationPanel({
  annotations,
  categories,
  selectedAnnotationId,
  onSelectAnnotation,
  onDeleteAnnotation,
  onChangeCategoryId,
}: AnnotationPanelProps) {
  const getCat = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-gray-700">标注列表</span>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {annotations.length} 个
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {annotations.length === 0 && (
          <div className="text-center py-8">
            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2 text-gray-300">
              <i className="ri-bounding-box text-[24px]"></i>
            </div>
            <div className="text-[11px] text-gray-400">暂无标注框</div>
            <div className="text-[10px] text-gray-300 mt-1">
              选择绘制工具后在图片上拖拽
            </div>
          </div>
        )}
        {annotations.map((ann, idx) => {
          const cat = getCat(ann.categoryId);
          const isSelected = ann.id === selectedAnnotationId;

          return (
            <div
              key={ann.id}
              onClick={() => onSelectAnnotation(isSelected ? null : ann.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#eef2ff] ring-1 ring-[#0052d9] ring-opacity-30'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cat?.color ?? '#999' }}
              />
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-gray-700 truncate">
                  #{idx + 1} {cat?.name ?? ann.categoryId}
                </div>
                <div className="text-[10px] text-gray-400">
                  {(ann.width * 100).toFixed(0)}% × {(ann.height * 100).toFixed(0)}%
                </div>
              </div>
              {/* Category change */}
              {isSelected && (
                <select
                  value={ann.categoryId}
                  onChange={(e) => {
                    e.stopPropagation();
                    onChangeCategoryId(ann.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] border border-gray-200 rounded-md px-1 py-0.5 outline-none bg-white cursor-pointer max-w-[80px]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAnnotation(ann.id);
                }}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
              >
                <i className="ri-delete-bin-line text-[12px]"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
