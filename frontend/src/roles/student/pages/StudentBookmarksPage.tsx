import React, { useState } from 'react';
import { Bookmark, Tag, Trash2, ArrowRight, BookOpen } from 'lucide-react';

interface IBookmarkItem {
  id: string;
  title: string;
  type: 'QUESTION' | 'LESSON' | 'VOCAB';
  partOrSkill: string;
  savedAt: string;
}

const mockBookmarks: IBookmarkItem[] = [
  { id: 'b-1', title: 'Part 5: Phân biệt cấu trúc Not only... but also', type: 'QUESTION', partOrSkill: 'TOEIC Part 5', savedAt: 'Hôm qua' },
  { id: 'b-2', title: 'Từ vựng: Unanimous (Nhất trí, đồng lòng)', type: 'VOCAB', partOrSkill: 'Vocabulary B2', savedAt: '3 ngày trước' },
  { id: 'b-3', title: 'Bài học: 5 Mẹo Skimming đoạn văn thông báo Part 7', type: 'LESSON', partOrSkill: 'Reading Lesson', savedAt: '1 tuần trước' },
];

export const StudentBookmarksPage: React.FC = () => {
  const [items, setItems] = useState(mockBookmarks);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-indigo-600" />
          <span>Nội dung đã lưu (Bookmarks)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Nơi lưu trữ các câu hỏi khó, từ vựng hay và bài giảng bạn đã đánh dấu để xem lại.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4 hover:border-indigo-300 transition"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {item.partOrSkill}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{item.title}</h3>
                <span className="text-[11px] text-slate-400">Đã lưu: {item.savedAt}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Bỏ lưu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
            <Bookmark className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Chưa có mục nào được lưu lại.</p>
          </div>
        )}
      </div>
    </div>
  );
};
