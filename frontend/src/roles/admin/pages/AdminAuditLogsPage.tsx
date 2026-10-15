import React from 'react';
import { History, Shield, Clock } from 'lucide-react';

interface IAuditItem {
  id: string;
  action: string;
  resource: string;
  userName: string;
  details: string;
  ip: string;
  timestamp: string;
}

const mockAuditLogs: IAuditItem[] = [
  { id: 'log-1', action: 'CREATE_QUESTION', resource: 'QUESTION', userName: 'Admin', details: 'Thêm mới câu hỏi reading Part 7 (Passage: ps-901)', ip: '127.0.0.1', timestamp: '10 phút trước' },
  { id: 'log-2', action: 'PUBLISH_TEST', resource: 'MOCK_TEST', userName: 'Admin', details: 'Xuất bản đề thi ETS TOEIC 2024 Actual Test 02', ip: '127.0.0.1', timestamp: '1 giờ trước' },
  { id: 'log-3', action: 'UPDATE_ROLE', resource: 'USER', userName: 'Admin', details: 'Cập nhật tài khoản teacher@orbi.edu.vn thành TEACHER', ip: '192.168.1.15', timestamp: '3 giờ trước' },
  { id: 'log-4', action: 'SRS_RECALCULATE', resource: 'CRON_JOB', userName: 'System Daemon', details: 'Quét 124 mục ôn tập đến hạn cho học viên toàn hệ thống', ip: 'localhost', timestamp: 'Hôm nay 00:00' },
];

export const AdminAuditLogsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-purple-400" />
          <span>Nhật ký hệ thống & Kiểm soát bảo mật (Audit Logs)</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Theo dõi chi tiết các thao tác nhạy cảm trên hệ thống: tạo câu hỏi, sửa điểm, đổi quyền người dùng và tác vụ nền.
        </p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Hành động</th>
              <th className="py-3.5 px-4">Tài nguyên</th>
              <th className="py-3.5 px-4">Người thực hiện</th>
              <th className="py-3.5 px-4">Chi tiết thao tác</th>
              <th className="py-3.5 px-4">IP Address</th>
              <th className="py-3.5 px-5 text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {mockAuditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/60 transition">
                <td className="py-4 px-5">
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {log.action}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-400 font-bold">{log.resource}</td>
                <td className="py-4 px-4 font-semibold text-white">{log.userName}</td>
                <td className="py-4 px-4 text-slate-300">{log.details}</td>
                <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">{log.ip}</td>
                <td className="py-4 px-5 text-right text-slate-500">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
