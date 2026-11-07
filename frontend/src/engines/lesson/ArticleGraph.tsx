import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ListChecks, Network, Quote } from 'lucide-react';
import { ARTICLE_RULES, globalSearch, localSearch, type ArticleClaim, type ArticleGraphIndex, type ArticleRuleId, type ArticleTextUnit, type ArticleWord } from '@toeic-vstep/shared';
import { cn } from '@/shared/utils';
import './article-graph.css';

/**
 * Mạo từ theo GraphRAG (index do backend dựng — packages/shared/src/logic/article-graphrag.ts).
 *  - Tổng quan  = global search (map-reduce trên báo cáo cộng đồng Leiden)
 *  - Sơ đồ      = mạo từ → dạng "a / an / the + …" (quan hệ APPLIES) → cụm gặp trong video (claim)
 *  - Khung giải thích = local search quanh node đang chọn (hàng xóm, quan hệ, câu dẫn chứng, báo cáo cộng đồng)
 */
type Sel = { entityId?: string; phrase?: string };
type Path = { d: string; level: 1 | 2 };
const ARTICLES: ArticleWord[] = ['a', 'an', 'the'];
const SOURCE: Record<ArticleTextUnit['source'], string> = { video: 'Video', 'bai-giang': 'Bài giảng', 'vi-du': 'Ví dụ', 'tu-vung': 'Bảng từ vựng' };

const mmss = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Tô các cụm cần chú ý trong câu dẫn chứng */
const Highlight: React.FC<{ text: string; marks: string[] }> = ({ text, marks }) => {
  if (!marks.length) return <>{text}</>;
  const re = new RegExp(`\\b(${marks.map(esc).join('|')})\\b`, 'gi');
  const parts = text.split(re);
  return <>{parts.map((p, i) => (i % 2 ? <mark key={i} className="ag-mark">{p}</mark> : <React.Fragment key={i}>{p}</React.Fragment>))}</>;
};

export const ArticleGraph: React.FC<{ graph: ArticleGraphIndex }> = ({ graph }) => {
  const overview = useMemo(() => globalSearch(graph), [graph]);
  const count = (a: ArticleWord) => graph.claims.filter((c) => c.article === a).length;
  const roots = ARTICLES.filter((a) => count(a) > 0);
  const firstArt = [...roots].sort((x, y) => count(y) - count(x))[0];

  const [art, setArt] = useState<ArticleWord | null>(firstArt ?? null);
  const [rule, setRule] = useState<ArticleRuleId | null>(null);
  const [sel, setSel] = useState<Sel>(firstArt ? { entityId: `a:${firstArt}` } : {});

  // quy tắc của mạo từ đang mở: theo quan hệ APPLIES trong đồ thị, xếp theo trọng số
  const rules = useMemo(() => {
    if (!art) return [];
    return graph.relationships
      .filter((r) => r.kind === 'APPLIES' && (r.source === `a:${art}` || r.target === `a:${art}`))
      .map((r) => ({ id: (r.source.startsWith('r:') ? r.source : r.target).slice(2) as ArticleRuleId, weight: r.weight }))
      .sort((x, y) => y.weight - x.weight);
  }, [graph, art]);
  // cụm trong bài của (mạo từ, quy tắc): gộp claim trùng cụm
  const phrases = useMemo(() => {
    if (!art || !rule) return [];
    const m = new Map<string, { c: ArticleClaim; n: number }>();
    graph.claims
      .filter((c) => c.article === art && c.rules.includes(rule))
      .forEach((c) => {
        const k = c.phrase.toLowerCase();
        const x = m.get(k);
        if (x) x.n++;
        else m.set(k, { c, n: 1 });
      });
    return [...m.values()].sort((x, y) => Number(!!x.c.inferred) - Number(!!y.c.inferred) || y.n - x.n).slice(0, 12);
  }, [graph, art, rule]);

  const result = useMemo(() => localSearch(graph, sel), [graph, sel]);

  // ---- đường nối SVG đo theo vị trí thật của node ----
  const wrap = useRef<HTMLDivElement>(null);
  const artRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const ruleRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const leafRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const ruleCol = useRef<HTMLDivElement>(null);
  const leafCol = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  useLayoutEffect(() => {
    const draw = () => {
      const w = wrap.current;
      if (!w) return;
      // cột con căn giữa theo node cha (không vượt mép trên).
      // Các cột ghim mép trên (align-items: start) → vị trí node cha không phụ thuộc cột con;
      // tính từ vị trí gốc của cột (bỏ margin hiện tại), không đặt lại 0 → không sinh vòng đo/vẽ làm node chạy lên xuống.
      const center = (col: HTMLDivElement | null, parent: HTMLElement | null | undefined) => {
        if (!col || !parent) return;
        const cur = parseFloat(col.style.marginTop) || 0;
        const p = parent.getBoundingClientRect();
        const c = col.getBoundingClientRect();
        const next = Math.max(0, Math.round(p.top + p.height / 2 - c.height / 2 - (c.top - cur)));
        if (Math.abs(next - cur) >= 1) col.style.marginTop = `${next}px`;
      };
      const pa = art ? artRefs.current[art] : null;
      center(ruleCol.current, pa);
      const pr = rule ? ruleRefs.current[rule] : null;
      center(leafCol.current, pr);
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
      if (pa) rules.forEach((r) => ruleRefs.current[r.id] && out.push({ d: curve(box(pa), box(ruleRefs.current[r.id]!)), level: 1 }));
      if (pr) leafRefs.current.slice(0, phrases.length).forEach((el) => el && out.push({ d: curve(box(pr), box(el)), level: 2 }));
      setPaths(out);
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, [art, rule, rules, phrases]);

  const openArt = (a: ArticleWord) => {
    const closing = art === a;
    setArt(closing ? null : a);
    setRule(null);
    setSel(closing ? {} : { entityId: `a:${a}` });
  };
  const openRule = (r: ArticleRuleId) => {
    const closing = rule === r;
    setRule(closing ? null : r);
    setSel(closing && art ? { entityId: `a:${art}` } : { entityId: `r:${r}` });
  };
  const pickEntity = (id: string) => {
    if (id.startsWith('a:')) return openArt(id.slice(2) as ArticleWord);
    setSel({ entityId: id });
  };
  const focus = result.focus[0];
  const heading = sel.phrase ?? (focus ? (focus.type === 'ARTICLE' ? `Mạo từ “${focus.title}”` : focus.title) : '');

  return (
    <div className="space-y-4">
      {/* Tổng quan — global search */}
      <section className="ag-overview" aria-label="Tổng quan mạo từ trong bài">
        <p className="ag-overview__lead">
          <ListChecks className="h-4 w-4" aria-hidden /> {overview.lead}
        </p>
        {overview.points.length > 0 && (
          <ul className="ag-overview__list">
            {overview.points.map((p) => (
              <li key={p.ruleId}>
                <button type="button" className="ag-point" onClick={() => setSel({ entityId: `r:${p.ruleId}` })}>
                  <span className="ag-point__title">{p.title}</span>
                  <span className="ag-point__count">{p.count}</span>
                  <span className="ag-point__phrases">{p.phrases.join(', ')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sơ đồ: mạo từ → quy tắc → cụm trong bài */}
      <div className="ag-scroll">
        <div ref={wrap} className="ag-map">
          <svg className="ag-lines" aria-hidden>
            {paths.map((p, i) => (
              <path key={i} d={p.d} className={`ag-line--${p.level}`} />
            ))}
          </svg>
          <div className="ag-col ag-col--arts">
            {roots.map((a) => (
              <button key={a} ref={(el) => (artRefs.current[a] = el)} type="button" className={cn('ag-node ag-node--art', art === a && 'ag-node--open')} aria-expanded={art === a} onClick={() => openArt(a)}>
                <span className="ag-node__label">{a}</span>
                <span className="ag-node__count">{count(a)}</span>
                <ChevronRight className="ag-node__chev" aria-hidden />
              </button>
            ))}
          </div>
          {rules.length > 0 ? (
            <div ref={ruleCol} className="ag-col ag-col--rules">
              {rules.map((r) => (
                <button key={`${art}-${r.id}`} ref={(el) => (ruleRefs.current[r.id] = el)} type="button" className={cn('ag-node ag-node--rule', rule === r.id && 'ag-node--open', sel.entityId === `r:${r.id}` && 'ag-node--selected')} aria-expanded={rule === r.id} onClick={() => openRule(r.id)}>
                  <span className="ag-node__label">{ARTICLE_RULES[r.id].title}</span>
                  <span className="ag-node__count">{Math.round(r.weight)}</span>
                  <ChevronRight className="ag-node__chev" aria-hidden />
                </button>
              ))}
            </div>
          ) : (
            <p className="ag-empty">Chọn a, an hoặc the để xem đi với gì trong video</p>
          )}
          {phrases.length > 0 ? (
            <div ref={leafCol} className="ag-col ag-col--leaves">
              {phrases.map(({ c, n }, i) => (
                <button key={`${rule}-${c.phrase}`} ref={(el) => (leafRefs.current[i] = el)} type="button" className={cn('ag-node ag-node--leaf', c.inferred && 'ag-node--inferred', sel.phrase === c.phrase && 'ag-node--selected')} onClick={() => setSel({ phrase: c.phrase })}>
                  <span className="ag-node__label">{c.phrase}</span>
                  <span className="ag-node__sub">{n > 1 ? `${n} lần` : '1 lần'}</span>
                </button>
              ))}
            </div>
          ) : (
            rules.length > 0 && <p className="ag-empty">Chọn một dạng để xem các cụm trong video</p>
          )}
        </div>
      </div>

      {/* Giải thích — local search */}
      {focus && (
        <div className="ag-detail" aria-live="polite">
          <p className="ag-detail__title">{heading}</p>
          <ul className="ag-detail__answer">
            {result.answer.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          {result.evidence.length > 0 && (
            <div className="ag-evidence">
              <p className="ag-section-label">
                <Quote className="h-3.5 w-3.5" aria-hidden /> Câu trong video
              </p>
              <ul>
                {result.evidence.map(({ unit, highlight }) => (
                  <li key={unit.id}>
                    <span className="ag-src">{unit.source === 'video' && unit.startMs !== undefined ? `Video ${mmss(unit.startMs)}` : SOURCE[unit.source]}</span>
                    <span className="ag-evidence__text">
                      <Highlight text={unit.text} marks={highlight} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.related.length > 0 && (
            <div>
              <p className="ag-section-label">
                <Network className="h-3.5 w-3.5" aria-hidden /> Liên quan trong đồ thị
              </p>
              <div className="ag-chips">
                {result.related.map((e) => (
                  <button key={e.id} type="button" className={cn('ag-chip', `ag-chip--${e.type.toLowerCase()}`)} onClick={() => pickEntity(e.id)}>
                    {e.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          {result.report && (
            <p className="ag-report">
              <span className="font-semibold">Nhóm kiến thức: {result.report.title}</span> · {result.report.summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
