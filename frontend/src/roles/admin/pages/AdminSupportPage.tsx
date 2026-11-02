import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Phone, Search, Send, Crown, Inbox } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { adminApi, useAdminInvalidate, useAdminTickets, useAdminUsers } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import type { SupportTicket, TicketStatus } from '@/shared/types';
import { Avatar } from '@/shared/components/ui';
import { cn, formatDateTime, timeAgo } from '@/shared/utils';
import { Figures, Status, TBtn, TPageHead, TTabs, inputCls, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const STATUS: Record<TicketStatus, { label: string; tone: StatusTone }> = { OPEN: { label: 'Mới', tone: 'red' }, PENDING: { label: 'Đang xử lý', tone: 'amber' }, RESOLVED: { label: 'Đã xong', tone: 'green' } };
const CHANNEL: Record<SupportTicket['channel'], { label: string; icon: React.ElementType }> = { CHAT: { label: 'Chat hỗ trợ', icon: MessageCircle }, EMAIL: { label: 'Email', icon: Mail }, PHONE: { label: 'Hotline', icon: Phone } };
const CATEGORY: Record<SupportTicket['category'], string> = { ACCOUNT: 'Tài khoản', PAYMENT: 'Thanh toán', EXAM: 'Bài thi', CONTENT: 'Nội dung học', OTHER: 'Khác' };
const PRIORITY: Record<SupportTicket['priority'], { label: string; cls: string }> = {
  HIGH: { label: 'Gấp', cls: 'bg-rose-500/10 text-rose-700' },
  NORMAL: { label: 'Thường', cls: 'bg-slate-100 text-slate-600' },
  LOW: { label: 'Thấp', cls: 'bg-slate-100 text-slate-500' },
};

/** Câu trả lời mẫu theo nhóm yêu cầu */
const QUICK: { label: string; text: string; cat?: SupportTicket['category'] }[] = [
  { label: 'Đã kích hoạt VIP', cat: 'PAYMENT', text: 'Chào bạn, bên mình đã xác nhận thanh toán và kích hoạt gói VIP cho tài khoản. Bạn đăng xuất rồi đăng nhập lại để cập nhật nhé.' },
  { label: 'Khôi phục bài thi', cat: 'EXAM', text: 'Chào bạn, hệ thống tự lưu bài làm mỗi 30 giây. Mình đã khôi phục bài, bạn vào Đề thi thử → Bài đang làm dở để tiếp tục nhé.' },
  { label: 'Đặt lại mật khẩu', cat: 'ACCOUNT', text: 'Chào bạn, mình vừa gửi lại liên kết đặt lại mật khẩu, có hiệu lực trong 30 phút. Bạn kiểm tra cả mục Thư rác giúp mình nhé.' },
  { label: 'Đã chuyển tổ chuyên môn', cat: 'CONTENT', text: 'Cảm ơn bạn đã báo lỗi. Mình đã chuyển cho tổ chuyên môn kiểm tra, sẽ phản hồi lại bạn trong 24 giờ.' },
  { label: 'Cảm ơn & đóng yêu cầu', text: 'Cảm ơn bạn đã liên hệ OrbiLingo. Nếu cần hỗ trợ thêm, bạn cứ nhắn vào khung chat ở góc màn hình nhé.' },
];

/** Hộp thư hỗ trợ: đầu kia của khung chat hỗ trợ học viên, cộng email và hotline */
export const AdminSupportPage: React.FC = () => {
  useDocumentTitle('Hỗ trợ học viên');
  const meUser = useAuthStore((s) => s.user);
  const me = meUser?.fullName ?? 'Quản trị viên';
  const ticketsQ = useAdminTickets();
  const admins = useAdminUsers({ role: 'ADMIN' }).data?.items ?? [];
  const students = useAdminUsers({ role: 'STUDENT' }).data?.items ?? [];
  const refresh = useAdminInvalidate();
  const tickets = useMemo<(SupportTicket & { assigneeId?: string })[]>(() => ticketsQ.data ?? [], [ticketsQ.data]);
  const [sending, setSending] = useState(false);
  const [params] = useSearchParams();
  const linked = params.get('id');
  const [tab, setTab] = useState<TicketStatus | 'ALL'>(linked ? 'ALL' : 'OPEN');
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState('');
  const [activeId, setActiveId] = useState<string | null>(linked);
  const [draft, setDraft] = useState('');

  const list = useMemo(
    () =>
      tickets.filter((t) => (tab === 'ALL' || t.status === tab) && (!channel || t.channel === channel) && (!q || `${t.subject} ${t.userName} ${t.email} ${t.id}`.toLowerCase().includes(q.toLowerCase()))),
    [tickets, tab, channel, q]
  );
  const active = tickets.find((t) => t.id === activeId) ?? null;
  const shown = active ?? list[0] ?? null;
  const count = (s: TicketStatus) => tickets.filter((t) => t.status === s).length;
  const patch = async (id: string, p: Record<string, unknown>, ok?: string) => {
    try {
      await adminApi.updateTicket(id, p);
      if (ok) toast.success(ok);
      await refresh();
    } catch (e) {
      toast.error('Không cập nhật được', errorMessage(e));
    }
  };

  const send = async () => {
    if (!shown || !draft.trim()) return;
    setSending(true);
    try {
      await adminApi.replyTicket(shown.id, draft.trim());
      setDraft('');
      toast.success('Đã gửi trả lời', shown.channel === 'CHAT' ? `${shown.userName} nhận được trong khung chat hỗ trợ và thông báo` : `Đã ghi nhận trả lời cho ${shown.email}`);
      await refresh();
    } catch (e) {
      toast.error('Không gửi được', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const user = shown ? students.find((u) => u.email === shown.email) : undefined;
  const lastAt = (t: SupportTicket) => t.messages[t.messages.length - 1]?.at ?? t.createdAt;
  const resolvedWeek = tickets.filter((t) => t.status === 'RESOLVED' && Date.now() - new Date(lastAt(t)).getTime() < 7 * 86400_000).length;

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Người dùng' }, { label: 'Hỗ trợ học viên' }]} title="Hỗ trợ học viên" sub="Tin nhắn từ khung chat hỗ trợ trên trang học viên, email và cuộc gọi hotline được ghi lại thành yêu cầu." />
      <Figures
        items={[
          { label: 'Yêu cầu mới', value: count('OPEN'), icon: Inbox, tone: 'rose', note: `${tickets.filter((t) => t.status === 'OPEN' && t.priority === 'HIGH').length} yêu cầu gấp` },
          { label: 'Đang xử lý', value: count('PENDING'), icon: MessageCircle, tone: 'amber' },
          { label: 'Đã xong tuần này', value: resolvedWeek, icon: Send, tone: 'emerald', note: `${count('RESOLVED')} yêu cầu đã xong` },
          { label: 'Tổng yêu cầu', value: tickets.length, icon: Phone, tone: 'sky', note: 'chat, email, hotline' },
        ]}
      />

      <div className="grid overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] lg:grid-cols-[380px_1fr]">
        {/* Danh sách yêu cầu */}
        <div className={cn('min-w-0 border-slate-100 lg:border-r', active && 'max-lg:hidden')}>
          <div className="space-y-3 border-b border-slate-100 p-4">
            <TTabs
              value={tab}
              onChange={(k) => setTab(k as TicketStatus | 'ALL')}
              items={[
                { key: 'OPEN', label: 'Mới', count: count('OPEN') },
                { key: 'PENDING', label: 'Đang xử lý', count: count('PENDING') },
                { key: 'RESOLVED', label: 'Đã xong', count: count('RESOLVED') },
                { key: 'ALL', label: 'Tất cả' },
              ]}
            />
            <div className="flex gap-2">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tên, email, mã" className={cn(inputCls, 'w-full pl-9')} />
              </label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className={cn(inputCls, 'w-[118px] shrink-0')} aria-label="Kênh">
                <option value="">Mọi kênh</option>
                {Object.entries(CHANNEL).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ul className="max-h-[560px] overflow-y-auto">
            {list.map((t) => {
              const Icon = CHANNEL[t.channel].icon;
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setActiveId(t.id)} className={cn('flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors hover:bg-slate-50', shown?.id === t.id && 'bg-indigo-500/[0.06] hover:bg-indigo-500/[0.06]')}>
                    <Avatar name={t.userName} src={t.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{t.userName}</p>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(lastAt(t))}</span>
                      </div>
                      <p className="truncate text-[13px] text-slate-700">{t.subject}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3 w-3" /> {CHANNEL[t.channel].label}
                        </span>
                        <span>· {CATEGORY[t.category]}</span>
                        {t.priority !== 'NORMAL' && <span className={cn('rounded px-1.5 py-0.5 font-semibold', PRIORITY[t.priority].cls)}>{PRIORITY[t.priority].label}</span>}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {!list.length && <li className="px-4 py-12 text-center text-sm text-slate-500">{ticketsQ.isLoading ? 'Đang tải…' : 'Không có yêu cầu nào.'}</li>}
          </ul>
        </div>

        {/* Hội thoại */}
        {shown ? (
          <div className={cn('flex min-w-0 flex-col', !active && 'max-lg:hidden')}>
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <button type="button" onClick={() => setActiveId(null)} className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-900 lg:hidden">
                  <ArrowLeft className="h-4 w-4" /> Danh sách
                </button>
                <p className="text-[12px] text-slate-500">
                  #{shown.id.slice(0, 8)} · {CHANNEL[shown.channel].label} · {CATEGORY[shown.category]} · {formatDateTime(shown.createdAt)}
                </p>
                <h2 className="mt-0.5 font-display text-[17px] font-bold text-slate-900">{shown.subject}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={shown.status} onChange={(e) => void patch(shown.id, { status: e.target.value }, `Trạng thái: ${STATUS[e.target.value as TicketStatus].label}`)} className={cn(inputCls, 'h-9 w-[132px]')} aria-label="Trạng thái">
                  {Object.entries(STATUS).map(([k, s]) => (
                    <option key={k} value={k}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <select value={shown.assigneeId ?? ''} onChange={(e) => void patch(shown.id, { assigneeId: e.target.value || null }, 'Đã phân công')} className={cn(inputCls, 'h-9 w-[160px]')} aria-label="Người phụ trách">
                  <option value="">Chưa phân công</option>
                  {(admins.length ? admins : meUser ? [{ id: meUser.id, fullName: me }] : []).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 xl:grid-cols-[1fr_240px]">
              <div className="flex min-w-0 flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-5 py-5 lg:max-h-[420px]">
                  {shown.messages.map((m, i) => (
                    <div key={i} className={cn('flex', m.from === 'STAFF' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed', m.from === 'STAFF' ? 'rounded-br-md bg-indigo-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800')}>
                        <p className="whitespace-pre-line">{m.text}</p>
                        <p className={cn('mt-1 text-[11px]', m.from === 'STAFF' ? 'text-white/70' : 'text-slate-400')}>
                          {m.from === 'STAFF' ? (shown.assignee ?? me) : shown.userName} · {formatDateTime(m.at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-slate-100 p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK.filter((x) => !x.cat || x.cat === shown.category).map((x) => (
                      <button key={x.label} type="button" onClick={() => setDraft(x.text)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] text-slate-600 hover:border-indigo-300 hover:text-indigo-700">
                        {x.label}
                      </button>
                    ))}
                  </div>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void send(); }} rows={3} placeholder={shown.channel === 'CHAT' ? 'Trả lời trong khung chat của học viên…' : `Trả lời qua email ${shown.email}…`} className={cn(inputCls, 'h-auto w-full resize-none py-2.5')} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-slate-400 max-sm:hidden">Ctrl + Enter để gửi</span>
                    <div className="ml-auto flex gap-2">
                      {shown.status !== 'RESOLVED' && (
                        <TBtn size="sm" onClick={() => void patch(shown.id, { status: 'RESOLVED' }, 'Đã đóng yêu cầu')}>
                          Đánh dấu đã xong
                        </TBtn>
                      )}
                      <TBtn size="sm" variant="primary" icon={<Send />} disabled={!draft.trim() || sending} onClick={() => void send()}>
                        Gửi
                      </TBtn>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin học viên */}
              <aside className="space-y-4 border-t border-slate-100 p-5 text-sm xl:border-l xl:border-t-0">
                <div className="flex items-center gap-3">
                  <Avatar name={shown.userName} src={shown.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{shown.userName}</p>
                    <p className="truncate text-[12px] text-slate-500">{shown.email}</p>
                  </div>
                </div>
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Gói</dt>
                    <dd className="inline-flex items-center gap-1 font-medium text-slate-800">{shown.plan === 'VIP' && <Crown className="h-3.5 w-3.5 text-amber-500" />}{shown.plan}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Trạng thái</dt>
                    <dd><Status tone={STATUS[shown.status].tone}>{STATUS[shown.status].label}</Status></dd>
                  </div>
                  {user && (
                    <>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Mục tiêu</dt>
                        <dd className="text-slate-800">{user.target ? `${user.target.examType} ${user.target.score}` : 'Chưa đặt'}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate-500">Chuỗi ngày học</dt>
                        <dd className="tabular-nums text-slate-800">{user.streak} ngày</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Yêu cầu trước đây</dt>
                    <dd className="tabular-nums text-slate-800">{tickets.filter((t) => t.email === shown.email && t.id !== shown.id).length}</dd>
                  </div>
                </dl>
                <div className="flex flex-col gap-2">
                  <TBtn size="sm" to={`/admin/users?q=${encodeURIComponent(shown.email)}`}>Xem tài khoản</TBtn>
                  {shown.category === 'PAYMENT' && <TBtn size="sm" to="/admin/billing">Xem giao dịch</TBtn>}
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-12 text-sm text-slate-500 max-lg:hidden">Chọn một yêu cầu để xem.</div>
        )}
      </div>
    </div>
  );
};
