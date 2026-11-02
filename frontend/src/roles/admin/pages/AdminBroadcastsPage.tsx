import React, { useState } from 'react';
import { Bell, Mail, Send, CalendarClock, Megaphone } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { adminApi, useAdminBroadcasts, useAdminInvalidate } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import type { Broadcast } from '@/shared/types';
import { cn, formatDateTime } from '@/shared/utils';
import { Panel, Status, TBtn, TPageHead, inputCls, tbl, type StatusTone } from '@/roles/teacher/components/TeacherKit';

const AUDIENCE: Record<Broadcast['audience'], string> = { ALL: 'Tất cả người dùng', STUDENT: 'Học viên', VIP: 'Học viên VIP', TEACHER: 'Giáo viên', HEAD_TEACHER: 'Trưởng bộ môn' };
const STATUS: Record<Broadcast['status'], { label: string; tone: StatusTone }> = { SENT: { label: 'Đã gửi', tone: 'green' }, SCHEDULED: { label: 'Hẹn giờ', tone: 'blue' }, DRAFT: { label: 'Nháp', tone: 'gray' } };

const EMPTY: Broadcast[] = [];
/** Thời điểm mặc định khi hẹn giờ: 8:00 sáng mai (giờ địa phương) */
const tomorrow8 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T08:00`;
};

/** Gửi thông báo hệ thống: hiện trong chuông thông báo của người nhận và/hoặc gửi email */
export const AdminBroadcastsPage: React.FC = () => {
  useDocumentTitle('Gửi thông báo');
  const { data, isLoading } = useAdminBroadcasts();
  const refresh = useAdminInvalidate();
  const items = data?.items ?? EMPTY;
  const reachOf = (a: Broadcast['audience']) => data?.audienceCounts[a] ?? 0;
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Broadcast['audience']>('STUDENT');
  const [channels, setChannels] = useState<Broadcast['channels']>(['IN_APP']);
  const [when, setWhen] = useState<'now' | 'later'>('now');
  const [at, setAt] = useState(tomorrow8);

  const toggle = (c: 'IN_APP' | 'EMAIL') => setChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const valid = title.trim() && body.trim() && channels.length && (when === 'now' || at);

  const submit = async (status: Broadcast['status']) => {
    setSending(true);
    try {
      const b = await adminApi.createBroadcast({
        title: title.trim() || 'Chưa có tiêu đề',
        body: body.trim() || title.trim(),
        audience,
        channels: channels.length ? channels : ['IN_APP'],
        mode: status === 'SENT' ? 'NOW' : status === 'SCHEDULED' ? 'SCHEDULE' : 'DRAFT',
        scheduledAt: status === 'SCHEDULED' ? new Date(at).toISOString() : undefined,
      });
      setTitle('');
      setBody('');
      toast.success(status === 'SENT' ? 'Đã gửi thông báo' : status === 'SCHEDULED' ? 'Đã hẹn giờ gửi' : 'Đã lưu nháp', status === 'DRAFT' ? b.title : `${AUDIENCE[audience]} · ${(status === 'SENT' ? b.reach : reachOf(audience)).toLocaleString('vi-VN')} người nhận${channels.includes('EMAIL') ? ' (email chưa có dịch vụ gửi, chỉ ghi nhận)' : ''}`);
      await refresh();
    } catch (e) {
      toast.error('Không gửi được', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Vận hành' }, { label: 'Gửi thông báo' }]} title="Gửi thông báo" sub="Thông báo bảo trì, nội dung mới, ưu đãi gửi tới từng nhóm người dùng. Người nhận thấy trong chuông thông báo hoặc email." />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px] [&>*]:min-w-0">
        <Panel title="Soạn thông báo" icon={Megaphone} tone="violet">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Tiêu đề</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="VD: Bảo trì hệ thống 02:00–04:00 ngày 09/11" className={cn(inputCls, 'w-full')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Nội dung</span>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={300} placeholder="Nội dung ngắn gọn, tối đa 300 ký tự" className={cn(inputCls, 'h-auto w-full resize-none py-2.5')} />
              <span className="mt-1 block text-right text-[11px] text-slate-400">{body.length}/300</span>
            </label>

            <div>
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Gửi tới</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AUDIENCE) as Broadcast['audience'][]).map((a) => (
                  <button key={a} type="button" onClick={() => setAudience(a)} className={cn('rounded-xl border px-3 py-2 text-left text-[13px] transition-colors', audience === a ? 'border-indigo-500 bg-indigo-500/[0.06] text-indigo-800' : 'border-slate-200 text-slate-700 hover:border-slate-300')}>
                    <span className="block font-semibold">{AUDIENCE[a]}</span>
                    <span className="text-[11px] text-slate-500">{reachOf(a).toLocaleString('vi-VN')} người</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Kênh</span>
                <div className="flex flex-wrap gap-2">
                  {([['IN_APP', 'Chuông thông báo', Bell], ['EMAIL', 'Email', Mail]] as const).map(([c, l, Icon]) => (
                    <label key={c} className={cn('inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[13px]', channels.includes(c) ? 'border-indigo-500 bg-indigo-500/[0.06] text-indigo-800' : 'border-slate-200 text-slate-700')}>
                      <input type="checkbox" className="sr-only" checked={channels.includes(c)} onChange={() => toggle(c)} />
                      <Icon className="h-4 w-4" /> {l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Thời điểm</span>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={when} onChange={(e) => setWhen(e.target.value as 'now' | 'later')} className={cn(inputCls, 'w-[130px]')} aria-label="Thời điểm gửi">
                    <option value="now">Gửi ngay</option>
                    <option value="later">Hẹn giờ</option>
                  </select>
                  {when === 'later' && <input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} className={cn(inputCls, 'min-w-0 flex-1')} aria-label="Giờ gửi" />}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <TBtn variant="ghost" disabled={!title.trim() || title.trim().length < 2 || body.trim().length < 2 || sending} onClick={() => void submit('DRAFT')}>
                Lưu nháp
              </TBtn>
              <TBtn variant="primary" icon={when === 'now' ? <Send /> : <CalendarClock />} disabled={!valid || sending || body.trim().length < 2} onClick={() => void submit(when === 'now' ? 'SENT' : 'SCHEDULED')}>
                {when === 'now' ? 'Gửi thông báo' : 'Hẹn giờ gửi'}
              </TBtn>
            </div>
          </div>
        </Panel>

        <Panel title="Xem trước" sub="Người nhận thấy trong popup chuông thông báo">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-12px_rgba(16,24,40,0.25)]">
              <p className="border-b border-slate-100 px-4 py-2.5 text-[13px] font-semibold text-slate-900">Thông báo</p>
              <div className="flex gap-3 bg-indigo-500/[0.04] px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{title || 'Tiêu đề thông báo'}</p>
                  <p className="mt-0.5 line-clamp-3 text-[12px] text-slate-600">{body || 'Nội dung thông báo hiển thị ở đây.'}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{when === 'now' ? 'Vừa xong' : formatDateTime(new Date(at).toISOString())}</p>
                </div>
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              </div>
            </div>
          </div>
          {channels.includes('EMAIL') && <p className="mt-3 text-[12px] text-slate-500">Email gửi từ thongbao@orbilingo.vn với cùng tiêu đề và nội dung.</p>}
        </Panel>
      </div>

      <Panel title="Lịch sử thông báo" sub={`${items.length} thông báo`} flush>
        <div className="overflow-x-auto">
          <table className={tbl.table}>
            <thead className={tbl.thead}>
              <tr>
                <th className={tbl.th}>Thông báo</th>
                <th className={tbl.th}>Gửi tới</th>
                <th className={tbl.th}>Kênh</th>
                <th className={tbl.th}>Thời điểm</th>
                <th className={cn(tbl.th, 'whitespace-nowrap text-right')}>Người nhận</th>
                <th className={cn(tbl.th, 'whitespace-nowrap text-right')}>Đã mở</th>
                <th className={cn(tbl.th, 'whitespace-nowrap')}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className={tbl.tr}>
                  <td className={cn(tbl.td, 'min-w-[260px]')}>
                    <p className="font-medium text-slate-900">{b.title}</p>
                    <p className="line-clamp-1 text-[12px] text-slate-500">{b.body}</p>
                  </td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{AUDIENCE[b.audience]}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{b.channels.map((c) => (c === 'IN_APP' ? 'Chuông' : 'Email')).join(', ')}</td>
                  <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{formatDateTime(b.at)}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{b.reach ? b.reach.toLocaleString('vi-VN') : '—'}</td>
                  <td className={cn(tbl.td, 'text-right tabular-nums')}>{b.openRate !== undefined ? `${b.openRate}%` : '—'}</td>
                  <td className={tbl.td}>
                    <div className="flex items-center gap-2">
                      <Status tone={STATUS[b.status].tone}>{STATUS[b.status].label}</Status>
                      {b.status !== 'SENT' && (
                        <TBtn size="sm" variant="ghost" onClick={() => adminApi.sendBroadcast(b.id).then(() => { toast.success('Đã gửi thông báo', b.title); void refresh(); }).catch((e) => toast.error('Không gửi được', errorMessage(e)))}>
                          Gửi ngay
                        </TBtn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    {isLoading ? 'Đang tải…' : 'Chưa có thông báo nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
