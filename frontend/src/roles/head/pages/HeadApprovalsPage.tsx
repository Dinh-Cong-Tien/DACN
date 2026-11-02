import React, { useState } from 'react';
import { CheckSquare, Check, Clock, X, Eye, FileText, Database, Video, Newspaper } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_APPROVALS, MOCK_TEACHERS } from '@/shared/mocks';
import type { ApprovalRequest } from '@/shared/types';
import { cn, timeAgo, formatDateTime } from '@/shared/utils';
import { Avatar, Button, EmptyState, Modal, Textarea } from '@/shared/components/ui';
import { Figures, IconTile, Panel, Status, TBtn, TPageHead, TTabs, type Tone } from '@/roles/teacher/components/TeacherKit';

const TYPE: Record<ApprovalRequest['type'], { label: string; tone: Tone; icon: React.ElementType; cls: string }> = {
  TEST: { label: 'Đề thi', tone: 'indigo', icon: FileText, cls: 'bg-indigo-500/10 text-indigo-700' },
  QUESTION: { label: 'Câu hỏi', tone: 'violet', icon: Database, cls: 'bg-violet-500/10 text-violet-700' },
  LESSON: { label: 'Bài giảng', tone: 'sky', icon: Video, cls: 'bg-sky-500/10 text-sky-700' },
  POST: { label: 'Bài viết', tone: 'amber', icon: Newspaper, cls: 'bg-amber-500/15 text-amber-800' },
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
      <TPageHead eyebrow="Học liệu" title="Phê duyệt học liệu" sub="Thẩm định đề kiểm tra, câu hỏi, bài giảng và bài viết do giáo viên gửi lên trước khi xuất bản tới học viên." />
      <Figures
        items={[
          { label: 'Chờ duyệt', value: count('PENDING'), note: 'cần thẩm định', icon: Clock, tone: 'amber' },
          { label: 'Đã duyệt', value: count('APPROVED'), note: 'đã xuất bản', icon: CheckSquare, tone: 'emerald' },
          { label: 'Từ chối', value: count('REJECTED'), note: 'trả lại giáo viên', icon: X, tone: 'rose' },
        ]}
      />
      <TTabs
        value={tab}
        onChange={(k) => setTab(k as ApprovalRequest['status'])}
        items={[
          { key: 'PENDING', label: 'Chờ duyệt', count: count('PENDING') },
          { key: 'APPROVED', label: 'Đã duyệt', count: count('APPROVED') },
          { key: 'REJECTED', label: 'Từ chối', count: count('REJECTED') },
        ]}
      />

      {list.length === 0 ? (
        <Panel>
          <EmptyState icon={<CheckSquare />} title="Không có yêu cầu" description="Chưa có học liệu nào ở trạng thái này." />
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {list.map((a) => {
            const t = TYPE[a.type];
            return (
              <section key={a.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] transition-shadow hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_32px_-16px_rgba(16,24,40,0.2)]">
                <div className="flex flex-1 items-start gap-4 p-5">
                  <IconTile icon={t.icon} tone={t.tone} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className={cn('rounded-md px-2 py-0.5 font-semibold', t.cls)}>{t.label}</span>
                      <span>
                        {formatDateTime(a.submittedAt)} · {timeAgo(a.submittedAt)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-[17px] font-bold leading-snug text-slate-900">{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.summary}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={a.author} src={authorAvatar(a.author)} size="sm" />
                    <div className="leading-tight">
                      <p className="text-[13px] font-semibold text-slate-800">{a.author}</p>
                      <p className="text-xs text-slate-500">Giáo viên bộ môn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TBtn size="sm" variant="ghost" icon={<Eye />} onClick={() => setDetail(a)}>
                      Chi tiết
                    </TBtn>
                    {a.status === 'PENDING' ? (
                      <>
                        <TBtn size="sm" icon={<X />} onClick={() => setRejecting(a)}>
                          Từ chối
                        </TBtn>
                        <TBtn size="sm" variant="primary" icon={<Check />} onClick={() => approve(a)}>
                          Phê duyệt
                        </TBtn>
                      </>
                    ) : (
                      <Status tone={a.status === 'APPROVED' ? 'green' : 'red'}>{a.status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}</Status>
                    )}
                  </div>
                </div>
              </section>
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
            <div className="rounded-xl border-l-4 border-indigo-400 bg-indigo-500/[0.05] p-4 leading-relaxed">{detail.summary}</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Loại học liệu', TYPE[detail.type].label],
                ['Trạng thái', detail.status === 'PENDING' ? 'Chờ duyệt' : detail.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'],
                ['Tác giả', detail.author],
                ['Mã yêu cầu', detail.id.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <p className="text-xs text-slate-500">{k}</p>
                  <p className="mt-0.5 font-semibold text-slate-900">{v}</p>
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
