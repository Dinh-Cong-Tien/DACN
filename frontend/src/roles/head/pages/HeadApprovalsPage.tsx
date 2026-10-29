import React, { useState } from 'react';
import { CheckSquare, Check, X, Eye, FileText, Database, Video, Newspaper } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_APPROVALS, MOCK_TEACHERS } from '@/shared/mocks';
import type { ApprovalRequest } from '@/shared/types';
import { cn, timeAgo, formatDateTime } from '@/shared/utils';
import { Avatar, Badge, Button, Card, EmptyState, Modal, PageHeader, StatCard, Tabs, Textarea } from '@/shared/components/ui';

const TYPE: Record<ApprovalRequest['type'], { label: string; tone: 'indigo' | 'violet' | 'sky' | 'amber'; icon: React.ElementType; cls: string }> = {
  TEST: { label: 'Đề thi', tone: 'indigo', icon: FileText, cls: 'bg-indigo-200 text-indigo-900' },
  QUESTION: { label: 'Câu hỏi', tone: 'violet', icon: Database, cls: 'bg-violet-200 text-violet-900' },
  LESSON: { label: 'Bài giảng', tone: 'sky', icon: Video, cls: 'bg-sky-200 text-sky-900' },
  POST: { label: 'Bài viết', tone: 'amber', icon: Newspaper, cls: 'bg-amber-200 text-amber-900' },
};

const authorAvatar = (name: string) => MOCK_TEACHERS.find((t) => t.name === name)?.avatarUrl;

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
      <PageHeader
        title={
          <>
            Phê duyệt <span className="mark">học liệu</span>
          </>
        }
        description="Thẩm định đề kiểm tra, câu hỏi, bài giảng và bài viết do giáo viên gửi lên."
        icon={<CheckSquare />}
      />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Chờ duyệt" value={count('PENDING')} tone="amber" />
        <StatCard label="Đã duyệt" value={count('APPROVED')} tone="emerald" />
        <StatCard label="Từ chối" value={count('REJECTED')} tone="rose" />
      </div>
      <Tabs
        variant="pill"
        value={tab}
        onChange={(k) => setTab(k as ApprovalRequest['status'])}
        items={[
          { key: 'PENDING', label: 'Chờ duyệt', count: count('PENDING') },
          { key: 'APPROVED', label: 'Đã duyệt', count: count('APPROVED') },
          { key: 'REJECTED', label: 'Từ chối', count: count('REJECTED') },
        ]}
      />

      {list.length === 0 ? (
        <Card hard>
          <EmptyState icon={<CheckSquare />} title="Không có yêu cầu" description="Chưa có học liệu nào ở trạng thái này." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {list.map((a, i) => {
            const t = TYPE[a.type];
            const Icon = t.icon;
            return (
              <Card key={a.id} hard hover className="animate-fade-up relative" style={{ animationDelay: `${i * 60}ms` }}>
                <span className={cn('sticker absolute -top-3 right-4 !text-[10px]', i % 2 ? 'tilt-2' : 'tilt-1')}>{t.label}</span>
                <div className="flex items-start gap-3">
                  <span className={cn('w-11 h-11 rounded-xl border-2 border-slate-900 flex items-center justify-center shrink-0', t.cls)}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-500 font-semibold">Gửi {formatDateTime(a.submittedAt)} · {timeAgo(a.submittedAt)}</p>
                    <h3 className="font-display font-bold text-slate-900 mt-1 leading-snug">{a.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar name={a.author} src={authorAvatar(a.author)} size="sm" ring />
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-slate-800">{a.author}</p>
                        <p className="text-[10px] text-slate-500">Giáo viên bộ môn</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t-2 border-slate-100">
                  <Button size="sm" variant="ghost" leftIcon={<Eye className="w-4 h-4" />} onClick={() => setDetail(a)}>
                    Chi tiết
                  </Button>
                  {a.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="outline" leftIcon={<X className="w-4 h-4" />} onClick={() => setRejecting(a)}>
                        Từ chối
                      </Button>
                      <Button size="sm" variant="success" leftIcon={<Check className="w-4 h-4" />} onClick={() => approve(a)}>
                        Phê duyệt
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        description={detail ? `${TYPE[detail.type].label} · gửi bởi ${detail.author} · ${timeAgo(detail.submittedAt)}` : ''}
        size="lg"
        footer={
          detail?.status === 'PENDING' ? (
            <>
              <Button variant="outline" onClick={() => setRejecting(detail)}>
                Từ chối
              </Button>
              <Button variant="success" onClick={() => detail && approve(detail)}>
                Phê duyệt
              </Button>
            </>
          ) : undefined
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-2xl bg-paper border-2 border-slate-900 leading-relaxed">{detail.summary}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Loại học liệu', TYPE[detail.type].label],
                ['Trạng thái', detail.status],
                ['Tác giả', detail.author],
                ['Mã yêu cầu', detail.id.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl border-2 border-slate-200">
                  <p className="text-[10px] font-extrabold uppercase text-slate-500">{k}</p>
                  <p className="font-bold text-slate-900 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600">Checklist thẩm định: đúng format đề thi · không trùng lặp ngân hàng · có lời giải · độ khó phù hợp mục tiêu.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title="Từ chối học liệu"
        description={rejecting?.title}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Huỷ
            </Button>
            <Button variant="danger" onClick={reject}>
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        <Textarea label="Lý do / yêu cầu chỉnh sửa" required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Trùng đề ETS 2023, cần biên soạn lại câu 5–10..." />
      </Modal>
    </div>
  );
};
