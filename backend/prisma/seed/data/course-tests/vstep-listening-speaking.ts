import type { AuthoredTest } from './types';

const LISTEN_PROMPT = "Nghe đoạn hội thoại / bài nói và chọn đáp án đúng.";
const SPEAK_PROMPT = "Chọn cách nói phù hợp và tự nhiên nhất cho tình huống.";

export const TESTS: AuthoredTest[] = [
  // ===== 1. Nghe từng âm, từng từ =====
  {
    lessonId: "d8899a92-3b91-4118-b452-eb7727c7bfa4",
    title: "Nghe chép chính tả ngắn",
    prompt: LISTEN_PROMPT,
    type: "listening",
    questions: [
      {
        speak: "The meeting has been moved to the fifteenth of March, not the fifth.",
        text: "What is the new date of the meeting?",
        options: ["March 15th", "March 5th", "May 15th", "March 16th"],
        explain: "Người nói nhấn mạnh \"the fifteenth of March, not the fifth\" nên ngày mới là 15/3; \"fifth\" chỉ là ngày cũ bị phủ định.",
      },
      {
        speak: "The jacket was originally ninety dollars, but today it's on sale for forty.",
        text: "How much does the jacket cost today?",
        options: ["$40", "$90", "$14", "$19"],
        explain: "\"on sale for forty\" là giá hôm nay; \"ninety dollars\" là giá gốc. Chú ý phân biệt forty/fourteen và ninety/nineteen qua trọng âm.",
      },
      {
        speak: "I can't come on Friday, but I can meet you on Saturday morning.",
        text: "When can the speaker meet?",
        options: ["Saturday morning", "Friday morning", "Friday evening", "Saturday evening"],
        explain: "\"I can't come on Friday, but I can meet you on Saturday morning\": can't được nhấn rõ, còn can ở dạng yếu /kən/ đi với Saturday morning.",
      },
      {
        speak: "My phone number is oh nine one two, three four seven, eight six five.",
        text: "What is the speaker's phone number?",
        options: ["0912 347 865", "0921 347 865", "0912 374 865", "0912 347 856"],
        explain: "Số được đọc theo cụm \"oh nine one two, three four seven, eight six five\" = 0912 347 865; \"oh\" là cách đọc số 0.",
      },
      {
        speak: "Could you pick it up at the end of the day?",
        text: "Which phrase did you hear?",
        options: ["pick it up", "pick a cup", "picked up", "pick it out"],
        explain: "\"pick it up\" được nối âm thành /pɪkɪtʌp/ (phụ âm cuối nối với nguyên âm đầu), nghe như một từ nhưng vẫn là pick it up.",
      },
      {
        speak: "There are thirteen students in the morning class and thirty in the evening class.",
        text: "How many students are in the evening class?",
        options: ["30", "13", "33", "43"],
        explain: "\"thirty in the evening class\" (trọng âm ở âm đầu THIR-ty); thirteen (thir-TEEN) là số học viên lớp buổi sáng.",
      },
      {
        speak: "The library first opened its doors in nineteen eighty-seven.",
        text: "When did the library open?",
        options: ["1987", "1978", "1897", "2087"],
        explain: "Năm được đọc theo cặp số: \"nineteen eighty-seven\" = 1987.",
      },
      {
        speak: "I'd like a cup of tea and a piece of cake, please.",
        text: "What does the speaker order?",
        options: ["A cup of tea and a piece of cake", "A cup of coffee and a piece of cake", "A cup of tea and a plate of cakes", "A pot of tea and a cake"],
        explain: "\"a cup of tea and a piece of cake\": of đọc yếu /əv/, and đọc yếu /ən/, nối liền thành \"cupəv tea ən a pieceəv cake\".",
      },
      {
        speak: "The last bus leaves at a quarter to eleven, so don't be late.",
        text: "What time does the last bus leave?",
        options: ["10:45", "11:15", "11:45", "10:15"],
        explain: "\"a quarter to eleven\" là kém 15 phút đến 11 giờ, tức 10:45; \"a quarter past eleven\" mới là 11:15.",
      },
      {
        speak: "Your total comes to twelve pounds fifty. Would you like a bag?",
        text: "How much does the customer have to pay?",
        options: ["£12.50", "£15.20", "£20.50", "£12.15"],
        explain: "\"twelve pounds fifty\" nghĩa là 12 bảng 50 xu, tức £12.50.",
      },
    ],
  },

  // ===== 2. Nghe hội thoại ngắn =====
  {
    lessonId: "8e73782e-54ca-449d-ba6c-14cecc5d80af",
    title: "Kiểm tra chặng 2",
    prompt: LISTEN_PROMPT,
    type: "listening",
    questions: [
      {
        speak: "Waiter: Are you ready to order? Woman: Yes, I'll have the grilled chicken, please. Waiter: I'm sorry, we've run out of chicken tonight. The beef is very good. Woman: I don't eat red meat, so I'll take the fish instead.",
        text: "What does the woman finally order?",
        options: ["Fish", "Grilled chicken", "Beef", "Vegetable soup"],
        explain: "Gà đã hết, bò thì cô không ăn: \"I'll take the fish instead\".",
      },
      {
        speak: "Woman: Hi, I bought this shirt yesterday, but it's too small. Man: Would you like a refund, or would you prefer a larger size? Woman: A larger size, please. The colour is perfect.",
        text: "What does the woman want?",
        options: ["To exchange the shirt for a larger size", "To get her money back", "To buy a second shirt", "To change the shirt for a different colour"],
        explain: "Cô từ chối hoàn tiền và chọn \"A larger size, please\"; cô còn nói màu áo rất ưng nên không đổi màu.",
      },
      {
        speak: "Man: Hello, could I speak to Ms. Lan, please? Woman: I'm afraid she's in a meeting. Can I take a message? Man: Yes, this is Tom from Green Travel. Could you ask her to call me back before five? She has my number.",
        text: "What does the man ask Ms. Lan to do?",
        options: ["Call him back before five o'clock", "Meet him at five o'clock", "Send him an email", "Visit the Green Travel office"],
        explain: "Lời nhắn là \"ask her to call me back before five\".",
      },
      {
        speak: "Woman: How much are these apples? Man: They're two dollars a kilo, but if you buy three kilos, it's only five dollars. Woman: Great, I'll take three kilos, then.",
        text: "How much does the woman pay?",
        options: ["$5", "$2", "$6", "$3"],
        explain: "Mua 3 kg chỉ \"only five dollars\" nên cô trả 5 đô; bẫy là nhân 2 đô x 3 = 6 đô.",
      },
      {
        speak: "Receptionist: Doctor Smith's office, how can I help you? Man: I'd like to make an appointment for Tuesday. Receptionist: Tuesday is fully booked, I'm afraid. How about Wednesday at ten? Man: Wednesday is difficult for me. Do you have anything on Thursday? Receptionist: Yes, Thursday at two thirty. Man: Perfect.",
        text: "When is the man's appointment?",
        options: ["Thursday at 2:30", "Tuesday at 10:00", "Wednesday at 10:00", "Thursday at 10:00"],
        explain: "Thứ Ba kín lịch, thứ Tư anh bận; cuối cùng chốt \"Thursday at two thirty. - Perfect.\"",
      },
      {
        speak: "Man: Excuse me, is this seat taken? Woman: No, go ahead. Are you also waiting for the train to Hue? Man: Yes, but I just heard it's delayed by forty minutes.",
        text: "Where are the speakers?",
        options: ["At a train station", "On a bus", "At an airport", "In a restaurant"],
        explain: "Hai người đang \"waiting for the train to Hue\" và tàu bị trễ, nên họ ở nhà ga.",
      },
      {
        speak: "Woman: Could we have the bill, please? Waiter: Certainly. Would you like to pay together or separately? Woman: Separately, please. And can I pay by card? Waiter: I'm afraid our card machine isn't working today, so it's cash only.",
        text: "How will the woman pay?",
        options: ["In cash", "By card", "By bank transfer", "Her friend will pay for her"],
        explain: "Máy quẹt thẻ hỏng: \"it's cash only\"; họ trả riêng (\"separately\") nên bạn cô không trả hộ.",
      },
      {
        speak: "Woman: Is your flat on the top floor? Man: Yes, the eighth floor. And the lift has been broken all week, so I've been taking the stairs every day.",
        text: "What problem does the man have?",
        options: ["The lift is broken", "His flat is too small", "He lives on the ground floor", "The stairs are closed"],
        explain: "\"the lift has been broken all week\" (lift, flat là từ của tiếng Anh - Anh, tương đương elevator, apartment trong tiếng Mỹ).",
      },
      {
        speak: "Receptionist: Could you spell your surname, please? Man: Sure, it's N, G, U, Y, E, N. Receptionist: Thank you. And your first name? Man: Minh, M, I, N, H.",
        text: "What is the man's surname?",
        options: ["Nguyen", "Minh", "Nguyan", "Ngoyen"],
        explain: "Họ (surname) được đánh vần \"N, G, U, Y, E, N\" = Nguyen; Minh là tên (first name).",
      },
      {
        speak: "Man: Do you have this sofa in grey? Woman: Only in blue or brown at the moment, I'm afraid, but we can order a grey one for you. It takes about two weeks. Man: That's fine. I'm not in a hurry.",
        text: "What will the man probably do?",
        options: ["Order a grey sofa", "Buy the blue sofa", "Buy the brown sofa", "Look in another shop"],
        explain: "Cửa hàng có thể đặt sofa xám mất hai tuần và anh nói \"That's fine. I'm not in a hurry\", nên anh sẽ đặt hàng màu xám.",
      },
    ],
  },

  // ===== 3. Nghe bài nói dài =====
  {
    lessonId: "72eb7a04-d331-473f-85b2-c4ab6dbdfcf8",
    title: "Kiểm tra chặng 3",
    prompt: LISTEN_PROMPT,
    type: "listening",
    questions: [
      {
        speak: "Attention, please. This is an announcement for passengers on flight VN two four five to Singapore. Due to bad weather, the flight has been delayed by one hour. The new departure time is eleven fifteen. Passengers are also advised that the boarding gate has changed from gate twelve to gate eighteen. Please make your way to gate eighteen no later than ten forty-five. We apologise for any inconvenience.",
        text: "Which gate should passengers go to?",
        options: ["Gate 18", "Gate 12", "Gate 15", "Gate 45"],
        explain: "\"the boarding gate has changed from gate twelve to gate eighteen\" - cổng 12 là cổng cũ.",
      },
      {
        speak: "Good morning, passengers. The eight thirty train to Da Nang will depart from platform three instead of platform one. This train will stop at Ninh Binh, Vinh and Dong Hoi. Please note that the restaurant car is closed today, but snacks and drinks are available from the trolley service. Passengers with large luggage are kindly asked to use the storage area at the end of each carriage. Thank you for travelling with us.",
        text: "What is NOT available on the train today?",
        options: ["The restaurant car", "Snacks from the trolley", "Luggage storage", "Drinks"],
        explain: "\"the restaurant car is closed today\"; đồ ăn nhẹ, đồ uống từ xe đẩy và chỗ để hành lý vẫn có.",
      },
      {
        speak: "Hello everyone, and welcome to the city library. Before your tour begins, here are a few things to remember. The library is open from eight a.m. to eight p.m. on weekdays, but it closes at five on Saturdays and is closed all day on Sunday. You can borrow up to six books at a time for three weeks. If you return a book late, there is a fine of two thousand dong per day. Finally, the computer room on the second floor requires a library card.",
        text: "How long can members keep borrowed books?",
        options: ["Three weeks", "Six weeks", "Two weeks", "Five days"],
        explain: "\"borrow up to six books at a time for three weeks\": sáu là số sách tối đa, ba tuần là thời hạn mượn.",
      },
      {
        speak: "Welcome back to Healthy Habits. I'm Anna. Today we're talking about sleep. Many people think the number of hours is the only thing that matters, but actually, going to bed and waking up at the same time every day is just as important. So, um, what can you do? First, stop using your phone at least thirty minutes before bed. Second, keep your bedroom cool and dark. And if you can't fall asleep after twenty minutes, get up and read something light instead of lying in bed worrying.",
        text: "What is the main point of the podcast?",
        options: ["A regular sleep routine matters as much as the number of hours", "Everyone should sleep at least eight hours a night", "Reading in bed is the best way to fall asleep", "Phones should never be kept in the bedroom"],
        explain: "Ý chính: \"going to bed and waking up at the same time every day is just as important\"; các mẹo phía sau chỉ là chi tiết hỗ trợ.",
      },
      {
        speak: "Today's lecture is about urban heat islands. An urban heat island is a city area that is much warmer than the countryside around it. There are three main causes. The first is that buildings and roads absorb heat during the day and release it at night. The second is the lack of trees and green spaces. For example, a park can be up to four degrees cooler than nearby streets. The third cause is heat from cars and air conditioners. In our next class, we'll look at solutions.",
        text: "Why does the lecturer mention a park?",
        options: ["To show the cooling effect of green spaces", "To suggest a place for the next class", "To explain how roads absorb heat", "To compare temperatures in the countryside at night"],
        explain: "Công viên là ví dụ (\"For example, a park can be up to four degrees cooler\") minh hoạ nguyên nhân thứ hai: thiếu cây xanh.",
      },
      {
        speak: "Ladies and gentlemen, the museum will be closing in fifteen minutes. Please make your way to the main exit on the ground floor. The gift shop near the entrance will remain open for an extra thirty minutes. Visitors who left bags in the cloakroom should collect them before leaving, as the cloakroom closes at the same time as the museum. We open again tomorrow at nine a.m. Thank you for visiting.",
        text: "What will stay open after the museum closes?",
        options: ["The gift shop", "The cloakroom", "The main exhibition", "The ground floor café"],
        explain: "\"The gift shop near the entrance will remain open for an extra thirty minutes\"; phòng gửi đồ đóng cùng lúc với bảo tàng.",
      },
      {
        speak: "Hi Mai, it's Peter from the language centre. I'm calling about your speaking class next week. Unfortunately, your teacher, Ms. Hoa, is ill, so the Monday class is cancelled. We'll hold a make-up lesson on Wednesday evening at seven, in room two oh four instead of your usual room. Please bring your workbook, because you'll do the practice test from unit six. If Wednesday doesn't work for you, just send me a text. Thanks, bye.",
        text: "Where will the make-up lesson take place?",
        options: ["Room 204", "Room 206", "Room 240", "In Mai's usual room"],
        explain: "\"in room two oh four instead of your usual room\" = phòng 204; số 6 là unit six của bài kiểm tra.",
      },
      {
        speak: "Good afternoon. In today's talk on learning languages, I'll focus on spaced repetition. Basically, instead of studying a word ten times in one evening, you review it several times over a longer period, say, after one day, then three days, then a week. Research shows that this helps move information into long-term memory. However, I should point out that it works best for vocabulary, not for skills like speaking. To sum up, spread your review out rather than cramming it into one session.",
        text: "According to the speaker, what is spaced repetition most useful for?",
        options: ["Learning vocabulary", "Practising speaking", "Studying for an exam in one night", "Improving pronunciation"],
        explain: "\"it works best for vocabulary, not for skills like speaking\" - tín hiệu \"However, I should point out\" báo trước ý quan trọng.",
      },
      {
        speak: "Good morning, everyone, and welcome aboard. Our tour of the old quarter will last about three hours. We'll start at the lake, then walk to the temple, and after that we'll stop for lunch at a local restaurant around twelve. In the afternoon, you'll have one hour of free time at the night market. Sorry, I mean the weekend market, which is open during the day. Please stay with the group and remember that the bus leaves at three o'clock sharp.",
        text: "What will the group do right after visiting the temple?",
        options: ["Have lunch at a local restaurant", "Walk around the lake", "Visit the night market", "Get back on the bus"],
        explain: "Thứ tự: hồ, rồi đền, \"and after that we'll stop for lunch at a local restaurant\"; chợ đêm là chỗ hướng dẫn viên nói nhầm rồi sửa lại.",
      },
      {
        speak: "On today's episode, we asked listeners about working from home. Most people said they enjoyed saving time on travel. About sixty percent felt they were more productive at home. But here's the surprising part: nearly half also said they felt lonely, and many missed chatting with colleagues over coffee. So, while working from home has clear benefits, it seems people still need some face-to-face contact. Next week, we'll talk to a manager who lets her team choose where to work.",
        text: "What surprised the podcast hosts?",
        options: ["Many people felt lonely working from home", "Most people saved time on travel", "Sixty percent felt more productive", "A manager lets her team choose where to work"],
        explain: "Tín hiệu \"But here's the surprising part: nearly half also said they felt lonely\" chỉ ra điều gây bất ngờ.",
      },
    ],
  },

  // ===== 4. Nghe tốc độ thật =====
  {
    lessonId: "20eb5089-f761-4649-b643-7e5e01612a20",
    title: "Bài kiểm tra cuối khoá",
    prompt: LISTEN_PROMPT,
    type: "listening",
    questions: [
      {
        speak: "Heavy rain has caused flooding in three central provinces, forcing more than two thousand families to leave their homes. Local authorities say schools in the worst-hit areas will remain closed until Friday. Meanwhile, forecasters expect the rain to ease by the weekend, although strong winds may continue along the coast.",
        text: "What is the main news?",
        options: ["Flooding has forced thousands of families from their homes", "Schools have closed across the whole country", "Strong winds have destroyed the coast", "The rain will stop on Friday"],
        explain: "Tin tức theo kim tự tháp ngược: câu đầu là ý chính - \"flooding in three central provinces, forcing more than two thousand families to leave their homes\".",
      },
      {
        speak: "The city's new metro line carried around forty-five thousand passengers on its first day, nearly double the number officials had expected. Tickets will be free for the first two weeks, after which a single journey will cost twelve thousand dong.",
        text: "How much will a single journey cost after the first two weeks?",
        options: ["12,000 dong", "45,000 dong", "20,000 dong", "Nothing"],
        explain: "\"after which a single journey will cost twelve thousand dong\"; 45.000 là số hành khách, miễn phí chỉ trong hai tuần đầu.",
      },
      {
        speak: "Woman: So, how was the job interview? Man: Well, let's just say I won't be holding my breath for a phone call. Woman: Oh no. What happened? Man: I got there twenty minutes late, and then I forgot the name of the company.",
        text: "How does the man feel about the interview?",
        options: ["He thinks it went badly", "He is sure he got the job", "He is expecting a call tonight", "He thinks he arrived early"],
        explain: "\"I won't be holding my breath for a phone call\" nghĩa là không hy vọng được gọi lại; anh còn đến muộn và quên tên công ty.",
      },
      {
        speak: "Man: Are you coming to the party on Saturday? Woman: I'd love to, but I'm snowed under this week. My boss wants the report on his desk by Monday. Man: That's a shame. Maybe next time.",
        text: "Why can't the woman go to the party?",
        options: ["She has too much work", "The weather is too bad", "She is going away on Monday", "She wasn't invited"],
        explain: "\"I'm snowed under\" là thành ngữ chỉ ngập đầu công việc (sếp cần báo cáo trước thứ Hai), không liên quan đến thời tiết.",
      },
      {
        speak: "Scientists have welcomed a new government plan to plant one billion trees by twenty thirty. However, some environmental groups warn that planting trees alone is not enough, and say the country must also cut its use of coal.",
        text: "What do some environmental groups think?",
        options: ["The plan should also include cutting coal use", "The plan is completely unnecessary", "One billion trees is too many", "Scientists are against the plan"],
        explain: "\"planting trees alone is not enough ... must also cut its use of coal\": họ không phản đối mà muốn bổ sung việc giảm than; giới khoa học thì hoan nghênh.",
      },
      {
        speak: "In football, Hanoi FC came from behind to beat Hai Phong two goals to one last night. Hai Phong scored first in the tenth minute, but Hanoi equalised just before half-time and then won the match with a header in the final minute.",
        text: "Which statement is true?",
        options: ["Hanoi FC scored the winning goal in the last minute", "Hai Phong won the match 2-1", "Hanoi FC scored the first goal", "The match ended in a draw"],
        explain: "\"won the match with a header in the final minute\"; \"came from behind\" nghĩa là bị dẫn trước (Hai Phong ghi bàn trước) rồi lội ngược dòng.",
      },
      {
        speak: "Man: Wanna grab something to eat? I'm starving. Woman: Gimme five minutes. I gotta finish this email first. Man: Sure, I'll wait for you downstairs.",
        text: "What will the woman do first?",
        options: ["Finish an email", "Go downstairs", "Buy some food", "Call the man"],
        explain: "\"I gotta finish this email first\" (gotta = got to, gimme = give me); người chờ ở dưới nhà là người đàn ông.",
      },
      {
        speak: "And now for the traffic. There's been an accident on the main bridge into the city, and traffic is moving very slowly. Drivers heading to the city centre are advised to use the ring road instead. The accident is expected to be cleared within the next hour.",
        text: "What are drivers advised to do?",
        options: ["Take the ring road", "Use the main bridge", "Stay at home for an hour", "Drive more slowly"],
        explain: "\"Drivers heading to the city centre are advised to use the ring road instead\"; cầu chính là nơi xảy ra tai nạn.",
      },
      {
        speak: "Shares in the electronics company TechNova fell by eight percent this morning after the firm announced that its new smartphone would be delayed until next spring. The company blamed a shortage of computer chips. Analysts say the delay could allow competitors to win customers during the busy holiday season.",
        text: "Why did TechNova's shares fall?",
        options: ["Its new smartphone has been delayed", "It sold fewer phones during the holidays", "It lost its main competitor", "Computer chip prices fell"],
        explain: "Cổ phiếu giảm \"after the firm announced that its new smartphone would be delayed\"; mùa lễ chỉ là dự báo của chuyên gia, chưa xảy ra.",
      },
      {
        speak: "Woman: I've been doing shadowing for a month now, ten minutes every morning. Man: And? Is it actually working? Woman: Honestly, my listening hasn't changed much yet. But my teacher says my pronunciation sounds a lot more natural.",
        text: "What improvement has the woman noticed?",
        options: ["Her pronunciation sounds more natural", "Her listening is much better", "She can read faster", "She studies for longer every morning"],
        explain: "\"my listening hasn't changed much yet. But my teacher says my pronunciation sounds a lot more natural\" - tiến bộ ở phát âm, không phải nghe.",
      },
    ],
  },

  // ===== 5. Luyện nói: giới thiệu bản thân =====
  {
    lessonId: "a0e66f47-2cc8-42fa-b694-8404748a9190",
    title: "Luyện nói: giới thiệu bản thân",
    prompt: SPEAK_PROMPT,
    type: "speaking",
    questions: [
      {
        text: "Examiner: \"Could you tell me a little about yourself?\" - Câu mở đầu nào phù hợp nhất?",
        options: ["Sure. My name is Linh. I'm twenty-two, and I'm a final-year student at a university in Hanoi.", "Yes.", "My name Linh, I am student, I like many thing.", "I'd rather not talk about myself."],
        explain: "Câu trả lời đúng ngữ pháp, đủ thông tin (tên, tuổi, nghề nghiệp) và mở ra chủ đề; \"Yes.\" quá ngắn, câu thứ ba sai ngữ pháp.",
      },
      {
        text: "Bạn không nghe rõ câu hỏi của giám khảo. Câu nào lịch sự nhất?",
        options: ["Sorry, could you repeat the question, please?", "What? Say again.", "I don't understand you.", "Speak louder!"],
        explain: "\"Sorry, could you repeat ..., please?\" là cách nhờ nhắc lại lịch sự; các câu còn lại cộc lốc hoặc mang tính ra lệnh.",
      },
      {
        text: "Examiner: \"Do you have any pastimes?\" - Bạn không chắc nghĩa của từ \"pastimes\".",
        options: ["Sorry, do you mean hobbies, or things I do in my free time?", "Pastimes? Next question, please.", "I have no idea what that is.", "Yes, I have."],
        explain: "Hỏi lại để xác nhận nghĩa (\"do you mean ...?\") vừa lịch sự vừa giúp trả lời đúng; bỏ qua hoặc trả lời đại đều mất điểm.",
      },
      {
        text: "Examiner: \"Do you like reading?\" - Câu trả lời Part 1 nào tốt nhất?",
        options: ["Yes, I do. I usually read novels before bed because it helps me relax after a long day.", "Yes.", "Yes, I like read book very much.", "Reading is an activity in which people look at words."],
        explain: "Câu trả lời tốt gồm ý trả lời + chi tiết + lý do (because ...); \"like read book\" sai ngữ pháp, câu cuối lạc đề.",
      },
      {
        text: "Câu nào nói về sở thích đúng ngữ pháp?",
        options: ["I really enjoy playing badminton with my friends at weekends.", "I really enjoy to play badminton with my friends at weekends.", "I am enjoy playing badminton with my friends at weekends.", "I really enjoying play badminton with my friends at weekends."],
        explain: "enjoy + V-ing (enjoy playing); không dùng enjoy to V và không thêm am trước động từ thường.",
      },
      {
        text: "Câu nào đặt trạng từ tần suất đúng vị trí?",
        options: ["I usually go jogging in the park on Sunday mornings.", "I go usually jogging in the park on Sunday mornings.", "I am usually go jogging in the park on Sunday mornings.", "I usually going jogging in the park on Sunday mornings."],
        explain: "Trạng từ tần suất đứng trước động từ thường: \"I usually go\"; không xen giữa go và jogging, không thêm am.",
      },
      {
        text: "Bạn cần vài giây suy nghĩ trước khi trả lời. Câu nào tự nhiên nhất?",
        options: ["That's an interesting question. Let me think for a moment...", "Uhhh... I don't know.", "Next question, please.", "Can I answer in Vietnamese?"],
        explain: "Câu lấp khoảng trống tự nhiên giúp có thời gian suy nghĩ mà vẫn giữ mạch nói; \"I don't know\" làm cuộc trò chuyện dừng lại.",
      },
      {
        text: "Your friend says: \"I just came back from Da Lat.\" - Câu nào giúp cuộc trò chuyện tiếp tục tốt nhất?",
        options: ["Oh, really? What did you enjoy most about it?", "OK.", "Did you go to Da Lat?", "I see. Goodbye."],
        explain: "Câu hỏi mở (What ...?) mời người kia kể thêm; \"Did you go to Da Lat?\" hỏi lại điều vừa nghe, còn \"OK\" làm cuộc nói chuyện tắt ngấm.",
      },
      {
        text: "Examiner: \"Do you prefer mornings or evenings?\" - Câu trả lời nào phát triển ý tốt nhất?",
        options: ["I'd say evenings, because that's when I feel most relaxed. For example, I often cook dinner and listen to music after work.", "Evenings.", "I prefer mornings and evenings and afternoons.", "Mornings is better than evening because."],
        explain: "Câu trả lời có lựa chọn rõ, lý do (because) và ví dụ (For example); câu cuối sai ngữ pháp và bỏ lửng.",
      },
      {
        text: "Giám khảo hỏi một câu dài, bạn muốn xác nhận mình đã hiểu đúng.",
        options: ["So you're asking whether I prefer studying alone or in a group, is that right?", "You ask what?", "I think I understand, maybe, or not.", "Can you ask me an easier question?"],
        explain: "Nhắc lại ý câu hỏi kèm \"is that right?\" là cách xác nhận lịch sự và rõ ràng.",
      },
    ],
  },

  // ===== 6. Luyện nói: đóng vai theo tình huống =====
  {
    lessonId: "0deeb05f-5b86-414b-bae2-285d8f89e0cf",
    title: "Luyện nói: đóng vai theo tình huống",
    prompt: SPEAK_PROMPT,
    type: "speaking",
    questions: [
      {
        text: "Ở quán cà phê, bạn muốn gọi một ly latte cỡ vừa mang đi.",
        options: ["Could I have a medium latte to take away, please?", "Give me latte medium, take.", "I want that you give me a latte.", "Medium latte. Now."],
        explain: "\"Could I have ..., please?\" là mẫu gọi món lịch sự; \"to take away\" (Anh) / \"to go\" (Mỹ) nghĩa là mang đi.",
      },
      {
        text: "Bạn không biết chọn món gì và muốn nhân viên gợi ý.",
        options: ["What would you recommend?", "What do you recommend me to eat it?", "Recommend!", "Is the food here good or bad?"],
        explain: "\"What would you recommend?\" là câu hỏi gợi ý món tự nhiên; câu thứ hai sai cấu trúc, câu cuối thiếu tế nhị.",
      },
      {
        text: "Hoá đơn tính thêm món tráng miệng mà bạn không gọi.",
        options: ["Excuse me, I think there might be a mistake on the bill. We didn't order the dessert.", "This bill is wrong. You're cheating us.", "I'm not paying for this.", "Why you put dessert here?"],
        explain: "Mở đầu bằng \"Excuse me, I think there might be a mistake\" giúp phàn nàn nhẹ nhàng, rồi nêu cụ thể vấn đề.",
      },
      {
        text: "Bạn muốn hỏi chiếc áo khoác này có cỡ lớn hơn không.",
        options: ["Do you have this jacket in a larger size?", "Have you bigger this jacket?", "Is this jacket more big?", "I want large jacket try."],
        explain: "Mẫu chuẩn: \"Do you have this ... in a larger size?\"; \"more big\" sai vì big có dạng so sánh bigger.",
      },
      {
        text: "Bạn muốn trả lại đôi giày bị bong đế và lấy lại tiền.",
        options: ["I bought these shoes last week, but the sole has come off. Could I get a refund, please?", "These shoes are rubbish. Money back now.", "I want change my money.", "Can I refund these shoes to you for free?"],
        explain: "Câu đúng nêu thời điểm mua, lỗi sản phẩm và yêu cầu \"Could I get a refund, please?\" một cách lịch sự.",
      },
      {
        text: "Bạn muốn hỏi một người lạ đường đến bưu điện gần nhất.",
        options: ["Excuse me, could you tell me how to get to the nearest post office?", "Where post office?", "Hey, post office, where is it, you know?", "Tell me the post office."],
        explain: "\"Excuse me, could you tell me how to get to ...?\" là câu hỏi gián tiếp, lịch sự khi hỏi người lạ.",
      },
      {
        text: "Một du khách hỏi đường đến bảo tàng. Câu chỉ đường nào rõ ràng và đúng nhất?",
        options: ["Go straight ahead, then take the second left. The museum is opposite the bank.", "Go straight on the second left opposite at the bank.", "You go, then left, then museum.", "Take the second left straight, the museum is between the bank."],
        explain: "Câu đúng chia rõ từng bước (go straight ahead, take the second left) và dùng đúng giới từ opposite; between cần hai mốc.",
      },
      {
        text: "Bạn gọi điện đến một công ty và muốn gặp ông Brown.",
        options: ["Hello, this is Nam from ABC Company. Could I speak to Mr. Brown, please?", "Hello, who are you? I want Mr. Brown.", "Give the phone to Mr. Brown.", "Is this Mr. Brown's phone? Why?"],
        explain: "Gọi điện nên giới thiệu \"This is ... from ...\" rồi hỏi \"Could I speak to ..., please?\"; không nói \"I am ...\" hay hỏi \"who are you?\".",
      },
      {
        text: "Người bạn cần gặp không có mặt. Bạn muốn để lại lời nhắn.",
        options: ["Could you ask him to call me back when he's free? My number is 0987 654 321.", "Tell him call me.", "OK, I'll never call again.", "Can I leave him?"],
        explain: "Lời nhắn lịch sự: \"Could you ask him to call me back ...?\" kèm số điện thoại; \"Can I leave him?\" mang nghĩa \"bỏ rơi anh ấy\".",
      },
      {
        text: "Bạn cần dời lịch hẹn với nha sĩ từ thứ Hai sang ngày khác.",
        options: ["I'm afraid I can't make it on Monday. Would it be possible to move my appointment to later in the week?", "I cancel Monday. Give me other day.", "Monday is not good, so I won't come ever.", "Can you postpone me?"],
        explain: "\"I'm afraid I can't make it ...\" báo không đến được một cách lịch sự, \"Would it be possible to move ...?\" đề nghị đổi lịch.",
      },
    ],
  },

  // ===== 7. Luyện nói: một ngày đi du lịch =====
  {
    lessonId: "131b402f-7254-4108-8f2d-469e7069004f",
    title: "Luyện nói: một ngày đi du lịch",
    prompt: SPEAK_PROMPT,
    type: "speaking",
    questions: [
      {
        text: "Check-in staff: \"Do you have any bags to check in?\"",
        options: ["Yes, just this suitcase. I'll keep the backpack as hand luggage.", "Yes, I check.", "No, I have bags.", "My bag is very heavy check."],
        explain: "Trả lời rõ vali nào ký gửi, ba lô nào xách tay (hand luggage); \"No, I have bags\" tự mâu thuẫn.",
      },
      {
        text: "Customs officer: \"Do you have anything to declare?\"",
        options: ["No, nothing to declare. Just personal items.", "Yes, I declare I am happy.", "I don't know what is in my bag.", "Declare is what?"],
        explain: "\"anything to declare\" là hỏi có hàng phải khai báo hải quan; câu trả lời chuẩn: \"Nothing to declare\".",
      },
      {
        text: "Bạn muốn hỏi chuyến bay VN123 khởi hành ở cổng nào.",
        options: ["Excuse me, which gate does flight VN123 leave from?", "Where is my gate of VN123 is?", "Gate! VN123!", "When gate?"],
        explain: "\"Which gate does flight ... leave from?\" đúng cấu trúc câu hỏi; câu thứ hai lặp hai lần is.",
      },
      {
        text: "Bạn đến khách sạn và đã đặt phòng trước dưới tên Tran.",
        options: ["Hi, I have a reservation under the name Tran.", "I booked. Tran. Room.", "Give me my room, please, Tran.", "Do you have a reservation for me to reserve?"],
        explain: "Mẫu nhận phòng: \"I have a reservation under the name ...\".",
      },
      {
        text: "Điều hoà trong phòng khách sạn không hoạt động. Bạn gọi xuống lễ tân.",
        options: ["I'm sorry to bother you, but the air conditioning in my room doesn't seem to be working.", "Your air conditioner is terrible. Fix it now!", "Air conditioner no.", "Why your hotel so hot?"],
        explain: "\"I'm sorry to bother you, but ... doesn't seem to be working\" là cách báo sự cố lịch sự, giảm nhẹ giọng phàn nàn.",
      },
      {
        text: "Bạn muốn trả phòng muộn hơn giờ quy định.",
        options: ["Would it be possible to have a late check-out, around 2 p.m.?", "I check out when I want.", "Can I late check-out myself?", "I don't want to leave the room."],
        explain: "\"Would it be possible to ...?\" là cách xin phép lịch sự, kèm giờ cụ thể để lễ tân dễ trả lời.",
      },
      {
        text: "Bạn lên taxi, muốn đến sân bay và hỏi giá ước tính.",
        options: ["Could you take me to the airport, please? Roughly how much will it cost?", "Airport. How much money you want?", "Drive to the airport fast and cheap.", "Is the airport far or expensive or what?"],
        explain: "\"Could you take me to ...?\" + \"Roughly how much will it cost?\" vừa nêu điểm đến vừa hỏi giá lịch sự.",
      },
      {
        text: "Bạn muốn hỏi tài xế xe buýt xem xe có đi đến ga tàu không hay phải đổi tuyến.",
        options: ["Excuse me, does this bus go to the train station, or do I need to change?", "This bus is train station?", "Change me to the train station.", "Where is change the bus?"],
        explain: "\"Does this bus go to ...?\" và \"do I need to change?\" là hai câu hỏi chuẩn khi đi xe buýt.",
      },
      {
        text: "Bạn bị mất hộ chiếu và đến đồn cảnh sát.",
        options: ["I'd like to report a lost passport. I think I left it in a taxi this morning.", "My passport is lost, find it.", "Passport no have.", "I lose passport, it is your problem."],
        explain: "\"I'd like to report a lost ...\" là mẫu trình báo mất đồ, kèm chi tiết nơi và thời điểm có thể bị mất.",
      },
      {
        text: "Bạn bị sốt và đau đầu, cần mua thuốc ở hiệu thuốc.",
        options: ["I've had a fever and a headache since last night. What would you recommend?", "I am fever head pain.", "Give me strong medicine, any.", "My head is hurting me a fever."],
        explain: "Dùng hiện tại hoàn thành + since để mô tả triệu chứng kéo dài, rồi hỏi dược sĩ gợi ý thuốc.",
      },
    ],
  },

  // ===== 8. Bài nói cuối khoá =====
  {
    lessonId: "133cb8dd-12df-4494-ba56-f8ae9a13d223",
    title: "Bài nói cuối khoá",
    prompt: SPEAK_PROMPT,
    type: "speaking",
    questions: [
      {
        text: "Your friend says: \"Students shouldn't have any homework at all.\" - Bạn không đồng ý. Câu nào lịch sự nhất?",
        options: ["I see your point, but I think a little homework helps students review what they've learned.", "You're totally wrong.", "No. Homework is good. End of story.", "That's a silly idea."],
        explain: "\"I see your point, but ...\" thừa nhận ý người kia trước khi phản biện kèm lý do - cách không đồng ý lịch sự.",
      },
      {
        text: "Câu nào thể hiện đồng ý MỘT PHẦN?",
        options: ["I agree up to a point, but online learning can't completely replace teachers.", "I completely agree with everything you said.", "I strongly disagree with that.", "Whatever you think."],
        explain: "\"I agree up to a point, but ...\" nghĩa là đồng ý một phần; các câu còn lại là đồng ý hoàn toàn, phản đối hoàn toàn hoặc thờ ơ.",
      },
      {
        text: "Your friend says: \"I always feel tired in the morning.\" - Lời khuyên nào đúng ngữ pháp và tự nhiên?",
        options: ["If I were you, I'd try going to bed a bit earlier.", "If I was you, I will go to bed earlier.", "You should to go to bed earlier.", "Why don't you going to bed earlier?"],
        explain: "Câu điều kiện loại 2: If I were you, I'd + V; should + V nguyên mẫu; Why don't you + V nguyên mẫu.",
      },
      {
        text: "Câu gợi ý nào dùng suggest đúng?",
        options: ["I suggest taking the bus instead of driving.", "I suggest to take the bus instead of driving.", "I suggest you to take the bus instead of driving.", "I suggest take the bus instead of driving."],
        explain: "suggest + V-ing (hoặc suggest that + S + V); không dùng suggest to V hay suggest somebody to V.",
      },
      {
        text: "Bạn đang kể một trải nghiệm. Câu nào dùng thì đúng?",
        options: ["I was walking home when it suddenly started to rain.", "I was walking home when it suddenly was starting rain.", "I was walk home when it suddenly started to rain.", "I am walking home when it suddenly started to rain."],
        explain: "Quá khứ tiếp diễn (was walking) cho hành động đang diễn ra, quá khứ đơn (started) cho hành động xen vào.",
      },
      {
        text: "Bạn muốn kết thúc câu chuyện về một trải nghiệm đáng nhớ. Câu nào phù hợp nhất?",
        options: ["Looking back, it was one of the most exciting days of my life, and I'll never forget it.", "Firstly, I want to tell you about my trip.", "Next, we went to the beach.", "In conclusion of the story, finish."],
        explain: "\"Looking back, ...\" dùng để kết chuyện và nêu cảm xúc; \"Firstly\" và \"Next\" là từ nối mở đầu, giữa chuyện.",
      },
      {
        text: "Bạn có 1 phút chuẩn bị cho bài nói 2 phút. Cách ghi chú nào hiệu quả nhất?",
        options: ["Note key words for an opening, two or three main points with examples, and a conclusion", "Write out every sentence in full so you can read it aloud", "Write nothing and just speak spontaneously", "Only list difficult words you want to show off"],
        explain: "Dàn ý từ khoá theo bố cục mở - thân - kết giúp nói mạch lạc mà vẫn tự nhiên; viết cả câu thì không kịp và dễ thành đọc bài.",
      },
      {
        text: "Câu mở bài nào phù hợp nhất cho chủ đề \"The benefits of learning a foreign language\"?",
        options: ["Today I'd like to talk about the benefits of learning a foreign language, focusing on work, travel and personal growth.", "Foreign language. Good. Many benefits.", "I don't know much about this topic, sorry.", "Learning a foreign language has benefits, the end."],
        explain: "Mở bài tốt giới thiệu chủ đề và báo trước các ý sẽ trình bày (work, travel, personal growth).",
      },
      {
        text: "Bạn muốn chuyển sang ý thứ hai trong bài nói. Câu nào phù hợp?",
        options: ["Another important point is that it can open up better job opportunities.", "In conclusion, it can open up better job opportunities.", "For example, firstly, it opens up better job opportunities.", "However, by contrast, it also opens up better job opportunities."],
        explain: "\"Another important point is that ...\" là từ nối thêm ý; \"In conclusion\" dùng để kết, \"However/by contrast\" chỉ sự đối lập.",
      },
      {
        text: "VSTEP Speaking Part 2 (thảo luận giải pháp): bạn được yêu cầu chọn một trong ba giải pháp. Cách trả lời nào tốt nhất?",
        options: ["Choose one option, explain why it is the best, and briefly say why the other two are less suitable", "Describe all three options equally without choosing one", "Choose one option and give no reasons", "Talk about a different solution that was not given"],
        explain: "Part 2 yêu cầu chọn một giải pháp, lập luận vì sao nó tốt nhất và so sánh ngắn với hai giải pháp còn lại.",
      },
    ],
  },
];
