import type { IMockTest, IQuestion } from '@toeic-vstep/shared';
import type { ExamSetup, RubricCriterion } from '@/shared/types';
import { TOEIC_PARTS_INFO, VSTEP_PARTS_INFO } from './tests';

const AUDIO_SAMPLE = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const IMG_OFFICE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=70';
const IMG_MEETING = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=70';

const q = (p: Partial<IQuestion> & Pick<IQuestion, 'id' | 'stem' | 'options' | 'correctAnswer'>): IQuestion => ({
  examType: 'TOEIC',
  type: 'SINGLE_CHOICE',
  skillType: 'READING',
  partOrSkill: 'PART_5',
  level: '550+',
  difficulty: 2,
  tags: [],
  explanation: null,
  ...p,
});

/** TOEIC PART 1 — Photographs */
export const TOEIC_PART1: IQuestion[] = [
  q({
    id: 'p1-01',
    skillType: 'LISTENING',
    partOrSkill: 'PART_1',
    stem: 'Nhìn tranh và chọn câu mô tả đúng nhất.',
    options: [
      { key: 'A', text: 'The woman is typing on a laptop.' },
      { key: 'B', text: 'The woman is hanging a picture.' },
      { key: 'C', text: 'The woman is pouring coffee.' },
      { key: 'D', text: 'The woman is closing the window.' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Trong tranh người phụ nữ đang ngồi gõ máy tính xách tay. Các phương án còn lại mô tả hành động không xuất hiện trong tranh (bẫy "picture / window" liên tưởng đến văn phòng).',
    tags: ['present_continuous', 'office'],
    passage: { id: 'ps-p1-01', examType: 'TOEIC', partOrSkill: 'PART_1', content: '', imageUrl: IMG_OFFICE, audioUrl: AUDIO_SAMPLE },
  }),
  q({
    id: 'p1-02',
    skillType: 'LISTENING',
    partOrSkill: 'PART_1',
    stem: 'Nhìn tranh và chọn câu mô tả đúng nhất.',
    options: [
      { key: 'A', text: 'They are leaving the conference room.' },
      { key: 'B', text: 'Some people are gathered around a table.' },
      { key: 'C', text: 'A man is writing on the whiteboard.' },
      { key: 'D', text: 'Chairs are being stacked in a corner.' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Câu B dùng thì hiện tại đơn bị động "are gathered" mô tả trạng thái đúng với tranh. Câu D là bẫy bị động tiếp diễn "are being stacked" (hành động đang diễn ra) không có trong tranh.',
    tags: ['passive_voice', 'meeting'],
    difficulty: 3,
    passage: { id: 'ps-p1-02', examType: 'TOEIC', partOrSkill: 'PART_1', content: '', imageUrl: IMG_MEETING, audioUrl: AUDIO_SAMPLE },
  }),
];

/** TOEIC PART 2 — Question-Response */
export const TOEIC_PART2: IQuestion[] = [
  q({
    id: 'p2-01',
    skillType: 'LISTENING',
    partOrSkill: 'PART_2',
    stem: '"When is the quarterly report due?"',
    options: [
      { key: 'A', text: 'In the top drawer.' },
      { key: 'B', text: 'By the end of this week.' },
      { key: 'C', text: 'Yes, it was very detailed.' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Câu hỏi "When" cần câu trả lời về thời gian → "By the end of this week". Câu A trả lời cho "Where", câu C là bẫy Yes/No cho câu hỏi Wh-.',
    tags: ['wh_question', 'time'],
    passage: { id: 'ps-p2-01', examType: 'TOEIC', partOrSkill: 'PART_2', content: '', audioUrl: AUDIO_SAMPLE },
  }),
  q({
    id: 'p2-02',
    skillType: 'LISTENING',
    partOrSkill: 'PART_2',
    stem: '"Who is going to lead the training session tomorrow?"',
    options: [
      { key: 'A', text: 'It starts at nine o\'clock.' },
      { key: 'B', text: 'The new HR manager, I believe.' },
      { key: 'C', text: 'The training room is on the third floor.' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Câu hỏi "Who" → cần người. Câu A trả lời "When", câu C lặp lại từ "training" (bẫy lặp từ).',
    tags: ['wh_question', 'repeated_word_trap'],
    passage: { id: 'ps-p2-02', examType: 'TOEIC', partOrSkill: 'PART_2', content: '', audioUrl: AUDIO_SAMPLE },
  }),
  q({
    id: 'p2-03',
    skillType: 'LISTENING',
    partOrSkill: 'PART_2',
    stem: '"Would you like me to book the flight for you?"',
    options: [
      { key: 'A', text: 'That would be great, thanks.' },
      { key: 'B', text: 'I read that book last month.' },
      { key: 'C', text: 'The flight was delayed.' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Câu đề nghị "Would you like me to..." → đáp lại bằng chấp nhận/từ chối. "Book" ở B là bẫy đồng âm (đặt vé / quyển sách).',
    tags: ['offer', 'homophone_trap'],
    difficulty: 1,
    passage: { id: 'ps-p2-03', examType: 'TOEIC', partOrSkill: 'PART_2', content: '', audioUrl: AUDIO_SAMPLE },
  }),
];

/** TOEIC PART 3 — Conversations */
const P3_PASSAGE = {
  id: 'ps-p3-01',
  examType: 'TOEIC' as const,
  partOrSkill: 'PART_3',
  title: 'Questions 32–34 refer to the following conversation.',
  content:
    'M: Hi, Sarah. I just heard that the client meeting has been moved to Thursday. Is that right?\nW: Yes, Mr. Patel asked to reschedule because he\'ll be flying back from Singapore on Wednesday night.\nM: That gives us one more day to finalize the proposal. Could you send me the updated cost estimates by tomorrow morning?\nW: Sure. I\'ll also book the large conference room, since the marketing team wants to join.',
  audioUrl: AUDIO_SAMPLE,
};

export const TOEIC_PART3: IQuestion[] = [
  q({
    id: 'p3-01',
    skillType: 'LISTENING',
    partOrSkill: 'PART_3',
    stem: 'Why has the meeting been rescheduled?',
    options: [
      { key: 'A', text: 'A client is traveling.' },
      { key: 'B', text: 'The conference room is unavailable.' },
      { key: 'C', text: 'The proposal is not ready.' },
      { key: 'D', text: 'The marketing team is busy.' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Người phụ nữ nói Mr. Patel "will be flying back from Singapore" → khách hàng đang đi công tác.',
    tags: ['detail', 'paraphrase'],
    passage: P3_PASSAGE,
    orderInPassage: 1,
  }),
  q({
    id: 'p3-02',
    skillType: 'LISTENING',
    partOrSkill: 'PART_3',
    stem: 'What does the man ask the woman to do?',
    options: [
      { key: 'A', text: 'Call Mr. Patel' },
      { key: 'B', text: 'Send some figures' },
      { key: 'C', text: 'Book a flight' },
      { key: 'D', text: 'Contact the marketing team' },
    ],
    correctAnswer: { key: 'B' },
    explanation: '"Send me the updated cost estimates" được paraphrase thành "Send some figures".',
    tags: ['request', 'paraphrase'],
    difficulty: 3,
    passage: P3_PASSAGE,
    orderInPassage: 2,
  }),
  q({
    id: 'p3-03',
    skillType: 'LISTENING',
    partOrSkill: 'PART_3',
    stem: 'What will the woman most likely do next?',
    options: [
      { key: 'A', text: 'Reserve a room' },
      { key: 'B', text: 'Print the proposal' },
      { key: 'C', text: 'Fly to Singapore' },
      { key: 'D', text: 'Cancel the meeting' },
    ],
    correctAnswer: { key: 'A' },
    explanation: '"I\'ll also book the large conference room" → Reserve a room.',
    tags: ['inference', 'next_action'],
    passage: P3_PASSAGE,
    orderInPassage: 3,
  }),
];

/** TOEIC PART 4 — Short Talks */
const P4_PASSAGE = {
  id: 'ps-p4-01',
  examType: 'TOEIC' as const,
  partOrSkill: 'PART_4',
  title: 'Questions 71–73 refer to the following announcement.',
  content:
    'Attention, shoppers. Thank you for visiting Greenfield Market. For today only, all fresh produce in aisle three is twenty percent off. Members of our loyalty program will receive an additional five percent discount at checkout. If you haven\'t signed up yet, visit the customer service desk near the main entrance – registration takes less than two minutes. We will be closing at nine tonight. Thank you for shopping with us.',
  audioUrl: AUDIO_SAMPLE,
};

export const TOEIC_PART4: IQuestion[] = [
  q({
    id: 'p4-01',
    skillType: 'LISTENING',
    partOrSkill: 'PART_4',
    stem: 'Where is the announcement being made?',
    options: [
      { key: 'A', text: 'At an airport' },
      { key: 'B', text: 'At a supermarket' },
      { key: 'C', text: 'At a hotel' },
      { key: 'D', text: 'At a bank' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Các từ khóa "shoppers", "fresh produce", "aisle three", "checkout" → siêu thị.',
    tags: ['location', 'keyword'],
    passage: P4_PASSAGE,
    orderInPassage: 1,
  }),
  q({
    id: 'p4-02',
    skillType: 'LISTENING',
    partOrSkill: 'PART_4',
    stem: 'What are loyalty members eligible for?',
    options: [
      { key: 'A', text: 'A free product' },
      { key: 'B', text: 'Extended opening hours' },
      { key: 'C', text: 'An extra discount' },
      { key: 'D', text: 'Home delivery' },
    ],
    correctAnswer: { key: 'C' },
    explanation: '"an additional five percent discount" = an extra discount.',
    tags: ['detail'],
    passage: P4_PASSAGE,
    orderInPassage: 2,
  }),
  q({
    id: 'p4-03',
    skillType: 'LISTENING',
    partOrSkill: 'PART_4',
    stem: 'According to the speaker, what can listeners do at the customer service desk?',
    options: [
      { key: 'A', text: 'Return an item' },
      { key: 'B', text: 'Join a program' },
      { key: 'C', text: 'Get a parking voucher' },
      { key: 'D', text: 'Order a product' },
    ],
    correctAnswer: { key: 'B' },
    explanation: '"If you haven\'t signed up yet, visit the customer service desk" → đăng ký chương trình thành viên.',
    tags: ['detail', 'paraphrase'],
    passage: P4_PASSAGE,
    orderInPassage: 3,
  }),
];

/** TOEIC PART 5 — Incomplete Sentences */
export const TOEIC_PART5: IQuestion[] = [
  q({
    id: 'p5-01',
    stem: 'Mr. Tanaka requested that all department managers submit their quarterly budgets ______ Friday afternoon.',
    options: [
      { key: 'A', text: 'by' },
      { key: 'B', text: 'until' },
      { key: 'C', text: 'since' },
      { key: 'D', text: 'during' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Dùng giới từ "by" để chỉ hạn chót (muộn nhất là thời điểm nào). "Until" dùng cho hành động kéo dài liên tục tới một mốc thời gian.',
    tags: ['preposition', 'deadline'],
  }),
  q({
    id: 'p5-02',
    stem: 'The newly appointed director has implemented a series of ______ measures to reduce operational costs.',
    options: [
      { key: 'A', text: 'economize' },
      { key: 'B', text: 'economic' },
      { key: 'C', text: 'economical' },
      { key: 'D', text: 'economist' },
    ],
    correctAnswer: { key: 'C' },
    explanation: '"Economical" (tiết kiệm) là tính từ phù hợp bổ nghĩa cho "measures". "Economic" nghĩa là thuộc về kinh tế.',
    tags: ['word_form', 'confusing_adjectives'],
    difficulty: 3,
    level: '650+',
  }),
  q({
    id: 'p5-03',
    stem: '______ the heavy rain, the outdoor product launch proceeded as scheduled.',
    options: [
      { key: 'A', text: 'Although' },
      { key: 'B', text: 'Despite' },
      { key: 'C', text: 'Because' },
      { key: 'D', text: 'Even' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Sau chỗ trống là cụm danh từ "the heavy rain" → cần giới từ "Despite". "Although" là liên từ, phải theo sau bởi mệnh đề.',
    tags: ['conjunction_vs_preposition', 'contrast'],
  }),
  q({
    id: 'p5-04',
    stem: 'Employees ______ wish to attend the workshop must register with the HR department by Monday.',
    options: [
      { key: 'A', text: 'whom' },
      { key: 'B', text: 'whose' },
      { key: 'C', text: 'who' },
      { key: 'D', text: 'which' },
    ],
    correctAnswer: { key: 'C' },
    explanation: 'Đại từ quan hệ thay thế cho chủ ngữ chỉ người (Employees) → "who".',
    tags: ['relative_clause'],
    difficulty: 1,
  }),
  q({
    id: 'p5-05',
    stem: 'The marketing team ______ the new campaign by the time the CEO returns from her business trip.',
    options: [
      { key: 'A', text: 'will have completed' },
      { key: 'B', text: 'has completed' },
      { key: 'C', text: 'completed' },
      { key: 'D', text: 'is completing' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Cấu trúc "by the time + hiện tại đơn" ở tương lai → mệnh đề chính dùng tương lai hoàn thành.',
    tags: ['tense', 'future_perfect'],
    difficulty: 4,
    level: '750+',
  }),
  q({
    id: 'p5-06',
    stem: 'Please review the attached contract ______ and let us know if any changes are needed.',
    options: [
      { key: 'A', text: 'careful' },
      { key: 'B', text: 'carefully' },
      { key: 'C', text: 'carefulness' },
      { key: 'D', text: 'caring' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Bổ nghĩa cho động từ "review" → cần trạng từ "carefully".',
    tags: ['word_form', 'adverb'],
    difficulty: 1,
  }),
  q({
    id: 'p5-07',
    stem: 'Sales figures for the third quarter were ______ higher than analysts had predicted.',
    options: [
      { key: 'A', text: 'significant' },
      { key: 'B', text: 'significance' },
      { key: 'C', text: 'significantly' },
      { key: 'D', text: 'signify' },
    ],
    correctAnswer: { key: 'C' },
    explanation: 'Bổ nghĩa cho tính từ so sánh hơn "higher" → trạng từ "significantly".',
    tags: ['word_form', 'adverb'],
  }),
  q({
    id: 'p5-08',
    stem: 'Neither the manager ______ the assistants were informed about the schedule change.',
    options: [
      { key: 'A', text: 'or' },
      { key: 'B', text: 'nor' },
      { key: 'C', text: 'and' },
      { key: 'D', text: 'but' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Cặp liên từ tương quan "Neither ... nor".',
    tags: ['correlative_conjunction'],
    difficulty: 1,
  }),
];

/** TOEIC PART 6 — Text Completion */
const P6_PASSAGE = {
  id: 'ps-p6-01',
  examType: 'TOEIC' as const,
  partOrSkill: 'PART_6',
  title: 'Questions 131–134 refer to the following e-mail.',
  content:
    'To: All Staff\nFrom: Facilities Department\nSubject: Parking Lot Renovation\n\nDear colleagues,\n\nPlease be advised that the north parking lot will be closed for resurfacing from May 6 to May 10. ___(131)___ this period, employees are encouraged to use the south lot or the public garage on Elm Street. ___(132)___. We apologize for any inconvenience this may cause. The renovation is part of our ongoing ___(133)___ to improve workplace facilities. Should you have any questions, please do not hesitate to ___(134)___ the Facilities Department at extension 2200.\n\nBest regards,\nFacilities Department',
};

export const TOEIC_PART6: IQuestion[] = [
  q({
    id: 'p6-01',
    partOrSkill: 'PART_6',
    stem: '(131)',
    options: [
      { key: 'A', text: 'During' },
      { key: 'B', text: 'While' },
      { key: 'C', text: 'Since' },
      { key: 'D', text: 'Among' },
    ],
    correctAnswer: { key: 'A' },
    explanation: '"During + danh từ (this period)". "While" phải theo sau bởi mệnh đề.',
    tags: ['preposition'],
    passage: P6_PASSAGE,
    orderInPassage: 1,
  }),
  q({
    id: 'p6-02',
    partOrSkill: 'PART_6',
    stem: '(132)',
    options: [
      { key: 'A', text: 'Parking permits will be validated at the front desk.' },
      { key: 'B', text: 'The cafeteria menu has also been updated.' },
      { key: 'C', text: 'The new CEO will visit next month.' },
      { key: 'D', text: 'Our sales exceeded expectations this year.' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Câu chèn phải liên quan ngữ cảnh đỗ xe (parking permits).',
    tags: ['sentence_insertion', 'context'],
    difficulty: 4,
    passage: P6_PASSAGE,
    orderInPassage: 2,
  }),
  q({
    id: 'p6-03',
    partOrSkill: 'PART_6',
    stem: '(133)',
    options: [
      { key: 'A', text: 'effort' },
      { key: 'B', text: 'efforts' },
      { key: 'C', text: 'effortless' },
      { key: 'D', text: 'effortlessly' },
    ],
    correctAnswer: { key: 'B' },
    explanation: '"ongoing efforts to improve..." — danh từ số nhiều là collocation thông dụng.',
    tags: ['word_form', 'collocation'],
    passage: P6_PASSAGE,
    orderInPassage: 3,
  }),
  q({
    id: 'p6-04',
    partOrSkill: 'PART_6',
    stem: '(134)',
    options: [
      { key: 'A', text: 'contact' },
      { key: 'B', text: 'contacting' },
      { key: 'C', text: 'contacted' },
      { key: 'D', text: 'contacts' },
    ],
    correctAnswer: { key: 'A' },
    explanation: '"hesitate to + V nguyên mẫu".',
    tags: ['verb_form', 'infinitive'],
    difficulty: 1,
    passage: P6_PASSAGE,
    orderInPassage: 4,
  }),
];

/** TOEIC PART 7 — Reading Comprehension */
const P7_PASSAGE = {
  id: 'ps-p7-01',
  examType: 'TOEIC' as const,
  partOrSkill: 'PART_7',
  title: 'Questions 147–149 refer to the following advertisement.',
  content:
    'BRIGHTWAVE CO-WORKING SPACE – GRAND OPENING\n\nLooking for a flexible place to work in downtown Da Nang? BrightWave offers modern desks, private meeting rooms, and high-speed internet, all just five minutes from the Han River Bridge.\n\nMembership options:\n• Day Pass – 150,000 VND\n• Monthly Hot Desk – 2,500,000 VND\n• Dedicated Desk – 3,900,000 VND (includes a locker and 10 hours of meeting-room use)\n\nSign up before June 30 and receive your first month at 20% off. Free coffee and tea are available to all members throughout the day. To schedule a tour, call 0236-555-0199 or visit www.brightwave.vn.',
};

export const TOEIC_PART7: IQuestion[] = [
  q({
    id: 'p7-01',
    partOrSkill: 'PART_7',
    stem: 'What is being advertised?',
    options: [
      { key: 'A', text: 'A coffee shop' },
      { key: 'B', text: 'A shared office' },
      { key: 'C', text: 'An apartment building' },
      { key: 'D', text: 'A travel agency' },
    ],
    correctAnswer: { key: 'B' },
    explanation: '"Co-working space", "modern desks", "meeting rooms" → văn phòng dùng chung.',
    tags: ['main_idea'],
    difficulty: 1,
    passage: P7_PASSAGE,
    orderInPassage: 1,
  }),
  q({
    id: 'p7-02',
    partOrSkill: 'PART_7',
    stem: 'What is included with the Dedicated Desk membership?',
    options: [
      { key: 'A', text: 'A private office' },
      { key: 'B', text: 'Free parking' },
      { key: 'C', text: 'A storage locker' },
      { key: 'D', text: 'Unlimited meeting-room use' },
    ],
    correctAnswer: { key: 'C' },
    explanation: '"includes a locker and 10 hours of meeting-room use" → tủ đồ. Câu D sai vì chỉ có 10 giờ, không phải không giới hạn.',
    tags: ['detail', 'scanning'],
    passage: P7_PASSAGE,
    orderInPassage: 2,
  }),
  q({
    id: 'p7-03',
    partOrSkill: 'PART_7',
    stem: 'How can readers receive a discount?',
    options: [
      { key: 'A', text: 'By registering before a certain date' },
      { key: 'B', text: 'By referring a friend' },
      { key: 'C', text: 'By paying in cash' },
      { key: 'D', text: 'By attending a tour' },
    ],
    correctAnswer: { key: 'A' },
    explanation: '"Sign up before June 30 and receive ... 20% off".',
    tags: ['detail', 'paraphrase'],
    passage: P7_PASSAGE,
    orderInPassage: 3,
  }),
];

/** VSTEP — Reading & Listening samples */
const VSTEP_READ_PASSAGE = {
  id: 'ps-vs-r1',
  examType: 'VSTEP' as const,
  partOrSkill: 'READING_PART_1',
  title: 'Read the passage and answer the questions.',
  content:
    'Urban farming has grown rapidly in Vietnamese cities over the past decade. Rooftop gardens, balcony planters and community plots now supply fresh vegetables to thousands of households in Hanoi and Ho Chi Minh City. Supporters argue that growing food locally reduces transport emissions, strengthens neighbourhood ties and gives city dwellers a healthier relationship with what they eat. Critics, however, point out that small urban plots cannot realistically replace rural agriculture, and that the water and fertiliser used in some rooftop systems may offset their environmental benefits. Local authorities have begun to respond: in 2024, Ho Chi Minh City launched a pilot programme offering free seedlings and training to residents of ten districts.',
};

export const VSTEP_READING: IQuestion[] = [
  q({
    id: 'vs-r-01',
    examType: 'VSTEP',
    partOrSkill: 'READING_PART_1',
    level: 'B1',
    stem: 'What is the main topic of the passage?',
    options: [
      { key: 'A', text: 'The decline of rural agriculture in Vietnam' },
      { key: 'B', text: 'The rise of urban farming and its debate' },
      { key: 'C', text: 'Government subsidies for farmers' },
      { key: 'D', text: 'Water shortages in big cities' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Đoạn văn trình bày sự phát triển của urban farming cùng ý kiến ủng hộ và phản đối.',
    tags: ['main_idea'],
    passage: VSTEP_READ_PASSAGE,
    orderInPassage: 1,
  }),
  q({
    id: 'vs-r-02',
    examType: 'VSTEP',
    partOrSkill: 'READING_PART_1',
    level: 'B2',
    stem: 'The word "offset" in the passage is closest in meaning to ______.',
    options: [
      { key: 'A', text: 'increase' },
      { key: 'B', text: 'cancel out' },
      { key: 'C', text: 'explain' },
      { key: 'D', text: 'measure' },
    ],
    correctAnswer: { key: 'B' },
    explanation: '"Offset" = bù trừ, triệt tiêu (cancel out).',
    tags: ['vocabulary_in_context'],
    difficulty: 3,
    passage: VSTEP_READ_PASSAGE,
    orderInPassage: 2,
  }),
  q({
    id: 'vs-r-03',
    examType: 'VSTEP',
    partOrSkill: 'READING_PART_1',
    level: 'B2',
    stem: 'According to the passage, what did Ho Chi Minh City do in 2024?',
    options: [
      { key: 'A', text: 'Banned rooftop gardens' },
      { key: 'B', text: 'Started a pilot support programme' },
      { key: 'C', text: 'Raised water prices' },
      { key: 'D', text: 'Built new rural farms' },
    ],
    correctAnswer: { key: 'B' },
    explanation: '"launched a pilot programme offering free seedlings and training".',
    tags: ['detail'],
    passage: VSTEP_READ_PASSAGE,
    orderInPassage: 3,
  }),
];

export const VSTEP_LISTENING: IQuestion[] = [
  q({
    id: 'vs-l-01',
    examType: 'VSTEP',
    skillType: 'LISTENING',
    partOrSkill: 'LISTENING_PART_1',
    level: 'B1',
    stem: 'What time does the library close on weekdays?',
    options: [
      { key: 'A', text: '5 p.m.' },
      { key: 'B', text: '7 p.m.' },
      { key: 'C', text: '9 p.m.' },
      { key: 'D', text: '10 p.m.' },
    ],
    correctAnswer: { key: 'C' },
    explanation: 'Người nói nhắc "we stay open until nine on weekdays".',
    tags: ['detail', 'time'],
    passage: { id: 'ps-vs-l1', examType: 'VSTEP', partOrSkill: 'LISTENING_PART_1', content: '', audioUrl: AUDIO_SAMPLE },
  }),
  q({
    id: 'vs-l-02',
    examType: 'VSTEP',
    skillType: 'LISTENING',
    partOrSkill: 'LISTENING_PART_2',
    level: 'B2',
    stem: 'What is the speaker\'s attitude toward remote work?',
    options: [
      { key: 'A', text: 'Strongly opposed' },
      { key: 'B', text: 'Cautiously positive' },
      { key: 'C', text: 'Completely indifferent' },
      { key: 'D', text: 'Confused' },
    ],
    correctAnswer: { key: 'B' },
    explanation: 'Người nói nêu lợi ích nhưng kèm điều kiện "as long as teams communicate well" → thái độ tích cực có dè dặt.',
    tags: ['attitude', 'inference'],
    difficulty: 4,
    passage: { id: 'ps-vs-l2', examType: 'VSTEP', partOrSkill: 'LISTENING_PART_2', content: '', audioUrl: AUDIO_SAMPLE },
  }),
];

/** 4 tiêu chí chấm Viết: học viên thấy ở trang Luyện Viết, giáo viên chấm đúng theo đây */
export const WRITING_CRITERIA: RubricCriterion[] = [
  { key: 'task', label: 'Task Fulfilment', desc: 'Trả lời đủ các ý của đề, đúng số từ' },
  { key: 'coherence', label: 'Coherence & Cohesion', desc: 'Bố cục rõ, dùng từ nối hợp lý' },
  { key: 'lexical', label: 'Lexical Resource', desc: 'Từ vựng đa dạng, đúng ngữ cảnh' },
  { key: 'grammar', label: 'Grammatical Range', desc: 'Đa dạng cấu trúc, ít lỗi' },
];

/** 4 tiêu chí chấm Nói */
export const SPEAKING_CRITERIA: RubricCriterion[] = [
  { key: 'fluency', label: 'Fluency & Coherence', desc: 'Nói liền mạch, ý có liên kết' },
  { key: 'pronunciation', label: 'Pronunciation', desc: 'Phát âm, trọng âm, ngữ điệu' },
  { key: 'lexical', label: 'Lexical Resource', desc: 'Từ vựng phù hợp chủ đề' },
  { key: 'grammar', label: 'Grammatical Range', desc: 'Đa dạng cấu trúc, ít lỗi' },
];

export const VSTEP_WRITING_TASKS = [
  {
    id: 'vs-w-1',
    task: 'Task 1 — Letter / Email',
    minutes: 20,
    minWords: 120,
    prompt:
      'You recently stayed at a hotel during a business trip and were unhappy with the service. Write an email to the hotel manager. In your email: describe the problems you experienced, explain how they affected your trip, and say what you would like the manager to do.',
  },
  {
    id: 'vs-w-2',
    task: 'Task 2 — Essay',
    minutes: 40,
    minWords: 250,
    prompt:
      'Some people believe that universities should focus on preparing students for specific careers, while others think they should provide a broad general education. Discuss both views and give your own opinion.',
  },
];

export const VSTEP_SPEAKING_PARTS = [
  { id: 'vs-s-1', part: 'Part 1 — Social Interaction', minutes: 3, prompt: 'Let\'s talk about your hometown. Where is it? What do you like most about living there? Has it changed much in recent years?' },
  { id: 'vs-s-2', part: 'Part 2 — Solution Discussion', minutes: 4, prompt: 'Your company wants to reduce employee stress. Three options are proposed: flexible working hours, a gym membership, or weekly team outings. Which option is best? Explain why.' },
  { id: 'vs-s-3', part: 'Part 3 — Topic Development', minutes: 5, prompt: 'Topic: The role of technology in education. Talk about: access to information, interaction between teachers and students, and possible drawbacks.' },
];

export const ALL_QUESTIONS: IQuestion[] = [...TOEIC_PART1, ...TOEIC_PART2, ...TOEIC_PART3, ...TOEIC_PART4, ...TOEIC_PART5, ...TOEIC_PART6, ...TOEIC_PART7, ...VSTEP_READING, ...VSTEP_LISTENING];

export const QUESTIONS_BY_PART: Record<string, IQuestion[]> = {
  PART_1: TOEIC_PART1,
  PART_2: TOEIC_PART2,
  PART_3: TOEIC_PART3,
  PART_4: TOEIC_PART4,
  PART_5: TOEIC_PART5,
  PART_6: TOEIC_PART6,
  PART_7: TOEIC_PART7,
  VSTEP_READING,
  VSTEP_LISTENING,
};

/**
 * Dựng đề từ ngân hàng câu hỏi mẫu.
 * `setup` chế độ PRACTICE: chỉ gồm các Part được chọn (mỗi Part một phần), thời gian theo người học đặt; 0 phút = không giới hạn.
 */
export function buildMockTest(id: string, examType: 'TOEIC' | 'VSTEP' = 'TOEIC', title?: string, setup?: ExamSetup): IMockTest {
  if (setup?.mode === 'PRACTICE') {
    const info = [...TOEIC_PARTS_INFO, ...VSTEP_PARTS_INFO];
    const sections = setup.parts
      .filter((p) => QUESTIONS_BY_PART[p]?.length)
      .map((p, i) => {
        const part = info.find((x) => x.id === p);
        const questions = QUESTIONS_BY_PART[p];
        return { id: `${id}-${p}`, name: part ? `${part.name} · ${part.nameVi}` : p, skillType: questions[0].skillType, orderIndex: i + 1, questions };
      });
    const names = setup.parts.map((p) => info.find((x) => x.id === p)?.name ?? p).join(', ');
    return {
      id,
      slug: id,
      title: `${title ?? id} · Luyện ${names}`,
      examType,
      durationMinutes: setup.minutes ?? 0,
      totalQuestions: sections.reduce((a, s) => a + s.questions.length, 0),
      sections,
    };
  }
  if (examType === 'VSTEP') {
    return {
      id,
      slug: id,
      title: title ?? 'VSTEP B1–B2 Mock Test (Listening & Reading)',
      examType: 'VSTEP',
      targetLevel: 'B2',
      durationMinutes: 20,
      totalQuestions: VSTEP_LISTENING.length + VSTEP_READING.length,
      sections: [
        { id: `${id}-l`, name: 'Listening', skillType: 'LISTENING', durationMins: 8, orderIndex: 1, questions: VSTEP_LISTENING },
        { id: `${id}-r`, name: 'Reading', skillType: 'READING', durationMins: 12, orderIndex: 2, questions: VSTEP_READING },
      ],
    };
  }
  const listening = [...TOEIC_PART1, ...TOEIC_PART2, ...TOEIC_PART3, ...TOEIC_PART4];
  const reading = [...TOEIC_PART5, ...TOEIC_PART6, ...TOEIC_PART7];
  return {
    id,
    slug: id,
    title: title ?? 'ETS TOEIC 2024 — Mini Test',
    examType: 'TOEIC',
    targetLevel: '650+',
    durationMinutes: 25,
    totalQuestions: listening.length + reading.length,
    sections: [
      { id: `${id}-l`, name: 'Listening (Part 1–4)', skillType: 'LISTENING', durationMins: 12, orderIndex: 1, questions: listening },
      { id: `${id}-r`, name: 'Reading (Part 5–7)', skillType: 'READING', durationMins: 13, orderIndex: 2, questions: reading },
    ],
  };
}

export function buildPartTest(part: string): IMockTest {
  const questions = QUESTIONS_BY_PART[part] ?? TOEIC_PART5;
  return {
    id: `part-${part}`,
    slug: `part-${part}`,
    title: `Luyện ${part.replace('_', ' ')}`,
    examType: questions[0]?.examType ?? 'TOEIC',
    durationMinutes: Math.max(5, questions.length * 1),
    totalQuestions: questions.length,
    sections: [{ id: `sec-${part}`, name: part, skillType: questions[0]?.skillType ?? 'READING', orderIndex: 1, questions }],
  };
}
