import { PHOTOS } from '@/shared/components/media/Img';
import type { Course, CourseSection, DictionaryEntry, GrammarTopic, Lesson, TranscriptLine } from '@/shared/types';

export const SAMPLE_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const SAMPLE_TRANSCRIPT: TranscriptLine[] = [
  { start: 0, end: 6, text: 'Welcome back to OrbiLingo. In today\'s lesson we are going to look at word forms in English.', textVi: 'Chào mừng trở lại OrbiLingo. Hôm nay chúng ta sẽ tìm hiểu về từ loại trong tiếng Anh.' },
  { start: 6, end: 13, text: 'Many English words have a family: a noun, a verb, an adjective and an adverb that share the same root.', textVi: 'Nhiều từ tiếng Anh có một "gia đình": danh từ, động từ, tính từ và trạng từ cùng chung một gốc từ.' },
  { start: 13, end: 20, text: 'For example, economy, economic and economical all come from the same root, but they do different jobs in a sentence.', textVi: 'Ví dụ economy, economic và economical có cùng gốc từ, nhưng mỗi từ làm một nhiệm vụ khác nhau trong câu.' },
  { start: 20, end: 28, text: 'Look at the word before the gap. An article or an adjective usually signals a noun.', textVi: 'Hãy nhìn từ đứng trước chỗ trống. Mạo từ hoặc tính từ thường báo hiệu một danh từ.' },
  { start: 28, end: 36, text: 'If the word describes how an action happens, you need an adverb, like "carefully" or "significantly".', textVi: 'Nếu từ đó mô tả hành động diễn ra thế nào, bạn cần một trạng từ, ví dụ "carefully" hay "significantly".' },
  { start: 36, end: 44, text: 'Remember: adjectives describe nouns, adverbs describe verbs, adjectives and other adverbs.', textVi: 'Hãy nhớ: tính từ bổ nghĩa cho danh từ, trạng từ bổ nghĩa cho động từ, tính từ và trạng từ khác.' },
  { start: 44, end: 52, text: 'Let\'s practise. "Prices this year are ______ higher than last year." Which word fits?', textVi: 'Cùng luyện tập. "Prices this year are ______ higher than last year." Từ nào phù hợp?' },
  { start: 52, end: 60, text: 'The gap modifies the comparative adjective "higher", so the answer is the adverb "significantly".', textVi: 'Chỗ trống bổ nghĩa cho tính từ so sánh hơn "higher", nên đáp án là trạng từ "significantly".' },
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

// ---------- 3 lộ trình kiến thức chung: học lần lượt từ Bài 1, bài sau mở khi xong bài trước ----------
type PathLesson = [title: string, type: Lesson['type'], durationMin: number, summary: string];

/** Dựng các chặng: `done` bài đầu đã học, bài kế tiếp đang mở, các bài sau khoá; `free` bài đầu cho học thử */
const mkPath = (prefix: string, chapters: [title: string, lessons: PathLesson[], part?: string][], done: number, free: number): CourseSection[] => {
  let n = 0;
  return chapters.map(([title, lessons, part], si) => ({
    id: `${prefix}-s${si + 1}`,
    title,
    part,
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
      'Nền móng của câu',
      [
        ['Một câu tiếng Anh gồm những gì', 'VIDEO', 12, 'Chủ ngữ, động từ, tân ngữ, bổ ngữ: chỉ ra từng phần trong một câu bất kỳ.'],
        ['8 từ loại và cách nhận ra từng loại', 'VIDEO', 14, 'Danh từ, động từ, tính từ, trạng từ, đại từ, giới từ, liên từ, thán từ.'],
        ['Danh từ đếm được, không đếm được và số nhiều', 'VIDEO', 13, 'Quy tắc thêm -s/-es, danh từ số nhiều bất quy tắc.'],
        ['Mạo từ a, an, the', 'VIDEO', 12, 'Khi nào dùng a/an, khi nào dùng the, khi nào không cần mạo từ.'],
        ['Đại từ: nhân xưng, tân ngữ, sở hữu, phản thân', 'VIDEO', 13, 'I – me – my – mine – myself: chọn đúng dạng theo vị trí trong câu.'],
        ['Từ chỉ số lượng: some, any, much, many, a few, a little', 'VIDEO', 12, 'Đi với danh từ đếm được hay không đếm được.'],
        ['Kiểm tra chặng 1', 'QUIZ', 10, '15 câu trắc nghiệm, đúng từ 10 câu để mở chặng tiếp theo.'],
      ],
    ],
    [
      'Động từ và các thì đơn, tiếp diễn',
      [
        ['Động từ to be', 'VIDEO', 12, 'am, is, are, was, were trong câu khẳng định, phủ định, câu hỏi.'],
        ['Thì hiện tại đơn', 'VIDEO', 15, 'Thói quen, sự thật hiển nhiên; thêm -s/-es cho ngôi thứ ba số ít.'],
        ['Thì hiện tại tiếp diễn', 'VIDEO', 13, 'Việc đang diễn ra lúc nói và kế hoạch đã sắp xếp.'],
        ['Thì quá khứ đơn và động từ bất quy tắc', 'VIDEO', 16, 'Kể lại việc đã xong; 50 động từ bất quy tắc dùng nhiều nhất.'],
        ['Thì quá khứ tiếp diễn', 'VIDEO', 12, 'Việc đang xảy ra tại một thời điểm trong quá khứ, có việc khác xen vào.'],
        ['Tương lai đơn và be going to', 'VIDEO', 12, 'Quyết định tức thời khác dự định có sẵn thế nào.'],
        ['Kiểm tra chặng 2', 'QUIZ', 12, '20 câu chia động từ theo ngữ cảnh.'],
      ],
    ],
    [
      'Các thì hoàn thành',
      [
        ['Thì hiện tại hoàn thành', 'VIDEO', 15, 'have/has + V3; since, for, already, yet, just, ever, never.'],
        ['Hiện tại hoàn thành tiếp diễn', 'VIDEO', 12, 'Nhấn mạnh việc kéo dài liên tục đến hiện tại.'],
        ['Hiện tại hoàn thành hay quá khứ đơn?', 'VIDEO', 14, 'Cặp thì người học hay nhầm nhất, so sánh qua ví dụ.'],
        ['Thì quá khứ hoàn thành', 'VIDEO', 13, 'Việc xảy ra trước một mốc hoặc một việc khác trong quá khứ.'],
        ['Tương lai tiếp diễn và tương lai hoàn thành', 'VIDEO', 13, 'Việc sẽ đang diễn ra, việc sẽ xong trước một mốc tương lai.'],
        ['Tổng hợp 12 thì trong một bảng', 'READING', 10, 'Công thức, cách dùng và dấu hiệu nhận biết đặt cạnh nhau.'],
        ['Kiểm tra chặng 3', 'QUIZ', 12, '20 câu chọn thì đúng.'],
      ],
    ],
    [
      'Tính từ, trạng từ và giới từ',
      [
        ['Tính từ và trật tự tính từ', 'VIDEO', 13, 'Vị trí của tính từ; a beautiful old wooden house.'],
        ['Trạng từ và trạng từ chỉ tần suất', 'VIDEO', 12, 'Đuôi -ly, vị trí của always, usually, often, never.'],
        ['So sánh bằng, so sánh hơn, so sánh nhất', 'VIDEO', 15, 'Tính từ ngắn, tính từ dài và các dạng bất quy tắc.'],
        ['Giới từ chỉ thời gian: in, on, at', 'VIDEO', 11, 'in May, on Monday, at 7 a.m. và các ngoại lệ.'],
        ['Giới từ chỉ nơi chốn và phương hướng', 'VIDEO', 12, 'in, on, at, under, between, next to, through, across.'],
        ['Giới từ đi sau động từ và tính từ', 'VIDEO', 13, 'depend on, interested in, good at, afraid of…'],
        ['Kiểm tra chặng 4', 'QUIZ', 12, '20 câu tổng hợp tính từ, trạng từ, giới từ.'],
      ],
    ],
    [
      'Các kiểu câu',
      [
        ['Câu hỏi Yes/No và câu hỏi Wh-', 'VIDEO', 13, 'Đảo trợ động từ; what, where, when, why, who, how.'],
        ['Câu hỏi đuôi', 'VIDEO', 11, "You're a student, aren't you? và các trường hợp đặc biệt."],
        ['There is / There are', 'VIDEO', 10, 'Nói về sự tồn tại của người, vật ở hiện tại và quá khứ.'],
        ['Câu mệnh lệnh, lời mời và lời đề nghị', 'VIDEO', 11, "Let's, Why don't we, Would you like, Could you…"],
        ['Động từ khuyết thiếu: can, could, must, should, may, might', 'VIDEO', 15, 'Khả năng, nghĩa vụ, lời khuyên, sự cho phép, phỏng đoán.'],
        ['Kiểm tra chặng 5', 'QUIZ', 12, '20 câu đặt câu hỏi và chọn động từ khuyết thiếu.'],
      ],
    ],
    [
      'Động từ nâng cao',
      [
        ['V-ing hay to V sau động từ', 'VIDEO', 14, 'enjoy doing, decide to do, và nhóm động từ đi được cả hai.'],
        ['Câu bị động', 'VIDEO', 16, 'be + V3 ở các thì đã học; khi nào nên dùng bị động.'],
        ['Câu nhờ vả: have / get something done', 'VIDEO', 10, 'I had my hair cut. She got her car repaired.'],
        ['used to, be used to, get used to', 'VIDEO', 11, 'Thói quen trong quá khứ khác với việc đã quen làm gì.'],
        ['Kiểm tra chặng 6', 'QUIZ', 12, '20 câu chọn dạng động từ.'],
      ],
    ],
    [
      'Mệnh đề và câu phức',
      [
        ['Liên từ và từ nối', 'VIDEO', 14, 'and, but, so, because, although, however, therefore.'],
        ['Mệnh đề quan hệ: who, which, that, whose, where', 'VIDEO', 15, 'Nối hai câu thành một; mệnh đề xác định và không xác định.'],
        ['Rút gọn mệnh đề quan hệ', 'VIDEO', 11, 'Dùng V-ing, V3 và to V để câu gọn hơn.'],
        ['Câu điều kiện loại 0, 1, 2, 3 và hỗn hợp', 'VIDEO', 17, 'Điều kiện có thật, không có thật ở hiện tại và trong quá khứ.'],
        ['Câu ước: wish, if only', 'VIDEO', 11, 'Ước cho hiện tại, quá khứ và tương lai.'],
        ['Câu tường thuật', 'VIDEO', 14, 'Lùi thì, đổi đại từ và trạng từ; tường thuật câu hỏi, mệnh lệnh.'],
        ['Mệnh đề danh từ: that, what, whether', 'VIDEO', 12, 'Dùng cả một mệnh đề làm chủ ngữ hoặc tân ngữ.'],
        ['Kiểm tra chặng 7', 'QUIZ', 15, '25 câu nối câu và viết lại câu.'],
      ],
    ],
    [
      'Cấu trúc nâng cao',
      [
        ['so … that, such … that, too, enough', 'VIDEO', 11, 'Diễn tả mức độ và kết quả.'],
        ['Câu chẻ: It is … that …', 'VIDEO', 10, 'Nhấn mạnh một thành phần trong câu.'],
        ['Câu giả định: suggest, recommend, it is important that', 'VIDEO', 11, 'Động từ nguyên mẫu sau các động từ, tính từ chỉ đề nghị.'],
        ['Đảo ngữ', 'VIDEO', 13, 'Never have I…, Not only … but also…, Should you…'],
        ['Bài kiểm tra cuối khoá', 'QUIZ', 30, '50 câu tổng hợp; có bảng điểm từng chủ điểm sau khi nộp để biết cần ôn lại phần nào.'],
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
      'Phát âm nền tảng',
      [
        ['Học phát âm bắt đầu từ đâu', 'VIDEO', 10, 'Vì sao nên học bảng IPA trước khi học từ mới.'],
        ['Nguyên âm đơn', 'VIDEO', 14, '12 nguyên âm đơn, so sánh cặp ngắn – dài như /ɪ/ và /iː/.'],
        ['Nguyên âm đôi', 'VIDEO', 12, '8 nguyên âm đôi: /eɪ/, /aɪ/, /ɔɪ/, /əʊ/, /aʊ/…'],
        ['Phụ âm vô thanh và hữu thanh', 'VIDEO', 14, '24 phụ âm, đặt tay lên cổ để cảm nhận độ rung.'],
        ['Các cặp âm người Việt hay nhầm', 'VIDEO', 13, '/θ/ – /ð/, /ʃ/ – /s/, /l/ – /n/, /v/ – /w/.'],
        ['Âm cuối, đuôi -s/-es và -ed', 'VIDEO', 13, 'Đọc đúng /s/, /z/, /ɪz/ và /t/, /d/, /ɪd/.'],
        ['Kiểm tra chặng 1', 'QUIZ', 8, 'Nghe và chọn phiên âm đúng cho 15 từ.'],
      ],
    ],
    [
      'Trọng âm và ngữ điệu',
      [
        ['Trọng âm của từ hai âm tiết', 'VIDEO', 12, 'Quy tắc cho danh từ, động từ, tính từ hai âm tiết.'],
        ['Trọng âm của từ nhiều âm tiết', 'VIDEO', 13, 'Trọng âm theo đuôi: -tion, -ic, -ity, -ical…'],
        ['Trọng âm câu: từ nội dung và từ chức năng', 'VIDEO', 12, 'Nhấn từ mang nghĩa, đọc lướt từ chức năng.'],
        ['Nối âm và nuốt âm', 'VIDEO', 12, 'Vì sao người bản xứ nói nhanh, và cách nghe ra.'],
        ['Ngữ điệu lên và xuống', 'VIDEO', 11, 'Câu hỏi, câu khẳng định, câu liệt kê.'],
        ['Kiểm tra chặng 2', 'QUIZ', 8, 'Chọn trọng âm đúng và nghe ngữ điệu.'],
      ],
    ],
    [
      'Cách học từ và cấu tạo từ',
      [
        ['Học từ vựng thế nào để nhớ lâu', 'VIDEO', 10, 'Học theo cụm, ôn ngắt quãng và cách dùng sổ từ trên OrbiLingo.'],
        ['Đọc hiểu một mục từ trong từ điển', 'VIDEO', 11, 'Phiên âm, từ loại, nghĩa, ví dụ, từ đi kèm.'],
        ['Tiền tố: un-, re-, dis-, pre-, over-, mis-', 'VIDEO', 12, 'Đoán nghĩa từ mới từ phần đầu của từ.'],
        ['Hậu tố tạo danh từ: -tion, -ment, -ness, -er, -ity', 'VIDEO', 12, 'Nhận ra danh từ chỉ qua phần đuôi.'],
        ['Hậu tố tạo tính từ và trạng từ: -ful, -less, -ive, -al, -ly', 'VIDEO', 12, 'Một gốc từ, bốn từ loại: success – succeed – successful – successfully.'],
        ['Từ ghép', 'VIDEO', 10, 'Danh từ ghép, tính từ ghép và cách viết.'],
        ['Kiểm tra chặng 3', 'QUIZ', 10, '20 câu chọn dạng từ đúng.'],
      ],
    ],
    [
      'Từ vựng đời sống hằng ngày',
      [
        ['Số đếm, ngày tháng và giờ giấc', 'VIDEO', 12, 'Đọc số tiền, số điện thoại, năm, ngày tháng.'],
        ['Gia đình và con người', 'VIDEO', 11, 'Quan hệ gia đình, ngoại hình, tính cách.'],
        ['Nhà cửa và sinh hoạt', 'VIDEO', 11, 'Các phòng, đồ dùng và hoạt động trong ngày.'],
        ['Ăn uống và mua sắm', 'VIDEO', 12, 'Món ăn, gọi món, hỏi giá, đổi trả hàng.'],
        ['Đi lại và hỏi đường', 'VIDEO', 11, 'Phương tiện, biển báo, chỉ đường.'],
        ['Sức khoẻ và thời tiết', 'VIDEO', 11, 'Triệu chứng thường gặp, đi khám, mô tả thời tiết.'],
        ['Kiểm tra chặng 4', 'QUIZ', 10, '25 câu điền từ theo tranh và theo ngữ cảnh.'],
      ],
    ],
    [
      'Từ vựng học tập, công việc và xã hội',
      [
        ['Trường lớp và học tập', 'VIDEO', 12, 'Môn học, bằng cấp, thi cử.'],
        ['Công việc và nghề nghiệp', 'VIDEO', 12, 'Tên nghề, nơi làm việc, xin việc.'],
        ['Công nghệ và mạng xã hội', 'VIDEO', 11, 'Thiết bị, ứng dụng, an toàn trên mạng.'],
        ['Môi trường và thiên nhiên', 'VIDEO', 12, 'Ô nhiễm, biến đổi khí hậu, bảo vệ môi trường.'],
        ['Du lịch và văn hoá', 'VIDEO', 12, 'Đặt phòng, sân bay, lễ hội, phong tục.'],
        ['Kiểm tra chặng 5', 'QUIZ', 10, '25 câu theo chủ đề.'],
      ],
    ],
    [
      'Dùng từ tự nhiên',
      [
        ['Collocation: những từ hay đi cùng nhau', 'VIDEO', 13, 'make a decision, take a break, heavy rain…'],
        ['Cụm động từ thông dụng', 'VIDEO', 14, '40 phrasal verb hay dùng: give up, look after, find out…'],
        ['Những cặp từ dễ nhầm', 'VIDEO', 12, 'make – do, say – tell, borrow – lend, lose – miss.'],
        ['Thành ngữ thông dụng', 'VIDEO', 11, '20 thành ngữ người bản xứ hay dùng trong giao tiếp.'],
        ['Bài kiểm tra cuối khoá', 'QUIZ', 25, '50 câu phát âm và từ vựng; từ sai được đưa vào sổ từ để ôn lại.'],
      ],
    ],
  ],
  2,
  2,
);

const REVIEW = 'Ôn kiến thức chung';
const TOPICS = 'Luyện theo chủ đề';

/**
 * Nền tảng TOEIC (B1 → B2), nặng hơn VSTEP.
 * Phần 1 ôn lại kiến thức chung (phát âm, từ loại, thì, cấu trúc câu, từ vựng thông dụng) và chốt bằng bài kiểm tra giữa khoá;
 * Phần 2 mới đưa từng chủ đề công việc để áp dụng và luyện sơ bộ.
 */
const TOEIC_PATH = mkPath(
  'tp',
  [
    [
      'Phát âm và từ loại',
      [
        ['Bảng phiên âm và âm cuối', 'VIDEO', 15, 'Ôn nguyên âm, phụ âm và các âm cuối hay bị bỏ khi nói.'],
        ['Trọng âm của từ', 'VIDEO', 13, 'Quy tắc trọng âm cho từ hai âm tiết và nhiều âm tiết.'],
        ['8 từ loại và vị trí trong câu', 'VIDEO', 16, 'Danh từ, động từ, tính từ, trạng từ… đứng ở đâu trong câu.'],
        ['Hậu tố nhận biết từ loại', 'VIDEO', 14, '-tion, -ment, -ive, -al, -ly: nhìn đuôi đoán từ loại.'],
        ['Ôn tập chặng 1', 'QUIZ', 15, '25 câu phát âm và từ loại.'],
      ],
      REVIEW,
    ],
    [
      'Câu và các thì',
      [
        ['Cấu trúc câu: chủ ngữ, động từ, tân ngữ, bổ ngữ', 'VIDEO', 14, 'Tách một câu dài thành các thành phần chính.'],
        ['Các thì hiện tại', 'VIDEO', 17, 'Hiện tại đơn, tiếp diễn, hoàn thành, hoàn thành tiếp diễn.'],
        ['Các thì quá khứ', 'VIDEO', 16, 'Quá khứ đơn, tiếp diễn, hoàn thành; động từ bất quy tắc.'],
        ['Các thì tương lai', 'VIDEO', 14, 'will, be going to, hiện tại tiếp diễn chỉ tương lai, tương lai hoàn thành.'],
        ['Ôn tập chặng 2', 'QUIZ', 15, '25 câu chia thì theo ngữ cảnh.'],
      ],
      REVIEW,
    ],
    [
      'Các cấu trúc câu quan trọng',
      [
        ['Câu bị động', 'VIDEO', 16, 'be + V3 ở các thì và với động từ khuyết thiếu.'],
        ['So sánh', 'VIDEO', 14, 'So sánh bằng, hơn, nhất và các dạng bất quy tắc.'],
        ['Mệnh đề quan hệ và rút gọn', 'VIDEO', 16, 'who, which, that, whose; rút gọn bằng V-ing, V3.'],
        ['Câu điều kiện', 'VIDEO', 15, 'Loại 1, 2, 3 và câu điều kiện hỗn hợp.'],
        ['V-ing và to V', 'VIDEO', 14, 'Động từ đi với V-ing, đi với to V, đi được cả hai.'],
        ['Ôn tập chặng 3', 'QUIZ', 18, '30 câu tổng hợp các cấu trúc.'],
      ],
      REVIEW,
    ],
    [
      'Từ vựng và mẫu câu thông dụng',
      [
        ['300 từ thông dụng nhất', 'VIDEO', 16, 'Danh từ, động từ, tính từ gặp nhiều nhất trong văn bản và hội thoại.'],
        ['Giới từ và cụm giới từ', 'VIDEO', 15, 'Giới từ thời gian, nơi chốn và cụm động từ + giới từ.'],
        ['Liên từ và từ nối', 'VIDEO', 14, 'and, but, because, although, however, therefore, as a result.'],
        ['Mẫu câu hỏi và đáp thông dụng', 'VIDEO', 13, 'Hỏi thông tin, đề nghị, xin phép, cảm ơn, xin lỗi.'],
        ['Kiểm tra giữa khoá', 'QUIZ', 35, '60 câu tổng hợp Phần 1; đạt từ 60% để mở Phần 2.'],
      ],
      REVIEW,
    ],
    [
      'Công ty và đồng nghiệp',
      [
        ['Từ vựng: phòng ban và chức danh', 'VIDEO', 13, 'Human Resources, Accounting, Sales; manager, supervisor, intern.'],
        ['Áp dụng: các thì hiện tại khi nói về công việc', 'VIDEO', 13, 'Dùng lại kiến thức chặng 2 để nói về việc thường ngày và dự án.'],
        ['Đọc hiểu: trang giới thiệu một công ty', 'VIDEO', 14, 'Lịch sử, sản phẩm, quy mô và các văn phòng.'],
        ['Luyện tập chủ đề', 'QUIZ', 12, '20 câu từ vựng và ngữ pháp trong ngữ cảnh công ty.'],
      ],
      TOPICS,
    ],
    [
      'Lịch làm việc và cuộc hẹn',
      [
        ['Từ vựng: lịch, hạn chót, cuộc hẹn', 'VIDEO', 12, 'schedule, deadline, postpone, reschedule, available.'],
        ['Áp dụng: thì tương lai và giới từ thời gian', 'VIDEO', 13, 'Đặt, dời, huỷ cuộc hẹn; by, until, within, prior to.'],
        ['Nghe hiểu: tin nhắn thoại về lịch hẹn', 'VIDEO', 14, 'Nghe ra người gọi, lý do gọi, thời gian mới.'],
        ['Luyện tập chủ đề', 'QUIZ', 12, '20 câu trong ngữ cảnh lịch hẹn.'],
      ],
      TOPICS,
    ],
    [
      'Email và thư từ công việc',
      [
        ['Từ vựng thư từ', 'VIDEO', 12, 'regarding, attached, forward, confirm, enclose.'],
        ['Áp dụng: câu yêu cầu lịch sự và từ nối', 'VIDEO', 14, 'Could you…?, I would appreciate it if…; however, in addition.'],
        ['Viết email hỏi thông tin và trả lời', 'VIDEO', 16, 'Bố cục: lý do viết, nội dung chính, lời kết.'],
        ['Luyện tập chủ đề', 'QUIZ', 15, '15 câu và một email ngắn để giáo viên nhận xét.'],
      ],
      TOPICS,
    ],
    [
      'Hội họp và số liệu',
      [
        ['Từ vựng cuộc họp và số liệu', 'VIDEO', 13, 'agenda, minutes, figure, rise, decline, remain stable.'],
        ['Áp dụng: so sánh khi trình bày số liệu', 'VIDEO', 14, 'Sales were 20% higher than…, the lowest figure since…'],
        ['Nghe hiểu: một cuộc họp ngắn', 'VIDEO', 15, 'Ai đề xuất gì, quyết định cuối cùng là gì.'],
        ['Luyện tập chủ đề', 'QUIZ', 12, '20 câu trong ngữ cảnh họp và báo cáo.'],
      ],
      TOPICS,
    ],
    [
      'Mua bán và khách hàng',
      [
        ['Từ vựng: báo giá, đơn hàng, hoá đơn', 'VIDEO', 13, 'quote, invoice, discount, refund, warranty.'],
        ['Áp dụng: câu điều kiện và mệnh đề quan hệ', 'VIDEO', 15, 'If you order 500 units…; the model, which was launched last year…'],
        ['Đọc hiểu: quảng cáo, hoá đơn, chính sách đổi trả', 'VIDEO', 15, 'Đối chiếu thông tin giữa các văn bản.'],
        ['Luyện tập chủ đề', 'QUIZ', 12, '20 câu trong ngữ cảnh mua bán.'],
      ],
      TOPICS,
    ],
    [
      'Tuyển dụng và đi công tác',
      [
        ['Từ vựng: tuyển dụng, sân bay, khách sạn', 'VIDEO', 14, 'applicant, position, benefits; itinerary, boarding pass, venue.'],
        ['Áp dụng: hiện tại hoàn thành và câu tường thuật', 'VIDEO', 15, "I've worked in sales for five years.; The manager said that…"],
        ['Đọc hiểu: tin tuyển dụng và lịch trình công tác', 'VIDEO', 15, 'Yêu cầu công việc, quyền lợi; thời gian và địa điểm.'],
        ['Kiểm tra cuối khoá', 'QUIZ', 45, '100 câu tổng hợp cả hai phần kèm một email; có bảng điểm từng mảng kiến thức.'],
      ],
      TOPICS,
    ],
  ],
  0,
  2,
);

/**
 * Nền tảng VSTEP (A2 → B1), nhẹ hơn TOEIC.
 * Phần 1 ôn kiến thức chung cơ bản và chốt bằng bài kiểm tra giữa khoá; Phần 2 đưa chủ đề đời sống để luyện sơ bộ.
 */
const VSTEP_PATH = mkPath(
  'sp',
  [
    [
      'Phát âm và từ loại cơ bản',
      [
        ['Bảng phiên âm cơ bản và âm cuối', 'VIDEO', 12, 'Các âm dễ sai và âm cuối /s/, /t/, /d/.'],
        ['Trọng âm cơ bản', 'VIDEO', 10, 'Trọng âm từ hai âm tiết thường gặp.'],
        ['Từ loại và vị trí trong câu', 'VIDEO', 12, 'Danh từ, động từ, tính từ, trạng từ.'],
        ['Ôn tập chặng 1', 'QUIZ', 10, '20 câu phát âm và từ loại.'],
      ],
      REVIEW,
    ],
    [
      'Câu và các thì cơ bản',
      [
        ['Câu đơn và câu hỏi', 'VIDEO', 11, 'Câu khẳng định, phủ định, câu hỏi Yes/No và Wh-.'],
        ['Hiện tại đơn và hiện tại tiếp diễn', 'VIDEO', 12, 'Thói quen và việc đang diễn ra.'],
        ['Quá khứ đơn', 'VIDEO', 12, 'Động từ có quy tắc và bất quy tắc thường dùng.'],
        ['Tương lai: will và be going to', 'VIDEO', 11, 'Quyết định tức thời và dự định có sẵn.'],
        ['Ôn tập chặng 2', 'QUIZ', 10, '20 câu chia thì.'],
      ],
      REVIEW,
    ],
    [
      'Từ vựng và cấu trúc thông dụng',
      [
        ['300 từ thông dụng nhất', 'VIDEO', 12, 'Những từ gặp nhiều nhất trong đời sống hằng ngày.'],
        ['Giới từ thời gian và nơi chốn', 'VIDEO', 11, 'in, on, at, next to, between, opposite.'],
        ['So sánh hơn và so sánh nhất', 'VIDEO', 11, 'Tính từ ngắn, tính từ dài, dạng bất quy tắc.'],
        ['Liên từ: and, but, because, so', 'VIDEO', 10, 'Nối hai ý thành một câu.'],
        ['Kiểm tra giữa khoá', 'QUIZ', 25, '40 câu tổng hợp Phần 1; đạt từ 60% để mở Phần 2.'],
      ],
      REVIEW,
    ],
    [
      'Bản thân và gia đình',
      [
        ['Từ vựng: gia đình, ngoại hình, tính cách', 'VIDEO', 10, 'parents, siblings, tall, friendly, hard-working.'],
        ['Áp dụng: hiện tại đơn khi giới thiệu bản thân', 'VIDEO', 10, 'Where are you from?, What do you do in your free time?'],
        ['Luyện tập chủ đề', 'QUIZ', 8, '15 câu trong ngữ cảnh gia đình.'],
      ],
      TOPICS,
    ],
    [
      'Học tập và trường lớp',
      [
        ['Từ vựng: môn học và hoạt động ở trường', 'VIDEO', 10, 'subject, lecture, assignment, semester.'],
        ['Áp dụng: viết email cho giảng viên', 'VIDEO', 12, 'Xin phép nghỉ học, hỏi bài tập; lời chào và lời kết.'],
        ['Luyện tập chủ đề', 'QUIZ', 8, '15 câu và một email ngắn.'],
      ],
      TOPICS,
    ],
    [
      'Nhà ở và thành phố',
      [
        ['Từ vựng: nhà cửa và địa điểm', 'VIDEO', 10, 'apartment, neighbourhood, crossroads, market.'],
        ['Áp dụng: giới từ nơi chốn và so sánh', 'VIDEO', 11, 'Chỉ đường, so sánh hai nơi ở.'],
        ['Luyện tập chủ đề', 'QUIZ', 8, '15 câu trong ngữ cảnh nhà ở.'],
      ],
      TOPICS,
    ],
    [
      'Sức khoẻ và lối sống',
      [
        ['Từ vựng: sức khoẻ và thói quen', 'VIDEO', 10, 'headache, exercise, diet, get enough sleep.'],
        ['Áp dụng: should, must khi đưa lời khuyên', 'VIDEO', 11, 'You should drink more water.'],
        ['Luyện tập chủ đề', 'QUIZ', 8, '15 câu trong ngữ cảnh sức khoẻ.'],
      ],
      TOPICS,
    ],
    [
      'Du lịch và môi trường',
      [
        ['Từ vựng: du lịch, lễ hội, môi trường', 'VIDEO', 11, 'destination, souvenir, festival, pollution, recycle.'],
        ['Áp dụng: quá khứ đơn và tương lai khi kể chuyến đi', 'VIDEO', 12, 'Kể lại chuyến đi đã qua và kế hoạch sắp tới.'],
        ['Viết đoạn văn ngắn theo chủ đề', 'VIDEO', 12, 'Câu chủ đề, hai ý kèm ví dụ, câu kết.'],
        ['Kiểm tra cuối khoá', 'QUIZ', 30, '60 câu tổng hợp cả hai phần kèm một đoạn văn; giáo viên chấm phần viết.'],
      ],
      TOPICS,
    ],
  ],
  0,
  2,
);

/** Ghi chú hiển thị dưới tiêu đề mỗi phần */
export const COURSE_PART_NOTE: Record<string, string> = {
  [REVIEW]: 'Ôn lại kiến thức chung trước khi vào chủ đề. Kết thúc bằng bài kiểm tra giữa khoá.',
  [TOPICS]: 'Mở sau bài kiểm tra giữa khoá. Mỗi chủ đề dùng lại kiến thức đã ôn ở Phần 1 để luyện sơ bộ.',
};

/** Số bài, số giờ và % đã học của một lộ trình */
const pathStats = (sections: CourseSection[]) => {
  const all = sections.flatMap((s) => s.lessons);
  return {
    lessonsCount: all.length,
    durationHours: Math.round(all.reduce((a, l) => a + l.durationMin, 0) / 60),
    progress: Math.round((all.filter((l) => l.isCompleted).length / all.length) * 100),
  };
};

/** Mục Khoá học: 2 lộ trình kiến thức chung (Ngữ pháp, Từ vựng và Phát âm) + Kiến thức nền tảng tách riêng TOEIC và VSTEP */
export const MOCK_COURSES: Course[] = [
  {
    id: 'c-grammar',
    category: 'GRAMMAR',
    slug: 'ngu-phap',
    coverUrl: PHOTOS.notes,
    title: 'Ngữ pháp tiếng Anh',
    level: 'Từ mất gốc',
    description: 'Toàn bộ ngữ pháp tiếng Anh, đi từ thành phần của một câu đến các cấu trúc nâng cao. Mỗi bài một video ngắn, học xong bài trước mới mở bài sau.',
    gradient: 'from-indigo-500 to-violet-600',
    ...pathStats(GRAMMAR_PATH),
    studentsCount: 7412,
    rating: 4.8,
    isFree: true,
    teacherName: 'Trần Thu Hà',
    sections: GRAMMAR_PATH,
  },
  {
    id: 'c-vocab',
    category: 'VOCABULARY',
    slug: 'tu-vung-phat-am',
    coverUrl: PHOTOS.flatlay,
    title: 'Từ vựng và Phát âm',
    level: 'Từ mất gốc',
    description: 'Bắt đầu từ bảng phiên âm IPA, trọng âm và ngữ điệu, sau đó học cách ghi nhớ từ, cấu tạo từ và từ vựng theo chủ đề đời sống.',
    gradient: 'from-rose-500 to-pink-600',
    ...pathStats(VOCAB_PATH),
    studentsCount: 5389,
    rating: 4.7,
    isFree: true,
    teacherName: 'Phạm Ngọc Linh',
    sections: VOCAB_PATH,
  },
  {
    id: 'c-toeic-basic',
    category: 'FOUNDATION',
    examType: 'TOEIC',
    slug: 'nen-tang-toeic',
    coverUrl: PHOTOS.office,
    title: 'Nền tảng TOEIC',
    level: 'B1 → B2',
    description: 'Phần 1 ôn lại kiến thức chung: phát âm, từ loại, các thì, cấu trúc câu, từ vựng thông dụng. Qua bài kiểm tra giữa khoá mới sang Phần 2, luyện theo từng chủ đề công việc. Nặng hơn VSTEP.',
    gradient: 'from-indigo-500 to-violet-600',
    ...pathStats(TOEIC_PATH),
    studentsCount: 6208,
    rating: 4.8,
    isFree: true,
    teacherName: 'Lê Quốc Bảo',
    sections: TOEIC_PATH,
  },
  {
    id: 'c-vstep-basic',
    category: 'FOUNDATION',
    examType: 'VSTEP',
    slug: 'nen-tang-vstep',
    coverUrl: PHOTOS.library,
    title: 'Nền tảng VSTEP',
    level: 'A2 → B1',
    description: 'Phần 1 ôn kiến thức chung cơ bản: phát âm, từ loại, các thì cơ bản, từ vựng và cấu trúc thông dụng. Qua bài kiểm tra giữa khoá mới sang Phần 2, luyện theo chủ đề đời sống. Nhẹ hơn TOEIC, mục tiêu B1.',
    gradient: 'from-emerald-500 to-teal-600',
    ...pathStats(VSTEP_PATH),
    studentsCount: 4126,
    rating: 4.7,
    isFree: true,
    teacherName: 'Phạm Ngọc Linh',
    sections: VSTEP_PATH,
  },
];

/** Link trang danh sách bài của một khoá */
export const courseHref = (c: Course) => `/courses/${c.slug}`;

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
