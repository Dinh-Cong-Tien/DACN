import React, { useState } from 'react';
import { Trophy, Medal, Flame, Award, Filter, Crown } from 'lucide-react';

interface IRankUser {
  rank: number;
  name: string;
  avatar: string;
  targetExam: string;
  score: number;
  streak: number;
  studyHours: number;
}

const mockRankers: IRankUser[] = [
  { rank: 1, name: 'Trần Đăng Khoa', avatar: 'TK', targetExam: 'TOEIC 900+', score: 940, streak: 42, studyHours: 85 },
  { rank: 2, name: 'Nguyễn Bích Ngọc', avatar: 'BN', targetExam: 'VSTEP C1', score: 9.0, streak: 35, studyHours: 72 },
  { rank: 3, name: 'Phạm Hải Đăng', avatar: 'HD', targetExam: 'TOEIC 850+', score: 880, streak: 28, studyHours: 64 },
  { rank: 4, name: 'Lê Minh Anh (Bạn)', avatar: 'MA', targetExam: 'TOEIC 750', score: 685, streak: 5, studyHours: 28.5 },
  { rank: 5, name: 'Vũ Quốc Bảo', avatar: 'QB', targetExam: 'TOEIC 700', score: 660, streak: 12, studyHours: 31 },
];

export const StudentLeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'ALL_TIME'>('WEEK');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Bảng vàng thành tích (Leaderboard)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vinh danh những học viên có chuỗi học tập bền bỉ và điểm số thi thử xuất sắc nhất.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setPeriod('WEEK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'WEEK' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setPeriod('MONTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'MONTH' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tháng này
          </button>
          <button
            onClick={() => setPeriod('ALL_TIME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'ALL_TIME' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Mọi thời đại
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 pt-6 pb-2 text-center items-end">
        {/* Silver (Rank 2) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-2 order-1">
          <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300 mx-auto flex items-center justify-center font-bold text-slate-700 text-sm">
            2
          </div>
          <span className="font-bold text-xs text-slate-800 block truncate">{mockRankers[1].name}</span>
          <span className="text-xs font-extrabold text-slate-500">{mockRankers[1].score} điểm</span>
        </div>

        {/* Gold (Rank 1) */}
        <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-md space-y-2 relative -translate-y-3 order-2">
          <Crown className="w-6 h-6 text-amber-500 mx-auto absolute -top-3 left-1/2 -translate-x-1/2" />
          <div className="w-14 h-14 rounded-full bg-amber-400 border-2 border-amber-500 mx-auto flex items-center justify-center font-black text-white text-base shadow-md">
            1
          </div>
          <span className="font-black text-sm text-slate-900 block truncate">{mockRankers[0].name}</span>
          <span className="text-sm font-black text-amber-600">{mockRankers[0].score} điểm</span>
          <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
            <Flame className="w-3 h-3 fill-amber-500" />
            <span>{mockRankers[0].streak}d streak</span>
          </div>
        </div>

        {/* Bronze (Rank 3) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-2 order-3">
          <div className="w-12 h-12 rounded-full bg-amber-700/20 border-2 border-amber-700/30 mx-auto flex items-center justify-center font-bold text-amber-800 text-sm">
            3
          </div>
          <span className="font-bold text-xs text-slate-800 block truncate">{mockRankers[2].name}</span>
          <span className="text-xs font-extrabold text-slate-500">{mockRankers[2].score} điểm</span>
        </div>
      </div>

      {/* Ranks Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
            <tr>
              <th className="py-3 px-5">Thứ hạng</th>
              <th className="py-3 px-4">Học viên</th>
              <th className="py-3 px-4">Mục tiêu</th>
              <th className="py-3 px-4">Chuỗi Streak</th>
              <th className="py-3 px-5 text-right">Điểm số cao nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockRankers.map((user) => (
              <tr
                key={user.rank}
                className={`hover:bg-slate-50/80 transition ${
                  user.name.includes('(Bạn)') ? 'bg-indigo-50/50 font-bold' : ''
                }`}
              >
                <td className="py-4 px-5 font-black text-slate-700">#{user.rank}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {user.avatar}
                    </div>
                    <span className="font-bold text-slate-900">{user.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-500">{user.targetExam}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{user.streak} ngày</span>
                  </span>
                </td>
                <td className="py-4 px-5 text-right font-black text-indigo-600 text-sm">{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
