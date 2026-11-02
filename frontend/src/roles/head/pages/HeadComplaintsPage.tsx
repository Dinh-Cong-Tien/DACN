import React, { useState } from 'react';
import { CheckCircle2, FileQuestion, Inbox, Reply } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_COMPLAINTS } from '@/shared/mocks';
import type { Complaint } from '@/shared/types';
import { timeAgo, formatDateTime } from '@/shared/utils';
import { Avatar, Button, EmptyState, Modal, Textarea } from '@/shared/components/ui';
import { pravatar } from '@/shared/components/media/Img';
import { Figures, Panel, Status, TBtn, TPageHead, TTabs, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const STATUS: Record<Complaint['status'], { label: string; tone: StatusTone }> = { NEW: { label: 'Mới', tone: 'red' }, IN_REVIEW: { label: 'Đang xử lý', tone: 'amber' }, RESOLVED: { label: 'Đã giải quyết', tone: 'green' } };

const studentAvatar = (id: string) => pravatar(20 + (Number(id.split('-')[1]) || 1));

export const HeadComplaintsPage: React.FC = () => {
  useDocumentTitle('Khiếu nại & Phản hồi');
  const [items, setItems] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [tab, setTab] = useState<Complaint['status']>('NEW');
  const [replying, setReplying] = useState<Complaint | null>(null);
  const [reply, setReply] = useState('');

  const list = items.filter((c) => c.status === tab);
  const count = (s: Complaint['status']) => items.filter((c) => c.status === s).length;

  const accept = (c: Complaint) => {
    setItems((s) => s.map((x) => (x.id === c.id ? { ...x, status: 'IN_REVIEW' } : x)));
    toast.info('Đã tiếp nhận', `Khiếu nại của ${c.student} đang được xử lý.`);
  };
  const resolve = () => {
    if (!replying) return;
    if (!reply.trim()) return toast.error('Vui lòng nhập nội dung phản hồi');
    setItems((s) => s.map((x) => (x.id === replying.id ? { ...x, status: 'RESOLVED' } : x)));
    toast.success('Đã phản hồi & đóng', `${replying.student} sẽ nhận được thông báo.`);
    setReplying(null);
    setReply('');
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
          <EmptyState icon={<Inbox />} title="Không có khiếu nại" description="Hộp thư ở trạng thái này đang trống." />
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
                      <FileQuestion className="h-3 w-3" /> {c.questionRef}
                    </span>
                  </p>
                  <blockquote className="mt-3 rounded-xl border-l-4 border-violet-400 bg-violet-500/[0.05] px-4 py-3 text-sm leading-relaxed text-slate-800">{c.content}</blockquote>
                </div>
                <div className="flex shrink-0 gap-2 md:flex-col">
                  {c.status === 'NEW' && <TBtn onClick={() => accept(c)}>Tiếp nhận</TBtn>}
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
            <Button variant="success" onClick={resolve}>
              Gửi & đóng khiếu nại
            </Button>
          </>
        }
      >
        {replying && <p className="mb-4 rounded-xl border-l-4 border-violet-400 bg-violet-500/[0.05] p-3 text-xs text-slate-600">"{replying.content}"</p>}
        <Textarea label="Nội dung phản hồi" required value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Giải thích kết luận chuyên môn, kết quả phúc khảo hoặc hướng xử lý..." />
      </Modal>
    </div>
  );
};
