/** Nạp nội dung thật từ thư mục Data (đề TOEIC, từ vựng, khoá video, bài tập ngữ pháp, đọc, chép chính tả, Viết, Nói). */
import fs from 'node:fs';
import path from 'node:path';
import type { CefrLevel, ExamPart, SkillType } from '@prisma/client';
import { MOCKS, cut, dataPath, exists, insertMany, log, prisma, readJson, readText, slugify, stripHtml, uuid } from './lib';
import { partTagSlug, type SeedCtx } from './base';

const PART_BY_NO: Record<number, ExamPart> = { 1: 'TOEIC_P1', 2: 'TOEIC_P2', 3: 'TOEIC_P3', 4: 'TOEIC_P4', 5: 'TOEIC_P5', 6: 'TOEIC_P6', 7: 'TOEIC_P7' };
const PART_META: Record<number, { title: string; skill: SkillType; minutes: number }> = {
  1: { title: 'Part 1 — Mô tả tranh', skill: 'LISTENING', minutes: 4 },
  2: { title: 'Part 2 — Hỏi đáp', skill: 'LISTENING', minutes: 9 },
  3: { title: 'Part 3 — Hội thoại', skill: 'LISTENING', minutes: 17 },
  4: { title: 'Part 4 — Bài nói ngắn', skill: 'LISTENING', minutes: 15 },
  5: { title: 'Part 5 — Hoàn thành câu', skill: 'READING', minutes: 10 },
  6: { title: 'Part 6 — Hoàn thành đoạn văn', skill: 'READING', minutes: 8 },
  7: { title: 'Part 7 — Đọc hiểu', skill: 'READING', minutes: 57 },
};
const clean = (s: unknown) => (typeof s === 'string' && s.trim() && s.trim() !== 'None' ? s.trim() : null);

// =====================================================================
// 1. 26 đề TOEIC full (dau_toeic) → mock_tests, passages, questions, mock_test_questions
// =====================================================================
export async function importToeicTests(ctx: SeedCtx) {
  const dir = dataPath('playwright_test', 'dau_toeic', 'data', 'De_thi');
  const files = fs.readdirSync(dir).filter((f) => /_Test_\d+\.json$/.test(f));
  const tests: any[] = [];
  const passages: any[] = [];
  const questions: any[] = [];
  const links: any[] = [];
  const vocab = new Map<string, any>(); // lemma|pos → từ (phục vụ tra từ)

  for (const f of files.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
    const d = readJson(path.join(dir, f));
    const info = d.test_info;
    const testId = uuid();
    const qs: any[] = d.questions;
    const passageId = new Map<string, string>();
    const firstQ = new Map<string, any>();
    for (const q of qs) if (q.passage_id && !firstQ.has(q.passage_id)) firstQ.set(q.passage_id, q);

    for (const p of d.passages as any[]) {
      const q0 = firstQ.get(p.id);
      const id = uuid();
      passageId.set(p.id, id);
      const vi = clean(q0?.dich_nghia);
      const listening = p.part <= 4;
      passages.push({
        id,
        purpose: 'EXAM',
        examType: 'TOEIC',
        part: PART_BY_NO[p.part],
        title: cut(clean(p.title), 200),
        // Dữ liệu nguồn không kèm văn bản gốc tiếng Anh của bài đọc / transcript, chỉ có bản dịch tiếng Việt
        contentMd: listening ? null : vi ? `> Bản dịch tiếng Việt của bài đọc (dữ liệu nguồn không kèm văn bản gốc tiếng Anh).\n\n${vi}` : null,
        transcript: listening && vi ? `[Bản dịch] ${vi}` : null,
        audioUrl: clean(p.audio_url),
        imageUrl: clean(p.image_url),
        isFree: !!info.is_free,
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
    }

    for (const q of qs) {
      const id = uuid();
      const part = Number(q.part);
      const opts = (['a', 'b', 'c', 'd'] as const)
        .map((k) => ({ key: k.toUpperCase(), text: clean(q[`option_${k}`]) }))
        .filter((o) => o.text !== null);
      const raw = clean(q.question_text) ?? '';
      let stem = raw;
      if (part === 1) stem = 'Chọn câu mô tả đúng nhất bức tranh.';
      else if (part === 2 && (/^(Câu|Part)\s/i.test(raw) || !raw)) stem = 'Nghe câu hỏi và chọn câu trả lời phù hợp nhất.';
      else if (part === 6) stem = `Chọn đáp án phù hợp điền vào chỗ trống số ${q.question_number}.`;
      else if (!stem) stem = `Câu ${q.question_number}`;
      const translation = part <= 2 ? clean(q.dich_nghia) : clean(q.explanation_en);
      const dl = Number(q.difficulty_level ?? info.difficulty_level ?? 3);
      questions.push({
        id,
        passageId: q.passage_id ? passageId.get(q.passage_id) ?? null : null,
        orderInPassage: q.passage_id ? q.question_number : null,
        examType: 'TOEIC',
        part: PART_BY_NO[part],
        skill: PART_META[part].skill,
        type: 'SINGLE_CHOICE',
        tagIds: [ctx.tags.get(partTagSlug(PART_BY_NO[part]))!],
        stem,
        options: opts,
        correctAnswer: { keys: [String(q.correct_answer).trim().toUpperCase()] },
        explanationMd: clean(q.explanation_vi),
        translationVi: translation,
        audioUrl: clean(q.audio_url),
        imageUrl: clean(q.image_url),
        irtB: Number.isFinite(dl) ? Math.max(-3, Math.min(3, (dl - 3) * 0.8)) : 0,
        source: 'IMPORT',
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
      links.push({ testId, questionId: id, part: PART_BY_NO[part], questionNo: Number(q.question_number) });

      for (const w of q.tu_vung?.vocabulary ?? []) {
        const head = clean(w.lemma) ?? clean(w.word);
        if (!head || !clean(w.meaning_vi)) continue;
        const pos = cut(clean(w.pos) ?? 'phr', 12)!;
        const key = `${head.toLowerCase()}|${pos}`;
        if (vocab.has(key)) continue;
        vocab.set(key, {
          headword: cut(head, 80),
          pos,
          ipaUk: cut(clean(w.ipa_uk), 80),
          ipaUs: cut(clean(w.ipa_us), 80),
          meaningVi: clean(w.meaning_vi),
          exampleEn: clean(w.example_en),
          exampleVi: clean(w.example_vi),
          level: /^(A1|A2|B1|B2|C1|C2)$/.test(String(w.cefr)) ? (w.cefr as CefrLevel) : null,
          part,
        });
      }
    }

    const counts: Record<number, number> = {};
    for (const q of qs) counts[q.part] = (counts[q.part] ?? 0) + 1;
    const set = String(info.set_name ?? 'TOEIC').trim();
    tests.push({
      id: testId,
      slug: slugify(`${set} ${info.name}`),
      title: `${set} — ${info.name}`,
      examType: 'TOEIC',
      kind: 'FULL',
      level: info.difficulty_label ?? null,
      year: info.year ?? null,
      durationMin: Math.round(((info.listening_duration_seconds ?? 2700) + (info.reading_duration_seconds ?? 4500)) / 60),
      totalQuestions: qs.length,
      sections: Object.keys(PART_META).map((n) => ({
        part: PART_BY_NO[+n],
        title: PART_META[+n].title,
        skill: PART_META[+n].skill,
        order: +n,
        questions: counts[+n] ?? 0,
        durationMin: PART_META[+n].minutes,
      })),
      isFree: !!info.is_free,
      tags: [set, 'Full Test', info.difficulty_label].filter(Boolean),
      status: 'PUBLISHED',
      authorId: ctx.adminId,
      reviewedById: ctx.headId,
    });
  }

  await insertMany(prisma.mockTest, tests);
  await insertMany(prisma.passage, passages);
  await insertMany(prisma.question, questions, 500);
  await insertMany(prisma.mockTestQuestion, links);
  log('toeic tests', tests.length, 'passages', passages.length, 'questions', questions.length);
  return { examVocab: [...vocab.values()] };
}

// =====================================================================
// 2. Từ vựng: 10 bộ × 80 từ (dau_toeic) + từ trong đề thi
// =====================================================================
const GRADIENTS = ['from-indigo-500 to-violet-500', 'from-emerald-500 to-teal-500', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-500', 'from-sky-500 to-cyan-500'];

export function parseVocabRaw(raw: string) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const words: { headword: string; pos: string; ipaUk?: string; ipaUs?: string; meaningVi: string; exampleEn?: string; exampleVi?: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^(.+?)\(([a-z.\s/]+)\)$/i.exec(lines[i]);
    if (!m || !lines[i + 1]?.startsWith('/') && !lines[i + 1]?.startsWith('UK:')) continue;
    const ipa = lines[i + 1];
    const uk = /UK:\s*(\/[^/]+\/)/.exec(ipa)?.[1] ?? (ipa.startsWith('/') ? ipa : undefined);
    const us = /US:\s*(\/[^/]+\/)/.exec(ipa)?.[1] ?? uk;
    words.push({ headword: m[1].trim(), pos: m[2].trim(), ipaUk: uk, ipaUs: us, meaningVi: lines[i + 2] ?? '', exampleEn: lines[i + 3], exampleVi: lines[i + 4] });
    i += 4;
  }
  return words;
}

export async function importVocabulary(ctx: SeedCtx, examVocab: any[]) {
  const dir = dataPath('playwright_test', 'dau_toeic', 'data', 'Tu_vung');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const topics: any[] = [];
  const words: any[] = [];
  files.forEach((f, idx) => {
    const d = readJson(path.join(dir, f));
    const n = Number(/(\d+)/.exec(f)?.[1] ?? idx + 1);
    const id = uuid();
    const parsed = parseVocabRaw(d.rawText);
    const seen = new Set<string>();
    parsed.forEach((w, i) => {
      const key = `${w.headword.toLowerCase()}|${w.pos}`;
      if (seen.has(key) || !w.meaningVi) return;
      seen.add(key);
      words.push({
        topicId: id,
        headword: cut(w.headword, 80),
        pos: cut(w.pos, 12),
        ipaUk: cut(w.ipaUk, 80),
        ipaUs: cut(w.ipaUs, 80),
        meaningVi: w.meaningVi,
        exampleEn: w.exampleEn,
        exampleVi: w.exampleVi,
        imageUrl: d.images?.[i] ?? null,
        orderInTopic: i + 1,
      });
    });
    topics.push({ id, slug: `toeic-vocab-set-${n}`, name: `Từ vựng TOEIC — Bộ ${n}`, icon: '📘', themeGradient: GRADIENTS[n % GRADIENTS.length], examType: 'TOEIC', isFree: n <= 3, wordsCount: seen.size, orderIndex: n });
  });

  // Từ trong đề thi: gom theo Part thành bộ "Từ vựng đề thi Part x"
  const byPart = new Map<number, any[]>();
  for (const w of examVocab) {
    if (!byPart.has(w.part)) byPart.set(w.part, []);
    byPart.get(w.part)!.push(w);
  }
  for (const [part, list] of [...byPart.entries()].sort((a, b) => a[0] - b[0])) {
    const id = uuid();
    topics.push({ id, slug: `toeic-exam-vocab-part-${part}`, name: `Từ vựng đề thi TOEIC Part ${part}`, icon: '📝', themeGradient: GRADIENTS[part % GRADIENTS.length], examType: 'TOEIC', isFree: true, wordsCount: list.length, orderIndex: 20 + part });
    list.forEach((w, i) => {
      const { part: _p, ...rest } = w;
      words.push({ ...rest, topicId: id, orderInTopic: i + 1 });
    });
  }
  await insertMany(prisma.vocabTopic, topics);
  await insertMany(prisma.word, words);
  log('vocab topics', topics.length, 'words', words.length);
}

// =====================================================================
// 3. Khoá video luyện thi TOEIC (8 chương, 119 bài)
// =====================================================================
export async function importVideoCourse(ctx: SeedCtx) {
  const d = readJson(dataPath('playwright_test', 'dau_toeic', 'data', 'Video', 'All_Video_Data.json'));
  const courseId = uuid();
  const sections: any[] = [];
  const lessons: any[] = [];
  let total = 0;
  (d.chapters as any[]).sort((a, b) => a.order_index - b.order_index).forEach((ch, si) => {
    const sid = uuid();
    sections.push({ id: sid, courseId, partNo: 1, title: String(ch.name).trim(), orderIndex: si + 1 });
    (ch.lessons as any[]).forEach((l, li) => {
      const t = String(l.lesson_type);
      const type = t === 'quiz' ? 'QUIZ' : t === 'vocabulary' ? 'READING' : 'VIDEO';
      const min = Math.max(1, Math.round((l.duration_seconds ?? 0) / 60)) || 10;
      total += min;
      lessons.push({
        sectionId: sid,
        title: cut(String(l.title).trim(), 200),
        type,
        summary: t === 'pronunciation' ? 'Video luyện phát âm' : t === 'vocabulary' ? 'Từ vựng theo chủ đề' : t === 'quiz' ? 'Bài tập củng cố' : null,
        skill: /part [1-4]|phát âm|nghe/i.test(ch.name) ? 'LISTENING' : /ngữ pháp|part 5|part 6/i.test(ch.name) ? 'GRAMMAR' : null,
        videoUrl: clean(l.video_url),
        passScorePct: type === 'QUIZ' ? 70 : null,
        durationMin: min,
        isFreePreview: l.access_level === 'free',
        orderIndex: li + 1,
        status: 'PUBLISHED',
      });
    });
  });
  await prisma.course.create({
    data: {
      id: courseId,
      slug: 'luyen-thi-toeic-video',
      title: 'Luyện thi TOEIC qua video bài giảng',
      category: 'FOUNDATION',
      examType: 'TOEIC',
      description: 'Chuỗi video bài giảng TOEIC: tìm hiểu bài thi, ngữ pháp trọng tâm Part 5–6, phát âm IPA và chiến thuật từng Part. Các bài miễn phí xem ngay, các bài còn lại mở khi ghi danh.',
      coverUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&q=75&auto=format&fit=crop',
      themeGradient: 'from-sky-500 to-indigo-600',
      isSequential: false,
      isFree: true,
      authorId: ctx.userByName.get('Trần Thu Hà'),
      departmentId: ctx.depts.get('TOEIC-LR'),
      status: 'PUBLISHED',
      reviewedById: ctx.headId,
      lessonsCount: lessons.length,
      durationMin: total,
      publishedAt: new Date(),
    },
  });
  await insertMany(prisma.courseSection, sections);
  await insertMany(prisma.lesson, lessons);
  log('video course lessons', lessons.length);
}

// =====================================================================
// 4. englishteststore: parser chung cho file txt "CHUYÊN ĐỀ … / === test === / Câu n: … / A. [ĐÚNG] …"
// =====================================================================
interface EtsItem { test: string; context: string | null; stem: string; options: { key: string; text: string }[]; answer: string | null }

export function parseEts(file: string): EtsItem[] {
  const txt = readText(file);
  const items: EtsItem[] = [];
  const tests = txt.split(/^=== (.+?) ===$/m);
  for (let t = 1; t < tests.length; t += 2) {
    const title = tests[t].trim();
    const blocks = tests[t + 1].split(/^Câu \d+:\s?/m).slice(1);
    for (const b of blocks) {
      const lines = b.split('\n');
      const opts: { key: string; text: string }[] = [];
      let answer: string | null = null;
      const body: string[] = [];
      for (const l of lines) {
        const m = /^\s+([A-F])\.\s(\[ĐÚNG\])?\s*(.*)$/.exec(l);
        if (m) {
          opts.push({ key: m[1], text: m[3].trim() });
          if (m[2]) answer = answer ?? m[1];
        } else if (!opts.length) body.push(l);
      }
      const text = body.join('\n').trim();
      if (opts.length < 2 || !answer || !text) continue;
      // Đọc / nghe: "đoạn văn … Question n: câu hỏi"
      const qm = /(?:^|\n)\s*(?:Question|Q)\s*\d+\s*[:.]\s*([\s\S]+)$/.exec(text);
      const context = qm ? text.slice(0, qm.index).trim() || null : null;
      const stem = (qm ? qm[1] : text).trim();
      items.push({ test: title, context, stem, options: opts, answer });
    }
  }
  return items;
}

const etsDir = (...p: string[]) => dataPath('playwright_test', 'englishteststore', ...p);

/** Bài tập ngữ pháp → questions TOEIC_P5 (GRAMMAR), gắn chủ điểm ngữ pháp qua nhãn kỹ năng. */
export async function importGrammarExercises(ctx: SeedCtx, topicTagByKey: (fileTitle: string) => string | undefined) {
  const dir = etsDir('Grammar Tests');
  if (!exists(dir)) return;
  const rows: any[] = [];
  const PER_FILE = 40;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.txt'))) {
    const items = parseEts(path.join(dir, f));
    if (!items.length) continue;
    const name = f.replace(/\.txt$/, '').replace(/ Tests?$/, '');
    const tagId = topicTagByKey(name) ?? ctx.addTag(`grammar-${slugify(name)}`, name, 'GRAMMAR', null);
    const seen = new Set<string>();
    for (const it of items) {
      if (seen.size >= PER_FILE) break;
      if (seen.has(it.stem)) continue;
      seen.add(it.stem);
      rows.push({
        examType: 'TOEIC',
        part: 'TOEIC_P5',
        skill: 'GRAMMAR',
        type: 'SINGLE_CHOICE',
        tagIds: [tagId, ctx.tags.get('toeic-p5')!],
        stem: it.context ? `${it.context}\n${it.stem}` : it.stem,
        options: it.options,
        correctAnswer: { keys: [it.answer] },
        source: 'IMPORT',
        status: 'PUBLISHED',
        authorId: ctx.adminId,
        level: /advanced/i.test(f) ? 'B2' : /basic|elementary/i.test(f) ? 'A2' : 'B1',
      });
    }
  }
  await ctx.flushTags();
  await insertMany(prisma.question, rows);
  log('grammar exercises', rows.length);
}

/** Đọc hiểu có văn bản tiếng Anh đầy đủ → passages (TOEIC_P7) + questions. */
export async function importReading(ctx: SeedCtx) {
  const dir = etsDir('Reading Tests');
  if (!exists(dir)) return;
  const passages: any[] = [];
  const questions: any[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => /Multi-choice/i.test(x))) {
    const level: CefrLevel = /advanced|grade 12/i.test(f) ? 'B2' : /elementary|grade 6/i.test(f) ? 'A2' : 'B1';
    let curKey = '';
    let curId = '';
    let order = 0;
    for (const it of parseEts(path.join(dir, f))) {
      if (!it.context) continue;
      const key = `${it.test}|${it.context.slice(0, 200)}`;
      if (key !== curKey) {
        curKey = key;
        curId = uuid();
        order = 0;
        passages.push({ id: curId, purpose: 'EXAM', examType: 'TOEIC', part: 'TOEIC_P7', title: cut(`${f.replace('.txt', '')} — ${it.test}`, 200), contentMd: it.context.replace(/\n\s+/g, '\n\n'), level, status: 'PUBLISHED', authorId: ctx.adminId });
      }
      questions.push({
        passageId: curId,
        orderInPassage: ++order,
        examType: 'TOEIC',
        part: 'TOEIC_P7',
        skill: 'READING',
        type: 'SINGLE_CHOICE',
        level,
        tagIds: [ctx.tags.get('toeic-p7')!],
        stem: it.stem,
        options: it.options,
        correctAnswer: { keys: [it.answer] },
        source: 'IMPORT',
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
    }
  }
  await insertMany(prisma.passage, passages);
  await insertMany(prisma.question, questions, 500);
  log('reading passages', passages.length, 'questions', questions.length);
}

/** Bài nghe chép chính tả: transcript bài nói / hội thoại (dữ liệu không kèm audio). */
export async function importDictation(ctx: SeedCtx) {
  const dir = etsDir('Listening Tests');
  if (!exists(dir)) return;
  const rows: any[] = [];
  const seen = new Set<string>();
  for (const f of fs.readdirSync(dir).filter((x) => /Short Talk|Conversation|Lecture/i.test(x))) {
    const level: CefrLevel = /hard|long|lecture/i.test(f) ? 'B2' : /medium/i.test(f) ? 'B1' : 'A2';
    for (const it of parseEts(path.join(dir, f))) {
      const text = it.context?.replace(/\s+/g, ' ').trim();
      if (!text || text.length < 60 || seen.has(text)) continue;
      seen.add(text);
      const sentences = text.match(/[^.!?]+[.!?]+["”’]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
      rows.push({
        purpose: 'DICTATION',
        examType: 'TOEIC',
        part: null,
        title: cut(`${f.replace('.txt', '')} — ${it.test}`, 200),
        transcript: text,
        segments: sentences.map((s, i) => ({ index: i, startMs: null, endMs: null, text: s })),
        level,
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
    }
  }
  await insertMany(prisma.passage, rows);
  log('dictation passages', rows.length);
}

// =====================================================================
// 5. Viết: TOEIC Writing Part 1 (viết câu theo tranh, 250 đề) — dau_toeic/Viet
// =====================================================================
export async function importWriting(ctx: SeedCtx) {
  const dir = dataPath('playwright_test', 'dau_toeic', 'data', 'Viet');
  const byNo = new Map<number, { keywords: string[]; image: string | null }>();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    for (const item of readJson<any[]>(path.join(dir, f))) {
      const no = Number(/Câu (\d+)\/\d+/.exec(item.text)?.[1]);
      if (!no || byNo.has(no)) continue;
      const m = /Write a sentence based on a picture\n([\s\S]*?)\nDirections:/.exec(item.text);
      const keywords = m ? m[1].split('\n').map((s: string) => s.trim()).filter(Boolean) : [];
      if (!keywords.length) continue;
      const img = (item.images as string[]).find((u) => u.includes('writing-part1-images')) ?? null;
      byNo.set(no, { keywords, image: img });
    }
  }
  const rows = [...byNo.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([no, w]) => ({
      examType: 'TOEIC',
      // exam_part chưa có giá trị riêng cho TOEIC Writing → dùng TOEIC_P1 (đề dựa trên tranh), phân biệt bằng skill = WRITING
      part: 'TOEIC_P1',
      skill: 'WRITING',
      type: 'ESSAY',
      stem: `Write ONE sentence based on the picture. You must use the two words: ${w.keywords.join(' / ')}`,
      taskConfig: {
        task: 'TOEIC_WRITING_Q1_5',
        title: `Viết câu theo tranh — Đề ${no}`,
        keywords: w.keywords,
        maxWords: 40,
        minutes: 2,
        // URL ảnh gốc là link ký có hạn (đã hết hạn) nên chỉ lưu đường dẫn tham khảo
        sourceImagePath: w.image ? w.image.split('?')[0].replace(/.*\/sign\//, '') : null,
      },
      rubricId: ctx.rubrics.get('TOEIC_WRITING'),
      source: 'IMPORT',
      status: 'PUBLISHED',
      authorId: ctx.adminId,
    }));
  await insertMany(prisma.question, rows);
  log('writing prompts', rows.length);
}

// =====================================================================
// 6. Nói: 10 đề TOEIC Speaking (zenlish) × 11 câu
// =====================================================================
const SPEAK_TASK = (n: number) =>
  n <= 2 ? { task: 'READ_ALOUD', prepSec: 45, responseSec: 45, label: 'Đọc to đoạn văn' }
  : n <= 4 ? { task: 'DESCRIBE_PICTURE', prepSec: 45, responseSec: 30, label: 'Mô tả tranh' }
  : n <= 7 ? { task: 'RESPOND_QUESTIONS', prepSec: 3, responseSec: n === 7 ? 30 : 15, label: 'Trả lời câu hỏi' }
  : n <= 10 ? { task: 'RESPOND_USING_INFO', prepSec: 3, responseSec: n === 10 ? 30 : 15, label: 'Trả lời dựa trên thông tin' }
  : { task: 'EXPRESS_OPINION', prepSec: 45, responseSec: 60, label: 'Nêu quan điểm' };

export async function importSpeaking(ctx: SeedCtx) {
  const dir = dataPath('playwright_test', 'zenlish', 'zenlish_toeic');
  const rows: any[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
    const d = readJson(path.join(dir, f));
    if (d.type !== 'speaking_writing' || !Array.isArray(d.questions)) continue;
    const title = String(d.title ?? f).replace(/[⟶→].*$/, '').trim();
    let infoImg: string | null = null; // Câu 8–10 dùng chung một bảng thông tin (ảnh ở câu 8, câu 9–10 chỉ có audio)
    (d.questions as any[]).forEach((q, i) => {
      const n = i + 1;
      const t = SPEAK_TASK(n);
      const html = String(q.question ?? '');
      let img = /<img[^>]+src="([^"]+)"/.exec(html)?.[1] ?? null;
      if (t.task === 'RESPOND_USING_INFO') {
        if (img) infoImg = img;
        img = img ?? infoImg;
      }
      const text = stripHtml(html);
      const stem =
        t.task === 'RESPOND_USING_INFO'
          ? text || `Question ${n}: Listen to the question and answer using the information provided.`
          : text || (img ? 'Describe the picture in as much detail as you can.' : '');
      if (!stem) return;
      rows.push({
        examType: 'TOEIC',
        part: 'TOEIC_P1', // exam_part chưa có giá trị TOEIC Speaking → phân biệt bằng skill = SPEAKING
        skill: 'SPEAKING',
        type: 'SPEAKING_RESPONSE',
        stem,
        audioUrl: clean(q.audio_src),
        imageUrl: img,
        taskConfig: { ...t, test: `TOEIC Speaking ${title}`, questionNo: n },
        rubricId: ctx.rubrics.get('TOEIC_SPEAKING'),
        source: 'IMPORT',
        status: 'PUBLISHED',
        authorId: ctx.adminId,
      });
    });
  }
  await insertMany(prisma.question, rows);
  log('speaking prompts', rows.length);
}

export const MOCK_LIST = MOCKS;
