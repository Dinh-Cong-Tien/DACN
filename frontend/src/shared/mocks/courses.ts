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

// ---------- Kỹ năng tiếng Anh: học để dùng, không gắn với kỳ thi ----------
const SPEAKING_PATH = mkPath(
  'sp',
  [
    [
      'Làm quen',
      [
        ['Chào hỏi và giới thiệu bản thân', 'VIDEO', 10, "Hi, I'm…, Nice to meet you; nói tên, quê, công việc trong 30 giây."],
        ['Hỏi lại khi chưa nghe rõ', 'VIDEO', 8, 'Sorry, could you say that again?, What does … mean?'],
        ['Nói về sở thích và thời gian rảnh', 'VIDEO', 10, 'I really enjoy…, I’m into…, How about you?'],
        ['Giữ cuộc trò chuyện tiếp tục', 'VIDEO', 11, 'Hỏi thêm một câu, phản hồi ngắn: Really?, That sounds fun.'],
        ['Luyện nói: giới thiệu bản thân', 'QUIZ', 10, 'Ghi âm 1 phút giới thiệu bản thân; giáo viên nhận xét phát âm và độ trôi chảy.'],
      ],
    ],
    [
      'Sinh hoạt hằng ngày',
      [
        ['Gọi món ở quán cà phê, nhà hàng', 'VIDEO', 11, "I'd like…, Can I get…?, Could we have the bill, please?"],
        ['Mua sắm, hỏi giá và đổi trả', 'VIDEO', 11, 'How much is this?, Do you have it in a smaller size?'],
        ['Hỏi đường và chỉ đường', 'VIDEO', 10, 'Go straight, turn left at…, It’s opposite the bank.'],
        ['Gọi điện và để lại lời nhắn', 'VIDEO', 10, 'Could I speak to…?, Can I leave a message?'],
        ['Đặt lịch hẹn, hoãn và huỷ hẹn', 'VIDEO', 10, 'Are you free on…?, Something came up, can we reschedule?'],
        ['Luyện nói: đóng vai theo tình huống', 'QUIZ', 12, 'Đóng vai khách hàng ở 3 tình huống, ghi âm câu trả lời.'],
      ],
    ],
    [
      'Du lịch',
      [
        ['Ở sân bay: làm thủ tục, an ninh, hải quan', 'VIDEO', 12, 'Window or aisle?, Anything to declare?'],
        ['Khách sạn: nhận phòng, báo sự cố, trả phòng', 'VIDEO', 11, 'I have a reservation under…, The air conditioner isn’t working.'],
        ['Đi taxi, xe buýt, tàu', 'VIDEO', 9, 'How long does it take to…?, Does this bus go to…?'],
        ['Khi gặp sự cố: lạc đồ, ốm, nhờ giúp đỡ', 'VIDEO', 10, "I've lost my passport. I need to see a doctor."],
        ['Luyện nói: một ngày đi du lịch', 'QUIZ', 12, 'Nói liền mạch qua 4 tình huống từ sân bay đến khách sạn.'],
      ],
    ],
    [
      'Bày tỏ ý kiến',
      [
        ['Đồng ý, không đồng ý một cách lịch sự', 'VIDEO', 11, "I see your point, but…, I'm not so sure about that."],
        ['Đưa lời khuyên và gợi ý', 'VIDEO', 10, 'If I were you…, Have you thought about…?'],
        ['Kể chuyện: một trải nghiệm đáng nhớ', 'VIDEO', 12, 'Mở đầu, diễn biến, kết thúc; từ nối first, then, in the end.'],
        ['Nói về một chủ đề trong 2 phút', 'VIDEO', 12, 'Lên ý nhanh, nói theo dàn ý, tự sửa khi nói sai.'],
        ['Bài nói cuối khoá', 'QUIZ', 20, 'Trò chuyện 5 phút với giáo viên qua video; chấm theo phát âm, từ vựng, độ trôi chảy.'],
      ],
    ],
  ],
  1,
  2,
);

const LISTENING_PATH = mkPath(
  'lp',
  [
    [
      'Nghe từng âm, từng từ',
      [
        ['Vì sao nghe không ra dù biết từ', 'VIDEO', 10, 'Chữ viết khác âm thanh: âm yếu, nối âm, nuốt âm.'],
        ['Nối âm giữa phụ âm và nguyên âm', 'VIDEO', 11, 'turn_off, pick_it_up: nghe cả cụm thay vì từng từ.'],
        ['Âm yếu: to, of, can, and khi nói nhanh', 'VIDEO', 11, 'Dạng yếu /tə/, /əv/, /kən/ của các từ chức năng.'],
        ['Số đếm, ngày tháng, giá tiền', 'VIDEO', 10, 'fifteen hay fifty; nghe số điện thoại, giờ, giá.'],
        ['Nghe chép chính tả ngắn', 'QUIZ', 10, '10 câu ngắn, gõ lại đúng từng từ.'],
      ],
    ],
    [
      'Nghe hội thoại ngắn',
      [
        ['Nghe ý chính trước, chi tiết sau', 'VIDEO', 11, 'Ai nói với ai, ở đâu, về việc gì.'],
        ['Hội thoại ở cửa hàng và nhà hàng', 'VIDEO', 10, 'Tốc độ chậm, sau đó nghe lại ở tốc độ thật.'],
        ['Hội thoại qua điện thoại', 'VIDEO', 10, 'Không có hình ảnh hỗ trợ; chú ý tên, số, thời gian.'],
        ['Phân biệt giọng Anh – Mỹ – Úc', 'VIDEO', 12, 'Cùng một câu nói bằng ba giọng; các âm khác nhau rõ nhất.'],
        ['Kiểm tra chặng 2', 'QUIZ', 12, '15 câu nghe hội thoại ngắn.'],
      ],
    ],
    [
      'Nghe bài nói dài',
      [
        ['Thông báo nơi công cộng', 'VIDEO', 10, 'Sân bay, nhà ga, siêu thị: nắm thông tin cần làm theo.'],
        ['Ghi chú khi nghe', 'VIDEO', 11, 'Viết tắt, kí hiệu, chỉ ghi từ khoá.'],
        ['Nghe podcast tốc độ vừa', 'VIDEO', 14, 'Một đoạn podcast 5 phút về đời sống, có bản ghi chữ.'],
        ['Nghe bài giảng ngắn', 'VIDEO', 14, 'Nhận ra cấu trúc: mở đầu, các ý chính, kết luận.'],
        ['Kiểm tra chặng 3', 'QUIZ', 12, '15 câu nghe đoạn dài.'],
      ],
    ],
    [
      'Nghe tốc độ thật',
      [
        ['Phim và chương trình truyền hình', 'VIDEO', 13, 'Nghe có phụ đề tiếng Anh, sau đó tắt phụ đề.'],
        ['Tin tức', 'VIDEO', 13, 'Từ vựng thời sự thường gặp, câu dài, tốc độ nhanh.'],
        ['Shadowing: nghe và nói đuổi', 'VIDEO', 12, 'Nhại theo người nói để quen nhịp và ngữ điệu.'],
        ['Bài kiểm tra cuối khoá', 'QUIZ', 25, '30 câu từ hội thoại ngắn đến bài nói dài, tốc độ thật.'],
      ],
    ],
  ],
  0,
  2,
);

const WRITING_PATH = mkPath(
  'wp',
  [
    [
      'Viết câu đúng',
      [
        ['Câu đơn: chủ ngữ + động từ', 'VIDEO', 10, 'Lỗi thiếu động từ, thiếu chủ ngữ hay gặp ở người Việt.'],
        ['Câu ghép và câu phức', 'VIDEO', 12, 'Nối ý bằng and, but, because, when, although.'],
        ['Dấu câu và viết hoa', 'VIDEO', 9, 'Dấu phẩy, dấu chấm phẩy, dấu nháy; viết hoa tên riêng.'],
        ['Lỗi dịch từng chữ từ tiếng Việt', 'VIDEO', 11, 'I very like → I really like; các lỗi điển hình và cách sửa.'],
        ['Kiểm tra chặng 1', 'QUIZ', 10, 'Tìm và sửa lỗi trong 15 câu.'],
      ],
    ],
    [
      'Viết đoạn văn',
      [
        ['Câu chủ đề và câu triển khai', 'VIDEO', 11, 'Một đoạn chỉ nói một ý; câu đầu nêu ý đó.'],
        ['Từ nối để đoạn văn liền mạch', 'VIDEO', 10, 'First, In addition, For example, As a result.'],
        ['Đoạn văn miêu tả', 'VIDEO', 11, 'Tả người, nơi chốn bằng tính từ và so sánh.'],
        ['Đoạn văn kể chuyện', 'VIDEO', 11, 'Dùng các thì quá khứ và từ chỉ thời gian.'],
        ['Bài viết: một đoạn văn 120 từ', 'QUIZ', 15, 'Viết theo đề cho sẵn; giáo viên chấm và sửa chi tiết.'],
      ],
    ],
    [
      'Viết email và tin nhắn',
      [
        ['Email thân mật cho bạn bè', 'VIDEO', 10, 'Mở thư, hỏi thăm, kể chuyện, kết thư.'],
        ['Email trang trọng: xin thông tin, đặt lịch', 'VIDEO', 12, 'Dear Mr…, I am writing to…, I look forward to…'],
        ['Email phàn nàn và xin lỗi', 'VIDEO', 11, 'Nêu vấn đề, đề nghị cách giải quyết, giữ giọng lịch sự.'],
        ['Bài viết: email trả lời', 'QUIZ', 15, 'Trả lời một email cho sẵn, 150 từ.'],
      ],
    ],
    [
      'Viết bài luận ngắn',
      [
        ['Lập dàn ý trong 5 phút', 'VIDEO', 11, 'Mở bài – 2 thân bài – kết bài; chọn ý và ví dụ.'],
        ['Mở bài và kết bài', 'VIDEO', 10, 'Diễn đạt lại đề, nêu quan điểm, tóm tắt.'],
        ['Bài luận nêu ý kiến', 'VIDEO', 13, 'Đưa lý do, ví dụ, và phản biện ý ngược lại.'],
        ['Tự sửa bài trước khi nộp', 'VIDEO', 9, 'Danh sách kiểm tra: thì, mạo từ, số nhiều, chính tả.'],
        ['Bài viết cuối khoá', 'QUIZ', 30, 'Một bài luận 250 từ; giáo viên chấm theo nội dung, bố cục, từ vựng, ngữ pháp.'],
      ],
    ],
  ],
  0,
  2,
);

const OFFICE_PATH = mkPath(
  'op',
  [
    [
      'Ở văn phòng',
      [
        ['Giới thiệu bản thân và công việc', 'VIDEO', 11, 'What do you do?, I work in the marketing department.'],
        ['Nói chuyện với đồng nghiệp', 'VIDEO', 10, 'Small talk giờ nghỉ, hỏi thăm cuối tuần.'],
        ['Nhờ giúp đỡ và giao việc', 'VIDEO', 10, 'Could you give me a hand with…?, Would you mind…?'],
        ['Gọi điện công việc', 'VIDEO', 11, 'Chuyển máy, hẹn gọi lại, xác nhận thông tin.'],
        ['Kiểm tra chặng 1', 'QUIZ', 10, '15 câu theo tình huống văn phòng.'],
      ],
    ],
    [
      'Email và văn bản công việc',
      [
        ['Cấu trúc một email công việc', 'VIDEO', 11, 'Tiêu đề, lời chào, mục đích, hành động cần làm, lời kết.'],
        ['Email nhắc việc và theo dõi tiến độ', 'VIDEO', 10, 'Just a quick reminder…, Could you update me on…?'],
        ['Viết biên bản cuộc họp', 'VIDEO', 11, 'Ghi quyết định, người phụ trách, hạn chót.'],
        ['Bài viết: email gửi khách hàng', 'QUIZ', 15, 'Viết email báo chậm tiến độ và đề xuất lịch mới.'],
      ],
    ],
    [
      'Họp và thuyết trình',
      [
        ['Tham gia cuộc họp', 'VIDEO', 12, 'Xin phát biểu, ngắt lời lịch sự, xin làm rõ.'],
        ['Mở đầu và kết thúc bài thuyết trình', 'VIDEO', 12, 'Today I’d like to talk about…, To sum up…'],
        ['Mô tả biểu đồ và số liệu', 'VIDEO', 12, 'rise, fall, remain stable; sharply, slightly.'],
        ['Trả lời câu hỏi sau thuyết trình', 'VIDEO', 10, "That's a good question. Let me get back to you on that."],
        ['Bài nói: thuyết trình 3 phút', 'QUIZ', 15, 'Ghi hình bài thuyết trình có slide; giáo viên nhận xét.'],
      ],
    ],
    [
      'Phỏng vấn xin việc',
      [
        ['Viết CV và thư xin việc bằng tiếng Anh', 'VIDEO', 13, 'Động từ mạnh, mô tả thành tích bằng số liệu.'],
        ['Câu hỏi phỏng vấn thường gặp', 'VIDEO', 14, 'Tell me about yourself, strengths and weaknesses, why us?'],
        ['Kể kinh nghiệm theo cấu trúc STAR', 'VIDEO', 12, 'Situation, Task, Action, Result.'],
        ['Phỏng vấn thử cuối khoá', 'QUIZ', 20, 'Phỏng vấn 10 phút với giáo viên, có nhận xét chi tiết.'],
      ],
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

/** Mục Khoá học: kiến thức chung (Ngữ pháp, Từ vựng và Phát âm) + kỹ năng tiếng Anh không gắn kỳ thi + Kiến thức nền tảng tách riêng TOEIC và VSTEP */
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
    id: 'c-speaking',
    category: 'SKILL',
    slug: 'giao-tiep-hang-ngay',
    coverUrl: PHOTOS.discussion,
    title: 'Giao tiếp hằng ngày',
    level: 'A1 → B1',
    description: 'Nói được tiếng Anh trong những tình huống quen thuộc: làm quen, mua sắm, gọi món, hỏi đường, đi du lịch, bày tỏ ý kiến. Mỗi chặng kết thúc bằng một bài ghi âm có giáo viên nhận xét.',
    gradient: 'from-amber-500 to-orange-600',
    ...pathStats(SPEAKING_PATH),
    studentsCount: 3874,
    rating: 4.8,
    isFree: true,
    teacherName: 'Nguyễn Minh Anh',
    sections: SPEAKING_PATH,
  },
  {
    id: 'c-listening',
    category: 'SKILL',
    slug: 'luyen-nghe',
    coverUrl: PHOTOS.headphones,
    title: 'Luyện nghe hiểu',
    level: 'A2 → B2',
    description: 'Đi từ nghe từng âm, nối âm, âm yếu đến hội thoại ngắn, podcast, tin tức và phim ở tốc độ thật. Có bản ghi chữ song ngữ và bài nghe chép chính tả.',
    gradient: 'from-sky-500 to-blue-600',
    ...pathStats(LISTENING_PATH),
    studentsCount: 2967,
    rating: 4.7,
    isFree: true,
    teacherName: 'Lê Quốc Bảo',
    sections: LISTENING_PATH,
  },
  {
    id: 'c-writing',
    category: 'SKILL',
    slug: 'viet-tieng-anh',
    coverUrl: PHOTOS.writing,
    title: 'Viết tiếng Anh',
    level: 'A2 → B2',
    description: 'Viết câu đúng, rồi đoạn văn, email và bài luận ngắn. Các bài viết cuối chặng được giáo viên chấm và sửa từng lỗi.',
    gradient: 'from-teal-500 to-emerald-600',
    ...pathStats(WRITING_PATH),
    studentsCount: 2241,
    rating: 4.7,
    isFree: true,
    teacherName: 'Trần Thu Hà',
    sections: WRITING_PATH,
  },
  {
    id: 'c-office',
    category: 'SKILL',
    slug: 'tieng-anh-cong-so',
    coverUrl: PHOTOS.meeting,
    title: 'Tiếng Anh công sở',
    level: 'B1 → B2',
    description: 'Tiếng Anh dùng ở nơi làm việc: nói chuyện với đồng nghiệp, gọi điện, viết email, họp, thuyết trình và phỏng vấn xin việc.',
    gradient: 'from-slate-600 to-slate-800',
    ...pathStats(OFFICE_PATH),
    studentsCount: 3105,
    rating: 4.8,
    isFree: true,
    teacherName: 'Nguyễn Minh Anh',
    sections: OFFICE_PATH,
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
