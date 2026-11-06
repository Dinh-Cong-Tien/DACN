import React from 'react';
import type { CourseTrack, ExamType } from '@/shared/types';
import { classTrack } from '@/shared/constants/staff';
import { cn } from '@/shared/utils';
import { TTabs } from './TeacherKit';

/**
 * Bảng điểm / thống kê tách theo kỳ thi — không trộn lớp TOEIC, VSTEP, THPT vào nhau.
 * Điểm thi thử quy đổi bậc CEFR: TOEIC theo thang 990, VSTEP theo thang 10 (4.0 B1 · 6.0 B2 · 8.5 C1).
 */
export const EXAM_TRACKS = [
  { key: 'TOEIC', label: 'TOEIC', mock: 'Thi thử TOEIC', scale: 'thang 990', unit: 'điểm' },
  { key: 'VSTEP', label: 'VSTEP', mock: 'Thi thử VSTEP', scale: 'thang 10', unit: 'điểm' },
  { key: 'THPT', label: 'Tiếng Anh THPT', mock: 'Kiểm tra', scale: 'thang 10', unit: 'điểm' },
] as const;
export type ExamTrack = (typeof EXAM_TRACKS)[number];

/** Ngưỡng điểm từng bậc (từ cao xuống thấp) */
export const LEVEL_BANDS: Partial<Record<CourseTrack, { level: string; min: number }[]>> = {
  TOEIC: [
    { level: 'C1', min: 945 },
    { level: 'B2', min: 785 },
    { level: 'B1', min: 550 },
    { level: 'A2', min: 225 },
    { level: 'A1', min: 0 },
  ],
  VSTEP: [
    { level: 'C1', min: 8.5 },
    { level: 'B2', min: 6 },
    { level: 'B1', min: 4 },
    { level: 'Dưới B1', min: 0 },
  ],
};
export const TARGET_LEVELS = ['B1', 'B2', 'C1'] as const;

/** Bậc dự kiến từ điểm thi thử; null = chưa thi thử / kỳ thi không quy đổi bậc */
export const levelOf = (track: CourseTrack, score: number | null) => (score === null ? null : LEVEL_BANDS[track]?.find((b) => score >= b.min)?.level ?? null);
export const minScoreOf = (track: CourseTrack, level: string) => LEVEL_BANDS[track]?.find((b) => b.level === level)?.min ?? null;
export const hasLevels = (track: CourseTrack) => !!LEVEL_BANDS[track];

type ClassLike = { id: string; examType: ExamType; track?: CourseTrack; course?: { track?: CourseTrack } };

/** Lớp theo kỳ thi đang chọn (?muc=toeic|vstep|thpt; ?class= thì theo kỳ thi của lớp đó) */
export function useTrackClasses<C extends ClassLike>(classes: C[], params: URLSearchParams) {
  const tracks = EXAM_TRACKS.filter((t) => classes.some((c) => classTrack(c) === t.key));
  const picked = classes.find((c) => c.id === params.get('class'));
  const key = (picked ? classTrack(picked) : tracks.find((t) => t.key === params.get('muc')?.toUpperCase())?.key) ?? tracks[0]?.key;
  const trackClasses = classes.filter((c) => classTrack(c) === key);
  const exam: ExamTrack = EXAM_TRACKS.find((t) => t.key === key) ?? EXAM_TRACKS[0];
  return { tracks, track: exam.key as CourseTrack, exam, trackClasses, cls: picked ?? trackClasses[0] };
}

export const TrackTabs: React.FC<{ tracks: readonly ExamTrack[]; value: string; classes: ClassLike[]; onChange: (muc: string) => void }> = ({ tracks, value, classes, onChange }) =>
  tracks.length ? <TTabs value={value} onChange={(k) => onChange(k.toLowerCase())} items={tracks.map((t) => ({ key: t.key, label: t.label, count: classes.filter((c) => classTrack(c) === t.key).length }))} /> : null;

const LEVEL_TONE: Record<string, string> = { C1: 'bg-violet-500', B2: 'bg-indigo-500', B1: 'bg-emerald-500', A2: 'bg-amber-500', A1: 'bg-rose-400', 'Dưới B1': 'bg-rose-400' };

/** Phân bố bậc dự kiến của lớp (theo điểm thi thử trung bình từng học viên) */
export const LevelDistribution: React.FC<{ track: CourseTrack; scores: (number | null)[]; target?: string; className?: string }> = ({ track, scores, target, className }) => {
  const bands = LEVEL_BANDS[track];
  if (!bands) return null;
  const tested = scores.filter((s): s is number => s !== null);
  const max = Math.max(1, ...bands.map((b) => tested.filter((s) => levelOf(track, s) === b.level).length));
  return (
    <div className={cn('space-y-2.5', className)}>
      {bands.map((b) => {
        const n = tested.filter((s) => levelOf(track, s) === b.level).length;
        return (
          <div key={b.level} className="flex items-center gap-3 text-sm">
            <span className={cn('w-16 shrink-0 font-semibold', b.level === target ? 'text-indigo-700' : 'text-slate-700')}>{b.level}</span>
            <span className="w-24 shrink-0 text-[12px] tabular-nums text-slate-500">
              {track === 'TOEIC' ? `từ ${b.min}` : `từ ${b.min.toFixed(1)}`}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span className={cn('block h-full rounded-full', LEVEL_TONE[b.level] ?? 'bg-slate-400')} style={{ width: `${(n / max) * 100}%` }} />
            </span>
            <span className="w-16 shrink-0 text-right tabular-nums text-slate-700">{n} HV</span>
          </div>
        );
      })}
      <p className="pt-1 text-[12px] text-slate-500">
        {tested.length}/{scores.length} học viên đã có điểm thi thử
      </p>
    </div>
  );
};
