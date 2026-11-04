import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BookText, ChevronRight, Languages, ListTree, Quote, Volume2 } from 'lucide-react';
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

type Path = { d: string; active: boolean };

/**
 * Sơ đồ mạo từ dạng mind map ngang: Mạo từ → a / an / the / không mạo từ → các từ trong bài.
 * Bấm một mạo từ để sinh các node từ ở cột bên phải (căn theo nhánh cha), bấm lại để thu gọn.
 * Đường nối là đường cong SVG đo theo vị trí thật của node.
 */
const ArticleTree: React.FC<{ roots: KnowledgeNode[] }> = ({ roots }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [sel, setSel] = useState<KnowledgeNode | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const leavesRef = useRef<HTMLDivElement>(null);
  const l1 = useRef<(HTMLButtonElement | null)[]>([]);
  const l2 = useRef<(HTMLButtonElement | null)[]>([]);
  const kids = openIdx !== null ? (roots[openIdx]?.children ?? []) : [];

  useLayoutEffect(() => {
    const draw = () => {
      const w = wrap.current;
      if (!w) return;
      const parent = openIdx !== null ? l1.current[openIdx] : null;
      // cột từ: căn giữa theo nhánh đang mở (không vượt lên trên mép sơ đồ)
      const lv = leavesRef.current;
      if (lv && parent) {
        lv.style.marginTop = '0px';
        const p = parent.getBoundingClientRect();
        const l = lv.getBoundingClientRect();
        lv.style.marginTop = `${Math.max(0, p.top + p.height / 2 - l.height / 2 - l.top)}px`;
      }
      const o = w.getBoundingClientRect();
      const box = (el: Element) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - o.left, r: r.right - o.left, y: r.top - o.top + r.height / 2 };
      };
      const curve = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => {
        const mx = (a.r + b.l) / 2;
        return `M${a.r},${a.y}C${mx},${a.y} ${mx},${b.y} ${b.l},${b.y}`;
      };
      const out: Path[] = [];
      const root = rootRef.current;
      if (root && root.offsetWidth > 0)
        l1.current.forEach((el, i) => el && out.push({ d: curve(box(root), box(el)), active: i === openIdx }));
      if (parent) l2.current.slice(0, kids.length).forEach((el) => el && out.push({ d: curve(box(parent), box(el)), active: true }));
      setPaths(out);
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [openIdx, roots, kids.length]);

  const toggle = (i: number) => {
    const closing = openIdx === i;
    setOpenIdx(closing ? null : i);
    setSel(closing ? null : roots[i]);
  };

  return (
    <div className="space-y-4">
      <div className="kt-scroll">
        <div ref={wrap} className="kt-map">
          <svg className="kt-lines" aria-hidden>
            {paths.map((p, i) => (
              <path key={i} d={p.d} className={p.active ? 'is-active' : undefined} />
            ))}
          </svg>
          <div ref={rootRef} className="kt-node kt-node--root">
            Mạo từ
          </div>
          <div className="kt-col">
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
                <span className="kt-node__count">{r.children?.length ?? 0}</span>
                <ChevronRight className="kt-node__chev" aria-hidden />
              </button>
            ))}
          </div>
          {kids.length > 0 ? (
            <div ref={leavesRef} className="kt-col kt-col--leaves">
              {kids.map((c, i) => (
                <button key={`${openIdx}-${i}`} ref={(el) => (l2.current[i] = el)} type="button" className={cn('kt-node kt-node--leaf', sel === c && 'kt-node--selected')} onClick={() => setSel(c)}>
                  <span className="kt-node__label">{c.label}</span>
                  {c.meaningVi && <span className="kt-node__sub">{c.meaningVi}</span>}
                </button>
              ))}
            </div>
          ) : (
            <p className="kt-empty">Chọn a, an, the hoặc "Không dùng mạo từ" để xem các từ trong bài đi kèm</p>
          )}
        </div>
      </div>
      {sel && (
        <div className="kt-detail" aria-live="polite">
          <p className="text-sm">
            <span className="font-bold text-slate-900">{sel.label}</span>
            {sel.meaningVi && <span className="text-slate-600"> · {sel.meaningVi}</span>}
          </p>
          {sel.example && <p className="kt-detail__ex">{sel.example}</p>}
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
