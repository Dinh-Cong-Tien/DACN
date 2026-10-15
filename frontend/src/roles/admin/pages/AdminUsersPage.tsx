import React, { useState } from 'react';
import { Users, Search, Shield, Ban, CheckCircle2, MoreVertical, Edit2 } from 'lucide-react';

interface IUserItem {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isEmailVerified: boolean;
  streakCount: number;
  createdAt: string;
}

const mockUsers: IUserItem[] = [
  { id: 'u-1', name: 'Lê Minh Anh', email: 'student@orbi.edu.vn', role: 'STUDENT', isEmailVerified: true, streakCount: 5, createdAt: '10/10/2026' },
  { id: 'u-2', name: 'ThS. Nguyễn Hoàng Nam', email: 'teacher@orbi.edu.vn', role: 'TEACHER', isEmailVerified: true, streakCount: 18, createdAt: '01/09/2026' },
  { id: 'u-3', name: 'Hệ thống Quản trị Viên', email: 'admin@orbi.edu.vn', role: 'ADMIN', isEmailVerified: true, streakCount: 60, createdAt: '01/01/2026' },
  { id: 'u-4', name: 'Vũ Quốc Bảo', email: 'bao.vu@gmail.com', role: 'STUDENT', isEmailVerified: false, streakCount: 0, createdAt: '14/10/2026' },
];

export const AdminUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [users, setUsers] = useState(mockUsers);

  const filtered = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm && !u.email.toLowerCase().includes(searchTerm.toLowerCase()) && !u.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-rose-500" />
          <span>Quản lý người dùng & Phân quyền (User Management)</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Danh sách tài khoản, điều chỉnh vai trò phân quyền Role (Student, Teacher, Admin) và trạng thái tài khoản.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-800 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo email hoặc họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-white outline-none w-full placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Lọc vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-1.5 outline-none font-medium"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="STUDENT">Học viên (Student)</option>
            <option value="TEACHER">Giáo viên (Teacher)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Người dùng</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Vai trò</th>
              <th className="py-3.5 px-4">Xác thực</th>
              <th className="py-3.5 px-4">Ngày tạo</th>
              <th className="py-3.5 px-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-900/60 transition">
                <td className="py-4 px-5 font-bold text-white flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-rose-400 font-black flex items-center justify-center text-xs">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="py-4 px-4 font-mono text-slate-400">{u.email}</td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : u.role === 'TEACHER'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {u.isEmailVerified ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px]">Chưa xác thực</span>
                  )}
                </td>
                <td className="py-4 px-4 text-slate-500">{u.createdAt}</td>
                <td className="py-4 px-5 text-right">
                  <button className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-[11px]">
                    Sửa quyền
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
