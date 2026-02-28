
import { useState } from 'react';

export interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#84cc16',
  '#0ea5e9',
  '#a855f7',
];

export default function CategoryManager({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onClose,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#ef4444');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('类别名称不能为空');
      return;
    }
    if (categories.some((c) => c.name === trimmed)) {
      setError('类别名称已存在');
      return;
    }
    try {
      onAddCategory(trimmed, newColor);
      setNewName('');
      setError('');
    } catch (e) {
      // Defensive: in case the parent throws
      setError('添加类别失败，请稍后重试');
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900">类别管理</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-close-line text-gray-500 text-[16px]"></i>
          </button>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-[12px]">
              暂无类别，请添加
            </div>
          )}
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-gray-100 ring-1 ring-gray-300'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              ></div>
              <span className="flex-1 text-[13px] text-gray-800 font-medium">
                {cat.name}
              </span>
              {selectedCategoryId === cat.id && (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  当前选中
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(cat.id);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <i className="ri-delete-bin-line text-[13px]"></i>
              </button>
            </div>
          ))}
        </div>

        {/* Add New */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            添加新类别
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="输入类别名称..."
              className="flex-1 px-3 py-2 text-[12px] border border-gray-200 rounded-lg outline-none focus:border-[#0052d9] bg-white"
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-[#0052d9] text-white text-[12px] rounded-lg hover:bg-[#0041b0] transition-colors cursor-pointer whitespace-nowrap"
            >
              添加
            </button>
          </div>
          {error && <div className="text-[11px] text-red-500 mb-2">{error}</div>}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                  newColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
