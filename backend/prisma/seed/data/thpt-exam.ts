/**
 * Khoá "Ôn thi tốt nghiệp THPT" môn Tiếng Anh — theo cấu trúc đề minh hoạ từ năm 2025 (Bộ GD&ĐT công bố 18/10/2024):
 * 40 câu trắc nghiệm / 50 phút — Câu 1–6 đọc điền thông báo, quảng cáo · 7–12 đọc điền tờ rơi · 13–17 sắp xếp
 * hội thoại / lá thư / đoạn văn · 18–22 điền cụm từ, mệnh đề vào đoạn văn · 23–30 đọc hiểu bài 1 · 31–40 đọc hiểu bài 2.
 * Bài đọc và câu hỏi là nội dung soạn mới (không chép đề), chủ đề theo SGK Global Success.
 * Câu hỏi: [đáp án đúng, sai, sai, sai] — thứ tự hiển thị được xáo cố định khi nạp.
 */
export interface ExamQuestion {
  /** câu dẫn (tiếng Anh như đề thật) */
  q: string;
  options: [string, string, string, string];
  /** giải thích (tiếng Việt) */
  explain: string;
}
export interface ExamSet {
  /** loại câu → nhãn trên câu hỏi */
  type: 'notice-cloze' | 'arrange' | 'text-cloze' | 'reading';
  /** yêu cầu chung của dạng (tiếng Anh như đề thật) */
  prompt: string;
  /** đoạn văn dùng chung cho các câu (sắp xếp: mỗi câu một đoạn riêng trong `own`) */
  passage?: { title: string; content: string };
  questions: (ExamQuestion & { own?: { title: string; content: string } })[];
}

// ---------------- Câu 1–6: quảng cáo ----------------
export const SET_1: ExamSet = {
  type: 'notice-cloze',
  prompt: 'Read the following advertisement and choose the option that best fits each of the numbered blanks.',
  passage: {
    title: 'Discover Green Valley Eco-Camp!',
    content:
      'Are you looking for a weekend escape (1) ______ will refresh your mind? Green Valley Eco-Camp offers a (2) ______ experience for families and students. Surrounded by (3) ______ forests, our camp is the perfect place to relax.\n\nGuests can join (4) ______ activities such as hiking, kayaking and bird-watching. Our friendly guides are always ready to help you (5) ______ the beauty of nature.\n\nBook now and (6) ______ advantage of our special student discount!',
  },
  questions: [
    { q: 'Question 1: (1) ______', options: ['which', 'who', 'whom', 'whose'], explain: 'Đại từ quan hệ thay cho vật ("a weekend escape") làm chủ ngữ của "will refresh" → which.' },
    { q: 'Question 2: (2) ______', options: ['memorable', 'memory', 'memorize', 'memorably'], explain: 'Sau mạo từ "a", trước danh từ "experience" cần tính từ → memorable (đáng nhớ).' },
    { q: 'Question 3: (3) ______', options: ['beautiful old pine', 'old beautiful pine', 'pine beautiful old', 'beautiful pine old'], explain: 'Trật tự tính từ: ý kiến (beautiful) – tuổi (old) – loại (pine) + danh từ.' },
    { q: 'Question 4: (4) ______', options: ['outdoor', 'outdoors', 'outside', 'out'], explain: 'Trước danh từ "activities" cần tính từ → outdoor; "outdoors" là trạng từ.' },
    { q: 'Question 5: (5) ______', options: ['discover', 'discovering', 'to discovering', 'discovered'], explain: 'help + O + V (nguyên mẫu) → help you discover.' },
    { q: 'Question 6: (6) ______', options: ['take', 'make', 'get', 'have'], explain: 'Cụm cố định: take advantage of = tận dụng.' },
  ],
};

// ---------------- Câu 7–12: tờ rơi ----------------
export const SET_2: ExamSet = {
  type: 'notice-cloze',
  prompt: 'Read the following leaflet and choose the option that best fits each of the numbered blanks.',
  passage: {
    title: 'Join Our Community Clean-Up Day!',
    content:
      'Our town needs your help! (7) ______ residents have noticed more rubbish in local parks recently. To deal with this problem, the Youth Union is organising a clean-up day (8) ______ Saturday, 15 March.\n\nVolunteers will be divided into small teams, and (9) ______ team will be given gloves and bags. If you cannot join us in person, you can still help by (10) ______ the event on social media.\n\n(11) ______ the weather is bad, the event will be moved to the following week. Let\'s work together to (12) ______ our town cleaner and greener!',
  },
  questions: [
    { q: 'Question 7: (7) ______', options: ['Many', 'Much', 'A little', 'Every'], explain: '"residents" là danh từ đếm được số nhiều → Many. Much / a little đi với danh từ không đếm được; every + danh từ số ít.' },
    { q: 'Question 8: (8) ______', options: ['on', 'in', 'at', 'by'], explain: 'Trước thứ / ngày cụ thể dùng on (on Saturday, 15 March).' },
    { q: 'Question 9: (9) ______', options: ['each', 'all', 'both', 'most'], explain: '"team" là danh từ số ít → each team. All / most cần danh từ số nhiều, both chỉ dùng cho 2 người / vật.' },
    { q: 'Question 10: (10) ______', options: ['sharing', 'share', 'to share', 'shared'], explain: 'Sau giới từ "by" dùng V-ing → by sharing.' },
    { q: 'Question 11: (11) ______', options: ['If', 'Unless', 'Although', 'So that'], explain: 'Câu điều kiện loại 1: If + hiện tại đơn, will + V. Unless (= if not) làm sai nghĩa.' },
    { q: 'Question 12: (12) ______', options: ['make', 'do', 'let', 'take'], explain: 'make + O + adj = làm cho … trở nên … → make our town cleaner.' },
  ],
};

// ---------------- Câu 13–17: sắp xếp ----------------
const ARR = 'Choose the correct arrangement of the sentences to make a meaningful exchange or text.';
export const SET_3: ExamSet = {
  type: 'arrange',
  prompt: ARR,
  questions: [
    {
      q: 'Question 13',
      own: { title: 'Conversation', content: 'a. Tom: Great! Let\'s meet at the school gate at 7 a.m.\nb. Tom: Hi Mai, would you like to join our volunteer trip this Sunday?\nc. Mai: Sure, I\'d love to. What time shall we leave?' },
      options: ['b – c – a', 'a – c – b', 'c – b – a', 'b – a – c'],
      explain: 'Lời mời (b) → nhận lời và hỏi giờ (c) → hẹn giờ gặp (a).',
    },
    {
      q: 'Question 14',
      own: {
        title: 'Conversation',
        content:
          'a. Customer: Yes, I\'d like to return this jacket. It\'s too small.\nb. Assistant: Good morning. Can I help you?\nc. Assistant: I\'m sorry. Do you have the receipt?\nd. Customer: Yes, here it is. Can I get a bigger size instead?\ne. Assistant: Of course. Let me check if we have it in stock.',
      },
      options: ['b – a – c – d – e', 'b – c – a – d – e', 'a – b – c – e – d', 'b – a – d – c – e'],
      explain: 'Chào và hỏi (b) → nêu yêu cầu (a) → hỏi hoá đơn (c) → đưa hoá đơn, xin đổi cỡ (d) → kiểm tra hàng (e).',
    },
    {
      q: 'Question 15',
      own: {
        title: 'Letter',
        content:
          'Dear Ms Hoa,\na. I am writing to thank you for organising the career workshop at our school last week.\nb. In particular, the talk about choosing the right university was extremely useful to me.\nc. Thanks to your advice, I now feel more confident about my future plans.\nd. I hope our school will have more workshops like this in the future.\ne. Many students, including me, learnt a lot about different jobs.\nYours sincerely,\nMinh',
      },
      options: ['a – e – b – c – d', 'a – b – e – d – c', 'e – a – b – c – d', 'a – c – b – e – d'],
      explain: 'Thư: nêu mục đích (a) → ý chung (e) → "In particular" nói cụ thể (b) → kết quả (c) → mong muốn kết thư (d).',
    },
    {
      q: 'Question 16',
      own: {
        title: 'Paragraph',
        content:
          'a. As a result, many people now prefer working from home at least a few days a week.\nb. Moreover, they can spend more time with their families.\nc. In recent years, technology has changed the way people work.\nd. With a laptop and an Internet connection, employees can finish their tasks anywhere.\ne. Working from home helps them save time and money on travelling.',
      },
      options: ['c – d – a – e – b', 'c – a – d – b – e', 'd – c – a – e – b', 'e – c – d – a – b'],
      explain: 'Câu chủ đề (c) → giải thích (d) → "As a result" kết quả (a) → lợi ích (e) → "Moreover" lợi ích thêm (b).',
    },
    {
      q: 'Question 17',
      own: {
        title: 'Paragraph',
        content:
          'a. First, they should make a list of the most important tasks each day.\nb. Many students find it hard to manage their time during exam season.\nc. Finally, getting enough sleep helps them stay focused in class.\nd. Then, they should take short breaks after every hour of study.\ne. However, a few simple habits can make a big difference.',
      },
      options: ['b – e – a – d – c', 'e – b – a – d – c', 'b – a – e – d – c', 'b – e – d – a – c'],
      explain: 'Nêu vấn đề (b) → "However" hướng giải quyết (e) → First (a) → Then (d) → Finally (c).',
    },
  ],
};

// ---------------- Câu 18–22: điền cụm từ, mệnh đề ----------------
export const SET_4: ExamSet = {
  type: 'text-cloze',
  prompt: 'Read the following passage and choose the option that best fits each of the numbered blanks.',
  passage: {
    title: 'Fighting plastic pollution',
    content:
      'Plastic pollution is one of the biggest environmental problems (18) ______. Every year, millions of tonnes of plastic end up in the ocean, (19) ______. Many countries have introduced laws (20) ______.\n\nIn Viet Nam, some supermarkets now wrap vegetables in banana leaves instead of plastic bags. (21) ______, young people are also taking action by joining clean-up campaigns. If everyone makes small changes, (22) ______.',
  },
  questions: [
    { q: 'Question 18: (18) ______', options: ['that the world is facing today', 'which facing the world today', 'the world faces it today', 'faced the world today'], explain: 'Mệnh đề quan hệ bổ nghĩa cho "problems": that + S + V (the world is facing).' },
    { q: 'Question 19: (19) ______', options: ['harming sea animals and their habitats', 'harms sea animals and their habitats', 'that harming sea animals and their habitats', 'harmed by sea animals and their habitats'], explain: 'Mệnh đề phân từ chủ động (V-ing) nêu kết quả của cả câu trước → harming …' },
    { q: 'Question 20: (20) ______', options: ['to reduce the use of single-use plastics', 'reducing of single-use plastics use', 'which reduce single-use plastics using', 'for reduce the use of single-use plastics'], explain: 'To V chỉ mục đích / bổ nghĩa cho "laws" → laws to reduce …' },
    { q: 'Question 21: (21) ______', options: ['At the same time', 'Despite this', 'On the contrary', 'As a result of'], explain: 'Bổ sung một hành động diễn ra song song → At the same time. "As a result of" phải đi với danh từ.' },
    { q: 'Question 22: (22) ______', options: ['the planet will become a cleaner place', 'the planet would have become cleaner', 'the planet becoming cleaner', 'which the planet will be cleaner'], explain: 'Câu điều kiện loại 1: If + hiện tại đơn, S + will + V.' },
  ],
};

// ---------------- Câu 23–30: đọc hiểu bài 1 ----------------
export const SET_5: ExamSet = {
  type: 'reading',
  prompt: 'Read the following passage and choose the best answer to each of the questions.',
  passage: {
    title: 'Lifelong learning',
    content:
      'In the past, people often believed that learning stopped when they left school. Today, however, the idea of lifelong learning has become increasingly popular. Lifelong learning means continuing to gain knowledge and skills throughout one\'s life, not only for work but also for personal development.\n\nOne major reason for this trend is the rapid development of technology. Many jobs that exist today did not exist twenty years ago, and some traditional jobs are disappearing. To keep up with these changes, workers need to update their skills regularly. Online courses have made this much easier. With just a smartphone, learners can study a new language, take a coding class or attend a lecture given by a professor on the other side of the world.\n\nLifelong learning also brings personal benefits. Studies show that older adults who keep learning new things tend to have better memory and are less likely to feel lonely. Learning a musical instrument or joining a cooking class, for example, can help people make new friends and stay active.\n\nHowever, lifelong learning is not always easy. Many adults find it difficult to balance study with work and family responsibilities. Others lack motivation when there are no teachers or deadlines. Experts suggest that learners should set small, clear goals and study a little every day. They also recommend joining online communities, where learners can share their progress and encourage one another.',
  },
  questions: [
    { q: 'Question 23: Which of the following is NOT mentioned as a benefit of lifelong learning?', options: ['a higher salary', 'better memory', 'making new friends', 'staying active'], explain: 'Đoạn 3 nêu trí nhớ tốt hơn, kết bạn, năng động; không nhắc tới lương cao hơn.' },
    { q: 'Question 24: The word "this" in paragraph 2 refers to ______.', options: ['updating skills regularly', 'the development of technology', 'losing traditional jobs', 'studying abroad'], explain: '"Online courses have made this much easier" — "this" thay cho việc cập nhật kỹ năng thường xuyên ở câu ngay trước.' },
    { q: 'Question 25: The word "rapid" in paragraph 2 is closest in meaning to ______.', options: ['fast', 'slow', 'careful', 'modern'], explain: 'rapid = nhanh chóng ≈ fast.' },
    { q: 'Question 26: According to paragraph 2, why do workers need to update their skills?', options: ['Because jobs are changing quickly.', 'Because online courses are free.', 'Because professors require it.', 'Because smartphones are cheap.'], explain: 'Việc làm mới xuất hiện, việc cũ biến mất → phải cập nhật kỹ năng để theo kịp thay đổi.' },
    { q: 'Question 27: The word "lack" in paragraph 4 is OPPOSITE in meaning to ______.', options: ['have', 'need', 'lose', 'avoid'], explain: 'lack = thiếu ↔ have = có.' },
    { q: 'Question 28: Which of the following best paraphrases the sentence "Many jobs that exist today did not exist twenty years ago"?', options: ["Some of today's jobs are new and did not appear twenty years ago.", 'All jobs from twenty years ago have disappeared.', 'Twenty years ago there were more jobs than today.', 'People did the same jobs twenty years ago as they do now.'], explain: 'Câu gốc: nhiều công việc hiện nay chưa có 20 năm trước → nhiều việc là mới.' },
    { q: 'Question 29: According to the passage, what do experts suggest learners do?', options: ['set small, clear goals and study a little every day', 'study only with a teacher', 'give up their jobs to study', 'avoid online communities'], explain: 'Đoạn 4: "learners should set small, clear goals and study a little every day".' },
    { q: 'Question 30: What is the main idea of the passage?', options: ['Lifelong learning is becoming important, bringing benefits as well as challenges.', 'Technology is destroying traditional jobs.', 'Older adults should learn to play musical instruments.', 'Online courses are better than traditional schools.'], explain: 'Bài nói về xu hướng học tập suốt đời: lý do, lợi ích (đoạn 2–3) và khó khăn (đoạn 4).' },
  ],
};

// ---------------- Câu 31–40: đọc hiểu bài 2 ----------------
export const SET_6: ExamSet = {
  type: 'reading',
  prompt: 'Read the following passage and choose the best answer to each of the questions.',
  passage: {
    title: 'Smart cities',
    content:
      '[I] As more people move from the countryside to cities, urban areas around the world are facing serious problems such as traffic congestion, air pollution and a shortage of housing. [II] To solve these problems, many governments are investing in so-called "smart cities". [III] A smart city uses digital technology to collect data and manage resources more efficiently. [IV]\n\nIn Singapore, for example, thousands of sensors are placed on roads and buildings. They collect information about traffic, energy use and even the amount of rubbish in public bins. This data is then analysed so that the city can respond quickly. When a road becomes crowded, traffic lights are automatically adjusted to reduce waiting time. Rubbish trucks are only sent to bins that are nearly full, which saves fuel and money.\n\nSmart cities also aim to be greener. Buildings are designed to use natural light and solar energy, and residents are encouraged to use electric buses and shared bicycles instead of private cars. In Copenhagen, more than half of all residents cycle to work or school every day, thanks to safe bike lanes and a well-planned public transport system.\n\nDespite these advantages, smart cities have raised some concerns. Because so much personal data is collected, many people worry about their privacy. Critics also point out that building a smart city is extremely expensive, so poorer cities may be left behind. For smart cities to succeed, experts argue, governments must protect citizens\' data and make sure that new technology benefits everyone, not just the wealthy.',
  },
  questions: [
    { q: 'Question 31: Where in paragraph 1 does the following sentence best fit? "In other words, technology helps the city work like a living brain."', options: ['[IV]', '[I]', '[II]', '[III]'], explain: '"In other words" diễn đạt lại ý ngay trước: thành phố dùng công nghệ thu thập dữ liệu, quản lý tài nguyên → đứng sau câu định nghĩa, ở vị trí [IV].' },
    { q: 'Question 32: The word "They" in paragraph 2 refers to ______.', options: ['sensors', 'roads', 'buildings', 'traffic lights'], explain: '"They collect information…" — chủ thể thu thập thông tin là các cảm biến (sensors) ở câu trước.' },
    { q: 'Question 33: According to paragraph 2, rubbish trucks in Singapore ______.', options: ['only go to bins that are nearly full', 'collect rubbish every hour', 'use solar energy', 'are driven by robots'], explain: '"Rubbish trucks are only sent to bins that are nearly full".' },
    { q: 'Question 34: The word "adjusted" in paragraph 2 is closest in meaning to ______.', options: ['changed', 'broken', 'removed', 'ignored'], explain: 'adjust = điều chỉnh ≈ change.' },
    { q: 'Question 35: Which of the following is TRUE according to paragraph 3?', options: ["More than half of Copenhagen's residents cycle to work or school every day.", 'Copenhagen has banned private cars.', 'Electric buses are free in Copenhagen.', 'Buildings in smart cities use no electricity.'], explain: '"In Copenhagen, more than half of all residents cycle to work or school every day".' },
    { q: 'Question 36: The word "concerns" in paragraph 4 is OPPOSITE in meaning to ______.', options: ['reassurances', 'worries', 'problems', 'questions'], explain: 'concern = mối lo ngại ↔ reassurance = sự trấn an, yên tâm.' },
    { q: 'Question 37: Which of the following best paraphrases the sentence "For smart cities to succeed, experts argue, governments must protect citizens\' data"?', options: ["Experts believe protecting citizens' data is necessary for smart cities to be successful.", 'Experts argue that smart cities do not need to protect data.', "Governments have already protected all citizens' data.", "Citizens must protect the government's data."], explain: 'Câu gốc: muốn thành công thì chính phủ phải bảo vệ dữ liệu người dân → bảo vệ dữ liệu là điều kiện cần.' },
    { q: 'Question 38: What can be inferred from paragraph 4?', options: ['Not every city can afford to become a smart city.', 'Smart cities never collect personal data.', 'Poor cities are the first to become smart.', 'Critics want to stop all technology.'], explain: '"building a smart city is extremely expensive, so poorer cities may be left behind" → không phải thành phố nào cũng đủ tiền.' },
    { q: 'Question 39: Which of the following is NOT mentioned as a problem of growing cities in paragraph 1?', options: ['high crime rates', 'traffic congestion', 'air pollution', 'a shortage of housing'], explain: 'Đoạn 1 nêu tắc đường, ô nhiễm không khí, thiếu nhà ở; không nhắc tội phạm.' },
    { q: 'Question 40: Which of the following best summarises the passage?', options: ['Smart cities use technology to solve urban problems and become greener, but they also raise concerns about privacy and cost.', 'Singapore is the smartest city in the world.', 'Cycling is the best way to reduce pollution.', 'Technology has made cities more expensive to live in.'], explain: 'Bài gồm: vấn đề đô thị → thành phố thông minh giải quyết (đoạn 2), xanh hơn (đoạn 3), lo ngại về quyền riêng tư và chi phí (đoạn 4).' },
  ],
};

export const EXAM_SETS = [SET_1, SET_2, SET_3, SET_4, SET_5, SET_6];

/** Kiến thức + chiến lược cho từng dạng câu (KnowledgePoint: title | formula | note | example) */
type KP = { title: string; formula?: string; note?: string; example?: string };
export interface PartGuide {
  section: string;
  part: string;
  strategyTitle: string;
  summary: string;
  content: string;
  grammar: KP[];
  tips: KP[];
  practiceTitle: string;
  sets: ExamSet[];
}

export const PART_GUIDES: PartGuide[] = [
  {
    section: 'Câu 1–6: Đọc thông báo, quảng cáo',
    part: 'Đọc điền',
    strategyTitle: 'Chiến lược: điền từ vào thông báo, quảng cáo',
    summary: 'Nhìn từ đứng trước và sau chỗ trống để xác định từ loại, cụm cố định, dạng động từ',
    content:
      'Câu 1–6 là một đoạn quảng cáo hoặc thông báo ngắn với 6 chỗ trống, chủ yếu kiểm tra từ loại, cụm từ cố định, dạng động từ và đại từ quan hệ.\n\nCách làm: đọc lướt cả đoạn để biết nội dung; với từng chỗ trống, nhìn từ ngay trước và ngay sau để xác định cần danh từ, tính từ, động từ hay giới từ; loại các phương án sai ngữ pháp rồi mới xét nghĩa. Mỗi câu nên làm trong khoảng 40 giây.',
    grammar: [
      { title: 'Vị trí tính từ', formula: 'a / an / the + adj + N', note: 'Tính từ đứng trước danh từ; sau be / become / seem', example: 'a memorable experience' },
      { title: 'Trật tự tính từ', formula: 'ý kiến + kích cỡ + tuổi + màu + nguồn gốc + chất liệu + loại + N', note: 'OSASCOMP', example: 'beautiful old pine forests' },
      { title: 'Đại từ quan hệ', formula: 'N (vật) + which / that + V; N (người) + who + V', note: 'whose + N chỉ sở hữu; whom làm tân ngữ', example: 'a trip which will refresh your mind' },
      { title: 'Động từ + O + V nguyên mẫu', formula: 'help / make / let + O + V', note: 'help có thể dùng thêm to V', example: 'help you discover nature' },
      { title: 'Cụm cố định thường gặp', formula: 'take advantage of / take part in / make use of', note: 'Học theo cụm, không dịch từng từ', example: 'Take advantage of our discount!' },
    ],
    tips: [
      { title: 'Xác định từ loại trước', note: 'Sau mạo từ cần danh từ / tính từ; sau động từ thường là trạng từ hoặc tân ngữ' },
      { title: 'Đọc cả câu chứa chỗ trống', note: 'Nhiều đáp án đúng ngữ pháp nhưng chỉ một đáp án hợp nghĩa quảng cáo' },
    ],
    practiceTitle: 'Luyện đề: Câu 1–6 (quảng cáo)',
    sets: [SET_1],
  },
  {
    section: 'Câu 7–12: Đọc tờ rơi',
    part: 'Đọc điền',
    strategyTitle: 'Chiến lược: điền từ vào tờ rơi',
    summary: 'Lượng từ, giới từ, liên từ, V-ing sau giới từ và cấu trúc make + O + adj',
    content:
      'Câu 7–12 là một tờ rơi (sự kiện, chiến dịch, câu lạc bộ) với 6 chỗ trống, hay hỏi lượng từ (many, much, each…), giới từ chỉ thời gian, liên từ, dạng V-ing sau giới từ và động từ đi với tân ngữ + tính từ.\n\nCách làm: xác định danh từ đi sau là đếm được hay không, số ít hay số nhiều; với liên từ, đọc hai vế để xem quan hệ (điều kiện, tương phản, nguyên nhân).',
    grammar: [
      { title: 'Lượng từ', formula: 'many / a few + N số nhiều; much / a little + N không đếm được; each / every + N số ít', note: 'both chỉ dùng cho 2', example: 'Many residents have noticed more rubbish.' },
      { title: 'Giới từ chỉ thời gian', formula: 'on + thứ / ngày; in + tháng / năm; at + giờ', note: 'on Saturday, 15 March', example: 'The event is on Saturday.' },
      { title: 'V-ing sau giới từ', formula: 'by / for / about / without + V-ing', note: 'Sau mọi giới từ dùng V-ing', example: 'help by sharing the event' },
      { title: 'Câu điều kiện loại 1', formula: 'If + S + V (hiện tại), S + will + V', note: 'Unless = If … not', example: 'If the weather is bad, the event will be moved.' },
      { title: 'make + O + adj', formula: 'make + O + adj', note: 'làm cho ai / cái gì trở nên …', example: 'make our town cleaner' },
    ],
    tips: [
      { title: 'Nhìn danh từ sau chỗ trống', note: 'Quyết định lượng từ / mạo từ: số ít hay số nhiều, đếm được hay không' },
      { title: 'Liên từ: đọc cả hai vế', note: 'If (điều kiện), Although (tương phản), Because (nguyên nhân), So that (mục đích)' },
    ],
    practiceTitle: 'Luyện đề: Câu 7–12 (tờ rơi)',
    sets: [SET_2],
  },
  {
    section: 'Câu 13–17: Sắp xếp hội thoại, lá thư, đoạn văn',
    part: 'Sắp xếp',
    strategyTitle: 'Chiến lược: sắp xếp câu thành hội thoại, thư, đoạn văn',
    summary: 'Tìm câu mở đầu, theo dấu hiệu liên kết (First, Then, However, As a result…) và đại từ thay thế',
    content:
      'Câu 13–17 gồm 5 câu sắp xếp: thường 2 đoạn hội thoại (3 và 5 lượt lời), 1 lá thư và 2 đoạn văn (5 câu).\n\nCách làm: tìm câu mở đầu (lời chào, lời mời, câu chủ đề); nối các cặp câu chắc chắn đi liền nhau (hỏi – đáp, đại từ they / it / this thay cho danh từ ở câu trước, từ nối First → Then → Finally); dùng các cặp đó để loại nhanh phương án.',
    grammar: [
      { title: 'Từ nối trình tự', formula: 'First → Then / Next → Finally', note: 'Liệt kê các bước theo thứ tự', example: 'First, make a list. Then, take short breaks.' },
      { title: 'Từ nối bổ sung / kết quả', formula: 'Moreover / In addition; As a result / Therefore', note: 'Câu có từ nối không bao giờ đứng đầu đoạn', example: 'As a result, many people prefer working from home.' },
      { title: 'Từ nối tương phản', formula: 'However, + S + V', note: 'Chuyển ý từ vấn đề sang giải pháp', example: 'However, a few simple habits can help.' },
    ],
    tips: [
      { title: 'Hội thoại: hỏi trước, đáp sau', note: 'Lời mời / yêu cầu → phản hồi → chi tiết; lời chào thường mở đầu' },
      { title: 'Thư: mục đích → chi tiết → kết thư', note: 'I am writing to… mở thư; I hope… / I look forward to… kết thư' },
      { title: 'Đoạn văn: câu chủ đề đứng đầu', note: 'Câu khái quát nhất, không có từ nối hay đại từ thay thế' },
    ],
    practiceTitle: 'Luyện đề: Câu 13–17 (sắp xếp)',
    sets: [SET_3],
  },
  {
    section: 'Câu 18–22: Điền cụm từ, mệnh đề vào đoạn văn',
    part: 'Điền đoạn văn',
    strategyTitle: 'Chiến lược: điền cụm từ, mệnh đề vào đoạn văn',
    summary: 'Mệnh đề quan hệ, mệnh đề phân từ, to V chỉ mục đích, từ nối và câu điều kiện',
    content:
      'Câu 18–22 là một đoạn văn với 5 chỗ trống, mỗi phương án là cả một cụm từ hoặc mệnh đề. Đề kiểm tra cấu trúc câu: mệnh đề quan hệ, mệnh đề phân từ (V-ing / V3), to V chỉ mục đích, từ nối giữa các câu và câu điều kiện.\n\nCách làm: xem chỗ trống đang thiếu thành phần gì (cả mệnh đề có chủ ngữ – động từ, hay chỉ cụm bổ nghĩa); loại phương án làm câu có hai động từ chính hoặc thiếu động từ; sau dấu phẩy nối tiếp câu trước thường là mệnh đề phân từ hoặc which.',
    grammar: [
      { title: 'Mệnh đề quan hệ', formula: 'N + that / which / who + S + V', note: 'Bổ nghĩa cho danh từ đứng trước', example: 'problems that the world is facing today' },
      { title: 'Mệnh đề phân từ', formula: '…, V-ing (chủ động) / V3 (bị động)', note: 'Rút gọn mệnh đề cùng chủ ngữ hoặc nêu kết quả', example: 'Plastic ends up in the ocean, harming sea animals.' },
      { title: 'To V chỉ mục đích', formula: 'N / V + to V', note: 'Nêu mục đích, bổ nghĩa cho danh từ', example: 'laws to reduce single-use plastics' },
      { title: 'Từ nối giữa hai câu', formula: 'At the same time / However / Therefore, + S + V', note: '"As a result of" và "Despite" phải đi với danh từ / V-ing', example: 'At the same time, young people are taking action.' },
    ],
    tips: [
      { title: 'Mỗi câu chỉ một động từ chính', note: 'Phương án thêm động từ chia thì vào câu đã đủ là sai' },
      { title: 'Đọc câu ngay sau chỗ trống', note: 'Từ nối và đại từ ở câu sau giúp chọn đúng cụm' },
    ],
    practiceTitle: 'Luyện đề: Câu 18–22 (điền đoạn văn)',
    sets: [SET_4],
  },
  {
    section: 'Câu 23–40: Đọc hiểu',
    part: 'Đọc hiểu',
    strategyTitle: 'Chiến lược: các dạng câu hỏi đọc hiểu',
    summary: 'Ý chính, chi tiết, NOT TRUE, từ thay thế, từ đồng / trái nghĩa, diễn đạt lại, điền câu vào đoạn, suy luận',
    content:
      'Câu 23–40 gồm 2 bài đọc: bài 1 có 8 câu hỏi, bài 2 dài hơn có 10 câu hỏi, chiếm gần một nửa số điểm.\n\nCách làm: đọc câu hỏi trước để biết cần tìm gì; câu hỏi chi tiết, từ vựng, đại từ thay thế thường theo thứ tự đoạn văn; câu ý chính / tóm tắt làm cuối cùng sau khi đã nắm cả bài; với câu NOT mentioned / NOT TRUE, gạch từng phương án có trong bài.',
    grammar: [],
    tips: [
      { title: 'Ý chính / tóm tắt', note: 'Chọn phương án bao quát tất cả các đoạn, không chỉ một chi tiết' },
      { title: 'Từ thay thế (it, they, this)', note: 'Tìm danh từ / ý gần nhất phía trước phù hợp số ít – số nhiều và nghĩa' },
      { title: 'Đồng nghĩa / trái nghĩa', note: 'Thay từng phương án vào câu gốc; đề hỏi OPPOSITE thì chọn nghĩa ngược' },
      { title: 'Diễn đạt lại (paraphrase)', note: 'Giữ đúng nghĩa và mức độ của câu gốc (many ≠ all)' },
      { title: 'Điền câu vào đoạn [I]–[IV]', note: 'Dựa vào từ nối và đại từ trong câu cần điền (In other words, This…) để tìm câu đứng trước' },
      { title: 'Suy luận (inferred)', note: 'Chọn điều chắc chắn suy ra từ bài, không phải điều bài nói thẳng hoặc điều quá xa' },
    ],
    practiceTitle: 'Luyện đề: Câu 23–40 (2 bài đọc hiểu)',
    sets: [SET_5, SET_6],
  },
];

/** Tổng ôn ngữ pháp: chủ điểm → các Unit SGK (lớp-unit) lấy kiến thức + câu luyện đã soạn */
export const GRAMMAR_REVIEW: { title: string; units: string[] }[] = [
  { title: 'Các thì: hiện tại, quá khứ, hiện tại hoàn thành', units: ['10-1', '10-4', '10-5', '11-1', '12-1', '12-4'] },
  { title: 'Câu bị động', units: ['10-2', '10-6'] },
  { title: 'Câu điều kiện và câu ước', units: ['10-10', '12-8'] },
  { title: 'Câu tường thuật', units: ['10-9', '12-10'] },
  { title: 'Mệnh đề quan hệ và mệnh đề phân từ', units: ['10-8', '11-5', '11-7', '12-3'] },
  { title: 'Danh động từ (V-ing) và to V', units: ['10-3', '10-5', '11-4', '11-6'] },
  { title: 'So sánh', units: ['10-7', '12-4'] },
  { title: 'Liên từ, từ nối và mệnh đề trạng ngữ', units: ['11-9', '12-5', '12-7'] },
  { title: 'Cấu trúc đặc biệt: câu chẻ, sai khiến, cụm động từ', units: ['11-8', '12-6', '12-9', '11-2', '11-3'] },
];
