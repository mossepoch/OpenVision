
import React from 'react';

interface AnnotationImage {
  id: string;
  name: string;
  url: string;
  annotationCount: number;
  status: string;
}

interface ImageListProps {
  images: AnnotationImage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ImageList({ images, selectedId, onSelect }: ImageListProps) {
  const labeled = images.filter((i) => i.status === 'labeled').length;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="text-[12px] font-semibold text-gray-700 mb-1">图片列表</div>
        <div className="text-[10px] text-gray-400">
          已标注{' '}
          <span className="text-emerald-600 font-medium">{labeled}</span> / {images.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => onSelect(img.id)}
            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer text-left ${
              selectedId === img.id
                ? 'bg-[#eef2ff] ring-1 ring-[#0052d9]/30'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-12 h-9 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
              {img.status === 'labeled' && (
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                  <i className="ri-check-line text-white text-[8px]"></i>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-gray-700 truncate">
                {String(idx + 1).padStart(3, '0')}. {img.name}
              </div>
              <div className="text-[10px] mt-0.5">
                {img.annotationCount > 0 ? (
                  <span className="text-[#0052d9]">{img.annotationCount} 个标注</span>
                ) : (
                  <span className="text-gray-400">未标注</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
