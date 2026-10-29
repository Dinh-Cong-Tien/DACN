import React, { useState } from 'react';
import { MessageSquareWarning, Inbox, CheckCircle2, Reply } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_COMPLAINTS } from '@/shared/mocks';
import type { Complaint } from '@/shared/types';
import { timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, EmptyState, Modal, PageHeader, StatCard, Tabs, Textarea } from '@/shared/components/ui';

const STATUS: Record<Complaint['status'], { label: string; tone: 'rose' | 'amber' | 'emerald' }> = { NEW: { label: 'Mới', tone: 'rose' }, IN_REVIEW: { label: 'Đang xử lý', tone: 'amber' }, RESOLVED: { label: 'Đã giải quyết', tone: 'emerald' } };

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
      <PageHeader title="Khiếu nại & Phản hồi" description="Tiếp nhận ý kiến của học viên về câu hỏi, đáp án và điểm số." icon={<MessageSquareWarning />} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Mới" value={count('NEW')} tone="rose" icon={<Inbox />} />
        <StatCard label="Đang xử lý" value={count('IN_REVIEW')} tone="amber" icon={<Reply />} />
        <StatCard label="Đã giải quyết" value={count('RESOLVED')} tone="emerald" icon={<CheckCircle2 />} />
      </div>
      <Tabs variant="pill" value={tab} onChange={(k) => setTab(k as Complaint['status'])} items={(Object.keys(STATUS) as Complaint['status'][]).map((s) => ({ key: s, label: STATUS[s].label, count: count(s) }))} />

      {list.length === 0 ? (
        <Card><EmptyState icon={<Inbox />} title="Không có khiếu nại" description="Hộp thư ở trạng thái này đang trống." /></Card>
      ) : (
        <div className="space-y-3">
          {list.map((c, i) => (
            <Card key={c.id} className="animate-fade-up card-hover" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <Avatar name={c.student} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{c.subject}</h3>
                    <Badge tone={STATUS[c.status].tone} dot size="xs">{STATUS[c.status].label}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.student} · {timeAgo(c.createdAt)} · <Badge tone="slate" size="xs">{c.questionRef}</Badge></p>
                  <p className="text-sm text-slate-700 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">"{c.content}"</p>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0">
                  {c.status === 'NEW' && <Button size="sm" variant="outline" onClick={() => accept(c)}>Tiếp nhận</Button>}
                  {c.status !== 'RESOLVED' && <Button size="sm" leftIcon={<Reply className="w-4 h-4" />} onClick={() => setReplying(c)}>Phản hồi & đóng</Button>}
                  {c.status === 'RESOLVED' && <Badge tone="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>Đã đóng</Badge>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!replying} onClose={() => setReplying(null)} title="Phản hồi khiếu nại" description={replying ? `${replying.student} · ${replying.subject}` : ''} icon={<Reply />} footer={<><Button variant="ghost" onClick={() => setReplying(null)}>Huỷ</Button><Button variant="success" onClick={resolve}>Gửi & đóng khiếu nại</Button></>}>
        {replying && <p className="text-xs text-slate-500 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">"{replying.content}"</p>}
        <Textarea label="Nội dung phản hồi" required value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Giải thích kết luận chuyên môn, kết quả phúc khảo hoặc hướng xử lý..." />
      </Modal>
    </div>
  );
};
