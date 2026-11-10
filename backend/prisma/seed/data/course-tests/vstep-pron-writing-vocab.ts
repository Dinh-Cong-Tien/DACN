import type { AuthoredTest } from './types';

/** Khoá VSTEP: Phát âm, Từ vựng, Viết — đề kiểm tra soạn riêng (không lấy lại bài tập trong bài học). */
export const TESTS: AuthoredTest[] = [
  // ───────────── Phát âm và từ loại cơ bản — Ôn tập chặng 1 ─────────────
  {
    lessonId: "f175e971-152c-4245-b01f-16c00c8f73ef",
    title: "Ôn tập chặng 1",
    prompt: "Chọn đáp án đúng",
    type: "phoneme",
    questions: [
      {
        prompt: "Chọn từ có đuôi -ed phát âm khác các từ còn lại",
        options: ["needed", "watched", "kissed", "helped"],
        explain: "needed /ˈniːdɪd/ đọc /ɪd/ vì gốc tận cùng bằng /d/; watched, kissed, helped tận cùng bằng âm vô thanh /tʃ/, /s/, /p/ nên đuôi -ed đọc /t/.",
      },
      {
        prompt: "Chọn từ có đuôi -s/-es phát âm khác các từ còn lại",
        options: ["watches", "lamps", "cats", "roofs"],
        explain: "watches /ˈwɒtʃɪz/ đọc /ɪz/ vì gốc tận cùng bằng /tʃ/; lamps, cats, roofs tận cùng bằng âm vô thanh /p/, /t/, /f/ nên đọc /s/.",
      },
      {
        prompt: "Chọn từ có đuôi -s phát âm khác các từ còn lại",
        options: ["dogs", "shops", "plates", "desks"],
        explain: "dogs /dɒɡz/ đọc /z/ vì /ɡ/ là âm hữu thanh; shops, plates, desks tận cùng bằng âm vô thanh /p/, /t/, /k/ nên đọc /s/.",
      },
      {
        prompt: "Từ nào có âm cuối là /k/?",
        options: ["cake", "cage", "case", "came"],
        explain: "cake /keɪk/ kết thúc bằng /k/ (chữ e cuối câm); cage kết thúc bằng /dʒ/, case bằng /s/, came bằng /m/.",
      },
      {
        prompt: "Chọn từ có trọng âm khác các từ còn lại",
        options: ["begin", "table", "garden", "window"],
        explain: "begin /bɪˈɡɪn/ nhấn âm tiết thứ hai; table, garden, window là danh từ hai âm tiết nhấn âm tiết đầu.",
      },
      {
        prompt: "Chọn từ có trọng âm khác các từ còn lại",
        options: ["teacher", "enjoy", "forget", "prefer"],
        explain: "teacher /ˈtiːtʃə/ nhấn âm tiết đầu; enjoy, forget, prefer là động từ hai âm tiết nhấn âm tiết thứ hai.",
      },
      {
        type: "grammar-gap",
        prompt: "Chọn từ loại đúng điền vào chỗ trống",
        text: "She sings very _____ at every school concert.",
        options: ["beautifully", "beautiful", "beauty", "beautify"],
        explain: "Cần trạng từ bổ nghĩa cho động từ sings nên dùng beautifully; beautiful là tính từ, beauty là danh từ, beautify là động từ.",
      },
      {
        type: "grammar-gap",
        prompt: "Chọn từ loại đúng điền vào chỗ trống",
        text: "Many students lack _____ when they speak English in public.",
        options: ["confidence", "confident", "confidently", "confide"],
        explain: "Sau động từ lack cần một danh từ làm tân ngữ: confidence (sự tự tin); confident là tính từ, confidently là trạng từ.",
      },
      {
        type: "grammar-gap",
        prompt: "Chọn từ loại đúng điền vào chỗ trống",
        text: "This is a very _____ website for learning new words.",
        options: ["useful", "use", "usefully", "usefulness"],
        explain: "Giữa very và danh từ website cần tính từ: useful; usefully là trạng từ, usefulness là danh từ.",
      },
      {
        prompt: "Ký hiệu IPA nào thể hiện âm đầu của từ \"ship\"?",
        options: ["/ʃ/", "/s/", "/tʃ/", "/ʒ/"],
        explain: "ship /ʃɪp/ bắt đầu bằng /ʃ/ (chữ sh); /s/ là âm trong see, /tʃ/ trong chip, /ʒ/ trong vision.",
      },
    ],
  },

  // ───────────── Cách học từ và cấu tạo từ — Kiểm tra chặng 3 ─────────────
  {
    lessonId: "b3a74f8b-1749-4786-bee5-26599cf44d98",
    title: "Kiểm tra chặng 3",
    prompt: "Chọn từ đúng điền vào chỗ trống",
    type: "vocab-context",
    questions: [
      {
        text: "I'm sorry, I _____ your message and thought the meeting was on Friday.",
        options: ["misunderstood", "disunderstood", "ununderstood", "reunderstood"],
        explain: "Tiền tố mis- mang nghĩa \"sai, nhầm\": misunderstand = hiểu nhầm; các dạng dis-, un-, re- + understand không tồn tại.",
      },
      {
        text: "The instructions were so _____ that nobody knew what to do next.",
        options: ["unclear", "disclear", "misclear", "inclear"],
        explain: "Tính từ clear tạo nghĩa phủ định bằng un-: unclear (không rõ ràng); disclear, misclear, inclear không phải từ tiếng Anh.",
      },
      {
        text: "The shop is closed for repairs and will _____ next Monday.",
        options: ["reopen", "preopen", "disopen", "overopen"],
        explain: "Tiền tố re- nghĩa là \"lại\": reopen = mở cửa trở lại; pre- (trước), dis- (phủ định), over- (quá mức) không hợp với open ở đây.",
      },
      {
        text: "Don't _____ the rice, or it will become soft and sticky.",
        options: ["overcook", "discook", "uncook", "malcook"],
        explain: "Tiền tố over- nghĩa là \"quá mức\": overcook = nấu quá chín; các phương án còn lại không phải từ có thật.",
      },
      {
        text: "Her _____ to help others made everyone respect her.",
        options: ["willingness", "willingment", "willingity", "willingtion"],
        explain: "Tính từ willing tạo danh từ bằng hậu tố -ness: willingness (sự sẵn lòng); -ment, -ity, -tion không kết hợp với willing.",
      },
      {
        text: "The _____ of the new bridge took almost three years.",
        options: ["construction", "constructment", "constructness", "constructity"],
        explain: "Động từ construct tạo danh từ bằng -ion: construction (việc xây dựng); các dạng -ment, -ness, -ity không tồn tại.",
      },
      {
        text: "The hotel staff were very _____ and answered all our questions.",
        options: ["helpful", "helpless", "helping", "helpness"],
        explain: "helpful (-ful: có nhiều) = hay giúp đỡ, hợp với việc trả lời mọi câu hỏi; helpless (-less: không có) = bất lực, ngược nghĩa; very helping và helpness sai.",
      },
      {
        text: "He did the test _____, so he made a lot of silly mistakes.",
        options: ["carelessly", "careless", "carefully", "care"],
        explain: "Cần trạng từ bổ nghĩa cho did, và vế sau nói mắc nhiều lỗi nên chọn carelessly (cẩu thả); carefully sai nghĩa, careless là tính từ.",
      },
      {
        prompt: "Mục từ điển ghi: deny (v) + V-ing. Chọn dạng đúng điền vào chỗ trống",
        text: "The man denied _____ the money from the office.",
        options: ["taking", "to take", "take", "to taking"],
        explain: "Mục từ cho biết deny đi với V-ing (deny doing sth), nên dùng taking; to take và take sai mẫu câu.",
      },
      {
        text: "All _____ must wear a uniform at work, but the manager can choose her own clothes.",
        options: ["employees", "employers", "employment", "employ"],
        explain: "Hậu tố -ee chỉ người được thuê: employees (nhân viên); employers (-er) là người thuê, ngược nghĩa với câu; employment là danh từ chỉ việc làm.",
      },
    ],
  },

  // ───────────── Dùng từ tự nhiên — Bài kiểm tra cuối khoá ─────────────
  {
    lessonId: "c33e0bcd-9f75-467c-bf26-e91fa66e7ad0",
    title: "Bài kiểm tra cuối khoá",
    prompt: "Chọn từ/cụm từ tự nhiên nhất điền vào chỗ trống",
    type: "vocab-context",
    questions: [
      {
        text: "I need to _____ a decision about my university course by tomorrow.",
        options: ["make", "do", "have", "get"],
        explain: "Collocation cố định là make a decision; không nói do/have/get a decision.",
      },
      {
        text: "Could you _____ me a favour and carry this box upstairs?",
        options: ["do", "make", "give", "take"],
        explain: "Cụm cố định là do someone a favour (giúp ai một việc); make/give/take a favour không tự nhiên.",
      },
      {
        text: "I've been feeling a bit under the _____ today, so I'll stay at home.",
        options: ["weather", "rain", "sky", "cloud"],
        explain: "Thành ngữ under the weather nghĩa là hơi mệt, không khoẻ; các từ còn lại không tạo thành thành ngữ.",
      },
      {
        text: "The meeting was _____ because the manager was ill.",
        options: ["called off", "called up", "put on", "taken off"],
        explain: "call off = huỷ bỏ (sự kiện); call up = gọi điện/gọi nhập ngũ, put on = mặc/tổ chức, take off = cởi ra/cất cánh.",
      },
      {
        text: "Can you _____ my cat while I'm on holiday next week?",
        options: ["look after", "look up", "look into", "look out"],
        explain: "look after = chăm sóc; look up = tra cứu, look into = điều tra, look out = coi chừng.",
      },
      {
        text: "My uncle finally _____ smoking after ten years.",
        options: ["gave up", "gave in", "gave away", "gave out"],
        explain: "give up + V-ing = bỏ (thói quen); give in = chịu thua, give away = cho đi, give out = phân phát/cạn kiệt.",
      },
      {
        text: "The new rules will _____ everyone who works in this building.",
        options: ["affect", "effect", "effort", "infect"],
        explain: "affect là động từ \"ảnh hưởng đến\"; effect thường là danh từ (kết quả, tác động), effort là nỗ lực, infect là lây nhiễm.",
      },
      {
        text: "Can you _____ me your pen for a minute? I forgot mine.",
        options: ["lend", "borrow", "rent", "owe"],
        explain: "lend sb sth = cho ai mượn; borrow là đi mượn (borrow sth from sb), nên \"borrow me your pen\" sai hướng nghĩa.",
      },
      {
        text: "My teacher gave me some useful _____ about the speaking test.",
        options: ["advice", "advise", "advices", "advises"],
        explain: "advice là danh từ không đếm được (không thêm -s); advise là động từ, nên không đứng sau some useful.",
      },
      {
        text: "Don't worry about the quiz — it'll be a piece of _____.",
        options: ["cake", "pie", "bread", "sugar"],
        explain: "Thành ngữ a piece of cake nghĩa là rất dễ; các từ khác không tạo thành thành ngữ này.",
      },
    ],
  },

  // ───────────── Viết câu đúng — Kiểm tra chặng 1 ─────────────
  {
    lessonId: "dfcbd783-08c0-46c3-913c-8c85a170135e",
    title: "Kiểm tra chặng 1",
    prompt: "Chọn câu đúng",
    type: "writing",
    questions: [
      {
        prompt: "Chọn câu đúng ngữ pháp",
        options: ["It is raining heavily today.", "Is raining heavily today.", "Raining heavily today.", "Today raining heavily."],
        explain: "Câu tiếng Anh luôn cần chủ ngữ và động từ; khi nói về thời tiết phải dùng chủ ngữ giả It. Các câu còn lại thiếu chủ ngữ hoặc thiếu động từ chia.",
      },
      {
        prompt: "Câu nào diễn đạt đúng ý \"Tôi có hứng thú với âm nhạc\"?",
        options: ["I am interested in music.", "I am interesting in music.", "I have interest with music.", "I interested music."],
        explain: "Người cảm thấy hứng thú dùng interested + in; interesting là \"thú vị\" (mô tả sự vật), còn \"have interest with\" là dịch từng chữ.",
      },
      {
        prompt: "Câu nào diễn đạt đúng ý \"Có nhiều người trong công viên\"?",
        options: ["There are many people in the park.", "Have many people in the park.", "It has many people in the park.", "Many people have in the park."],
        explain: "\"Có\" chỉ sự tồn tại dùng There is/There are; dịch \"có\" thành have/has là lỗi dịch từng chữ phổ biến.",
      },
      {
        prompt: "Chọn câu ghép đúng dấu câu",
        options: ["I wanted to go out, but it was raining.", "I wanted to go out but, it was raining.", "I wanted to go out, it was raining.", "I wanted to go out. But, it was raining, so."],
        explain: "Nối hai mệnh đề độc lập bằng liên từ but, dấu phẩy đặt trước but; chỉ dùng dấu phẩy mà không có liên từ là lỗi comma splice.",
      },
      {
        prompt: "Chọn câu phức đúng",
        options: ["Although she was tired, she kept working.", "Although she was tired, but she kept working.", "She was tired although, she kept working.", "Although tired she was, kept working."],
        explain: "Although đã mang nghĩa \"tuy... nhưng\" nên không dùng thêm but; đây là lỗi dịch \"tuy... nhưng...\" của người Việt.",
      },
      {
        prompt: "Chọn câu viết hoa đúng",
        options: ["My friend Lan moved to Hanoi last Monday.", "My friend lan moved to Hanoi last monday.", "my friend Lan moved to hanoi last Monday.", "My Friend Lan moved to Hanoi Last Monday."],
        explain: "Viết hoa chữ đầu câu, tên người (Lan), địa danh (Hanoi) và thứ trong tuần (Monday); danh từ chung như friend, last không viết hoa.",
      },
      {
        prompt: "Chọn phần SAI trong câu: \"My brother has 20 years old.\"",
        options: ["has", "My", "brother", "old"],
        explain: "Tuổi dùng động từ be: My brother is 20 years old; \"has ... years old\" là dịch từng chữ từ \"có 20 tuổi\".",
      },
      {
        prompt: "Chọn cách nối đúng hai câu: \"I was hungry. I made a sandwich.\"",
        options: ["I was hungry, so I made a sandwich.", "I was hungry, I made a sandwich.", "I was hungry so, I made a sandwich.", "Because I was hungry, so I made a sandwich."],
        explain: "Dùng \", so\" để nối mệnh đề chỉ kết quả; không dùng chỉ dấu phẩy, và không dùng because cùng so trong một câu.",
      },
      {
        prompt: "Chọn câu đúng",
        options: ["Do you know where the station is?", "Do you know where is the station?", "Do you know where the station is.", "Do you know, where the station is?"],
        explain: "Câu hỏi gián tiếp giữ trật tự S + V (the station is) và vẫn kết thúc bằng dấu hỏi vì cả câu là câu hỏi Do you know...?",
      },
      {
        prompt: "Câu nào diễn đạt đúng ý \"Tôi rất thích nó\"?",
        options: ["I like it very much.", "I very like it.", "I like very much it.", "I am very like it."],
        explain: "very much đứng sau tân ngữ: like it very much; very không đứng trước động từ like, và không chen giữa động từ với tân ngữ.",
      },
    ],
  },

  // ───────────── Viết đoạn văn — Bài viết: một đoạn văn 120 từ ─────────────
  {
    lessonId: "bf5e1036-486a-471a-a7b9-a251b6bcd41f",
    title: "Bài viết: một đoạn văn 120 từ",
    prompt: "Chọn đáp án phù hợp nhất",
    type: "writing",
    questions: [
      {
        prompt: "Chọn câu chủ đề phù hợp nhất cho đoạn văn",
        text: "_____ First, it keeps you fit without going to a gym. Second, it saves money on petrol. Finally, it does not pollute the air.",
        options: ["Cycling to work has several clear benefits.", "I bought a new bicycle last year.", "Many people drive cars in big cities.", "Cycling is a sport in the Olympic Games."],
        explain: "Câu chủ đề phải khái quát được cả ba ý triển khai (sức khoẻ, tiền, môi trường) về lợi ích của đi xe đạp; các câu khác chỉ là chi tiết hoặc lạc đề.",
      },
      {
        prompt: "Câu nào LẠC ĐỀ trong đoạn văn về lợi ích của việc đọc sách?",
        options: ["My favourite colour is blue.", "Reading improves your vocabulary.", "Books help you understand other cultures.", "Reading before bed can help you relax."],
        explain: "Ba câu kia đều nêu lợi ích của đọc sách; câu về màu sắc yêu thích không liên quan nên phá vỡ tính thống nhất của đoạn.",
      },
      {
        prompt: "Chọn từ nối phù hợp",
        text: "Living in the city is convenient. _____, it can be very noisy at night.",
        options: ["However", "Therefore", "For example", "In addition"],
        explain: "Hai câu đối lập (tiện lợi và ồn ào) nên dùng However; Therefore chỉ kết quả, For example đưa ví dụ, In addition bổ sung ý cùng chiều.",
      },
      {
        prompt: "Chọn từ nối phù hợp",
        text: "Regular exercise makes your body stronger. _____, it reduces stress.",
        options: ["Moreover", "However", "Instead", "Otherwise"],
        explain: "Câu sau bổ sung thêm một lợi ích cùng chiều nên dùng Moreover; However chỉ đối lập, Instead là thay vào đó, Otherwise là nếu không thì.",
      },
      {
        prompt: "Chọn từ nối phù hợp",
        text: "The main road was flooded. _____, we had to take a different route.",
        options: ["As a result", "For instance", "In contrast", "Similarly"],
        explain: "Câu sau là hệ quả của đường ngập nên dùng As a result; các từ còn lại chỉ ví dụ, đối lập hoặc tương tự.",
      },
      {
        prompt: "Chọn từ nối phù hợp cho đoạn văn kể chuyện",
        text: "We waited at the bus stop for over an hour. _____, the bus arrived.",
        options: ["Finally", "Firstly", "For example", "On the other hand"],
        explain: "Finally đánh dấu sự việc xảy ra sau cùng sau thời gian chờ; Firstly dùng để liệt kê ý đầu tiên, không hợp với kết thúc một chuỗi sự việc.",
      },
      {
        prompt: "Câu nào miêu tả sinh động nhất trong đoạn văn tả căn phòng?",
        options: ["Sunlight pours through the large window onto a wooden desk covered with books.", "The room is nice.", "There is a room and it is good.", "I like my room very much because it is my room."],
        explain: "Đoạn miêu tả cần chi tiết cụ thể (ánh nắng, cửa sổ lớn, bàn gỗ, sách); các câu còn lại chung chung, dùng từ mơ hồ như nice, good.",
      },
      {
        prompt: "Chọn câu kết phù hợp nhất cho đoạn văn về lợi ích của việc đi xe đạp",
        options: ["For these reasons, cycling is a healthy and cheap way to travel.", "Next, I will talk about cars.", "Some bicycles are very expensive.", "However, I have never ridden a bicycle."],
        explain: "Câu kết tóm lại ý chính của đoạn (khoẻ, rẻ) bằng For these reasons; các câu khác mở ý mới hoặc đi ngược nội dung.",
      },
      {
        prompt: "Trong đoạn văn kể lại một kỷ niệm, câu nào dùng thì đúng?",
        options: ["While I was walking home, it suddenly started to rain.", "While I walk home, it suddenly started to rain.", "While I was walking home, it suddenly starts to rain.", "While I am walking home, it suddenly rained."],
        explain: "Hành động đang diễn ra trong quá khứ dùng quá khứ tiếp diễn (was walking), hành động xen vào dùng quá khứ đơn (started); các câu khác lẫn thì.",
      },
      {
        prompt: "Câu nào là câu triển khai có ví dụ cụ thể cho ý \"Smartphones help students study.\"?",
        options: ["For example, students can use dictionary apps to check new words quickly.", "Smartphones are very popular today.", "However, smartphones are expensive.", "In conclusion, smartphones are good."],
        explain: "Câu triển khai tốt đưa ví dụ cụ thể (ứng dụng từ điển) chứng minh cho ý chính; các câu còn lại chung chung, đối lập hoặc là câu kết.",
      },
    ],
  },

  // ───────────── Viết email và tin nhắn — Bài viết: email trả lời ─────────────
  {
    lessonId: "12302f8b-57d6-4762-b4ee-4361ac21a12f",
    title: "Bài viết: email trả lời",
    prompt: "Chọn câu phù hợp nhất",
    type: "writing",
    questions: [
      {
        prompt: "Câu mở đầu phù hợp nhất cho email trả lời bạn thân",
        options: ["Hi Minh, thanks for your email!", "Dear Sir or Madam,", "To whom it may concern,", "Dear Mr Minh, I am writing to inform you of the following."],
        explain: "Email thân mật mở đầu bằng Hi + tên và lời cảm ơn thư của bạn; các phương án khác là văn phong trang trọng, dùng cho người lạ hoặc cơ quan.",
      },
      {
        prompt: "Câu nào phù hợp nhất để xin thông tin trong email trang trọng?",
        options: ["I would be grateful if you could send me more information about the course.", "Send me more info about the course.", "Tell me about the course, OK?", "I want you give me information about the course."],
        explain: "I would be grateful if you could... là cách đề nghị lịch sự, trang trọng; các câu khác mang tính ra lệnh, suồng sã hoặc sai ngữ pháp.",
      },
      {
        prompt: "Email bắt đầu bằng \"Dear Ms Taylor,\". Chọn lời chào kết phù hợp (theo quy ước Anh – Anh)",
        options: ["Yours sincerely,", "Yours faithfully,", "Love,", "Cheers,"],
        explain: "Khi biết tên người nhận (Dear Ms Taylor) dùng Yours sincerely; Yours faithfully dành cho Dear Sir or Madam, còn Love/Cheers là thân mật.",
      },
      {
        prompt: "Câu mở đầu phù hợp nhất cho email phàn nàn",
        options: ["I am writing to complain about the laptop I bought from your store last week.", "I am very angry and I hate your shop.", "Hi! Your laptop is bad lol.", "I am writing to thank you for the laptop."],
        explain: "Email phàn nàn nêu rõ mục đích ngay câu đầu bằng I am writing to complain about...; thể hiện cảm xúc gay gắt hay suồng sã là không phù hợp.",
      },
      {
        prompt: "Câu xin lỗi trang trọng phù hợp nhất khi trả lời khách hàng",
        options: ["Please accept our apologies for the delay in delivering your order.", "Sorry, my bad.", "Oops, the order is late.", "It is not our fault that your order is late."],
        explain: "Please accept our apologies for... là cách xin lỗi trang trọng; Sorry, my bad và Oops quá suồng sã, câu cuối đổ lỗi nên không phải lời xin lỗi.",
      },
      {
        prompt: "Chọn giới từ đúng trong email đặt lịch hẹn",
        text: "Would you be available _____ Thursday afternoon for a short meeting?",
        options: ["on", "in", "at", "by"],
        explain: "Với ngày cụ thể (kể cả Thursday afternoon) dùng on; in dùng cho buổi chung chung (in the afternoon), at cho giờ.",
      },
      {
        prompt: "Bạn rủ đi xem phim cuối tuần. Câu nhận lời tự nhiên nhất",
        options: ["I'd love to come! What time shall we meet?", "I accept your kind invitation with pleasure, Sir.", "Yes. Cinema. Time?", "I would be grateful if you could inform me of the time."],
        explain: "Với bạn bè, I'd love to come! kèm câu hỏi giờ hẹn là tự nhiên; các câu khác hoặc quá trang trọng, hoặc cụt lủn.",
      },
      {
        prompt: "Câu nêu yêu cầu giải quyết phù hợp nhất trong email phàn nàn",
        options: ["I would like a full refund or a replacement as soon as possible.", "Give me my money back now!", "Maybe you can do something, I don't know.", "I want that you return money."],
        explain: "Yêu cầu nên rõ ràng và lịch sự với I would like...; câu ra lệnh thiếu lịch sự, câu mơ hồ không nêu được mong muốn, câu cuối sai ngữ pháp.",
      },
      {
        prompt: "Trong email trang trọng, nên thay get trong \"I'd like to get more details\" bằng từ nào?",
        options: ["receive", "grab", "pick up", "have a go at"],
        explain: "receive trang trọng hơn get và giữ đúng nghĩa \"nhận\"; grab, pick up, have a go at là khẩu ngữ hoặc sai nghĩa.",
      },
      {
        prompt: "Câu kết phù hợp nhất cho email thân mật gửi bạn",
        options: ["Write back soon! Take care,", "I look forward to hearing from you at your earliest convenience.", "Yours faithfully,", "Kind regards from the management,"],
        explain: "Email cho bạn bè kết bằng câu thân mật như Write back soon! Take care; các phương án còn lại là văn phong công việc, trang trọng.",
      },
    ],
  },

  // ───────────── Viết bài luận ngắn — Bài viết cuối khoá ─────────────
  {
    lessonId: "bbd3f5ce-8cd2-482b-9506-99061f26586d",
    title: "Bài viết cuối khoá",
    prompt: "Chọn đáp án phù hợp nhất",
    type: "writing",
    questions: [
      {
        prompt: "Đề: \"Some people think students should wear school uniforms. Do you agree?\" Câu luận điểm (thesis) rõ ràng nhất là",
        options: ["I agree that students should wear uniforms because they reduce pressure about clothes and build school spirit.", "School uniforms are clothes.", "There are many schools in Vietnam.", "In this essay, I will write something about uniforms maybe."],
        explain: "Câu luận điểm tốt nêu rõ quan điểm (agree) và các lý do chính sẽ triển khai; các câu khác không nêu quan điểm hoặc mơ hồ.",
      },
      {
        prompt: "Thứ tự dàn ý hợp lý cho bài luận nêu ý kiến",
        options: ["Mở bài (nêu quan điểm) → Thân bài 1 (lý do 1 + ví dụ) → Thân bài 2 (lý do 2 + ví dụ) → Kết bài", "Kết bài → Mở bài → Thân bài 1 → Thân bài 2", "Thân bài 1 → Mở bài → Thân bài 2 → Kết bài", "Mở bài → Kết bài → Thân bài 1 → Thân bài 2"],
        explain: "Bài luận nêu ý kiến đi theo trình tự mở bài nêu quan điểm, các đoạn thân bài mỗi đoạn một lý do có ví dụ, rồi kết bài khẳng định lại.",
      },
      {
        prompt: "Cụm nào phù hợp nhất để bắt đầu đoạn kết bài?",
        options: ["In conclusion, I firmly believe that", "Firstly, I want to say that", "For example,", "Another reason is that"],
        explain: "In conclusion báo hiệu phần kết và đi kèm việc khẳng định lại quan điểm; Firstly, For example, Another reason dùng trong thân bài.",
      },
      {
        prompt: "Đoạn kết bài KHÔNG nên làm gì?",
        options: ["Đưa ra một lý do mới chưa nhắc đến ở thân bài", "Nhắc lại quan điểm của người viết", "Tóm tắt các lý do chính", "Dùng cụm To sum up để mở đầu"],
        explain: "Kết bài chỉ tóm tắt và khẳng định lại quan điểm; thêm lý do mới khiến ý đó không được phát triển và làm bài thiếu mạch lạc.",
      },
      {
        prompt: "Câu nào diễn đạt lại (paraphrase) tốt nhất đề bài \"Many people believe that working from home is better than working in an office.\"?",
        options: ["It is often argued that remote work has more advantages than office work.", "Many people believe that working from home is better than working in an office.", "Working is good.", "Home is better than office, many people."],
        explain: "Mở bài nên diễn đạt lại đề bằng từ và cấu trúc khác nhưng giữ nguyên ý; chép y đề hoặc rút gọn sai nghĩa đều bị đánh giá thấp.",
      },
      {
        prompt: "Cụm nào phù hợp nhất để nêu ý kiến trong bài luận?",
        options: ["From my perspective,", "I think so, lol,", "Me, I say,", "As everybody knows, obviously,"],
        explain: "From my perspective là cách nêu quan điểm trang trọng, phù hợp bài luận; các cụm còn lại suồng sã hoặc khẳng định chung chung thiếu căn cứ.",
      },
      {
        prompt: "Câu nào nêu ý kiến phản biện rồi bác bỏ hợp lý nhất?",
        options: ["Although some argue that uniforms limit creativity, students can still express themselves through hobbies and art.", "Uniforms limit creativity, so I agree with uniforms.", "Some argue uniforms limit creativity. Uniforms are blue.", "Although uniforms limit creativity, but I agree."],
        explain: "Câu đúng nêu ý phản đối bằng Although some argue... rồi bác bỏ bằng lập luận cụ thể; các câu khác mâu thuẫn, lạc ý hoặc dùng although cùng but.",
      },
      {
        prompt: "Khi tự sửa bài, câu nào đã đúng hoàn toàn?",
        options: ["Technology has changed the way people communicate.", "Technology have changed the way people communicates.", "Technology has change the way people communicate.", "Technology has changed the way of people communicate."],
        explain: "Technology là danh từ số ít nên dùng has, sau has là V3 changed, và \"the way people communicate\" không cần of; các câu khác sai hoà hợp chủ – vị hoặc dạng động từ.",
      },
      {
        prompt: "Câu nào phù hợp nhất với văn phong bài luận?",
        options: ["Many young people do not have enough time to exercise.", "Lots of young guys don't have enough time to exercise.", "Young people, they don't got time to exercise.", "Tons of kids can't exercise, you know."],
        explain: "Bài luận dùng văn phong trang trọng, không viết tắt và tránh khẩu ngữ như guys, tons of, you know; câu thứ ba còn sai ngữ pháp (don't got).",
      },
      {
        prompt: "Câu nào phù hợp làm câu chủ đề cho đoạn thân bài thứ nhất của bài luận ủng hộ đồng phục?",
        options: ["The first reason why uniforms are beneficial is that they save families money.", "For example, my sister's uniform was quite cheap.", "In conclusion, I support school uniforms.", "Do you like wearing uniforms?"],
        explain: "Câu chủ đề đoạn thân bài nêu một lý do chính để cả đoạn triển khai; câu ví dụ chỉ là chi tiết, câu kết bài đặt sai vị trí, câu hỏi không nêu ý.",
      },
    ],
  },

  // ───────────── Phát âm nền tảng — Kiểm tra chặng 1 ─────────────
  {
    lessonId: "5cad5607-0d16-4456-af87-f5c966757219",
    title: "Kiểm tra chặng 1",
    prompt: "Chọn từ có phần trong ngoặc phát âm khác các từ còn lại",
    type: "phoneme",
    questions: [
      {
        options: ["f(oo)d", "b(oo)k", "g(oo)d", "l(oo)k"],
        explain: "food có /uː/ dài (/fuːd/); book, good, look có /ʊ/ ngắn.",
      },
      {
        options: ["s(ea)t", "h(ea)d", "br(ea)d", "w(ea)ther"],
        explain: "seat có /iː/ (/siːt/); head, bread, weather có /e/ dù cùng viết ea.",
      },
      {
        options: ["h(o)me", "c(o)me", "l(o)ve", "s(o)n"],
        explain: "home có nguyên âm đôi /əʊ/ (/həʊm/); come, love, son có /ʌ/.",
      },
      {
        options: ["f(i)ne", "f(i)sh", "w(i)n", "b(i)g"],
        explain: "fine có nguyên âm đôi /aɪ/ (/faɪn/); fish, win, big có /ɪ/ ngắn.",
      },
      {
        options: ["s(ai)d", "p(ai)d", "m(ai)d", "w(ai)t"],
        explain: "said là ngoại lệ, đọc /sed/ với /e/; paid, maid, wait có nguyên âm đôi /eɪ/.",
      },
      {
        prompt: "Âm nào là phụ âm hữu thanh (dây thanh rung)?",
        options: ["/v/", "/f/", "/s/", "/k/"],
        explain: "/v/ là âm hữu thanh, cặp với /f/ vô thanh; /s/ và /k/ cũng là âm vô thanh.",
      },
      {
        options: ["(th)is", "(th)ink", "(th)ree", "(th)umb"],
        explain: "this có /ð/ hữu thanh (/ðɪs/); think, three, thumb có /θ/ vô thanh.",
      },
      {
        options: ["(ch)emistry", "(ch)air", "(ch)eap", "(ch)oose"],
        explain: "chemistry đọc /ˈkemɪstri/ với /k/; chair, cheap, choose có /tʃ/.",
      },
      {
        prompt: "Chọn từ có đuôi -ed phát âm khác các từ còn lại",
        options: ["laughed", "loved", "played", "opened"],
        explain: "laughed /lɑːft/ (gh đọc /f/ vô thanh) nên -ed đọc /t/; loved, played, opened tận cùng bằng âm hữu thanh nên đọc /d/.",
      },
      {
        prompt: "Cặp từ nào chỉ khác nhau ở cặp âm /l/ – /n/ mà người Việt hay nhầm?",
        options: ["light – night", "light – right", "night – knight", "line – lime"],
        explain: "light /laɪt/ và night /naɪt/ chỉ khác âm đầu /l/ – /n/; light – right là /l/ – /r/, night – knight đồng âm, line – lime khác /n/ – /m/.",
      },
    ],
  },

  // ───────────── Trọng âm và ngữ điệu — Kiểm tra chặng 2 ─────────────
  {
    lessonId: "9061e295-bc4e-4a59-bf26-e4c4cac319d4",
    title: "Kiểm tra chặng 2",
    prompt: "Chọn đáp án đúng",
    type: "phoneme",
    questions: [
      {
        prompt: "Chọn từ có trọng âm khác các từ còn lại",
        options: ["photograph", "computer", "important", "banana"],
        explain: "photograph /ˈfəʊtəɡrɑːf/ nhấn âm tiết đầu; computer /kəmˈpjuːtə/, important /ɪmˈpɔːtnt/, banana /bəˈnɑːnə/ nhấn âm tiết thứ hai.",
      },
      {
        prompt: "Chọn từ có trọng âm khác các từ còn lại",
        options: ["photographer", "engineer", "understand", "volunteer"],
        explain: "photographer /fəˈtɒɡrəfə/ nhấn âm tiết thứ hai (đuôi -grapher đẩy trọng âm lên trước); engineer, understand, volunteer nhấn âm tiết thứ ba.",
      },
      {
        prompt: "Chọn từ có trọng âm khác các từ còn lại",
        options: ["information", "communicate", "experience", "advantage"],
        explain: "information /ˌɪnfəˈmeɪʃn/ nhấn âm tiết ngay trước -tion (âm thứ ba); communicate, experience, advantage nhấn âm tiết thứ hai.",
      },
      {
        prompt: "Trong câu \"Vietnam needs to export more rice.\", từ export được nhấn thế nào?",
        options: ["ex-PORT, vì ở đây là động từ", "EX-port, vì ở đây là động từ", "EX-port, vì ở đây là danh từ", "Nhấn đều cả hai âm tiết"],
        explain: "Với cặp từ cùng chữ, danh từ nhấn âm đầu (EXport), động từ nhấn âm sau (exPORT /ɪkˈspɔːt/); sau needs to là động từ nguyên mẫu.",
      },
      {
        prompt: "Trong câu \"I bought a new car yesterday.\", từ nào thường KHÔNG được nhấn?",
        options: ["a", "bought", "car", "yesterday"],
        explain: "a là từ chức năng (mạo từ) nên đọc yếu /ə/; bought, car, yesterday là từ nội dung mang thông tin chính nên được nhấn.",
      },
      {
        prompt: "\"I said TUESDAY, not Thursday.\" Vì sao Tuesday được nhấn mạnh hơn bình thường?",
        options: ["Để nhấn ý đối lập, sửa lại thông tin người nghe hiểu sai", "Vì đó là từ chức năng trong câu", "Vì từ cuối câu luôn được nhấn mạnh nhất", "Vì người nói đang đặt câu hỏi"],
        explain: "Đây là trọng âm tương phản (contrastive stress): người nói nhấn từ mang thông tin đúng để sửa lại Thursday.",
      },
      {
        prompt: "Trong cụm nào phụ âm cuối của từ trước được nối với nguyên âm đầu của từ sau?",
        options: ["look at", "big dog", "red car", "hot tea"],
        explain: "look at /lʊk ət/ nối phụ âm /k/ với nguyên âm /ə/ thành /lʊkət/; các cụm còn lại là phụ âm gặp phụ âm nên không nối kiểu này.",
      },
      {
        prompt: "Khi nói nhanh cụm \"next week\", âm nào thường bị nuốt?",
        options: ["/t/ trong next", "/k/ trong week", "/n/ trong next", "/w/ trong week"],
        explain: "/t/ nằm giữa hai phụ âm (/kst/ + /w/) nên thường bị lược bỏ: /neks wiːk/; các âm còn lại vẫn giữ nguyên.",
      },
      {
        prompt: "Câu hỏi Wh- thông thường như \"Where do you live?\" thường kết thúc bằng ngữ điệu nào?",
        options: ["Xuống giọng ở cuối câu", "Lên giọng ở cuối câu", "Giữ giọng ngang, không đổi", "Lên ở từ để hỏi rồi giữ ngang đến hết câu"],
        explain: "Câu hỏi Wh- hỏi thông tin thường xuống giọng ở từ nhấn cuối (LIVE↘); lên giọng thường dùng cho câu hỏi Yes/No.",
      },
      {
        prompt: "Câu liệt kê \"I need eggs, milk, and bread.\" thường có ngữ điệu thế nào?",
        options: ["Lên ở eggs và milk, xuống ở bread", "Xuống ở cả ba từ", "Lên ở cả ba từ", "Xuống ở eggs, lên ở bread"],
        explain: "Khi liệt kê, các mục chưa hết lên giọng để báo còn tiếp, mục cuối xuống giọng để báo danh sách kết thúc.",
      },
    ],
  },
];
