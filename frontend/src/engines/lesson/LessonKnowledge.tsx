import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BookText, Languages, ListTree, Quote, Volume2 } from 'lucide-react';
import type { KnowledgeNode, LessonKnowledge as Knowledge } from '@/shared/types';
import { Card, Tabs } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import './lesson-knowledge.css';

type Key = keyof Knowledge;
const TABS: { key: Key; label: string; icon: React.ReactNode }[] = [
  { key: 'grammar', label: 'Ngữ pháp', icon: <BookText /> },
  { key: 'vocab', label: 'Từ vựng', icon: <Languages /> },
  { key: 'clauses', label: 'Mệnh đề', icon: <Quote /> },
  { key: 'articles', label: 'Mạo từ', icon: <ListTree /> },
];

const speak = (text: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  } catch {
    /* trình duyệt không hỗ trợ */
  }
};

/**
 * Sơ đồ mạo từ 3 tầng: "Mạo từ" → a / an / the / không mạo từ → các từ trong bài đi kèm.
 * Bấm một mạo từ để sinh ra các node từ bên dưới, bấm lại để thu gọn (mỗi lần mở 1 nhánh).
 * Đường nối vẽ bằng SVG theo vị trí thật của node (đo lại khi mở nhánh / đổi kích thước).
 */
const ArticleTree: React.FC<{ roots: KnowledgeNode[] }> = ({ roots }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [sel, setSel] = useState<KnowledgeNode | null>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const l1 = useRef<(HTMLButtonElement | null)[]>([]);
  const l2 = useRef<(HTMLButtonElement | null)[]>([]);
  const kids = openIdx !== null ? (roots[openIdx]?.children ?? []) : [];

  useLayoutEffect(() => {
    const draw = () => {
      const w = wrap.current;
      if (!w || !rootRef.current) return;
      const o = w.getBoundingClientRect();
      const pt = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - o.left + r.width / 2, top: r.top - o.top, bottom: r.bottom - o.top };
      };
      // đường nhánh kiểu sơ đồ tổ chức: dọc xuống → thanh ngang chung → dọc xuống từng node con
      const bus = (from: { x: number; bottom: number }, to: { x: number; top: number }[]) => {
        if (!to.length) return [];
        const y = from.bottom + (to[0].top - from.bottom) / 2;
        const xs = to.map((c) => c.x);
        return [`M${from.x},${from.bottom}V${y}`, `M${Math.min(from.x, ...xs)},${y}H${Math.max(from.x, ...xs)}`, ...to.map((c) => `M${c.x},${y}V${c.top}`)];
      };
      const level1 = l1.current.filter(Boolean).map((el) => pt(el!));
      const out = bus(pt(rootRef.current), level1);
      const parent = openIdx !== null ? l1.current[openIdx] : null;
      if (parent) out.push(...bus(pt(parent), l2.current.filter(Boolean).map((el) => pt(el!))));
      setPaths(out);
      // màn hình hẹp: cuộn sơ đồ sao cho nhánh đang mở (hoặc gốc) nằm giữa khung
      const sc = w.parentElement;
      const focus = (parent ?? rootRef.current) as HTMLElement;
      if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = focus.offsetLeft + focus.offsetWidth / 2 - sc.clientWidth / 2;
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [openIdx, roots, kids.length]);

  const toggle = (i: number) => {
    setSel(roots[i]);
    setOpenIdx((x) => (x === i ? null : i));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Bấm vào a / an / the để sinh ra các từ trong bài đi kèm; bấm lại để thu gọn. Bấm một từ để xem câu ví dụ.</p>
      <div className="kt-scroll">
        <div ref={wrap} className="kt-graph">
          <svg className="kt-lines" aria-hidden>
            {paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
          <div className="kt-level">
            <div ref={rootRef} className="kt-node kt-node--root">
              Mạo từ
            </div>
          </div>
          <div className="kt-level">
            {roots.map((r, i) => (
              <button
                key={i}
                ref={(el) => (l1.current[i] = el)}
                type="button"
                className={cn('kt-node kt-node--branch', openIdx === i && 'kt-node--open')}
                aria-expanded={openIdx === i}
                onClick={() => toggle(i)}
              >
                <span className="kt-node__label">{r.label}</span>
                <span className="kt-node__hint">{openIdx === i ? 'Thu gọn' : `${r.children?.length ?? 0} từ`}</span>
              </button>
            ))}
          </div>
          {kids.length > 0 && (
            <div className="kt-level kt-level--leaves">
              {kids.map((c, i) => (
                <button key={`${openIdx}-${i}`} ref={(el) => (l2.current[i] = el)} type="button" className={cn('kt-node', sel === c && 'kt-node--selected')} onClick={() => setSel(c)}>
                  <span className="kt-node__label">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {sel && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3" aria-live="polite">
          <p className="text-sm">
            <span className="font-semibold text-slate-900">{sel.label}</span>
            {sel.meaningVi && <span className="text-slate-600"> — {sel.meaningVi}</span>}
          </p>
          {sel.example && <p className="mt-1 text-sm italic text-slate-500">{sel.example}</p>}
        </div>
      )}
    </div>
  );
};

/** Kiến thức trong video: ngữ pháp, từ vựng, mệnh đề, cây mạo từ — hiện ngay dưới player */
export const LessonKnowledge: React.FC<{ knowledge: Knowledge; onWord?: (e: React.MouseEvent, word: string) => void }> = ({ knowledge, onWord }) => {
  const tabs = TABS.filter((t) => knowledge[t.key].length > 0);
  const [tab, setTab] = useState<Key>(tabs[0]?.key ?? 'grammar');
  useEffect(() => setTab(tabs[0]?.key ?? 'grammar'), [knowledge]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!tabs.length) return null;

  return (
    <Card padding="none" className="animate-fade-up overflow-hidden">
      <div className="px-5 pt-4">
        <p className="font-bold text-slate-900 text-sm">Kiến thức trong bài</p>
        <p className="text-[11px] text-slate-500">Vừa xem video vừa ôn lại ngữ pháp, từ vựng và cấu trúc được dùng trong bài</p>
      </div>
      <Tabs className="px-3 mt-2" value={tab} onChange={(k) => setTab(k as Key)} items={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon, count: knowledge[t.key].length }))} />
      <div className="p-5">
        {tab === 'grammar' && (
          <ul className="space-y-3">
            {knowledge.grammar.map((g, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{g.title}</p>
                {g.formula && <p className="mt-2 inline-block rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs text-white">{g.formula}</p>}
                {g.note && <p className="mt-2 text-sm text-slate-600">{g.note}</p>}
                {g.example && <p className="mt-2 border-l-2 border-indigo-200 pl-3 text-sm italic text-slate-700">{g.example}</p>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'vocab' && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {knowledge.vocab.map((v, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" className="text-left" onClick={(e) => onWord?.(e, v.word)} title="Tra từ điển / lưu vào sổ từ">
                    <span className="font-black text-slate-900 hover:text-indigo-700">{v.word}</span>
                    {(v.ipa || v.pos) && (
                      <span className="ml-2 font-mono text-xs text-indigo-600">
                        {v.ipa} {v.pos && <i className="text-slate-500">{v.pos}</i>}
                      </span>
                    )}
                  </button>
                  <button type="button" className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50" onClick={() => speak(v.word)} aria-label={`Phát âm ${v.word}`}>
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">{v.meaningVi}</p>
                {v.example && <p className="mt-1 text-xs italic text-slate-500">{v.example}</p>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'clauses' && (
          <ul className="space-y-3">
            {knowledge.clauses.map((c, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{c.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.markers.map((m) => (
                    <span key={m} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {m}
                    </span>
                  ))}
                </div>
                {c.note && <p className="mt-2 text-sm text-slate-600">{c.note}</p>}
                {c.example && <p className="mt-2 border-l-2 border-indigo-200 pl-3 text-sm italic text-slate-700">{c.example}</p>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'articles' && <ArticleTree roots={knowledge.articles} />}
      </div>
    </Card>
  );
};
