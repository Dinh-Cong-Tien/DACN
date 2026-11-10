import type { AuthoredTest, AuthoredQuestion } from './types';

/** Đề luyện tổng hợp 40 câu — định dạng đề thi tốt nghiệp THPT môn Tiếng Anh (từ 2025) */

const AD_PROMPT = "Read the following advertisement and choose the option that best fits each of the numbered blanks.";
const LEAFLET_PROMPT = "Read the following leaflet and choose the option that best fits each of the numbered blanks.";
const ARRANGE_PROMPT = "Choose the correct arrangement of the sentences to make a meaningful exchange or text.";
const CLOZE_PROMPT = "Read the following passage and choose the option that best fits each of the numbered blanks.";
const READING_PROMPT = "Read the following passage and choose the best answer to each of the questions.";

const AD = {
  title: "Learn to Swim at Blue Wave Pool!",
  content: `Have you always wanted to learn to swim but never (1) ______ the chance? Blue Wave Pool is now open in the city centre! Our (2) ______ instructors teach small groups of children and adults, so every learner gets plenty of attention.

Classes take place every day (3) ______ 6 a.m. to 9 p.m. Swimming is one of the (4) ______ ways to stay fit and healthy, and it is a skill that could one day save your life.

Please remember (5) ______ your own towel and goggles. Places are limited, so call us today to (6) ______ a place!`,
};

const LEAFLET = {
  title: "Every Drop Counts!",
  content: `(7) ______ water is wasted in our homes every day, and most of this waste can (8) ______ with a few simple habits.

- Turn off the tap (9) ______ you are brushing your teeth.
- Repair any pipes (10) ______ are leaking as soon as possible.
- Take short showers: a five-minute shower uses much (11) ______ water than a full bath.

Clean water is a precious resource. Let's all (12) ______ our part to protect it!`,
};

const ARR_13 = {
  title: "Conversation",
  content: `a. Lan: Not yet. Could you recommend one?
b. Nam: Have you chosen a book for your English presentation?
c. Nam: Try "Charlotte's Web". It's short and easy to understand.`,
};

const ARR_14 = {
  title: "Conversation",
  content: `a. Receptionist: Certainly. Is 9:30 tomorrow morning convenient for you?
b. Receptionist: Good afternoon, Hoa Binh Dental Clinic. How may I help you?
c. Patient: Hello, I'd like to make an appointment with Dr Lan, please.
d. Receptionist: Fine. Could I have your name and phone number, please?
e. Patient: Yes, that's perfect for me.`,
};

const ARR_15 = {
  title: "Email",
  content: `Dear Hung,
a. At first, I found it hard to remember where all the books were.
b. Why don't you come and visit me there next weekend?
c. I'm writing to tell you about my new part-time job at a bookshop.
d. Now, however, I can help customers find what they need in seconds.
e. I work there every Saturday and Sunday afternoon.
Best wishes,
Linh`,
};

const ARR_16 = {
  title: "Paragraph",
  content: `a. For example, tomatoes, herbs and lettuce can grow well in small pots.
b. Rooftop gardens are becoming popular in many crowded cities.
c. In addition, these gardens help to cool buildings during hot summers.
d. They allow city dwellers to grow their own vegetables even without a yard.
e. Therefore, more and more apartment owners are turning their roofs into green spaces.`,
};

const ARR_17 = {
  title: "Paragraph",
  content: `a. Next, practise answering common questions with a friend.
b. Preparing for a job interview can make you feel much less nervous.
c. Lastly, arrive a little early so that you have time to relax.
d. To begin with, find out as much as you can about the company.
e. You should also choose clean, suitable clothes the night before.`,
};

const CLOZE = {
  title: "Bat Trang pottery village",
  content: `Bat Trang, a village (18) ______, has been famous for its pottery for more than 500 years. Visitors come here not only to buy ceramics but also (19) ______. Under the guidance of local artisans, they can shape a bowl or paint a vase by hand.

However, the village is facing several challenges. Many young people prefer office jobs in the city, (20) ______. (21) ______, cheap factory-made products have made it harder for traditional workshops to compete. To protect this heritage, the local government has launched programmes (22) ______.`,
};

const SLEEP = {
  title: "Teenagers and sleep",
  content: `Most doctors agree that teenagers need between eight and ten hours of sleep every night. However, surveys in many countries show that a large number of secondary school students sleep fewer than seven hours. This shortage of rest can affect not only their health but also their performance at school.

Part of the problem is biological. During adolescence, the body releases melatonin, the hormone that makes people feel sleepy, about two hours later than it does in children or adults. As a result, many teenagers do not feel tired until eleven o'clock or even midnight. Yet most schools start early in the morning, so students are forced to get up before their bodies are ready.

Modern habits make the situation worse. Many young people use their phones in bed to chat with friends or watch videos. The bright light from screens tricks the brain into thinking it is still daytime, which delays sleep even further. Heavy homework loads and extra classes in the evening also leave little time for rest.

The consequences can be serious. Students who do not get enough sleep often find it hard to concentrate and remember new information. They are also more likely to feel irritable and anxious. Some schools in the United States have responded by starting lessons later, at around 8:30 a.m. Early results are encouraging: attendance has improved, and students report feeling more alert in class. Experts also advise teenagers to put their phones away at least an hour before bed and to keep a regular sleep schedule, even at weekends.`,
};

const CITIZEN = {
  title: "Citizen science",
  content: `[I] For centuries, scientific research was carried out almost entirely by professionals working in universities and laboratories. [II] Today, however, millions of ordinary people around the world are contributing to real research projects in their free time. [III] This movement, known as citizen science, is changing the way knowledge is produced. [IV]

One of the best-known examples is the Christmas Bird Count, which began in the United States in 1900. Every winter, tens of thousands of volunteers record the number and species of birds they see in a particular area. Because the count has been repeated for more than a century, scientists have been able to use it to track how bird populations respond to climate change. Such long-term data would be almost impossible for a small team of researchers to collect on their own.

Technology has made citizen science far more accessible. With smartphone apps, a hiker can photograph an unfamiliar plant and upload the image, along with its exact location, in a matter of seconds. Online platforms such as Zooniverse allow volunteers to examine thousands of images from telescopes or wildlife cameras and label what they see. In 2007, a Dutch schoolteacher taking part in one such project spotted a strange green cloud in a space image; it turned out to be a previously unknown type of astronomical object.

Nevertheless, citizen science is not without its critics. Some researchers question whether data gathered by untrained volunteers is accurate enough to be published. A volunteer might, for instance, mistake one bird species for another that looks similar. To address this concern, many projects provide short training courses and ask several people to check the same observation. Studies have shown that when these measures are in place, the results produced by volunteers can be as reliable as those of experts.

Perhaps the greatest value of citizen science lies beyond the data itself. Participants often say that the experience makes them more curious about the natural world and more willing to protect it. In this sense, citizen science does not only help scientists answer questions; it also helps to build a society that understands and values science.`,
};

const q = (
  type: AuthoredQuestion['type'],
  prompt: string,
  passage: { title?: string; content: string },
  text: string,
  options: string[],
  explain: string,
): AuthoredQuestion => ({ type, prompt, passage, text, options, explain });

export const TESTS: AuthoredTest[] = [
  {
    lessonId: '7f1774a7-4c59-44e1-9d4d-c741fe46346c',
    title: 'Đề luyện tổng hợp 40 câu — 50 phút',
    prompt: "Đọc kỹ từng phần và chọn đáp án đúng nhất cho mỗi câu hỏi.",
    type: 'reading',
    questions: [
      // ---- Câu 1–6: advertisement ----
      q('notice-cloze', AD_PROMPT, AD, "Question 1: (1) ______", ["had", "have", "having", "to have"],
        "Cấu trúc song song với \"Have you always wanted\" (hiện tại hoàn thành) → \"(have) never had the chance\"; cần quá khứ phân từ had."),
      q('notice-cloze', AD_PROMPT, AD, "Question 2: (2) ______", ["experienced", "experience", "experiencing", "experiences"],
        "Trước danh từ \"instructors\" cần tính từ → experienced (giàu kinh nghiệm)."),
      q('notice-cloze', AD_PROMPT, AD, "Question 3: (3) ______", ["from", "since", "between", "at"],
        "Cặp cố định from … to … chỉ khoảng thời gian (from 6 a.m. to 9 p.m.). \"between\" phải đi với \"and\"."),
      q('notice-cloze', AD_PROMPT, AD, "Question 4: (4) ______", ["best", "better", "good", "well"],
        "Cấu trúc so sánh nhất: one of the + tính từ so sánh nhất + danh từ số nhiều → one of the best ways."),
      q('notice-cloze', AD_PROMPT, AD, "Question 5: (5) ______", ["to bring", "bringing", "bring", "brought"],
        "remember + to V = nhớ phải làm việc gì (chưa làm); remember + V-ing = nhớ đã làm việc gì → to bring."),
      q('notice-cloze', AD_PROMPT, AD, "Question 6: (6) ______", ["book", "order", "hire", "pay"],
        "Kết hợp từ: book a place = đặt chỗ trước. order / hire / pay không đi với \"a place\" theo nghĩa này."),

      // ---- Câu 7–12: leaflet ----
      q('notice-cloze', LEAFLET_PROMPT, LEAFLET, "Question 7: (7) ______", ["A lot of", "Many", "A few", "Several"],
        "\"water\" là danh từ không đếm được → A lot of. Many / a few / several chỉ đi với danh từ đếm được số nhiều."),
      q('notice-cloze', LEAFLET_PROMPT, LEAFLET, "Question 8: (8) ______", ["be avoided", "avoid", "avoiding", "been avoided"],
        "Chủ ngữ \"this waste\" chịu tác động → bị động với động từ khuyết thiếu: can + be + V3 → can be avoided."),
      q('notice-cloze', LEAFLET_PROMPT, LEAFLET, "Question 9: (9) ______", ["while", "during", "despite", "because of"],
        "Sau chỗ trống là mệnh đề (you are brushing…) và nghĩa \"trong khi\" → while. During / despite / because of đi với danh từ."),
      q('notice-cloze', LEAFLET_PROMPT, LEAFLET, "Question 10: (10) ______", ["that", "who", "what", "whose"],
        "Đại từ quan hệ thay cho vật \"pipes\", làm chủ ngữ của \"are leaking\" → that. Who chỉ người, what không dùng sau danh từ, whose cần danh từ theo sau."),
      q('notice-cloze', LEAFLET_PROMPT, LEAFLET, "Question 11: (11) ______", ["less", "fewer", "little", "the least"],
        "So sánh hơn với danh từ không đếm được \"water\" (có \"than\") → less. Fewer dùng cho danh từ đếm được; \"the least\" là so sánh nhất."),
      q('notice-cloze', LEAFLET_PROMPT, LEAFLET, "Question 12: (12) ______", ["do", "make", "take", "give"],
        "Cụm cố định: do one's part = góp phần, làm phần việc của mình."),

      // ---- Câu 13–17: arrangement ----
      q('arrange', ARRANGE_PROMPT, ARR_13, "Question 13", ["b – a – c", "a – b – c", "c – a – b", "b – c – a"],
        "Nam hỏi đã chọn sách chưa (b) → Lan trả lời chưa, nhờ gợi ý (a) → Nam gợi ý một cuốn (c)."),
      q('arrange', ARRANGE_PROMPT, ARR_14, "Question 14", ["b – c – a – e – d", "b – a – c – e – d", "c – b – a – d – e", "b – c – e – a – d"],
        "Lễ tân chào (b) → bệnh nhân xin đặt lịch (c) → lễ tân đề xuất giờ (a) → bệnh nhân đồng ý (e) → lễ tân xin tên, số điện thoại (d)."),
      q('arrange', ARRANGE_PROMPT, ARR_15, "Question 15", ["c – e – a – d – b", "c – a – e – d – b", "e – c – a – d – b", "c – e – d – a – b"],
        "Nêu mục đích viết thư (c) → thời gian làm việc (e) → \"At first\" khó khăn ban đầu (a) → \"Now, however\" hiện tại đã quen (d) → lời mời kết thư (b)."),
      q('arrange', ARRANGE_PROMPT, ARR_16, "Question 16", ["b – d – a – c – e", "b – a – d – c – e", "d – b – a – c – e", "b – d – c – a – e"],
        "Câu chủ đề (b) → lợi ích chính, \"They\" thay cho rooftop gardens (d) → \"For example\" minh hoạ cho việc trồng rau (a) → \"In addition\" lợi ích thêm (c) → \"Therefore\" kết luận (e)."),
      q('arrange', ARRANGE_PROMPT, ARR_17, "Question 17", ["b – d – a – e – c", "b – a – d – e – c", "d – b – a – e – c", "b – d – e – c – a"],
        "Câu chủ đề (b) → \"To begin with\" (d) → \"Next\" (a) → \"also\" bổ sung (e) → \"Lastly\" (c)."),

      // ---- Câu 18–22: text cloze ----
      q('text-cloze', CLOZE_PROMPT, CLOZE, "Question 18: (18) ______",
        ["located about 15 kilometres from Ha Noi's city centre", "which locating about 15 kilometres from Ha Noi's city centre", "is located about 15 kilometres from Ha Noi's city centre", "locates about 15 kilometres from Ha Noi's city centre"],
        "Rút gọn mệnh đề quan hệ bị động (which is located → located) bổ nghĩa cho \"a village\"; động từ chính của câu là \"has been\"."),
      q('text-cloze', CLOZE_PROMPT, CLOZE, "Question 19: (19) ______",
        ["to experience making pottery themselves", "experiencing making pottery themselves", "for experience making pottery themselves", "they experience making pottery themselves"],
        "Cấu trúc song song not only to buy … but also to experience … (cùng dạng to V chỉ mục đích)."),
      q('text-cloze', CLOZE_PROMPT, CLOZE, "Question 20: (20) ______",
        ["so fewer people are learning the traditional skills", "despite fewer people learn the traditional skills", "which fewer people learning the traditional skills", "so that fewer people learned the traditional skills"],
        "Nêu kết quả của việc giới trẻ thích làm văn phòng → so + mệnh đề. \"so that\" chỉ mục đích, sai nghĩa; despite không đi với mệnh đề."),
      q('text-cloze', CLOZE_PROMPT, CLOZE, "Question 21: (21) ______", ["In addition", "In contrast", "Instead of", "Even though"],
        "Câu sau nêu thêm một khó khăn nữa của làng nghề → In addition. Instead of cần danh từ, Even though cần thêm mệnh đề chính."),
      q('text-cloze', CLOZE_PROMPT, CLOZE, "Question 22: (22) ______",
        ["that train young people and promote the village's products online", "which training young people and promoting the village's products online", "to be trained young people and promote the village's products online", "trained young people and promoted the village's products online"],
        "Mệnh đề quan hệ bổ nghĩa cho \"programmes\": that + V (train … and promote …), hai động từ song song ở thì hiện tại."),

      // ---- Câu 23–30: reading 1 ----
      q('reading', READING_PROMPT, SLEEP, "Question 23: What is the passage mainly about?",
        ["Why many teenagers do not get enough sleep, its effects and possible solutions", "How melatonin is produced in the human body", "Why schools in the United States start lessons late", "How mobile phones help teenagers relax"],
        "Bài nêu thực trạng thiếu ngủ (đoạn 1), nguyên nhân (đoạn 2–3), hậu quả và giải pháp (đoạn 4)."),
      q('reading', READING_PROMPT, SLEEP, "Question 24: The word \"releases\" in paragraph 2 is closest in meaning to ______.",
        ["produces", "stores", "removes", "blocks"],
        "\"the body releases melatonin\" = cơ thể tiết ra melatonin → release ≈ produce."),
      q('reading', READING_PROMPT, SLEEP, "Question 25: The word \"it\" in paragraph 2 refers to ______.",
        ["the body", "melatonin", "adolescence", "the hormone"],
        "\"the body releases melatonin … later than it does in children or adults\" — \"it\" thay cho \"the body\" (cơ thể của trẻ em hay người lớn tiết ra)."),
      q('reading', READING_PROMPT, SLEEP, "Question 26: According to paragraph 3, why does using a phone in bed delay sleep?",
        ["The light from the screen makes the brain think it is still daytime.", "Phone calls wake up other family members.", "Phones produce melatonin.", "Videos are usually too long to finish."],
        "Đoạn 3: \"The bright light from screens tricks the brain into thinking it is still daytime, which delays sleep\"."),
      q('reading', READING_PROMPT, SLEEP, "Question 27: The word \"irritable\" in paragraph 4 is OPPOSITE in meaning to ______.",
        ["calm", "angry", "nervous", "tired"],
        "irritable = dễ cáu gắt ↔ calm = bình tĩnh, điềm đạm."),
      q('reading', READING_PROMPT, SLEEP, "Question 28: Which of the following is NOT mentioned as a reason why teenagers sleep too little?",
        ["eating too much sugar", "using phones in bed", "heavy homework loads", "early school start times"],
        "Đoạn 2–3 nêu giờ học sớm, dùng điện thoại trên giường, bài tập và học thêm buổi tối; không nhắc tới ăn nhiều đường."),
      q('reading', READING_PROMPT, SLEEP, "Question 29: What can be inferred from paragraph 4?",
        ["Starting school later may help students learn better.", "All American schools now begin at 8:30 a.m.", "Teenagers should sleep more at weekends than on weekdays.", "Anxiety is the main cause of poor sleep among teenagers."],
        "Trường vào học muộn hơn thì đi học đều hơn, học sinh tỉnh táo hơn → vào học muộn có thể giúp học tốt hơn. Chỉ \"some schools\" làm vậy; chuyên gia khuyên ngủ đều giờ cả cuối tuần."),
      q('reading', READING_PROMPT, SLEEP, "Question 30: Which of the following best paraphrases the sentence \"students are forced to get up before their bodies are ready\"?",
        ["Students have to wake up while their bodies still need sleep.", "Students choose to wake up early to prepare their bodies.", "Students' bodies are ready long before they get up.", "Students refuse to get up until their bodies are ready."],
        "be forced to = buộc phải; before their bodies are ready = khi cơ thể chưa sẵn sàng (vẫn cần ngủ)."),

      // ---- Câu 31–40: reading 2 ----
      q('reading', READING_PROMPT, CITIZEN, "Question 31: Where in paragraph 1 does the following sentence best fit? \"Without any formal training, they count birds, photograph insects, measure rainfall and even classify distant galaxies.\"",
        ["[III]", "[I]", "[II]", "[IV]"],
        "Câu chèn nói cụ thể việc người không qua đào tạo làm → đứng ngay sau câu \"millions of ordinary people … contributing to real research projects\", tức vị trí [III]; \"they\" = ordinary people."),
      q('reading', READING_PROMPT, CITIZEN, "Question 32: The word \"it\" in paragraph 2 refers to ______.",
        ["the Christmas Bird Count", "climate change", "a century", "the United States"],
        "\"Because the count has been repeated … scientists have been able to use it to track …\" — \"it\" là cuộc đếm chim (the count) ở đầu câu."),
      q('reading', READING_PROMPT, CITIZEN, "Question 33: According to paragraph 2, what makes the Christmas Bird Count especially valuable to scientists?",
        ["It has produced data over a very long period.", "It is organised by professional researchers.", "It only takes place in the United States.", "It records birds in summer as well as winter."],
        "\"Because the count has been repeated for more than a century\" và \"Such long-term data would be almost impossible … to collect\" → giá trị nằm ở dữ liệu dài hạn."),
      q('reading', READING_PROMPT, CITIZEN, "Question 34: The word \"accessible\" in paragraph 3 is closest in meaning to ______.",
        ["easy to take part in", "difficult to understand", "costly to organise", "limited to experts"],
        "Đoạn 3 cho thấy nhờ ứng dụng, ai cũng có thể tham gia trong vài giây → accessible = dễ tiếp cận, dễ tham gia."),
      q('reading', READING_PROMPT, CITIZEN, "Question 35: Which of the following is TRUE according to paragraph 3?",
        ["A volunteer discovered a new type of object in space by studying an image.", "Zooniverse was created by a Dutch schoolteacher.", "Hikers must send plant samples to a laboratory.", "Volunteers on Zooniverse operate telescopes themselves."],
        "Đoạn 3: một giáo viên Hà Lan phát hiện đám mây xanh lạ trong ảnh vũ trụ, hoá ra là \"a previously unknown type of astronomical object\"."),
      q('reading', READING_PROMPT, CITIZEN, "Question 36: The word \"accurate\" in paragraph 4 is OPPOSITE in meaning to ______.",
        ["incorrect", "precise", "reliable", "detailed"],
        "accurate = chính xác ↔ incorrect = sai. precise / reliable gần nghĩa với accurate."),
      q('reading', READING_PROMPT, CITIZEN, "Question 37: Which of the following best paraphrases the sentence \"Such long-term data would be almost impossible for a small team of researchers to collect on their own\"?",
        ["A small group of scientists could hardly gather data over such a long time without help.", "A small team of researchers collected the data easily by themselves.", "Long-term data is not useful for small research teams.", "Only a small team of researchers is able to collect long-term data."],
        "almost impossible = hầu như không thể (could hardly); on their own = tự mình, không có trợ giúp."),
      q('reading', READING_PROMPT, CITIZEN, "Question 38: What can be inferred from paragraph 4?",
        ["The quality of volunteers' data depends partly on how projects are organised.", "Most volunteers cannot tell different bird species apart.", "Experts no longer check volunteers' observations.", "Scientific journals refuse to publish citizen science data."],
        "\"when these measures are in place, the results … can be as reliable as those of experts\" → chất lượng dữ liệu phụ thuộc vào cách dự án tổ chức (đào tạo, kiểm tra chéo)."),
      q('reading', READING_PROMPT, CITIZEN, "Question 39: Which of the following is NOT mentioned in the passage as an activity of citizen scientists?",
        ["testing new medicines", "recording birds they see", "photographing unfamiliar plants", "labelling images from telescopes"],
        "Bài nhắc ghi lại số chim (đoạn 2), chụp ảnh cây lạ và gắn nhãn ảnh kính viễn vọng (đoạn 3); không nhắc thử nghiệm thuốc mới."),
      q('reading', READING_PROMPT, CITIZEN, "Question 40: Which of the following is the best title for the passage?",
        ["Citizen Science: How Ordinary People Contribute to Research", "The History of the Christmas Bird Count", "Why Volunteers Make Poor Scientists", "New Discoveries in Astronomy"],
        "Cả bài nói về khoa học công dân: ví dụ, vai trò của công nghệ, tranh luận về độ tin cậy và giá trị xã hội; các tiêu đề khác chỉ là chi tiết hoặc trái ý (đoạn 4 cho thấy dữ liệu tình nguyện viên có thể tin cậy)."),
    ],
  },
];
