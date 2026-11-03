import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck, FileQuestion, Inbox, Reply } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { headApi, useHeadComplaints, useHeadMutation, type HeadComplaint } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import type { Complaint } from '@/shared/types';
import { timeAgo, formatDateTime, staffPath } from '@/shared/utils';
import { Avatar, Button, EmptyState, Modal, Textarea } from '@/shared/components/ui';
import { Figures, Panel, Status, TBtn, TPageHead, TTabs, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const STATUS: Record<Complaint['status'], { label: string; tone: StatusTone }> = { NEW: { label: 'Mới', tone: 'red' }, IN_REVIEW: { label: 'Đang xử lý', tone: 'amber' }, RESOLVED: { label: 'Đã giải quyết', tone: 'green' } };

const EMPTY: HeadComplaint[] = [];

export const HeadComplaintsPage: React.FC = () => {
  useDocumentTitle('Khiếu nại & Phản hồi');
  const { data, isLoading } = useHeadComplaints();
  const items = data ?? EMPTY;
  const studentAvatar = (id: string) => items.find((c) => c.id === id)?.avatarUrl;
  const setStatus = useHeadMutation((a: { id: string; status: 'NEW' | 'IN_REVIEW' | 'RESOLVED' }) => headApi.setComplaintStatus(a.id, a.status));
  const replyM = useHeadMutation((a: { id: string; text: string; accepted: boolean }) => headApi.replyComplaint(a.id, { text: a.text, resolve: true, accepted: a.accepted }));
  const [tab, setTab] = useState<Complaint['status']>('NEW');
  const [replying, setReplying] = useState<HeadComplaint | null>(null);
  const [reply, setReply] = useState('');

  const list = items.filter((c) => c.status === tab);
  const count = (s: Complaint['status']) => items.filter((c) => c.status === s).length;

  const accept = (c: Complaint) =>
    setStatus.mutate({ id: c.id, status: 'IN_REVIEW' }, { onSuccess: () => toast.info('Đã tiếp nhận', `Khiếu nại của ${c.student} đang được xử lý.`), onError: (e) => toast.error('Không thực hiện được', errorMessage(e)) });
  /** accepted = khiếu nại đúng (đã sửa câu hỏi / điều chỉnh) → học viên báo lỗi câu hỏi được cộng điểm ghi nhận đóng góp */
  const resolve = (accepted: boolean) => {
    if (!replying) return;
    if (!reply.trim()) return toast.error('Vui lòng nhập nội dung phản hồi');
    const who = replying.student;
    replyM.mutate(
      { id: replying.id, text: reply.trim(), accepted },
      {
        onSuccess: () => {
          toast.success(accepted ? 'Đã chấp nhận & đóng khiếu nại' : 'Đã từ chối & đóng khiếu nại', accepted && replying?.questionId ? `${who} được cộng điểm ghi nhận đóng góp và nhận thông báo.` : `${who} sẽ nhận được thông báo.`);
          setReplying(null);
          setReply('');
        },
        onError: (e) => toast.error('Không gửi được', errorMessage(e)),
      }
    );
  };

  return (
    <div className="space-y-6">
      <TPageHead eyebrow="Giảng dạy" title="Khiếu nại & phúc khảo" sub="Tiếp nhận ý kiến của học viên về câu hỏi, đáp án và điểm số; kết luận chuyên môn rồi phản hồi lại học viên." />
      <Figures
        items={[
          { label: 'Mới', value: count('NEW'), note: 'chưa tiếp nhận', icon: Inbox, tone: 'rose' },
          { label: 'Đang xử lý', value: count('IN_REVIEW'), note: 'đang phúc khảo', icon: Reply, tone: 'amber' },
          { label: 'Đã giải quyết', value: count('RESOLVED'), note: 'đã phản hồi học viên', icon: CheckCircle2, tone: 'emerald' },
        ]}
      />

      <TTabs value={tab} onChange={(k) => setTab(k as Complaint['status'])} items={(Object.keys(STATUS) as Complaint['status'][]).map((s) => ({ key: s, label: STATUS[s].label, count: count(s) }))} />

      {list.length === 0 ? (
        <Panel>
          <EmptyState icon={<Inbox />} title={isLoading ? "Đang tải…" : "Không có khiếu nại"} description={isLoading ? "" : "Hộp thư ở trạng thái này đang trống."} />
        </Panel>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <Panel key={c.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <Avatar name={c.student} src={studentAvatar(c.id)} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-display text-[17px] font-bold text-slate-900">{c.subject}</h3>
                    <Status tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Status>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-500">
                    <span className="font-semibold text-slate-700">{c.student}</span>
                    <span>·</span>
                    <span>
                      {formatDateTime(c.createdAt)} ({timeAgo(c.createdAt)})
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {c.kind === 'APPEAL' ? <ClipboardCheck className="h-3 w-3" /> : <FileQuestion className="h-3 w-3" />} {c.questionRef}
                    </span>
                  </p>
                  <blockquote className="mt-3 rounded-xl border-l-4 border-violet-400 bg-violet-500/[0.05] px-4 py-3 text-sm leading-relaxed text-slate-800">{c.content}</blockquote>
                </div>
                <div className="flex shrink-0 gap-2 md:flex-col">
                  {c.status === 'NEW' && <TBtn onClick={() => accept(c)}>Tiếp nhận</TBtn>}
                  {c.kind === 'APPEAL' && c.status !== 'RESOLVED' && (
                    <TBtn to={staffPath('/grading-review')} icon={<ClipboardCheck />}>
                      Xem lại điểm
                    </TBtn>
                  )}
                  {c.status !== 'RESOLVED' && (
                    <TBtn variant="primary" icon={<Reply />} onClick={() => setReplying(c)}>
                      Phản hồi & đóng
                    </TBtn>
                  )}
                  {c.status === 'RESOLVED' && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Đã đóng
                    </span>
                  )}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={!!replying}
        onClose={() => setReplying(null)}
        title="Phản hồi khiếu nại"
        description={replying ? `${replying.student} · ${replying.subject}` : ''}
        icon={<Reply />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReplying(null)}>
              Huỷ
            </Button>
            <Button variant="outline" onClick={() => resolve(false)} disabled={replyM.isPending}>
              Không chấp nhận
            </Button>
            <Button variant="success" onClick={() => resolve(true)} disabled={replyM.isPending}>
              Chấp nhận & đóng
            </Button>
          </>
        }
      >
        {replying && <p className="mb-4 rounded-xl border-l-4 border-violet-400 bg-violet-500/[0.05] p-3 text-xs text-slate-600">"{replying.content}"</p>}
        <p className="mb-3 text-xs text-slate-500">
          {replying?.kind === 'APPEAL'
            ? 'Phúc khảo: kết luận điểm ở Kiểm định chấm điểm (giữ hoặc điều chỉnh) trước, rồi phản hồi tại đây. Học viên và giáo viên chấm đều nhận được thông báo.'
            : 'Chấp nhận khi khiếu nại đúng (đã hiệu đính câu hỏi trong Ngân hàng câu hỏi hoặc đã điều chỉnh điểm). Học viên báo lỗi câu hỏi được chấp nhận sẽ được cộng 20 điểm ghi nhận đóng góp.'}
        </p>
        <Textarea label="Nội dung phản hồi" required value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Giải thích kết luận chuyên môn, kết quả phúc khảo hoặc hướng xử lý..." />
      </Modal>
    </div>
  );
};
