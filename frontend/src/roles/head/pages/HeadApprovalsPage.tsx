import React, { useState } from 'react';
import { CheckSquare, Check, X, Eye, FileText, Database, Video, Newspaper } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_APPROVALS } from '@/shared/mocks';
import type { ApprovalRequest } from '@/shared/types';
import { timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, EmptyState, Modal, PageHeader, StatCard, Tabs, Textarea } from '@/shared/components/ui';

const TYPE: Record<ApprovalRequest['type'], { label: string; tone: 'indigo' | 'violet' | 'sky' | 'amber'; icon: React.ElementType }> = {
  TEST: { label: 'Đề thi', tone: 'indigo', icon: FileText },
  QUESTION: { label: 'Câu hỏi', tone: 'violet', icon: Database },
  LESSON: { label: 'Bài giảng', tone: 'sky', icon: Video },
  POST: { label: 'Bài viết', tone: 'amber', icon: Newspaper },
};

export const HeadApprovalsPage: React.FC = () => {
  useDocumentTitle('Phê duyệt học liệu');
  const [items, setItems] = useState<ApprovalRequest[]>(MOCK_APPROVALS);
  const [tab, setTab] = useState<ApprovalRequest['status']>('PENDING');
  const [detail, setDetail] = useState<ApprovalRequest | null>(null);
  const [rejecting, setRejecting] = useState<ApprovalRequest | null>(null);
  const [reason, setReason] = useState('');

  const list = items.filter((a) => a.status === tab);
  const count = (s: ApprovalRequest['status']) => items.filter((a) => a.status === s).length;

  const approve = (a: ApprovalRequest) => {
    setItems((s) => s.map((x) => (x.id === a.id ? { ...x, status: 'APPROVED' } : x)));
    setDetail(null);
    toast.success('Đã phê duyệt', `${a.title} sẽ được xuất bản cho học viên.`);
  };
  const reject = () => {
    if (!rejecting) return;
    if (!reason.trim()) return toast.error('Vui lòng nhập lý do từ chối');
    setItems((s) => s.map((x) => (x.id === rejecting.id ? { ...x, status: 'REJECTED', summary: `Từ chối: ${reason}` } : x)));
    toast.info('Đã từ chối', `Giáo viên ${rejecting.author} sẽ nhận được phản hồi.`);
    setRejecting(null);
    setDetail(null);
    setReason('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Phê duyệt học liệu" description="Thẩm định đề kiểm tra, câu hỏi, bài giảng và bài viết do giáo viên gửi lên." icon={<CheckSquare />} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Chờ duyệt" value={count('PENDING')} tone="amber" />
        <StatCard label="Đã duyệt" value={count('APPROVED')} tone="emerald" />
        <StatCard label="Từ chối" value={count('REJECTED')} tone="rose" />
      </div>
      <Tabs variant="pill" value={tab} onChange={(k) => setTab(k as ApprovalRequest['status'])} items={[{ key: 'PENDING', label: 'Chờ duyệt', count: count('PENDING') }, { key: 'APPROVED', label: 'Đã duyệt', count: count('APPROVED') }, { key: 'REJECTED', label: 'Từ chối', count: count('REJECTED') }]} />

      {list.length === 0 ? (
        <Card><EmptyState icon={<CheckSquare />} title="Không có yêu cầu" description="Chưa có học liệu nào ở trạng thái này." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((a, i) => {
            const t = TYPE[a.type];
            const Icon = t.icon;
            return (
              <Card key={a.id} className="animate-fade-up card-hover" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-3">
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-${t.tone}-50 text-${t.tone}-600`}><Icon className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><Badge tone={t.tone} size="xs">{t.label}</Badge><span className="text-[11px] text-slate-400">{timeAgo(a.submittedAt)}</span></div>
                    <h3 className="font-bold text-slate-900 mt-1 leading-snug">{a.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{a.summary}</p>
                    <div className="flex items-center gap-2 mt-3"><Avatar name={a.author} size="xs" /><span className="text-xs font-semibold text-slate-600">{a.author}</span></div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button size="sm" variant="ghost" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setDetail(a)}>Chi tiết</Button>
                  {a.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="outline" leftIcon={<X className="w-4 h-4" />} onClick={() => setRejecting(a)}>Từ chối</Button>
                      <Button size="sm" variant="success" leftIcon={<Check className="w-4 h-4" />} onClick={() => approve(a)}>Phê duyệt</Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title} description={detail ? `${TYPE[detail.type].label} · gửi bởi ${detail.author} · ${timeAgo(detail.submittedAt)}` : ''} size="lg"
        footer={detail?.status === 'PENDING' ? (<><Button variant="outline" onClick={() => setRejecting(detail)}>Từ chối</Button><Button variant="success" onClick={() => detail && approve(detail)}>Phê duyệt</Button></>) : undefined}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed">{detail.summary}</div>
            <div className="grid grid-cols-2 gap-3">
              {[['Loại học liệu', TYPE[detail.type].label], ['Trạng thái', detail.status], ['Tác giả', detail.author], ['Mã yêu cầu', detail.id.toUpperCase()]].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl border border-slate-200"><p className="text-[10px] font-bold uppercase text-slate-400">{k}</p><p className="font-semibold text-slate-800 mt-0.5">{v}</p></div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Checklist thẩm định: đúng format đề thi · không trùng lặp ngân hàng · có lời giải · độ khó phù hợp mục tiêu.</p>
          </div>
        )}
      </Modal>

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Từ chối học liệu" description={rejecting?.title} size="sm" footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Huỷ</Button><Button variant="danger" onClick={reject}>Xác nhận từ chối</Button></>}>
        <Textarea label="Lý do / yêu cầu chỉnh sửa" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Trùng đề ETS 2023, cần biên soạn lại câu 5–10..." />
      </Modal>
    </div>
  );
};
