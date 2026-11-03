import React from 'react';
import { BarChart3, BookOpenCheck, CalendarCheck, ClipboardList, FileCheck2, GraduationCap, MessageSquareWarning, Scale, Trophy, Users } from 'lucide-react';
import { useHeadSummary } from '@/shared/api/head';
import { BarChart, HBarChart, LineChart, StackedBar, type SegmentColor } from '@/shared/components/charts/Charts';
import { formatNumber } from '@/shared/utils';
import { Figures, Panel } from '@/roles/teacher/components/TeacherKit';

/** Nhãn + màu cố định cho từng nhóm (màu theo thực thể, không theo thứ hạng) */
const RISK: Record<string, [string, SegmentColor]> = { GOOD: ['Ổn định', 'good'], WARNING: ['Cần nhắc', 'warn'], RISK: ['Nguy cơ bỏ học', 'bad'] };
const MARK: Record<string, [string, SegmentColor]> = { PRESENT: ['Có mặt', 'good'], LATE: ['Đi muộn', 'warn'], EXCUSED: ['Vắng có phép', 'neutral'], ABSENT: ['Vắng không phép', 'bad'] };
const SUB: Record<string, [string, SegmentColor]> = { GRADED: ['Đã chấm', 'good'], SUBMITTED: ['Đã nộp, chờ chấm', 'series-1'], LATE: ['Nộp muộn', 'warn'], MISSING: ['Quá hạn chưa nộp', 'bad'], TODO: ['Chưa đến hạn', 'neutral'] };
const REVIEW: Record<string, [string, SegmentColor]> = { AGREED: ['Đồng ý điểm GV', 'good'], ADJUSTED: ['Điều chỉnh điểm', 'serious'], PENDING: ['Chờ kiểm định', 'neutral'] };
const TICKET: Record<string, [string, SegmentColor]> = { OPEN: ['Mới', 'bad'], IN_REVIEW: ['Đang xem xét', 'warn'], PENDING: ['Chờ phản hồi', 'neutral'], RESOLVED: ['Đã giải quyết', 'good'], REJECTED: ['Không chấp nhận', 'serious'] };
const EXAM: Record<string, [string, SegmentColor]> = { TOEIC: ['TOEIC', 'series-1'], VSTEP: ['VSTEP', 'series-2'] };
const ASSIGN: Record<string, string> = { MOCK_TEST: 'Đề thi thử', PRACTICE: 'Luyện tập', LESSON: 'Bài giảng', GRAMMAR: 'Ngữ pháp', VOCAB: 'Từ vựng', ESSAY: 'Bài Viết', SPEAKING: 'Bài Nói' };

const seg = (rows: { key: string; value: number }[], map: Record<string, [string, SegmentColor]>) => rows.filter((r) => map[r.key]).map((r) => ({ label: map[r.key][0], value: r.value, color: map[r.key][1] }));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const partLabel = (p: string) => p.replace('TOEIC_P', 'P').replace('VSTEP_', '');

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="py-10 text-center text-sm text-slate-500">{children}</p>;

/** Biểu đồ cột theo tháng; toàn 0 thì hiện thông báo trống thay cho trục rỗng */
const Monthly: React.FC<{ months: string[]; values: number[]; label: string; unit: string; empty: string }> = ({ months, values, label, unit, empty }) =>
  sum(values) ? <BarChart ariaLabel={label} data={months.map((m, i) => ({ label: m, value: values[i] }))} height={200} unit={unit} /> : <Empty>{empty}</Empty>;

const Share: React.FC<{ rows: { label: string; value: number; color: SegmentColor }[]; label: string; unit?: string; empty: string }> = ({ rows, label, unit, empty }) =>
  sum(rows.map((r) => r.value)) ? <StackedBar ariaLabel={label} data={rows} unit={unit} /> : <Empty>{empty}</Empty>;

/** Thống kê tổng kết bộ môn: học viên · giảng dạy · bài tập & kết quả · học liệu & chất lượng */
export const HeadReportSummary: React.FC<{ months: number; departmentId?: string }> = ({ months, departmentId }) => {
  const { data: d, isLoading } = useHeadSummary(months, departmentId);
  if (!d) return <Panel><Empty>{isLoading ? 'Đang tổng hợp số liệu…' : 'Không tải được thống kê.'}</Empty></Panel>;
  const m = d.months;
  const period = `${m.length} tháng gần nhất`;
  const toeicParts = d.content.byPart.filter((p) => p.key.startsWith('TOEIC'));
  const vstepParts = d.content.byPart.filter((p) => p.key.startsWith('VSTEP'));
  const published = d.content.questionsByStatus.find((s) => s.key === 'PUBLISHED')?.value ?? 0;
  const avgToeic = d.results.avgToeicByMonth.map((v, i) => ({ v, l: m[i] })).filter((x) => x.v !== null) as { v: number; l: string }[];

  return (
    <div className="space-y-6">
      <Figures
        className="lg:grid-cols-5"
        items={[
          { label: 'Học viên đang học', value: d.students.total, note: `${sum(d.students.joined)} vào lớp · ${period}`, icon: GraduationCap, tone: 'indigo' },
          { label: 'Buổi đã dạy', value: sum(d.teaching.sessionsDone), note: `${d.teaching.sessionsUpcoming} buổi sắp tới`, icon: CalendarCheck, tone: 'emerald' },
          { label: 'Bài tập đã giao', value: sum(d.assignments.created), note: period, icon: ClipboardList, tone: 'amber' },
          { label: 'Lượt làm bài', value: sum(d.results.attempts), note: `${d.results.fullTests} bài thi thử`, icon: FileCheck2, tone: 'sky' },
          { label: 'Câu hỏi đã duyệt', value: formatNumber(published), note: `${d.content.testsByStatus.find((s) => s.key === 'PUBLISHED')?.value ?? 0} đề thi`, icon: BookOpenCheck, tone: 'violet' },
        ]}
      />

      {/* ---------- Học viên ---------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Học viên vào lớp theo tháng" sub={`Lượt ghi danh mới · ${period}`} icon={Users} tone="indigo">
          <Monthly months={m} values={d.students.joined} label="Học viên vào lớp theo tháng" unit=" học viên" empty="Chưa có học viên vào lớp trong giai đoạn này." />
        </Panel>
        <Panel title="Cơ cấu học viên" sub={`${d.students.total} học viên đang học`} icon={GraduationCap} tone="violet">
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-700">Theo kỳ thi</p>
              <Share rows={seg(d.students.byExam, EXAM)} label="Học viên theo kỳ thi" empty="Chưa có học viên." />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-700">Tình trạng học tập</p>
              <Share rows={seg(d.students.byRisk, RISK)} label="Tình trạng học tập" empty="Chưa có học viên." />
            </div>
          </div>
        </Panel>
      </div>

      {/* ---------- Giảng dạy ---------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Buổi đã dạy theo tháng" sub={`${d.teaching.sessionsCancelled} buổi huỷ · ${d.teaching.observed} buổi đã dự giờ`} icon={CalendarCheck} tone="emerald">
          <Monthly months={m} values={d.teaching.sessionsDone} label="Buổi đã dạy theo tháng" unit=" buổi" empty="Chưa có buổi học nào diễn ra." />
        </Panel>
        <Panel title="Điểm danh" sub="Tổng lượt điểm danh các buổi đã dạy" icon={CalendarCheck} tone="sky">
          <Share rows={seg(d.teaching.marks, MARK)} label="Điểm danh" unit=" lượt" empty="Giáo viên chưa điểm danh buổi nào." />
        </Panel>
        <Panel title="Học viên theo giáo viên" sub={`${d.teachers.length} giáo viên · ${d.teaching.classes} lớp đang mở`} icon={Users} tone="amber">
          {d.teachers.length ? (
            <HBarChart ariaLabel="Học viên theo giáo viên" data={d.teachers.map((t) => ({ label: t.name, value: t.students, note: `${t.classes} lớp` }))} unit="" labelWidth={130} />
          ) : (
            <Empty>Chưa có lớp nào.</Empty>
          )}
        </Panel>
      </div>

      {/* ---------- Bài tập & kết quả ---------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Bài tập giao theo tháng" sub={d.assignments.byType.length ? d.assignments.byType.map((t) => `${ASSIGN[t.key] ?? t.key} ${t.value}`).join(' · ') : period} icon={ClipboardList} tone="amber">
          <Monthly months={m} values={d.assignments.created} label="Bài tập giao theo tháng" unit=" bài" empty="Giáo viên chưa giao bài tập nào trong giai đoạn này." />
        </Panel>
        <Panel title="Tình trạng bài nộp" sub="Toàn bộ lượt giao bài cho học viên" icon={ClipboardList} tone="rose">
          <Share rows={seg(d.assignments.submissions, SUB)} label="Tình trạng bài nộp" unit=" lượt" empty="Chưa có bài tập nào được giao." />
        </Panel>
        <Panel title="Lượt làm bài theo tháng" sub="Thi thử, luyện Part, bài kiểm tra của học viên" icon={FileCheck2} tone="sky">
          <Monthly months={m} values={d.results.attempts} label="Lượt làm bài theo tháng" unit=" lượt" empty="Học viên chưa nộp bài nào trong giai đoạn này." />
        </Panel>
        <Panel title="Phân bố điểm thi thử TOEIC" sub={avgToeic.length ? `Điểm TB gần nhất ${avgToeic[avgToeic.length - 1].v} · thang 990` : 'Đề full · thang 990'} icon={Trophy} tone="violet">
          {sum(d.results.toeicBands.map((b) => b.value)) ? (
            <BarChart ariaLabel="Phân bố điểm thi thử TOEIC" data={d.results.toeicBands.map((b) => ({ label: b.key, value: b.value }))} height={200} unit=" bài" />
          ) : (
            <Empty>Chưa có bài thi thử TOEIC đề full.</Empty>
          )}
        </Panel>
        {avgToeic.length > 1 && (
          <Panel className="xl:col-span-2" title="Điểm TOEIC trung bình theo tháng" sub="Bài thi thử đề full" icon={BarChart3} tone="indigo">
            <LineChart ariaLabel="Điểm TOEIC trung bình theo tháng" labels={avgToeic.map((x) => x.l)} series={[{ name: 'Điểm TB', values: avgToeic.map((x) => x.v) }]} min={0} max={990} unit=" điểm" />
          </Panel>
        )}
      </div>

      {/* ---------- Học liệu & chất lượng ---------- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Ngân hàng câu hỏi TOEIC theo Part" sub={`${formatNumber(sum(toeicParts.map((p) => p.value)))} câu đã duyệt${vstepParts.length ? ` · VSTEP ${sum(vstepParts.map((p) => p.value))} câu` : ''}`} icon={BookOpenCheck} tone="violet">
          {toeicParts.length ? <BarChart ariaLabel="Câu hỏi TOEIC theo Part" data={toeicParts.map((p) => ({ label: partLabel(p.key), value: p.value }))} height={200} unit=" câu" /> : <Empty>Bộ môn chưa có câu hỏi TOEIC.</Empty>}
        </Panel>
        <Panel title="Chất lượng chuyên môn" sub="Kiểm định chấm bài và khiếu nại của học viên" icon={Scale} tone="emerald">
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[13px] font-medium text-slate-700">Kiểm định chấm bài Viết / Nói</p>
              <Share rows={seg(d.quality.reviews, REVIEW)} label="Kiểm định chấm bài" unit=" bài" empty="Chưa có bài nào được chọn kiểm định." />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                <MessageSquareWarning className="h-3.5 w-3.5 text-slate-400" /> Khiếu nại & phúc khảo
              </p>
              <Share rows={seg(d.quality.complaints, TICKET)} label="Khiếu nại theo trạng thái" unit=" đơn" empty="Chưa có khiếu nại nào." />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
