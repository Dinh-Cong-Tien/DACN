import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, Mic, PenTool, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<'all' | 'listening' | 'reading' | 'grammar' | 'vocab'>('all');

  const categories = [
    {
      title: 'Luyện tập Nghe hiểu (Listening)',
      desc: 'Kho 1,500+ bài nghe tốc độ thực tế với đầy đủ 4 accents: Mỹ, Anh, Úc, Canada.',
      icon: Headphones,
      badge: 'TOEIC Part 1-4 & VSTEP',
      items: [
        { name: 'Part 1: Tranh miêu tả hành động', count: 120 },
        { name: 'Part 2: Hỏi & Đáp bẫy đồng âm', count: 250 },
        { name: 'Part 3: Hội thoại văn phòng', count: 180 },
        { name: 'Part 4: Thông báo tin nhắn thoại', count: 140 },
      ],
      type: 'listening',
    },
    {
      title: 'Luyện tập Đọc hiểu (Reading)',
      desc: 'Kỹ thuật Scan & Skim tìm từ khóa nhanh chóng trong email, báo cáo, hợp đồng kép.',
      icon: BookOpen,
      badge: 'TOEIC Part 5-7 & VSTEP',
      items: [
        { name: 'Part 5: Ngữ pháp câu trắc nghiệm', count: 450 },
        { name: 'Part 6: Điền đoạn văn hoàn chỉnh', count: 160 },
        { name: 'Part 7: Đọc hiểu văn bản đơn', count: 200 },
        { name: 'Part 7: Đọc hiểu văn bản kép/ba', count: 180 },
      ],
      type: 'reading',
    },
    {
      title: 'Luyện Ngữ pháp chuyên đề',
      desc: 'Phân loại 24 chủ điểm ngữ pháp cốt lõi hay xuất hiện nhất trong các đề thi.',
      icon: Target,
      badge: 'Cốt lõi',
      items: [
        { name: 'Thì động từ & Sự hòa hợp Chủ - Vị', count: 85 },
        { name: 'Mệnh đề quan hệ rút gọn (V-ing / V3)', count: 65 },
        { name: 'Thể bị động & Động từ khiếm khuyết', count: 70 },
        { name: 'Liên từ & Giới từ chỉ thời gian/nơi chốn', count: 90 },
      ],
      type: 'grammar',
    },
    {
      title: 'Luyện Từ vựng phản xạ (SRS)',
      desc: 'Ôn tập 1,200 từ vựng theo thuật toán SuperMemo SM-2 ghi nhớ vĩnh viễn.',
      icon: Zap,
      badge: 'Spaced Repetition',
      items: [
        { name: 'Chủ đề Hợp đồng & Pháp lý (Contracts)', count: 50 },
        { name: 'Chủ đề Marketing & Bán hàng', count: 50 },
        { name: 'Chủ đề Tài chính & Ngân hàng', count: 50 },
        { name: 'Chủ đề Nhân sự & Tuyển dụng', count: 50 },
      ],
      type: 'vocab',
    },
  ];

  const filtered = selectedSkill === 'all' ? categories : categories.filter((c) => c.type === selectedSkill);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chế độ Luyện tập Thích ứng thông minh</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Luyện tập Kỹ năng</h1>
          <p className="text-slate-600 text-sm">
            Chọn chủ đề bạn đang còn yếu để tập trung cải thiện. Hệ thống sẽ ngay lập tức giải thích chi tiết và phân loại lỗi nếu bạn chọn sai.
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:border-indigo-200 transition space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{cat.title}</h3>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {cat.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>

                <div className="divide-y divide-slate-100 pt-2 border-t border-slate-100">
                  {cat.items.map((it, iIdx) => (
                    <div key={iIdx} className="py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{it.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">{it.count} câu</span>
                        <Link
                          to="/app/practice"
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-600 text-[11px] font-bold transition flex items-center gap-1"
                        >
                          <span>Luyện</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
