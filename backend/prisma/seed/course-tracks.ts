/**
 * Sắp xếp khoá học thành 3 mục chính: TOEIC / VSTEP / Tiếng Anh THPT.
 *  - TOEIC, VSTEP: chia chương có sẵn vào khoá theo đúng phần thi (TOEIC Part 1–7; VSTEP Nghe, Đọc, Viết, Nói),
 *    gắn nhãn phần thi cho từng chương (course_sections.part_title).
 *  - THPT: Lớp 10 / 11 / 12 theo SGK Global Success — mỗi Unit 2 bài (Từ vựng, Ngữ pháp) + bài Review sau các cụm Unit.
 * Chạy lại nhiều lần không tạo trùng (tìm theo slug / tên chương / tên bài). Sau đó chạy lesson-exercises.ts để sinh bài tập.
 * Chạy: npx tsx prisma/seed/course-tracks.ts
 */
import { Prisma, type CourseCategory, type CourseTrack, type CefrLevel } from '@prisma/client';
import { prisma } from './lib';
import { linkClassCourses } from './class-courses';
import { mergeCourses } from './merge-courses';
import { THPT, THPT_PRACTICE } from './data/thpt';
import { EXAM_SETS, GRAMMAR_REVIEW, PART_GUIDES, type ExamSet } from './data/thpt-exam';
import { authoredChoice, authoredGap, type LessonExercise } from '../../src/modules/catalog/lesson-exercises';

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1000&q=75&auto=format&fit=crop`;
/** Ảnh bìa (cùng bộ ảnh Unsplash đang dùng trên site), mỗi khoá một ảnh */
const COVER: Record<string, string> = {
  'toeic-phat-am': photo('1529070538774-1843cb3265df'),
  'toeic-part-1-2': photo('1521737711867-e3b97375f902'),
  'toeic-part-7': photo('1486312338219-ce68d2c6f44d'),
  'vstep-reading': photo('1497633762265-9d179a990aa6'),
  'vstep-writing': photo('1506784983877-45594efa4cbe'),
  'tieng-anh-lop-10': photo('1524178232363-1fb2b075b655'),
  'tieng-anh-lop-11': photo('1517486808906-6ca8b3f04846'),
  'tieng-anh-lop-12': photo('1523580494863-6f3031224c94'),
  'on-thi-tot-nghiep-thpt': photo('1434030216411-0b793f4b4173'),
};

/** Bộ câu đề thi → câu bài tập (id "sgk…" để giữ khi sinh lại; câu sắp xếp có đoạn riêng) */
const setExercises = (set: ExamSet, prefix: string): LessonExercise[] =>
  set.questions.map((q, i) =>
    authoredChoice(`sgk-${prefix}-${i + 1}`, {
      type: set.type,
      prompt: set.prompt,
      text: q.q,
      options: q.options,
      explain: q.explain,
      passage: q.own ?? set.passage,
    })
  );

type CourseSpec = {
  slug: string;
  /** slug cũ (đổi slug giữ nguyên khoá + học viên ghi danh) */
  from?: string;
  title: string;
  description: string;
  track: CourseTrack;
  group: string;
  order: number;
  category: CourseCategory;
  level?: CefrLevel | null;
  /** chương lấy từ khoá khác: [slug khoá nguồn, tên chương, nhãn phần thi] */
  take?: [string, string, string][];
  /** nhãn phần thi cho chương đang có của khoá: tên chương → nhãn */
  parts?: Record<string, string>;
};

const SPECS: CourseSpec[] = [
  // ---------------- TOEIC ----------------
  {
    slug: 'nen-tang-toeic',
    title: 'Nền tảng TOEIC',
    description: 'Giáo trình tiếng Anh công việc B1 → B2: phát âm, từ loại, các thì, cấu trúc câu và từ vựng theo chủ đề của đề TOEIC.',
    track: 'TOEIC',
    group: 'Nền tảng',
    order: 1,
    category: 'FOUNDATION',
  },
  {
    slug: 'toeic-phat-am',
    title: 'Phát âm cho TOEIC Listening',
    description: 'Bảng IPA, đuôi -s/-ed, trọng âm và nối âm — nghe rõ từng từ trong Part 1–4.',
    track: 'TOEIC',
    group: 'Listening · Part 1–4',
    order: 2,
    category: 'EXAM_PREP',
    take: [
      ['luyen-thi-toeic-video', 'Học phát âm bảng IPA với chuỗi video này (bài tập đi kèm)', 'Bảng phiên âm IPA'],
      ['luyen-thi-toeic-video', 'Các quy tắc phát âm khác', 'Quy tắc phát âm'],
    ],
  },
  {
    slug: 'toeic-part-1-2',
    title: 'TOEIC Part 1–2: Mô tả tranh và Hỏi – đáp',
    description: 'Cấu trúc bài thi TOEIC, cách nghe tranh người / vật (Part 1) và bẫy thường gặp trong câu hỏi – đáp ngắn (Part 2).',
    track: 'TOEIC',
    group: 'Listening · Part 1–4',
    order: 3,
    category: 'EXAM_PREP',
    take: [
      ['luyen-thi-toeic-video', 'Tìm hiểu bài thi TOEIC', 'Tổng quan bài thi'],
      ['luyen-thi-toeic-video', 'Tất tần tật về Part 1 TOEIC', 'Part 1 · Mô tả tranh'],
      ['luyen-thi-toeic-video', 'Part 2 - Hỏi đáp ngắn (25 câu)', 'Part 2 · Hỏi – đáp'],
    ],
  },
  {
    slug: 'toeic-part-3-4',
    from: 'tieng-anh-cong-so',
    title: 'TOEIC Part 3–4: Hội thoại và bài nói công sở',
    description: 'Tình huống văn phòng, họp, thuyết trình, phỏng vấn — đúng bối cảnh hội thoại (Part 3) và bài nói ngắn (Part 4).',
    track: 'TOEIC',
    group: 'Listening · Part 1–4',
    order: 4,
    category: 'EXAM_PREP',
    parts: { 'Ở văn phòng': 'Part 3 · Hội thoại', 'Họp và thuyết trình': 'Part 4 · Bài nói ngắn', 'Phỏng vấn xin việc': 'Part 3 · Hội thoại' },
  },
  {
    slug: 'toeic-part-5-6',
    from: 'luyen-thi-toeic-video',
    title: 'TOEIC Part 5–6: Ngữ pháp và hoàn thành câu',
    description: 'Toàn bộ ngữ pháp TOEIC qua video và luyện chuyên sâu Part 5 (hoàn thành câu), Part 6 (hoàn thành đoạn văn).',
    track: 'TOEIC',
    group: 'Reading · Part 5–7',
    order: 5,
    category: 'EXAM_PREP',
    parts: { 'Làm chủ ngữ pháp TOEIC': 'Ngữ pháp Part 5–6', 'Part 5 Luyện tập chuyên sâu (30 câu)': 'Part 5 · Hoàn thành câu', 'Part 6 - Hoàn thành đoạn văn (16 câu)': 'Part 6 · Hoàn thành đoạn văn' },
  },
  {
    slug: 'toeic-part-7',
    title: 'TOEIC Part 7: Đọc email và văn bản công việc',
    description: 'Đọc hiểu email, thông báo, văn bản công việc — dạng bài chiếm nhiều câu nhất của Part 7.',
    track: 'TOEIC',
    group: 'Reading · Part 5–7',
    order: 6,
    category: 'EXAM_PREP',
    take: [['tieng-anh-cong-so', 'Email và văn bản công việc', 'Part 7 · Đọc hiểu']],
  },
  // ---------------- VSTEP ----------------
  {
    slug: 'nen-tang-vstep',
    title: 'Nền tảng VSTEP',
    description: 'Giáo trình tiếng Anh đời sống A2 → B1: phát âm, các thì, cấu trúc thông dụng và từ vựng theo chủ đề của đề VSTEP.',
    track: 'VSTEP',
    group: 'Nền tảng',
    order: 1,
    category: 'FOUNDATION',
  },
  {
    slug: 'vstep-ngu-phap',
    from: 'ngu-phap',
    title: 'Ngữ pháp VSTEP (A2 → B2)',
    description: 'Toàn bộ ngữ pháp từ câu đơn đến nâng cao — nền cho bài Đọc và bài Viết VSTEP.',
    track: 'VSTEP',
    group: 'Nền tảng',
    order: 2,
    category: 'GRAMMAR',
  },
  {
    slug: 'vstep-listening',
    from: 'luyen-nghe',
    title: 'VSTEP Listening: Nghe hiểu Part 1–3',
    description: 'Nghe thông báo, hướng dẫn ngắn (Part 1), hội thoại (Part 2) và bài giảng, bài nói dài (Part 3) như bài thi thật.',
    track: 'VSTEP',
    group: 'Nghe · Listening',
    order: 3,
    category: 'SKILL',
    parts: { 'Nghe từng âm, từng từ': 'Nền tảng nghe', 'Nghe hội thoại ngắn': 'Part 1–2 · Thông báo và hội thoại', 'Nghe bài nói dài': 'Part 3 · Bài giảng, bài nói', 'Nghe tốc độ thật': 'Luyện tốc độ thật' },
  },
  {
    slug: 'vstep-reading',
    title: 'VSTEP Reading: Từ vựng và đọc hiểu',
    description: 'Cách học từ, cấu tạo từ và từ vựng theo chủ đề đời sống, học tập, xã hội — đúng các chủ đề của 4 bài đọc VSTEP.',
    track: 'VSTEP',
    group: 'Đọc · Reading',
    order: 4,
    category: 'VOCABULARY',
    take: [
      ['tu-vung-phat-am', 'Cách học từ và cấu tạo từ', 'Cấu tạo từ'],
      ['tu-vung-phat-am', 'Từ vựng đời sống hằng ngày', 'Từ vựng theo chủ đề'],
      ['tu-vung-phat-am', 'Từ vựng học tập, công việc và xã hội', 'Từ vựng theo chủ đề'],
      ['tu-vung-phat-am', 'Dùng từ tự nhiên', 'Kết hợp từ'],
    ],
  },
  {
    slug: 'vstep-writing',
    from: 'viet-tieng-anh',
    title: 'VSTEP Writing: Task 1 và Task 2',
    description: 'Viết câu, đoạn đúng; viết thư / email (Task 1) và bài luận (Task 2) theo tiêu chí chấm VSTEP.',
    track: 'VSTEP',
    group: 'Viết · Writing',
    order: 5,
    category: 'SKILL',
    parts: { 'Viết câu đúng': 'Nền tảng viết', 'Viết đoạn văn': 'Nền tảng viết', 'Viết email và tin nhắn': 'Task 1 · Viết thư / email', 'Viết bài luận ngắn': 'Task 2 · Viết bài luận' },
  },
  {
    slug: 'vstep-speaking',
    from: 'giao-tiep-hang-ngay',
    title: 'VSTEP Speaking: Part 1–3',
    description: 'Phát âm, trọng âm, ngữ điệu và nói theo 3 phần thi: tương tác xã hội, thảo luận giải pháp, phát triển chủ đề.',
    track: 'VSTEP',
    group: 'Nói · Speaking',
    order: 6,
    category: 'SKILL',
    take: [
      ['tu-vung-phat-am', 'Phát âm nền tảng', 'Phát âm'],
      ['tu-vung-phat-am', 'Trọng âm và ngữ điệu', 'Phát âm'],
    ],
    parts: { 'Làm quen': 'Part 1 · Tương tác xã hội', 'Sinh hoạt hằng ngày': 'Part 1 · Tương tác xã hội', 'Du lịch': 'Part 1 · Tương tác xã hội', 'Bày tỏ ý kiến': 'Part 2–3 · Thảo luận giải pháp, phát triển chủ đề' },
  },
];

const GRADE_LEVEL: Record<number, CefrLevel> = { 10: 'A2', 11: 'B1', 12: 'B1' };

async function findCourse(slug: string, from?: string) {
  return (await prisma.course.findFirst({ where: { slug, deletedAt: null } })) ?? (from ? await prisma.course.findFirst({ where: { slug: from, deletedAt: null } }) : null);
}

type LessonData = Omit<Prisma.LessonUncheckedCreateInput, 'sectionId' | 'title' | 'orderIndex'>;
/**
 * Tạo / cập nhật bài theo (chương, tên bài). Chạy lại không làm mất nội dung đã soạn sau đó:
 * giữ bài giảng viết dài hơn bản giới thiệu ngắn, giữ câu bài tập soạn riêng cho bài (id "sgk-les-…").
 */
async function upsertLesson(sectionId: string, title: string, order: number, d: LessonData) {
  const found = await prisma.lesson.findFirst({ where: { sectionId, title, deletedAt: null } });
  if (!found) return prisma.lesson.create({ data: { sectionId, title, orderIndex: order, ...d } });
  const keepContent = (found.contentMd?.length ?? 0) > (typeof d.contentMd === 'string' ? d.contentMd.length : 0) + 200;
  const written = ((found.exercises as { id?: string }[] | null) ?? []).filter((e) => e.id?.startsWith('sgk-les'));
  const exercises = d.exercises !== undefined && written.length ? ([...((d.exercises as unknown[]) ?? []), ...written] as Prisma.InputJsonValue) : d.exercises;
  return prisma.lesson.update({
    where: { id: found.id },
    data: { ...d, ...(keepContent ? { contentMd: found.contentMd, summary: found.summary } : {}), ...(exercises !== undefined ? { exercises } : {}), orderIndex: order },
  });
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });
  const log: string[] = [];

  // 1) TOEIC / VSTEP
  for (const s of SPECS) {
    const data = { slug: s.slug, title: s.title, description: s.description, track: s.track, trackGroup: s.group, trackOrder: s.order, category: s.category, examType: s.track === 'THPT' ? null : s.track, ...(COVER[s.slug] ? { coverUrl: COVER[s.slug] } : {}) };
    let course = await findCourse(s.slug, s.from);
    if (course) course = await prisma.course.update({ where: { id: course.id }, data });
    else course = await prisma.course.create({ data: { ...data, status: 'PUBLISHED', publishedAt: new Date(), isFree: true, isSequential: true, authorId: admin?.id } });

    // chương lấy từ khoá khác: dời sang, xếp trước các chương đang có (phát âm trước giao tiếp…)
    if (s.take?.length) {
      const own = await prisma.courseSection.findMany({ where: { courseId: course.id }, orderBy: { orderIndex: 'asc' } });
      // (course_id, order_index) là duy nhất → đẩy thứ tự cũ ra xa rồi đánh số lại
      await prisma.courseSection.updateMany({ where: { courseId: course.id }, data: { orderIndex: { increment: 500 } } });
      let order = 0;
      for (const [src, title, part] of s.take) {
        const sec = await prisma.courseSection.findFirst({ where: { title, course: { slug: { in: [src, ...SPECS.filter((x) => x.from === src).map((x) => x.slug)] } } } });
        const mine = own.find((o) => o.title === title);
        const id = sec?.id ?? mine?.id;
        if (!id) {
          log.push(`! không thấy chương "${title}" (${src})`);
          continue;
        }
        await prisma.courseSection.update({ where: { id }, data: { courseId: course.id, partTitle: part, orderIndex: ++order } });
      }
      // chương sẵn có của khoá xếp sau
      for (const o of own.filter((o) => !s.take!.some(([, t]) => t === o.title))) await prisma.courseSection.update({ where: { id: o.id }, data: { orderIndex: ++order } });
    }
    for (const [title, part] of Object.entries(s.parts ?? {})) await prisma.courseSection.updateMany({ where: { courseId: course.id, title }, data: { partTitle: part } });
    log.push(`${s.track} · ${s.group} · ${s.title}`);
  }

  // khoá cũ đã dời hết chương → lưu trữ
  for (const slug of ['tu-vung-phat-am']) {
    const c = await prisma.course.findFirst({ where: { slug, deletedAt: null }, include: { _count: { select: { courseSectionCourses: true } } } });
    if (c && c._count.courseSectionCourses === 0) {
      await prisma.course.update({ where: { id: c.id }, data: { status: 'ARCHIVED', deletedAt: new Date() } });
      log.push(`lưu trữ khoá rỗng: ${c.title}`);
    }
  }

  // 2) THPT theo SGK Global Success
  for (const g of THPT) {
    const slug = `tieng-anh-lop-${g.grade}`;
    const data = {
      slug,
      title: `Tiếng Anh ${g.grade} (Global Success)`,
      description: `Bám sát SGK Tiếng Anh ${g.grade} Global Success: từ vựng và ngữ pháp trọng tâm của 10 Unit, có bài tập sau mỗi bài và bài Review sau các cụm Unit.`,
      track: 'THPT' as const,
      trackGroup: `Lớp ${g.grade}`,
      trackOrder: g.grade - 9,
      category: 'FOUNDATION' as const,
      examType: null,
      level: GRADE_LEVEL[g.grade],
      coverUrl: COVER[slug],
    };
    const existing = await prisma.course.findFirst({ where: { slug, deletedAt: null } });
    const course = existing ? await prisma.course.update({ where: { id: existing.id }, data }) : await prisma.course.create({ data: { ...data, status: 'PUBLISHED', publishedAt: new Date(), isFree: true, isSequential: true, authorId: admin?.id } });

    await prisma.courseSection.updateMany({ where: { courseId: course.id }, data: { orderIndex: { increment: 500 } } });
    let secOrder = 0;
    const section = async (title: string, part: string) => {
      const found = await prisma.courseSection.findFirst({ where: { courseId: course.id, title } });
      const data = { partTitle: part, orderIndex: ++secOrder };
      return found ? prisma.courseSection.update({ where: { id: found.id }, data }) : prisma.courseSection.create({ data: { courseId: course.id, title, ...data } });
    };
    const lesson = upsertLesson;

    for (const u of g.units) {
      const term = u.no <= 5 ? 'Học kỳ 1' : 'Học kỳ 2';
      const sec = await section(`Unit ${u.no}: ${u.title}`, term);
      const vocab = u.vocab.map((line) => {
        const [word, ipa, pos, meaningVi, example] = line.split('|').map((x) => x.trim());
        return { word, ipa, pos, meaningVi, example };
      });
      const empty = { grammar: [], pronunciation: [], phrases: [], tips: [], vocab: [], clauses: [], articles: [] };
      await lesson(sec.id, `Từ vựng: ${u.title}`, 0, {
        type: 'READING',
        summary: `${u.titleVi} — ${vocab.length} từ trọng tâm của Unit ${u.no}`,
        contentMd: `Unit ${u.no} — ${u.title} (${u.titleVi}).\n\nHọc ${vocab.length} từ trọng tâm của chủ đề: nghĩa, phiên âm, từ loại và câu ví dụ. Bấm vào từ để nghe phát âm, tra từ điển hoặc lưu vào sổ từ. Làm bài tập ở bước 2 để hoàn thành bài.`,
        knowledge: { ...empty, vocab } as unknown as Prisma.InputJsonValue,
        durationMin: 15,
        status: 'PUBLISHED',
        isFreePreview: u.no === 1,
      });
      // câu điền chỗ trống soạn theo trọng tâm Unit (giữ lại khi sinh bài tập tự động)
      const gaps = (THPT_PRACTICE[`${g.grade}-${u.no}`] ?? [])
        .map((line, i) => authoredGap(`sgk${g.grade}u${u.no}q${i + 1}`, line, `${u.grammarTitle}: ${u.grammar.map((x) => x.formula).join('; ')}.`))
        .filter((x): x is NonNullable<typeof x> => !!x);
      await lesson(sec.id, `Ngữ pháp: ${u.grammarTitle}`, 1, {
        exercises: gaps as unknown as Prisma.InputJsonValue,
        type: 'READING',
        summary: `Trọng tâm ngữ pháp Unit ${u.no}`,
        contentMd: `Unit ${u.no} — ${u.title}: ${u.grammarTitle.toLowerCase()}.\n\nXem công thức, cách dùng và câu ví dụ theo chủ đề của Unit ở phần Kiến thức trong bài, sau đó làm bài tập ở bước 2.`,
        knowledge: { ...empty, grammar: u.grammar } as unknown as Prisma.InputJsonValue,
        durationMin: 20,
        status: 'PUBLISHED',
        isFreePreview: u.no === 1,
      });
      const review = g.reviews.find((r) => r.after === u.no);
      if (review) {
        const rs = await section(`Review ${g.reviews.indexOf(review) + 1}`, term);
        await lesson(rs.id, `Review ${g.reviews.indexOf(review) + 1}: ôn tập Unit ${review.units}`, 0, { type: 'QUIZ', summary: `Ôn tập từ vựng và ngữ pháp Unit ${review.units}`, passScorePct: 70, durationMin: 15, status: 'PUBLISHED' });
      }
    }
    log.push(`THPT · Lớp ${g.grade} · ${course.title}`);
  }

  // 2b) Ôn thi tốt nghiệp THPT — theo cấu trúc đề minh hoạ từ 2025 (40 câu / 50 phút)
  {
    const slug = 'on-thi-tot-nghiep-thpt';
    const data = {
      slug,
      title: 'Ôn thi tốt nghiệp THPT môn Tiếng Anh',
      description: 'Ôn theo đúng cấu trúc đề thi tốt nghiệp THPT từ năm 2025: 40 câu trắc nghiệm trong 50 phút. Tổng ôn ngữ pháp lớp 10–12, chiến lược và luyện đề cho từng dạng câu, đề luyện tổng hợp 40 câu.',
      track: 'THPT' as const,
      trackGroup: 'Ôn thi tốt nghiệp',
      trackOrder: 4,
      category: 'EXAM_PREP' as const,
      examType: null,
      level: 'B1' as const,
      coverUrl: COVER[slug],
      // ôn thi: vào thẳng dạng câu còn yếu hoặc làm đề tổng hợp, không bắt học tuần tự
      isSequential: false,
    };
    const existing = await prisma.course.findFirst({ where: { slug, deletedAt: null } });
    const course = existing ? await prisma.course.update({ where: { id: existing.id }, data }) : await prisma.course.create({ data: { ...data, status: 'PUBLISHED', publishedAt: new Date(), isFree: true, isSequential: true, authorId: admin?.id } });
    await prisma.courseSection.updateMany({ where: { courseId: course.id }, data: { orderIndex: { increment: 500 } } });
    let secOrder = 0;
    const section = async (title: string, part: string) => {
      const found = await prisma.courseSection.findFirst({ where: { courseId: course.id, title } });
      const d = { partTitle: part, orderIndex: ++secOrder };
      return found ? prisma.courseSection.update({ where: { id: found.id }, data: d }) : prisma.courseSection.create({ data: { courseId: course.id, title, ...d } });
    };
    const lesson = upsertLesson;
    const empty = { grammar: [], pronunciation: [], phrases: [], tips: [], vocab: [], clauses: [], articles: [] };
    const json = (v: unknown) => v as Prisma.InputJsonValue;

    // Làm quen đề thi
    // 3 phần: Nền tảng (làm quen đề + tổng ôn ngữ pháp) · Luyện theo dạng câu · Luyện đề
    const s0 = await section('Làm quen đề thi', 'Nền tảng');
    await lesson(s0.id, 'Cấu trúc đề thi tốt nghiệp THPT môn Tiếng Anh', 0, {
      type: 'READING',
      summary: '40 câu trắc nghiệm, 50 phút, 6 dạng câu theo thứ tự cố định',
      contentMd:
        'Từ năm 2025, đề thi tốt nghiệp THPT môn Tiếng Anh gồm 40 câu trắc nghiệm, làm trong 50 phút, mỗi câu 0,25 điểm. Đề tập trung vào đọc hiểu: không còn câu phát âm, trọng âm hay tìm lỗi sai riêng lẻ.\n\nThứ tự đề: Câu 1–6 đọc thông báo / quảng cáo điền từ · Câu 7–12 đọc tờ rơi điền từ · Câu 13–17 sắp xếp hội thoại, lá thư, đoạn văn · Câu 18–22 điền cụm từ, mệnh đề vào đoạn văn · Câu 23–30 đọc hiểu bài 1 · Câu 31–40 đọc hiểu bài 2.\n\nGợi ý phân bổ thời gian: Câu 1–12 khoảng 10 phút, Câu 13–22 khoảng 12 phút, hai bài đọc hiểu khoảng 25 phút, còn 3 phút để soát lại và tô đủ đáp án.',
      knowledge: json({
        ...empty,
        tips: [
          { title: 'Câu 1–12: đọc điền', note: 'Từ loại, cụm cố định, lượng từ, giới từ, liên từ — làm nhanh để dành thời gian cho đọc hiểu' },
          { title: 'Câu 13–17: sắp xếp', note: 'Tìm câu mở đầu và các cặp câu chắc chắn đi liền nhau rồi loại phương án' },
          { title: 'Câu 18–22: điền đoạn văn', note: 'Xem chỗ trống thiếu mệnh đề hay cụm bổ nghĩa; mỗi câu chỉ một động từ chính' },
          { title: 'Câu 23–40: đọc hiểu', note: 'Đọc câu hỏi trước, câu ý chính làm cuối; chiếm gần một nửa số điểm' },
          { title: 'Không bỏ trống câu nào', note: 'Thi trắc nghiệm không trừ điểm câu sai' },
        ],
      }),
      durationMin: 10,
      status: 'PUBLISHED',
      isFreePreview: true,
    });

    // Tổng ôn ngữ pháp lớp 10–12: kiến thức + câu luyện đã soạn của các Unit SGK
    const s1 = await section('Tổng ôn ngữ pháp lớp 10–12', 'Nền tảng');
    const unitOf = (key: string) => {
      const [g, u] = key.split('-').map(Number);
      return THPT.find((x) => x.grade === g)?.units.find((x) => x.no === u);
    };
    for (const [i, topic] of GRAMMAR_REVIEW.entries()) {
      const grammar = topic.units.flatMap((k) => unitOf(k)?.grammar ?? []);
      const gaps = topic.units
        .flatMap((k) => (THPT_PRACTICE[k] ?? []).map((line, j) => ({ k, line, j })))
        .map(({ k, line, j }) => authoredGap(`sgk-on-${k}-${j + 1}`, line, `${unitOf(k)?.grammarTitle ?? topic.title}: ${(unitOf(k)?.grammar ?? []).map((x) => x.formula).join('; ')}.`))
        .filter((x): x is NonNullable<typeof x> => !!x)
        .slice(0, 8);
      await lesson(s1.id, `Tổng ôn: ${topic.title}`, i, {
        type: 'READING',
        summary: `Ôn ${grammar.length} điểm ngữ pháp trọng tâm từ ${topic.units.length} Unit SGK lớp 10–12`,
        contentMd: `Tổng ôn chủ điểm ${topic.title.charAt(0).toLowerCase() + topic.title.slice(1)} trong chương trình Tiếng Anh 10–12 (Global Success). Xem công thức, cách dùng và câu ví dụ ở phần Kiến thức trong bài, sau đó làm bài tập ở bước 2.`,
        knowledge: json({ ...empty, grammar }),
        exercises: json(gaps),
        durationMin: 20,
        status: 'PUBLISHED',
      });
    }

    // Từng dạng câu: chiến lược + luyện đề đúng định dạng
    let setNo = 0;
    for (const g of PART_GUIDES) {
      const sec = await section(g.section, 'Luyện theo dạng câu');
      await lesson(sec.id, g.strategyTitle, 0, {
        type: 'READING',
        summary: g.summary,
        contentMd: g.content,
        knowledge: json({ ...empty, grammar: g.grammar, tips: g.tips }),
        durationMin: 15,
        status: 'PUBLISHED',
      });
      const qs = g.sets.flatMap((set) => setExercises(set, `de-${EXAM_SETS.indexOf(set) + 1}`));
      setNo += g.sets.length;
      await lesson(sec.id, g.practiceTitle, 1, {
        type: 'QUIZ',
        summary: `${qs.length} câu đúng định dạng đề thi, có giải thích từng câu`,
        exercises: json(qs),
        passScorePct: 60,
        durationMin: Math.max(5, Math.round(qs.length * 1.25)),
        status: 'PUBLISHED',
      });
    }

    // Đề luyện tổng hợp 40 câu
    const s9 = await section('Đề luyện tổng hợp', 'Luyện đề');
    const full = EXAM_SETS.flatMap((set, i) => setExercises(set, `full-${i + 1}`));
    await lesson(s9.id, 'Đề luyện tổng hợp 40 câu — 50 phút', 0, {
      type: 'QUIZ',
      summary: `${full.length} câu theo đúng thứ tự đề thi tốt nghiệp THPT, đạt từ 5 điểm (50%)`,
      exercises: json(full),
      passScorePct: 50,
      durationMin: 50,
      status: 'PUBLISHED',
    });
    log.push(`THPT · Ôn thi tốt nghiệp · ${course.title} (${setNo} bộ luyện đề, đề tổng hợp ${full.length} câu)`);
  }

  // 3) cập nhật số bài / thời lượng lưu sẵn
  for (const c of await prisma.course.findMany({ where: { deletedAt: null } })) {
    const agg = await prisma.lesson.aggregate({ where: { deletedAt: null, section: { courseId: c.id } }, _count: true, _sum: { durationMin: true } });
    await prisma.course.update({ where: { id: c.id }, data: { lessonsCount: agg._count, durationMin: agg._sum.durationMin ?? 0 } });
  }
  // 4) khoá trọn gói: các khoá nhỏ TOEIC / VSTEP thành chặng của một khoá (như khoá học thật)
  log.push(...(await mergeCourses()));
  // 5) lớp học nằm trong khoá: gắn lớp chưa có khoá, ghi danh học viên của lớp
  log.push(...(await linkClassCourses()));
  console.log(log.join('\n'));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
