import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, Clock, Award, CheckCircle2, ArrowRight, Sparkles, HelpCircle, Layers } from 'lucide-react';

export const ToeicPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'scoring'>('parts');

  const parts = [
    { part: 'Part 1', name: 'Photographs', questions: 6, skill: 'Listening', desc: 'Mô tả hình ảnh: quan sát hành động nhân vật, vị trí đồ vật và ngữ cảnh không gian.' },
    { part: 'Part 2', name: 'Question-Response', questions: 25, skill: 'Listening', desc: 'Hỏi & Đáp: Nhận diện câu hỏi Wh-, câu hỏi Yes/No, câu hỏi gián tiếp và bẫy đồng âm.' },
    { part: 'Part 3', name: 'Conversations', questions: 39, skill: 'Listening', desc: 'Hội thoại ngắn: Nghe cuộc trao đổi 2-3 người, kèm bảng biểu hoặc biểu đồ kết hợp.' },
    { part: 'Part 4', name: 'Short Talks', questions: 30, skill: 'Listening', desc: 'Bài nói độc thoại: Thông báo sân bay, quảng cáo radio, tin nhắn thoại, bản tin thời sự.' },
    { part: 'Part 5', name: 'Incomplete Sentences', questions: 30, skill: 'Reading', desc: 'Điền vào câu: Kiểm tra ngữ pháp cốt lõi (từ loại, chia thì, mệnh đề quan hệ) và từ vựng.' },
    { part: 'Part 6', name: 'Text Completion', questions: 16, skill: 'Reading', desc: 'Hoàn thành đoạn văn: Điền từ, cụm từ hoặc cả câu phù hợp với mạch văn toàn bài.' },
    { part: 'Part 7', name: 'Reading Comprehension', questions: 54, skill: 'Reading', desc: 'Đọc hiểu đoạn văn: Đoạn đơn, đoạn kép và đoạn ba (email, lịch trình, bài báo, tin nhắn chat).' },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Chương trình luyện thi TOEIC® 2026 Chuẩn Quốc tế</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Luyện thi TOEIC Listening & Reading thích ứng năng lực
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Nắm chắc 7 Parts bài thi, làm chủ 1000+ bẫy câu hỏi thường gặp và tự động lưu lỗi sai để ôn ngắt quãng trước kỳ thi thật.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl transition"
            >
              Test đầu vào TOEIC miễn phí
            </Link>
            <Link
              to="/mock-tests"
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50 transition"
            >
              Kho 50+ đề thi thử có chấm điểm
            </Link>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center border-b border-slate-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('parts')}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'parts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Cấu trúc chi tiết 7 Parts
            </button>
            <button
              onClick={() => setActiveTab('scoring')}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'scoring'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Thang điểm & Bảng quy đổi ETS
            </button>
          </div>
        </div>

        {/* Parts Grid */}
        {activeTab === 'parts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parts.map((p) => (
              <div
                key={p.part}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-200 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {p.part} • {p.questions} câu
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    {p.skill === 'Listening' ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    {p.skill}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                <div className="pt-2">
                  <Link
                    to={`/practice?part=${p.part}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <span>Luyện riêng {p.part}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scoring Table */}
        {activeTab === 'scoring' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Bảng quy đổi thang điểm TOEIC ETS (5 - 495)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Điểm bài thi TOEIC không tính theo tỷ lệ tuyến tính đơn giản (1 câu = 5 điểm) mà áp dụng thuật toán chuẩn hóa độ khó (Equating) của viện khảo thí ETS.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Số câu đúng (0-100)</th>
                    <th className="p-3">Điểm quy đổi Listening</th>
                    <th className="p-3">Điểm quy đổi Reading</th>
                    <th className="p-3 rounded-r-xl">Tổng điểm ước tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                  <tr>
                    <td className="p-3 font-bold text-slate-800">95 - 100 câu</td>
                    <td className="p-3 font-black text-emerald-600">485 - 495</td>
                    <td className="p-3 font-black text-emerald-600">475 - 495</td>
                    <td className="p-3 font-black text-indigo-600">960 - 990 (Xuất sắc)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">80 - 90 câu</td>
                    <td className="p-3 font-black text-indigo-600">420 - 460</td>
                    <td className="p-3 font-black text-indigo-600">390 - 440</td>
                    <td className="p-3 font-black text-indigo-600">810 - 900 (Nâng cao)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">65 - 75 câu</td>
                    <td className="p-3 font-black text-slate-800">330 - 380</td>
                    <td className="p-3 font-black text-slate-800">310 - 360</td>
                    <td className="p-3 font-black text-indigo-600">640 - 740 (Trung cấp)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-800">45 - 55 câu</td>
                    <td className="p-3 font-black text-slate-800">220 - 275</td>
                    <td className="p-3 font-black text-slate-800">210 - 265</td>
                    <td className="p-3 font-black text-indigo-600">430 - 540 (Cơ bản)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
