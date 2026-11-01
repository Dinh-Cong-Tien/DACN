import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { GRAMMAR_TOPICS, MOCK_ASSIGNMENTS, MOCK_COURSES, MOCK_TESTS, VOCAB_TOPICS, VSTEP_SPEAKING_PARTS, VSTEP_WRITING_TASKS, courseHref } from '@/shared/mocks';
import type { AssignmentTarget, Course, ExamType } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Panel, TBtn, TPageHead, TTabs, tbl } from '../components/TeacherKit';

type Kind = 'courses' | 'tests' | 'grammar' | 'vocabulary' | 'writing-speaking';

const COPY: Record<Kind, { title: string; sub: string }> = {
  courses: { title: 'Khoá học', sub: 'Các khoá học viên đang học trên hệ thống. Giao từng bài giảng cho lớp, xem bài như học viên thấy.' },
  tests: { title: 'Đề thi thử', sub: 'Kho đề học viên làm ở mục Thi thử. Giao full đề hoặc chọn Part và đặt thời gian cho lớp.' },
  grammar: { title: 'Ngữ pháp', sub: 'Chủ điểm ngữ pháp kèm bài tập. Học viên làm xong được chấm tự động.' },
  vocabulary: { title: 'Từ vựng', sub: 'Bộ flashcard theo chủ đề, học viên ôn bằng lịch ôn ngắt quãng.' },
  'writing-speaking': { title: 'Đề Viết & Nói', sub: 'Đề ở trang Luyện Viết và Luyện Nói. Bài nộp về Bàn chấm bài của giáo viên.' },
};

const GROUP_LABEL: Record<Course['category'], string> = { GRAMMAR: 'Kiến thức chung', VOCABULARY: 'Kiến thức chung', SKILL: 'Kỹ năng tiếng Anh', FOUNDATION: 'Nền tảng theo kỳ thi' };
const LESSON_TYPE: Record<string, string> = { VIDEO: 'Video', READING: 'Bài đọc', QUIZ: 'Kiểm tra' };

/** Số lần nội dung đã được giao cho các lớp (theo loại và id) */
const usedCount = (match: (t: AssignmentTarget) => boolean) => MOCK_ASSIGNMENTS.filter((a) => match(a.target)).length;

const PreviewLink: React.FC<{ href: string }> = ({ href }) => (
  <a href={href} target="_blank" rel="noreferrer" title="Xem như học viên" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
    <ExternalLink className="h-4 w-4" />
  </a>
);

/** Kho học liệu của giáo viên: cùng nội dung học viên đang dùng, mỗi mục có "Xem như học viên" và "Giao bài" */
export const TeacherLibraryPage: React.FC = () => {
  const { kind = 'courses' } = useParams();
  const copy = COPY[kind as Kind];
  useDocumentTitle(copy?.title ?? 'Học liệu');
  const navigate = useNavigate();
  if (!copy) return <Navigate to="/teacher/library/courses" replace />;

  const assign = (target: AssignmentTarget) => navigate('/teacher/assignments', { state: { assign: target } });

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Học liệu' }, { label: copy.title }]} title={copy.title} sub={copy.sub} />
      {kind === 'courses' && <CoursesView assign={assign} />}
      {kind === 'tests' && <TestsView assign={assign} />}
      {kind === 'grammar' && (
        <Panel flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Chủ điểm</th>
                  <th className={tbl.th}>Nhóm</th>
                  <th className={tbl.th}>Trình độ</th>
                  <th className={cn(tbl.th, 'text-right')}>Số câu</th>
                  <th className={cn(tbl.th, 'text-right')}>Đã giao</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {GRAMMAR_TOPICS.map((g) => (
                  <tr key={g.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'min-w-[280px]')}>
                      <p className="font-medium text-slate-900">{g.title}</p>
                      <p className="line-clamp-1 text-[12px] text-slate-500">{g.summary}</p>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{g.category}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{g.level}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{g.questionsCount}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{usedCount((t) => t.kind === 'GRAMMAR' && t.slug === g.slug)} lần</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                      <PreviewLink href={`/app/grammar/${g.slug}`} />
                      <TBtn size="sm" onClick={() => assign({ kind: 'GRAMMAR', slug: g.slug })}>
                        Giao bài
                      </TBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {kind === 'vocabulary' && (
        <Panel flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Bộ từ vựng</th>
                  <th className={tbl.th}>Dùng cho</th>
                  <th className={cn(tbl.th, 'text-right')}>Số từ</th>
                  <th className={cn(tbl.th, 'text-right')}>Đã giao</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {VOCAB_TOPICS.map((v) => (
                  <tr key={v.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'font-medium text-slate-900')}>{v.name}</td>
                    <td className={cn(tbl.td, 'text-slate-600')}>{v.name.startsWith('VSTEP') ? 'VSTEP' : 'TOEIC'}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{v.total}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{usedCount((t) => t.kind === 'VOCAB' && t.topicId === v.id)} lần</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                      <PreviewLink href={`/app/vocabulary/flashcards/${v.id}`} />
                      <TBtn size="sm" onClick={() => assign({ kind: 'VOCAB', topicId: v.id })}>
                        Giao bài
                      </TBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      {kind === 'writing-speaking' && (
        <div className="space-y-6">
          {[
            { title: 'Đề Viết', rows: VSTEP_WRITING_TASKS.map((w) => ({ id: w.id, name: w.task, meta: `${w.minutes} phút · tối thiểu ${w.minWords} từ`, prompt: w.prompt, href: `/app/writing?task=${w.id}`, target: { kind: 'WRITING', taskId: w.id } as AssignmentTarget })) },
            { title: 'Đề Nói', rows: VSTEP_SPEAKING_PARTS.map((p) => ({ id: p.id, name: p.part, meta: `${p.minutes} phút`, prompt: p.prompt, href: `/app/speaking?part=${p.id}`, target: { kind: 'SPEAKING', partId: p.id } as AssignmentTarget })) },
          ].map((g) => (
            <Panel key={g.title} title={g.title} sub="Chấm theo 4 tiêu chí, thang 10" flush>
              <ul className="divide-y divide-slate-100">
                {g.rows.map((r) => (
                  <li key={r.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">
                        {r.name} <span className="font-normal text-slate-500">· {r.meta}</span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.prompt}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <PreviewLink href={r.href} />
                      <TBtn size="sm" onClick={() => assign(r.target)}>
                        Giao bài
                      </TBtn>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
};

const CoursesView: React.FC<{ assign: (t: AssignmentTarget) => void }> = ({ assign }) => {
  const me = useAuthStore((s) => s.user?.fullName);
  const [openId, setOpenId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <Panel flush>
      <div className="overflow-x-auto">
        <table className={tbl.table}>
          <thead className={tbl.thead}>
            <tr>
              <th className={tbl.th}>Khoá học</th>
              <th className={tbl.th}>Nhóm</th>
              <th className={tbl.th}>Trình độ</th>
              <th className={cn(tbl.th, 'text-right')}>Số bài</th>
              <th className={cn(tbl.th, 'text-right')}>Học viên</th>
              <th className={tbl.th}>Giáo viên phụ trách</th>
              <th className={tbl.th} />
            </tr>
          </thead>
          <tbody>
            {MOCK_COURSES.map((c) => {
              const open = openId === c.id;
              const lessons = c.sections.flatMap((s) => s.lessons);
              return (
                <React.Fragment key={c.id}>
                  <tr className={cn(tbl.tr, 'cursor-pointer', open && 'bg-slate-50')} onClick={() => (setOpenId(open ? null : c.id), setPicked([]))}>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2">
                        {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                        <span className="font-medium text-slate-900">{c.title}</span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{c.examType ? `${GROUP_LABEL[c.category]} · ${c.examType}` : GROUP_LABEL[c.category]}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{c.level}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.lessonsCount}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.studentsCount.toLocaleString('vi-VN')}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>
                      {c.teacherName}
                      {c.teacherName === me && <span className="ml-1.5 text-[12px] text-indigo-700">(bạn)</span>}
                    </td>
                    <td className={cn(tbl.td, 'text-right')} onClick={(e) => e.stopPropagation()}>
                      <PreviewLink href={courseHref(c)} />
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={7} className="border-b border-slate-200 bg-slate-50/60 px-4 pb-4 pt-1">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[13px] text-slate-500">Tích chọn bài rồi giao cho lớp. Học viên thấy bài trong mục Lớp của tôi.</p>
                          <TBtn size="sm" variant="primary" disabled={!picked.length} onClick={() => assign({ kind: 'LESSON', courseId: c.id, lessonIds: lessons.filter((l) => picked.includes(l.id)).map((l) => l.id) })}>
                            Giao {picked.length || ''} bài đã chọn
                          </TBtn>
                        </div>
                        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                          {c.sections.map((sec) => (
                            <div key={sec.id}>
                              <p className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-500">
                                {sec.part ? `${sec.part} · ` : ''}
                                {sec.title}
                              </p>
                              {sec.lessons.map((l) => {
                                const n = lessons.indexOf(l) + 1;
                                const on = picked.includes(l.id);
                                return (
                                  <label key={l.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-1.5 text-sm last:border-0 hover:bg-slate-50">
                                    <input type="checkbox" checked={on} onChange={() => setPicked((p) => (on ? p.filter((x) => x !== l.id) : [...p, l.id]))} className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
                                    <span className="w-12 shrink-0 tabular-nums text-[12px] text-slate-400">Bài {n}</span>
                                    <span className="min-w-0 flex-1 truncate text-slate-800">{l.title}</span>
                                    <span className="hidden w-20 text-[12px] text-slate-500 sm:block">{LESSON_TYPE[l.type]}</span>
                                    <span className="w-14 text-right text-[12px] tabular-nums text-slate-500">{l.durationMin} phút</span>
                                  </label>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

const TestsView: React.FC<{ assign: (t: AssignmentTarget) => void }> = ({ assign }) => {
  const [exam, setExam] = useState<ExamType>('TOEIC');
  const tests = MOCK_TESTS.filter((t) => t.examType === exam);
  return (
    <div className="space-y-4">
      <TTabs
        value={exam}
        onChange={(k) => setExam(k as ExamType)}
        items={[
          { key: 'TOEIC', label: 'TOEIC', count: MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length },
          { key: 'VSTEP', label: 'VSTEP', count: MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length },
        ]}
      />
      <Panel flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Đề thi</th>
                <th className={tbl.th}>Phần thi</th>
                <th className={tbl.th}>Trình độ</th>
                <th className={cn(tbl.th, 'text-right')}>Câu</th>
                <th className={cn(tbl.th, 'text-right')}>Phút</th>
                <th className={cn(tbl.th, 'text-right')}>Lượt làm</th>
                <th className={tbl.th} />
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} className={tbl.tr}>
                  <td className={cn(tbl.td, 'min-w-[240px]')}>
                    <p className="font-medium text-slate-900">{t.title}</p>
                    <p className="text-[12px] text-slate-500">
                      {t.year} · {t.isFree ? 'Miễn phí cho học viên' : 'Gói VIP'} · đã giao {usedCount((x) => x.kind === 'EXAM' && x.testId === t.id)} lần
                    </p>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{t.parts.join(', ')}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{t.level}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{t.totalQuestions}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{t.durationMinutes}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{t.attempts.toLocaleString('vi-VN')}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                    <PreviewLink href={`/app/mock-tests/${t.id}`} />
                    <TBtn size="sm" onClick={() => assign({ kind: 'EXAM', testId: t.id, setup: { mode: 'FULL', parts: t.partIds, minutes: t.durationMinutes } })}>
                      Giao bài
                    </TBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
