import React from 'react';
import { BookOpenCheck, Target } from 'lucide-react';
import type { SelfStudy } from '@/shared/api/teacher';
import { MISTAKE_CAUSE_TEXT } from '@/shared/constants/teacher';
import { formatDate, timeAgo } from '@/shared/utils';
import { Meter, Panel } from './TeacherKit';

/** Tự học của học viên (mục tiêu, 7 ngày, từ vựng, khoá học) — dùng chung cho giáo viên và trưởng bộ môn */
export const SelfStudyPanel: React.FC<{ self: SelfStudy }> = ({ self }) => (
  <Panel title="Tự học" sub="Những gì học viên tự học ngoài bài tập của lớp" icon={BookOpenCheck} tone="emerald">
    <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        <p className="flex items-start gap-2.5 text-sm">
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
          {self.goal ? (
            <span>
              Mục tiêu{' '}
              <b className="text-slate-900">
                {self.goal.examType} {self.goal.score}
              </b>
              {self.goal.examDate && <> · thi ngày {formatDate(self.goal.examDate)}</>}
            </span>
          ) : (
            <span className="text-slate-500">Học viên chưa đặt mục tiêu thi</span>
          )}
        </p>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            ['Học 7 ngày qua', `${self.week.minutes} phút · ${self.week.activeDays}/7 ngày`],
            ['Câu đã luyện (7 ngày)', String(self.week.questions)],
            ['Từ vựng đã thuộc', `${self.vocab.learned} từ`],
            ['Thẻ đến hạn ôn', String(self.vocab.due)],
            ['Lỗi sai chưa xử lý', String(self.openMistakes)],
            ['Hoạt động gần nhất', timeAgo(self.lastActiveAt)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-[12px] text-slate-500">{k}</dt>
              <dd className="font-semibold tabular-nums text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium text-slate-700">Khoá học đang học</p>
        {self.courses.length ? (
          <ul className="space-y-2.5">
            {self.courses.map((c) => (
              <li key={c.slug} className="text-sm">
                <div className="mb-1 flex justify-between gap-3">
                  <span className="truncate text-slate-800">{c.title}</span>
                  <span className="shrink-0 tabular-nums text-slate-500">{c.completed ? 'Hoàn thành' : `${c.progress}%`}</span>
                </div>
                <Meter value={c.completed ? 100 : c.progress} tone={c.completed ? 'green' : 'indigo'} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Chưa ghi danh khoá học nào.</p>
        )}
      </div>
    </div>
  </Panel>
);

/** Lỗi sai thường gặp (theo nguyên nhân) + chủ điểm yếu, lấy từ Sổ tay lỗi sai của học viên */
export const MistakesPanel: React.FC<{
  causes?: { cause: string; count: number }[];
  weakTags?: { tagId: string; name: string; count: number }[];
  loading?: boolean;
}> = ({ causes = [], weakTags = [], loading }) => {
  const total = causes.reduce((x, y) => x + y.count, 0);
  return (
    <Panel title="Lỗi sai thường gặp" sub="Từ Sổ tay lỗi sai của học viên">
      {causes.length === 0 ? (
        <p className="text-sm text-slate-500">{loading ? 'Đang tải…' : 'Chưa có lỗi sai nào được ghi nhận.'}</p>
      ) : (
        <ul className="space-y-2.5">
          {causes.map((c) => (
            <li key={c.cause} className="flex items-center gap-3 text-sm">
              <span className="w-36 shrink-0 text-slate-700">{MISTAKE_CAUSE_TEXT[c.cause] ?? c.cause}</span>
              <Meter value={(c.count / total) * 100} className="flex-1" />
              <span className="w-14 text-right tabular-nums text-slate-600">{c.count} câu</span>
            </li>
          ))}
        </ul>
      )}
      {weakTags.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-2 text-[13px] font-medium text-slate-700">Chủ điểm sai nhiều</p>
          <ul className="flex flex-wrap gap-1.5">
            {weakTags.map((t) => (
              <li key={t.tagId} className="rounded-md bg-rose-500/10 px-2 py-1 text-[12px] text-rose-700">
                {t.name} · {t.count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
};
