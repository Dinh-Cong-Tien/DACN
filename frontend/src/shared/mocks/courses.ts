import { PHOTOS, pravatar, unsplash } from '@/shared/components/media/Img';
import type { Course, CourseCategory, CourseSection, DictionaryEntry, GrammarTopic, Lesson, TranscriptLine } from '@/shared/types';

export const SAMPLE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const SAMPLE_TRANSCRIPT: TranscriptLine[] = [
  { start: 0, end: 6, text: 'Welcome back to OrbiLingo. In today\'s lesson we are going to look at TOEIC Part 5 word-form questions.', textVi: 'Chào mừng trở lại OrbiLingo. Hôm nay chúng ta sẽ tìm hiểu dạng câu hỏi từ loại trong TOEIC Part 5.' },
  { start: 6, end: 13, text: 'Word-form questions are the easiest points to earn, because you rarely need to understand the whole sentence.', textVi: 'Câu hỏi từ loại là điểm dễ ăn nhất, vì bạn hiếm khi cần hiểu toàn bộ câu.' },
  { start: 13, end: 20, text: 'First, look at the four options. If they share the same root, such as economy, economic and economical, you have a word-form question.', textVi: 'Trước tiên nhìn vào 4 đáp án. Nếu chúng có cùng gốc từ như economy, economic, economical thì đó là câu hỏi từ loại.' },
  { start: 20, end: 28, text: 'Next, check the words immediately before and after the blank. An article or an adjective before the blank usually signals a noun.', textVi: 'Tiếp theo, kiểm tra từ đứng ngay trước và sau chỗ trống. Mạo từ hoặc tính từ trước chỗ trống thường báo hiệu một danh từ.' },
  { start: 28, end: 36, text: 'If the blank sits between a subject and a verb, you most likely need an adverb, like "carefully" or "significantly".', textVi: 'Nếu chỗ trống nằm giữa chủ ngữ và động từ, bạn gần như chắc chắn cần một trạng từ, ví dụ "carefully" hay "significantly".' },
  { start: 36, end: 44, text: 'Remember: adjectives describe nouns, adverbs describe verbs, adjectives and other adverbs.', textVi: 'Hãy nhớ: tính từ bổ nghĩa cho danh từ, trạng từ bổ nghĩa cho động từ, tính từ và trạng từ khác.' },
  { start: 44, end: 52, text: 'Let\'s practise with a real example. "Sales figures were ______ higher than predicted." Which word form fits?', textVi: 'Cùng luyện với ví dụ thật. "Sales figures were ______ higher than predicted." Từ loại nào phù hợp?' },
  { start: 52, end: 60, text: 'The blank modifies the comparative adjective "higher", so the answer is the adverb "significantly".', textVi: 'Chỗ trống bổ nghĩa cho tính từ so sánh hơn "higher", nên đáp án là trạng từ "significantly".' },
];

const mkLesson = (id: string, title: string, type: Lesson['type'], durationMin: number, isCompleted = false, isLocked = false): Lesson => ({
  id,
  title,
  type,
  durationMin,
  isCompleted,
  isLocked,
  videoUrl: type === 'VIDEO' ? SAMPLE_VIDEO_URL : undefined,
  transcript: type === 'VIDEO' ? SAMPLE_TRANSCRIPT : undefined,
  content: type === 'READING' ? 'Nội dung bài đọc tóm tắt lý thuyết kèm ví dụ minh hoạ, bảng so sánh và bài tập nhanh cuối bài.' : undefined,
  isFree: isCompleted,
});

export const MOCK_COURSES: Course[] = [
  {
    id: 'c-toeic-foundation',
    coverUrl: PHOTOS.studying,
    slug: 'toeic-foundation-450-650',
    title: 'TOEIC Foundation — Nền tảng 450 → 650',
    examType: 'TOEIC',
    level: '450–650',
    description: 'Xây nền ngữ pháp và từ vựng thiết yếu, làm quen 7 Part với chiến thuật cơ bản. Phù hợp người mới bắt đầu hoặc mất gốc.',
    gradient: 'from-indigo-500 to-violet-600',
    lessonsCount: 42,
    durationHours: 28,
    studentsCount: 8427,
    rating: 4.8,
    isFree: true,
    progress: 62,
    teacherName: 'Trần Thu Hà',
    sections: [
      {
        id: 's1',
        title: 'Chương 1 — Làm quen bài thi TOEIC',
        lessons: [mkLesson('l-1-1', 'Cấu trúc đề thi TOEIC Listening & Reading', 'VIDEO', 12, true), mkLesson('l-1-2', 'Chiến lược phân bổ thời gian 120 phút', 'VIDEO', 9, true), mkLesson('l-1-3', 'Kiểm tra nhanh: Bạn đã hiểu format?', 'QUIZ', 5, true)],
      },
      {
        id: 's2',
        title: 'Chương 2 — Ngữ pháp trọng tâm Part 5',
        lessons: [mkLesson('l-2-1', 'Word Form: Nhận diện từ loại trong 10 giây', 'VIDEO', 14, true), mkLesson('l-2-2', 'Thì động từ & dấu hiệu nhận biết', 'VIDEO', 16, false), mkLesson('l-2-3', 'Giới từ – Liên từ: bẫy kinh điển', 'READING', 8, false), mkLesson('l-2-4', 'Luyện tập 30 câu Part 5', 'QUIZ', 15, false)],
      },
      {
        id: 's3',
        title: 'Chương 3 — Listening Part 1 & 2',
        lessons: [mkLesson('l-3-1', 'Part 1: Mô tả tranh & bẫy bị động', 'VIDEO', 11, false, true), mkLesson('l-3-2', 'Part 2: 5 dạng câu hỏi Wh- thường gặp', 'VIDEO', 13, false, true), mkLesson('l-3-3', 'Nghe chép chính tả câu ngắn', 'QUIZ', 10, false, true)],
      },
    ],
  },
  {
    id: 'c-toeic-intensive',
    coverUrl: PHOTOS.laptop,
    slug: 'toeic-intensive-650-850',
    title: 'TOEIC Intensive — Bứt phá 650 → 850',
    examType: 'TOEIC',
    level: '650–850',
    description: 'Chiến thuật chuyên sâu Part 3, 4, 7; xử lý đoạn kép, đoạn ba và tăng tốc độ đọc. Kèm 10 đề thi thử chuẩn ETS.',
    gradient: 'from-violet-600 to-fuchsia-600',
    lessonsCount: 56,
    durationHours: 40,
    studentsCount: 5136,
    rating: 4.9,
    isFree: false,
    progress: 15,
    teacherName: 'Lê Quốc Bảo',
    sections: [
      { id: 's1', title: 'Chương 1 — Part 3 & 4 nâng cao', lessons: [mkLesson('l-1-1', 'Paraphrase trong Part 3: nhận diện nhanh', 'VIDEO', 15, true), mkLesson('l-1-2', 'Câu hỏi bảng biểu (Graphic)', 'VIDEO', 12, false)] },
      { id: 's2', title: 'Chương 2 — Part 7 đoạn kép & ba', lessons: [mkLesson('l-2-1', 'Liên kết thông tin giữa các đoạn', 'VIDEO', 18, false, true), mkLesson('l-2-2', 'Luyện 2 bộ đoạn ba', 'QUIZ', 25, false, true)] },
    ],
  },
  {
    id: 'c-vstep-b1',
    coverUrl: PHOTOS.writing,
    slug: 'vstep-b1-complete',
    title: 'VSTEP B1 Complete — 4 kỹ năng đạt chuẩn ra trường',
    examType: 'VSTEP',
    level: 'B1',
    description: 'Lộ trình trọn gói Nghe – Đọc – Viết – Nói theo format Bộ GD&ĐT. Mẫu bài viết Task 1/2 và khung trả lời Speaking.',
    gradient: 'from-emerald-500 to-teal-600',
    lessonsCount: 48,
    durationHours: 32,
    studentsCount: 6743,
    rating: 4.7,
    isFree: true,
    progress: 0,
    teacherName: 'Phạm Ngọc Linh',
    sections: [
      { id: 's1', title: 'Chương 1 — Tổng quan VSTEP', lessons: [mkLesson('l-1-1', 'Format đề thi và cách tính điểm', 'VIDEO', 10), mkLesson('l-1-2', 'Khung năng lực 6 bậc Việt Nam', 'READING', 6)] },
      { id: 's2', title: 'Chương 2 — Writing Task 1', lessons: [mkLesson('l-2-1', 'Cấu trúc email trang trọng & thân mật', 'VIDEO', 14), mkLesson('l-2-2', 'Bài mẫu band 7 phân tích', 'READING', 9), mkLesson('l-2-3', 'Viết thử & tự chấm theo rubric', 'QUIZ', 20)] },
    ],
  },
  {
    id: 'c-vstep-b2',
    coverUrl: PHOTOS.library,
    slug: 'vstep-b2-master',
    title: 'VSTEP B2 Master — Chinh phục bậc 4',
    examType: 'VSTEP',
    level: 'B2',
    description: 'Nâng cao kỹ năng lập luận, từ vựng học thuật và xử lý bài đọc dài. Luyện Speaking Part 3 với sơ đồ tư duy.',
    gradient: 'from-teal-500 to-cyan-600',
    lessonsCount: 60,
    durationHours: 45,
    studentsCount: 3218,
    rating: 4.8,
    isFree: false,
    teacherName: 'Lê Quốc Bảo',
    sections: [{ id: 's1', title: 'Chương 1 — Reading bậc 4', lessons: [mkLesson('l-1-1', 'Chiến thuật đọc bài 3 & 4', 'VIDEO', 16), mkLesson('l-1-2', 'Vocabulary in context', 'VIDEO', 12)] }],
  },
  {
    id: 'c-grammar-24',
    coverUrl: PHOTOS.books,
    slug: '24-chu-diem-ngu-phap',
    title: '24 Chủ điểm Ngữ pháp Tiếng Anh cốt lõi',
    examType: 'TOEIC',
    level: 'Mọi trình độ',
    description: 'Hệ thống hoá 24 chủ điểm ngữ pháp quan trọng nhất cho cả TOEIC và VSTEP, mỗi bài kèm 20 câu luyện tập.',
    gradient: 'from-amber-400 to-orange-500',
    lessonsCount: 24,
    durationHours: 18,
    studentsCount: 11264,
    rating: 4.9,
    isFree: true,
    progress: 38,
    teacherName: 'Trần Thu Hà',
    sections: [{ id: 's1', title: 'Nhóm 1 — Thì động từ', lessons: [mkLesson('l-1-1', 'Hiện tại đơn & tiếp diễn', 'VIDEO', 12, true), mkLesson('l-1-2', 'Quá khứ đơn & hiện tại hoàn thành', 'VIDEO', 14, true), mkLesson('l-1-3', 'Tương lai & tương lai hoàn thành', 'VIDEO', 11)] }],
  },
  {
    id: 'c-vocab-business',
    coverUrl: PHOTOS.office,
    slug: 'tu-vung-toeic-business',
    title: 'Từ vựng TOEIC theo 20 chủ đề Business',
    examType: 'TOEIC',
    level: '450+',
    description: '600 từ vựng tần suất cao nhất trong đề thi, chia theo chủ đề Office, HR, Marketing, Finance, Travel... Kèm flashcard SRS.',
    gradient: 'from-rose-500 to-pink-600',
    lessonsCount: 20,
    durationHours: 15,
    studentsCount: 9817,
    rating: 4.6,
    isFree: true,
    teacherName: 'Phạm Ngọc Linh',
    sections: [{ id: 's1', title: 'Chủ đề 1–5', lessons: [mkLesson('l-1-1', 'Office & Administration', 'VIDEO', 10), mkLesson('l-1-2', 'Human Resources', 'VIDEO', 10)] }],
  },
];

// ---------- Lộ trình nền tảng: học lần lượt từ Bài 1, bài sau mở khi xong bài trước ----------
type PathLesson = [title: string, type: Lesson['type'], durationMin: number, summary: string];

/** Dựng các chặng của lộ trình: `done` bài đầu đã học, bài kế tiếp đang mở, các bài sau khoá; `free` bài đầu cho học thử */
const mkPath = (prefix: string, chapters: [title: string, lessons: PathLesson[]][], done: number, free: number): CourseSection[] => {
  let n = 0;
  return chapters.map(([title, lessons], si) => ({
    id: `${prefix}-s${si + 1}`,
    title,
    lessons: lessons.map(([t, type, min, summary]) => {
      const i = n++;
      return { ...mkLesson(`${prefix}-${String(i + 1).padStart(2, '0')}`, t, type, min, i < done, i > done), summary, isFree: i < free };
    }),
  }));
};

const GRAMMAR_PATH = mkPath(
  'gp',
  [
    [
      'Nền móng của câu tiếng Anh',
      [
        ['Một câu tiếng Anh gồm những gì: chủ ngữ, động từ, tân ngữ', 'VIDEO', 12, 'Nhìn một câu bất kỳ và chỉ ra đâu là chủ ngữ, đâu là động từ chính.'],
        ['8 từ loại và cách nhận ra từng loại', 'VIDEO', 14, 'Danh từ, động từ, tính từ, trạng từ… và vị trí quen thuộc của chúng trong câu.'],
        ['Danh từ đếm được, không đếm được và số nhiều', 'VIDEO', 13, 'Thêm -s/-es thế nào, khi nào dùng much, many, a lot of.'],
        ['Mạo từ a, an, the', 'VIDEO', 12, 'Ba từ nhỏ nhưng sai nhiều nhất: dùng khi nào và khi nào bỏ đi.'],
        ['Đại từ nhân xưng, tân ngữ và sở hữu', 'VIDEO', 11, 'I – me – my – mine: chọn đúng dạng theo vị trí trong câu.'],
        ['Kiểm tra chặng 1', 'QUIZ', 10, '15 câu trắc nghiệm, đúng từ 10 câu để mở chặng tiếp theo.'],
      ],
    ],
    [
      'Động từ và các thì cơ bản',
      [
        ['Động từ to be: am, is, are, was, were', 'VIDEO', 12, 'Câu khẳng định, phủ định, câu hỏi với to be.'],
        ['Thì hiện tại đơn', 'VIDEO', 15, 'Thói quen, sự thật, lịch trình. Quy tắc thêm -s/-es cho ngôi thứ ba.'],
        ['Thì hiện tại tiếp diễn', 'VIDEO', 13, 'Việc đang diễn ra lúc nói và kế hoạch đã sắp xếp.'],
        ['Thì quá khứ đơn và động từ bất quy tắc', 'VIDEO', 16, 'Kể lại việc đã xong; 50 động từ bất quy tắc hay gặp nhất.'],
        ['Tương lai đơn và be going to', 'VIDEO', 12, 'Quyết định tức thời khác dự định có sẵn thế nào.'],
        ['Kiểm tra chặng 2', 'QUIZ', 12, '20 câu chia động từ theo ngữ cảnh.'],
      ],
    ],
    [
      'Mở rộng câu',
      [
        ['Tính từ và trạng từ', 'VIDEO', 13, 'Tính từ đứng trước danh từ, trạng từ bổ nghĩa cho động từ; đuôi -ly.'],
        ['Giới từ chỉ thời gian: in, on, at', 'VIDEO', 11, 'in May, on Monday, at 7 a.m. và các trường hợp ngoại lệ.'],
        ['Giới từ chỉ nơi chốn và phương hướng', 'VIDEO', 12, 'in, on, at, next to, between, across from… qua tranh minh hoạ.'],
        ['So sánh hơn và so sánh nhất', 'VIDEO', 14, 'Tính từ ngắn, tính từ dài và các dạng bất quy tắc good – better – best.'],
        ['Câu hỏi Yes/No và câu hỏi Wh-', 'VIDEO', 13, 'Đảo trợ động từ lên trước; what, where, when, why, how.'],
        ['Kiểm tra chặng 3', 'QUIZ', 12, '20 câu tổng hợp từ loại, giới từ và so sánh.'],
      ],
    ],
    [
      'Các thì hoàn thành và động từ khuyết thiếu',
      [
        ['Thì hiện tại hoàn thành', 'VIDEO', 15, 'have/has + V3; dấu hiệu since, for, already, yet, just.'],
        ['Hiện tại hoàn thành hay quá khứ đơn?', 'VIDEO', 14, 'Cặp thì hay nhầm nhất trong Part 5 và VSTEP Reading.'],
        ['Quá khứ tiếp diễn và quá khứ hoàn thành', 'VIDEO', 15, 'Việc đang xảy ra thì có việc khác xen vào; việc xảy ra trước một mốc quá khứ.'],
        ['Động từ khuyết thiếu: can, could, must, should, may', 'VIDEO', 13, 'Khả năng, nghĩa vụ, lời khuyên, sự cho phép.'],
        ['Kiểm tra chặng 4', 'QUIZ', 12, '20 câu chọn thì và động từ khuyết thiếu.'],
      ],
    ],
    [
      'Cấu trúc hay gặp trong đề TOEIC và VSTEP',
      [
        ['Câu bị động', 'VIDEO', 16, 'be + V3 ở các thì đã học; khi nào cần dùng bị động.'],
        ['Câu điều kiện loại 1, 2, 3', 'VIDEO', 16, 'Điều kiện có thật, không có thật ở hiện tại và trong quá khứ.'],
        ['Mệnh đề quan hệ: who, which, that, whose', 'VIDEO', 15, 'Nối hai câu thành một và cách rút gọn mệnh đề quan hệ.'],
        ['V-ing hay to V sau động từ', 'VIDEO', 13, 'enjoy doing, decide to do và nhóm động từ đi được cả hai.'],
        ['Liên từ và từ nối', 'VIDEO', 14, 'although, because, however, therefore; phân biệt với despite, because of.'],
        ['Câu tường thuật', 'VIDEO', 13, 'Lùi thì, đổi đại từ và trạng từ khi kể lại lời người khác.'],
        ['Bài kiểm tra cuối khoá', 'QUIZ', 25, '40 câu theo dạng Part 5 TOEIC; có bảng điểm từng chủ điểm sau khi nộp.'],
      ],
    ],
  ],
  5,
  2,
);

const VOCAB_PATH = mkPath(
  'vp',
  [
    [
      'Cách học từ và phát âm',
      [
        ['Học từ vựng thế nào để nhớ lâu', 'VIDEO', 10, 'Học theo cụm, ôn ngắt quãng và cách dùng sổ từ trên OrbiLingo.'],
        ['Bảng phiên âm IPA: nguyên âm', 'VIDEO', 14, '20 nguyên âm, so sánh cặp âm dễ nhầm như /ɪ/ và /iː/.'],
        ['Bảng phiên âm IPA: phụ âm', 'VIDEO', 14, '24 phụ âm, chú ý âm cuối /s/, /z/, /t/, /d/ người Việt hay bỏ.'],
        ['Trọng âm và cách tra từ điển', 'VIDEO', 12, 'Đọc ký hiệu trọng âm, từ loại và ví dụ trong từ điển Cambridge.'],
        ['Kiểm tra chặng 1', 'QUIZ', 8, 'Nghe và chọn phiên âm đúng cho 15 từ.'],
      ],
    ],
    [
      'Từ vựng thông dụng hằng ngày',
      [
        ['Số đếm, ngày tháng và giờ giấc', 'VIDEO', 12, 'Đọc số tiền, số điện thoại, ngày tháng như người bản xứ.'],
        ['Gia đình và con người', 'VIDEO', 11, 'Quan hệ gia đình, ngoại hình, tính cách.'],
        ['Nhà cửa và sinh hoạt hằng ngày', 'VIDEO', 11, 'Các phòng, đồ dùng và hoạt động trong ngày.'],
        ['Ăn uống và mua sắm', 'VIDEO', 12, 'Gọi món, hỏi giá, đổi trả hàng.'],
        ['Đi lại và hỏi đường', 'VIDEO', 11, 'Phương tiện, biển báo, chỉ đường.'],
        ['Sức khoẻ và thời tiết', 'VIDEO', 11, 'Triệu chứng thường gặp, đi khám, mô tả thời tiết.'],
        ['Kiểm tra chặng 2', 'QUIZ', 10, '25 câu điền từ theo tranh và theo ngữ cảnh.'],
      ],
    ],
    [
      'Cấu tạo từ',
      [
        ['Tiền tố hay gặp: un-, re-, dis-, pre-, over-', 'VIDEO', 12, 'Đoán nghĩa từ mới từ phần đầu của từ.'],
        ['Hậu tố danh từ: -tion, -ment, -ness, -er', 'VIDEO', 12, 'Nhận ra danh từ để làm câu hỏi từ loại.'],
        ['Hậu tố tính từ và trạng từ: -ful, -ive, -al, -ly', 'VIDEO', 12, 'Một gốc từ, bốn từ loại: success – succeed – successful – successfully.'],
        ['Cụm động từ cơ bản', 'VIDEO', 14, '30 phrasal verb hay gặp: set up, carry out, look forward to…'],
        ['Collocation: những từ hay đi cùng nhau', 'VIDEO', 13, 'make a decision, take part in, meet a deadline…'],
        ['Kiểm tra chặng 3', 'QUIZ', 10, '20 câu chọn dạng từ đúng.'],
      ],
    ],
    [
      'Từ vựng theo chủ đề đề thi',
      [
        ['Văn phòng và công việc', 'VIDEO', 13, 'Thiết bị, giấy tờ, giao việc; chủ đề xuất hiện nhiều nhất trong TOEIC.'],
        ['Tuyển dụng và nhân sự', 'VIDEO', 12, 'Hồ sơ, phỏng vấn, thăng chức, phúc lợi.'],
        ['Hội họp và sự kiện', 'VIDEO', 12, 'Lên lịch, hoãn họp, tổ chức hội thảo.'],
        ['Du lịch và khách sạn', 'VIDEO', 12, 'Đặt phòng, sân bay, hành lý, lịch trình.'],
        ['Giáo dục và môi trường', 'VIDEO', 13, 'Hai chủ đề quen thuộc của bài đọc và bài viết VSTEP.'],
        ['Bài kiểm tra cuối khoá', 'QUIZ', 20, '50 câu tổng hợp; từ sai được đưa vào sổ từ để ôn lại.'],
      ],
    ],
  ],
  0,
  2,
);

/** Số bài, số giờ và % đã học của một lộ trình */
const pathStats = (sections: CourseSection[]) => {
  const all = sections.flatMap((s) => s.lessons);
  return {
    lessonsCount: all.length,
    durationHours: Math.round(all.reduce((a, l) => a + l.durationMin, 0) / 60),
    progress: Math.round((all.filter((l) => l.isCompleted).length / all.length) * 100),
  };
};

MOCK_COURSES.push(
  {
    id: 'c-path-grammar',
    category: 'GRAMMAR',
    coverUrl: PHOTOS.notes,
    slug: 'ngu-phap-tu-dau',
    title: 'Ngữ pháp tiếng Anh từ đầu',
    examType: 'TOEIC',
    level: 'Mất gốc → B1',
    description: 'Học lại ngữ pháp từ câu đơn giản nhất đến các cấu trúc hay gặp trong đề TOEIC và VSTEP. Mỗi bài một video ngắn, học xong bài trước mới mở bài sau.',
    gradient: 'from-indigo-500 to-violet-600',
    ...pathStats(GRAMMAR_PATH),
    studentsCount: 7412,
    rating: 4.8,
    isFree: true,
    teacherName: 'Trần Thu Hà',
    sections: GRAMMAR_PATH,
  },
  {
    id: 'c-path-vocab',
    category: 'VOCABULARY',
    coverUrl: PHOTOS.flatlay,
    slug: 'tu-vung-tu-dau',
    title: 'Từ vựng tiếng Anh từ đầu',
    examType: 'TOEIC',
    level: 'Mất gốc → B1',
    description: 'Bắt đầu từ phát âm và cách học từ, sau đó đi qua từ vựng hằng ngày, cấu tạo từ và các chủ đề hay ra trong đề thi.',
    gradient: 'from-rose-500 to-pink-600',
    ...pathStats(VOCAB_PATH),
    studentsCount: 5389,
    rating: 4.7,
    isFree: true,
    teacherName: 'Phạm Ngọc Linh',
    sections: VOCAB_PATH,
  },
);

/** Đường dẫn trang lộ trình theo loại khoá */
export const LESSON_PATH_SLUG: Record<Exclude<CourseCategory, 'EXAM'>, string> = { GRAMMAR: 'ngu-phap', VOCABULARY: 'tu-vung' };

/** Link mở một khoá: lộ trình nền tảng → trang danh sách bài; khoá luyện thi → trang giới thiệu / học (học viên) */
export const courseHref = (c: Course, student = false) =>
  c.category && c.category !== 'EXAM' ? `/courses/${LESSON_PATH_SLUG[c.category]}` : student ? `/app/courses/${c.id}` : `/courses/${c.id}`;

export const DICTIONARY: Record<string, DictionaryEntry> = {
  economical: { word: 'economical', ipa: '/ˌiː.kəˈnɒm.ɪ.kəl/', pos: 'adjective', meaningVi: 'tiết kiệm, không lãng phí', meaningEn: 'not using more of something than is necessary', example: 'This car is very economical to run.' },
  economic: { word: 'economic', ipa: '/ˌiː.kəˈnɒm.ɪk/', pos: 'adjective', meaningVi: 'thuộc về kinh tế', meaningEn: 'relating to trade, industry and money', example: 'The country is facing an economic crisis.' },
  significantly: { word: 'significantly', ipa: '/sɪɡˈnɪf.ɪ.kənt.li/', pos: 'adverb', meaningVi: 'một cách đáng kể', meaningEn: 'in a way that is easy to see or by a large amount', example: 'Profits have increased significantly this year.' },
  adverb: { word: 'adverb', ipa: '/ˈæd.vɜːb/', pos: 'noun', meaningVi: 'trạng từ', meaningEn: 'a word that describes a verb, adjective or another adverb', example: '"Quickly" is an adverb.' },
  adjective: { word: 'adjective', ipa: '/ˈædʒ.ek.tɪv/', pos: 'noun', meaningVi: 'tính từ', meaningEn: 'a word that describes a noun', example: '"Big" is an adjective.' },
  predicted: { word: 'predict', ipa: '/prɪˈdɪkt/', pos: 'verb', meaningVi: 'dự đoán', meaningEn: 'to say what will happen in the future', example: 'Analysts predicted strong growth.' },
  comparative: { word: 'comparative', ipa: '/kəmˈpær.ə.tɪv/', pos: 'adjective', meaningVi: 'so sánh hơn', meaningEn: 'the form of an adjective or adverb that expresses more', example: '"Better" is the comparative of "good".' },
  modifies: { word: 'modify', ipa: '/ˈmɒd.ɪ.faɪ/', pos: 'verb', meaningVi: 'bổ nghĩa; sửa đổi', meaningEn: 'to change something slightly; (grammar) to describe', example: 'Adverbs modify verbs.' },
  signals: { word: 'signal', ipa: '/ˈsɪɡ.nəl/', pos: 'verb', meaningVi: 'báo hiệu', meaningEn: 'to be a sign that something is going to happen', example: 'Dark clouds signal rain.' },
  rarely: { word: 'rarely', ipa: '/ˈreə.li/', pos: 'adverb', meaningVi: 'hiếm khi', meaningEn: 'not often', example: 'She rarely goes out at night.' },
  root: { word: 'root', ipa: '/ruːt/', pos: 'noun', meaningVi: 'gốc từ', meaningEn: 'the basic form of a word from which other words are made', example: '"Act" is the root of "action".' },
  proposal: { word: 'proposal', ipa: '/prəˈpəʊ.zəl/', pos: 'noun', meaningVi: 'đề xuất, bản đề nghị', meaningEn: 'a suggestion or plan, often written', example: 'The board rejected the merger proposal.' },
};

export function lookupWord(raw: string): DictionaryEntry {
  const key = raw.toLowerCase().replace(/[^a-z]/g, '');
  return (
    DICTIONARY[key] ?? {
      word: key,
      ipa: `/${key}/`,
      pos: 'word',
      meaningVi: 'Từ này chưa có trong từ điển mẫu. Hãy thêm vào sổ từ để tra cứu sau.',
      meaningEn: 'No sample definition available.',
      example: '',
    }
  );
}

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'g-01',
    slug: 'thi-hien-tai-don',
    title: 'Thì Hiện tại đơn & Hiện tại tiếp diễn',
    level: 'A2–B1',
    category: 'Thì động từ',
    summary: 'Phân biệt thói quen, sự thật hiển nhiên với hành động đang diễn ra. Dấu hiệu nhận biết: always, usually, now, at the moment.',
    rules: [
      { title: 'Hiện tại đơn', detail: 'S + V(s/es). Diễn tả thói quen, sự thật, lịch trình cố định.', example: 'The train leaves at 8 a.m. every day.' },
      { title: 'Hiện tại tiếp diễn', detail: 'S + am/is/are + V-ing. Hành động đang xảy ra hoặc kế hoạch gần.', example: 'She is preparing the report right now.' },
    ],
    questionsCount: 25,
    progress: 100,
  },
  {
    id: 'g-02',
    slug: 'hien-tai-hoan-thanh',
    title: 'Hiện tại hoàn thành vs Quá khứ đơn',
    level: 'B1',
    category: 'Thì động từ',
    summary: 'Kết quả hiện tại vs hành động đã kết thúc tại thời điểm xác định trong quá khứ.',
    rules: [
      { title: 'Hiện tại hoàn thành', detail: 'S + have/has + V3. Dấu hiệu: since, for, already, yet, recently.', example: 'We have already submitted the proposal.' },
      { title: 'Quá khứ đơn', detail: 'S + V2. Dấu hiệu: yesterday, last week, in 2020, ago.', example: 'The company opened a branch in 2020.' },
    ],
    questionsCount: 30,
    progress: 80,
  },
  {
    id: 'g-03',
    slug: 'tu-loai-word-form',
    title: 'Từ loại (Word Form)',
    level: 'A2–B2',
    category: 'Từ loại',
    summary: 'Nhận biết danh từ, động từ, tính từ, trạng từ qua hậu tố và vị trí trong câu. Dạng câu hỏi chiếm ~30% Part 5.',
    rules: [
      { title: 'Vị trí tính từ', detail: 'Trước danh từ hoặc sau linking verb (be, seem, become).', example: 'an economical car / The plan seems reasonable.' },
      { title: 'Vị trí trạng từ', detail: 'Bổ nghĩa động từ, tính từ, trạng từ khác; giữa trợ động từ và động từ chính.', example: 'Sales have significantly increased.' },
      { title: 'Hậu tố thường gặp', detail: 'Danh từ: -tion, -ment, -ness, -ity. Tính từ: -ful, -ive, -al, -ous. Trạng từ: -ly.', example: 'competition / competitive / competitively' },
    ],
    questionsCount: 40,
    progress: 65,
  },
  {
    id: 'g-04',
    slug: 'gioi-tu',
    title: 'Giới từ thời gian & nơi chốn',
    level: 'A2–B1',
    category: 'Giới từ',
    summary: 'in/on/at, by/until, during/for/while — bộ ba cặp giới từ hay bị nhầm nhất.',
    rules: [
      { title: 'by vs until', detail: '"by" = hạn chót (muộn nhất); "until" = kéo dài liên tục đến.', example: 'Submit by Friday. / The office is open until 6 p.m.' },
      { title: 'during vs while', detail: '"during" + danh từ; "while" + mệnh đề.', example: 'during the meeting / while we were meeting' },
    ],
    questionsCount: 25,
    progress: 40,
  },
  {
    id: 'g-05',
    slug: 'menh-de-quan-he',
    title: 'Mệnh đề quan hệ',
    level: 'B1–B2',
    category: 'Mệnh đề',
    summary: 'who, whom, which, that, whose và rút gọn mệnh đề quan hệ bằng V-ing / V3.',
    rules: [
      { title: 'Đại từ quan hệ', detail: 'who (người – chủ ngữ), whom (người – tân ngữ), which (vật), whose (sở hữu).', example: 'Employees who wish to attend must register.' },
      { title: 'Rút gọn', detail: 'Chủ động → V-ing; bị động → V3.', example: 'The report (which was) submitted yesterday...' },
    ],
    questionsCount: 30,
    progress: 20,
  },
  {
    id: 'g-06',
    slug: 'lien-tu',
    title: 'Liên từ & Từ nối',
    level: 'B1–B2',
    category: 'Liên từ',
    summary: 'although/despite, because/because of, however/therefore — phân biệt liên từ, giới từ và trạng từ liên kết.',
    rules: [
      { title: 'Liên từ + mệnh đề', detail: 'although, because, while, whereas, so that.', example: 'Although it rained, the event went ahead.' },
      { title: 'Giới từ + danh từ', detail: 'despite, in spite of, because of, due to.', example: 'Despite the rain, the event went ahead.' },
    ],
    questionsCount: 25,
    progress: 0,
  },
  {
    id: 'g-07',
    slug: 'cau-bi-dong',
    title: 'Câu bị động',
    level: 'B1',
    category: 'Cấu trúc câu',
    summary: 'be + V3 ở các thì; bị động với động từ khuyết thiếu; bẫy Part 1 "is being + V3".',
    rules: [{ title: 'Công thức', detail: 'S + be (chia thì) + V3 (+ by O).', example: 'The parking lot will be closed for resurfacing.' }],
    questionsCount: 20,
    progress: 0,
  },
  {
    id: 'g-08',
    slug: 'cau-dieu-kien',
    title: 'Câu điều kiện',
    level: 'B1–B2',
    category: 'Cấu trúc câu',
    summary: 'Loại 1, 2, 3 và câu điều kiện hỗn hợp; đảo ngữ với Should/Were/Had.',
    rules: [{ title: 'Đảo ngữ loại 1', detail: 'Should + S + V, ...', example: 'Should you have any questions, please contact us.' }],
    questionsCount: 25,
    progress: 0,
  },
];
