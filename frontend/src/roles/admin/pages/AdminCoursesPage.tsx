import React, { useState } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, CheckCircle2, Clock, Users } from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState([
    { id: 'CRS-01', title: 'Khóa học Nền tảng TOEIC 450+ Cấp tốc', type: 'TOEIC', lessons: 32, students: 1420, status: 'PUBLISHED' },
    { id: 'CRS-02', title: 'Khóa học Bứt phá TOEIC 750+ Chuyên sâu', type: 'TOEIC', lessons: 48, students: 2150, status: 'PUBLISHED' },
    { id: 'CRS-03', title: 'Luyện thi VSTEP B1 Đầu ra Đại học', type: 'VSTEP', lessons: 36, students: 980, status: 'PUBLISHED' },
    { id: 'CRS-04', title: 'Chinh phục VSTEP B2 Toàn diện 4 Kỹ năng', type: 'VSTEP', lessons: 52, students: 1340, status: 'PUBLISHED' },
    { id: 'CRS-05', title: 'VSTEP C1 Chuyên ngành Sư phạm (Draft)', type: 'VSTEP', lessons: 24, students: 0, status: 'DRAFT' },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Quản lý Khóa học & Giáo trình (Courses Management)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Thiết lập chương trình học, danh mục bài giảng đa phương tiện và điều kiện vượt chặng.
          </p>
        </div>

        <button
          onClick={() => alert('Mở popup thêm khóa học mới')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo khóa học mới</span>
        </button>
      </div>

      {/* Courses List */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã khóa học, tên khóa..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <span className="text-xs text-slate-400 font-bold">Tổng cộng: {courses.length} khóa học</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4">Mã & Tên khóa học</th>
                <th className="p-4">Chứng chỉ</th>
                <th className="p-4">Số bài giảng</th>
                <th className="p-4">Số học viên</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{c.title}</div>
                    <span className="text-[10px] text-slate-500 font-mono">{c.id}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                        c.type === 'TOEIC' ? 'bg-indigo-900/60 text-indigo-300' : 'bg-violet-900/60 text-violet-300'
                      }`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{c.lessons} bài</td>
                  <td className="p-4 font-mono">{c.students.toLocaleString()}</td>
                  <td className="p-4">
                    {c.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3" /> Công khai
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                        Bản nháp
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => alert(`Chỉnh sửa ${c.id}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Xóa ${c.id}`)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
