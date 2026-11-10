import type { AuthoredTest } from './types';

const P2_PROMPT = "Nghe câu hỏi hoặc câu nói, chọn câu đáp lại phù hợp nhất.";

export const TESTS: AuthoredTest[] = [
  {
    lessonId: "dc01f06a-d430-4368-89b0-7e686a158bca",
    title: "Luyện nghe: Câu hỏi Wh- (15 câu)",
    prompt: P2_PROMPT,
    type: "toeic-p2",
    questions: [
      {
        speak: "Who's going to lead the training session on Monday?",
        options: ["Ms. Patel from human resources.", "On the third floor.", "It was very informative."],
        explain: "Who hỏi người, đáp án nêu tên và bộ phận. \"On the third floor\" trả lời Where; \"It was very informative\" sai thì (buổi tập huấn chưa diễn ra).",
      },
      {
        speak: "What time does the shipment usually arrive?",
        options: ["Around ten in the morning.", "Yes, it arrived yesterday.", "To our warehouse in Busan."],
        explain: "What time hỏi giờ nên chọn \"Around ten in the morning\". Không trả lời Yes cho câu hỏi Wh-; \"To our warehouse\" trả lời Where.",
      },
      {
        speak: "When is the deadline for the budget proposal?",
        options: ["It's been moved to next Friday.", "About fifty thousand dollars.", "The proposal was approved."],
        explain: "When hỏi thời gian, đáp án cho biết hạn đã dời sang thứ Sáu tới. \"Fifty thousand dollars\" là bẫy liên tưởng từ budget; \"proposal\" là bẫy lặp từ.",
      },
      {
        speak: "Where can I get my parking pass validated?",
        options: ["At the front desk in the lobby.", "Yes, it's valid until June.", "I parked on Elm Street."],
        explain: "Where hỏi nơi chốn, đáp án chỉ quầy lễ tân. \"Valid\" là bẫy âm gần với validated, \"parked\" là bẫy lặp từ parking.",
      },
      {
        speak: "Why was the client meeting postponed?",
        options: ["The director's flight was delayed.", "In conference room B.", "Yes, we met the client."],
        explain: "Why hỏi lý do; đáp án đúng nêu lý do mà không cần \"Because\". Hai phương án còn lại trả lời Where và dùng Yes cho câu Wh-.",
      },
      {
        speak: "How long will the renovation take?",
        options: ["About three weeks, I think.", "The new lobby looks great.", "By the construction company."],
        explain: "How long hỏi khoảng thời gian, chọn \"About three weeks\". \"By the construction company\" trả lời Who, câu về sảnh mới không trả lời thời lượng.",
      },
      {
        speak: "Which supplier did we choose for the office chairs?",
        options: ["The one with the lower price.", "Please choose a seat.", "They're quite comfortable."],
        explain: "Which hỏi sự lựa chọn, \"The one with ...\" là mẫu trả lời điển hình. \"Choose\" và \"seat\" là bẫy lặp từ, liên tưởng tới chairs.",
      },
      {
        speak: "Who should I send the invoice to?",
        options: ["I'm not sure. Let me ask accounting.", "In two business days.", "Yes, I've sent it."],
        explain: "Đáp án gián tiếp \"Let me ask accounting\" hợp lý khi chưa biết người nhận. \"In two business days\" trả lời When; Yes không dùng cho câu Wh-.",
      },
      {
        speak: "How often do you check the inventory?",
        options: ["Once a week, on Fridays.", "About two hundred items.", "It's in the storage room."],
        explain: "How often hỏi tần suất, chọn \"Once a week\". \"Two hundred items\" trả lời How many, \"in the storage room\" trả lời Where.",
      },
      {
        speak: "What did you think of the new marketing plan?",
        options: ["It seems a bit expensive to me.", "I'll plan to attend.", "At the marketing office."],
        explain: "What did you think of hỏi ý kiến, đáp án nêu nhận xét. \"Plan\" và \"marketing\" là bẫy lặp từ trong câu hỏi.",
      },
      {
        speak: "Where is the company retreat being held this year?",
        options: ["It hasn't been decided yet.", "For three days.", "A treat for the whole team."],
        explain: "\"It hasn't been decided yet\" là kiểu trả lời gián tiếp rất hay gặp. \"For three days\" trả lời How long, \"treat\" là bẫy âm gần với retreat.",
      },
      {
        speak: "Why is the elevator out of service?",
        options: ["It's undergoing its annual inspection.", "It serves twelve floors.", "Because of the service fee."],
        explain: "Đáp án nêu lý do: thang máy đang kiểm định hằng năm. \"Serves\" và \"service fee\" là bẫy lặp âm; có \"Because\" chưa chắc đã đúng.",
      },
      {
        speak: "How much does it cost to ship this package overseas?",
        options: ["That depends on the weight.", "By express mail.", "Packaging is on aisle four."],
        explain: "How much hỏi giá; \"That depends on the weight\" là câu trả lời gián tiếp hợp lý. \"By express mail\" trả lời How (phương thức), \"Packaging\" là bẫy âm gần package.",
      },
      {
        speak: "Who approved the new vacation policy?",
        options: ["The board of directors did.", "I'm going on vacation next week.", "Mostly in the summer."],
        explain: "Who hỏi người hoặc tổ chức, chọn \"The board of directors\". \"Vacation\" là bẫy lặp từ, \"in the summer\" trả lời When.",
      },
      {
        speak: "When will the new software be installed?",
        options: ["The technician is coming on Thursday.", "On every computer in the office.", "It was developed in-house."],
        explain: "Đáp án cho biết thời điểm qua việc kỹ thuật viên đến vào thứ Năm. \"On every computer\" trả lời Where, câu còn lại nói về nguồn gốc phần mềm.",
      },
    ],
  },
  {
    lessonId: "9f3956c7-eb20-4ac5-999e-9ba629c2c87d",
    title: "Luyện nghe: Câu hỏi Yes/No, câu hỏi đuôi, câu trần thuật (15 câu)",
    prompt: P2_PROMPT,
    type: "toeic-p2",
    questions: [
      {
        speak: "Did you get a chance to review the contract?",
        options: ["I'm just finishing it now.", "A contractor came by this morning.", "Two copies, please."],
        explain: "Câu hỏi Yes/No có thể trả lời gián tiếp: \"đang xem nốt\". \"Contractor\" là bẫy âm gần contract.",
      },
      {
        speak: "Is the conference room available this afternoon?",
        options: ["No, the sales team booked it.", "About twenty chairs.", "Yes, the conference was successful."],
        explain: "\"No\" kèm lý do phòng đã được đặt là hợp lý. \"Yes\" ở phương án C đi kèm nội dung lạc đề (conference là bẫy lặp từ).",
      },
      {
        speak: "Have you met the new accountant yet?",
        options: ["Yes, she introduced herself this morning.", "The account number is on the form.", "We'll meet at the station."],
        explain: "Đáp án xác nhận đã gặp và nói thêm chi tiết. \"Account\" là bẫy âm gần accountant, \"meet\" là bẫy lặp từ.",
      },
      {
        speak: "You're coming to the awards dinner, aren't you?",
        options: ["I wouldn't miss it.", "Dinner was served at seven.", "He won an award last year."],
        explain: "Câu hỏi đuôi xác nhận việc tham dự; \"I wouldn't miss it\" nghĩa là chắc chắn sẽ đến. Hai câu còn lại lặp từ dinner, award.",
      },
      {
        speak: "The quarterly report is due today, isn't it?",
        options: ["No, we got an extension until Monday.", "I'll report it to the manager.", "Every quarter."],
        explain: "Đáp án phủ nhận và giải thích được gia hạn. \"Report\" dùng như động từ và \"Every quarter\" đều là bẫy lặp từ.",
      },
      {
        speak: "Didn't Mr. Kim already sign the purchase order?",
        options: ["He's waiting for the final price.", "He ordered the soup.", "It's on the purchasing team's floor."],
        explain: "Câu hỏi phủ định; đáp án gián tiếp cho biết ông Kim chưa ký vì chờ giá cuối. \"Ordered\" và \"purchasing\" là bẫy lặp từ.",
      },
      {
        speak: "Why don't we take a short break before the next session?",
        options: ["That's a good idea.", "Because the session ran late.", "It broke down yesterday."],
        explain: "\"Why don't we\" là lời đề nghị, không hỏi lý do, nên đáp lại bằng đồng ý. \"Because...\" là bẫy hiểu nhầm thành câu hỏi Why, \"broke\" là bẫy âm gần break.",
      },
      {
        speak: "Could you help me move these files to the storage room?",
        options: ["Sure, just give me a minute.", "I moved here two years ago.", "The storage fee is monthly."],
        explain: "Lời nhờ giúp nên đáp bằng nhận lời. \"Moved\" và \"storage\" là bẫy lặp từ với nghĩa khác.",
      },
      {
        speak: "The printer on the second floor is jammed again.",
        options: ["I'll call the maintenance office.", "Print two copies of each.", "It's on the second floor."],
        explain: "Câu trần thuật báo sự cố, đáp án đưa ra cách xử lý. Hai phương án còn lại lặp lại print, second floor mà không phản hồi vấn đề.",
      },
      {
        speak: "Would you like me to book a taxi to the airport?",
        options: ["Thanks, but my colleague is driving me.", "The airport is very large.", "I've read that book."],
        explain: "Lời đề nghị giúp đỡ, đáp án từ chối lịch sự kèm lý do. \"Book\" ở phương án C là bẫy cùng chữ khác nghĩa (quyển sách).",
      },
      {
        speak: "Can you finish the slides by noon?",
        options: ["I should be able to.", "The slide show was impressive.", "At about noon yesterday."],
        explain: "\"I should be able to\" là cách trả lời có cho câu hỏi Can you. Hai phương án còn lại lặp slides, noon và sai thì.",
      },
      {
        speak: "Haven't the new brochures been delivered yet?",
        options: ["They should arrive this afternoon.", "Yes, I delivered the speech.", "They're printed in full color."],
        explain: "Câu hỏi phủ định; đáp án cho biết chưa tới và dự kiến chiều nay. \"Delivered the speech\" là bẫy cùng từ khác nghĩa.",
      },
      {
        speak: "Does this bus go to the convention center?",
        options: ["No, you need the number twelve.", "The convention lasts three days.", "The center opened last year."],
        explain: "Đáp án trả lời No và chỉ tuyến xe đúng. Hai câu còn lại chỉ lặp lại convention, center.",
      },
      {
        speak: "We're running low on printer paper.",
        options: ["I'll order some more today.", "I ran in the marathon.", "It's lower than the last one."],
        explain: "Câu trần thuật báo sắp hết giấy, đáp án hợp lý là đặt thêm. \"Ran\" và \"lower\" là bẫy âm gần running, low.",
      },
      {
        speak: "Let's review the budget figures after lunch.",
        options: ["OK, I'll bring the spreadsheet.", "I had a sandwich for lunch.", "It's a nice view from here."],
        explain: "\"Let's\" là lời đề nghị, đáp án đồng ý và chuẩn bị bảng tính. \"Lunch\" là bẫy lặp từ, \"view\" là bẫy âm gần review.",
      },
    ],
  },
  {
    lessonId: "e811e52c-78ad-40e8-92ad-335484fd6cfc",
    title: "Luyện tập tổng hợp Part 2 (25 câu)",
    prompt: P2_PROMPT,
    type: "toeic-p2",
    questions: [
      {
        speak: "Are you taking the train or flying to Chicago?",
        options: ["I'll probably drive, actually.", "Yes, I am.", "The flight attendant was helpful."],
        explain: "Câu hỏi lựa chọn có thể trả lời bằng phương án thứ ba (lái xe). Không trả lời Yes/No cho câu hỏi lựa chọn; \"flight\" là bẫy lặp âm.",
      },
      {
        speak: "Who's in charge of ordering office supplies?",
        options: ["Ms. Garcia handles that now.", "In the supply closet.", "A charge of fifteen dollars."],
        explain: "Who hỏi người phụ trách. \"Supply\" và \"charge\" là bẫy lặp từ với nghĩa khác.",
      },
      {
        speak: "When did the director return from Seoul?",
        options: ["Late last night.", "Next Tuesday.", "By plane."],
        explain: "Câu hỏi ở thì quá khứ (did) nên cần mốc quá khứ. \"Next Tuesday\" sai thì, \"By plane\" trả lời How.",
      },
      {
        speak: "Where's the nearest pharmacy?",
        options: ["There's one across from the bank.", "Near the end of the month.", "A prescription for allergies."],
        explain: "Where hỏi địa điểm. \"Near\" là bẫy âm gần nearest nhưng chỉ thời gian; \"prescription\" là bẫy liên tưởng.",
      },
      {
        speak: "Why is the store closing early tonight?",
        options: ["There's a staff training session.", "It closes at nine on weekends.", "Close the window, please."],
        explain: "Đáp án nêu lý do đóng cửa sớm. Phương án B trả lời giờ đóng cửa (When), C là bẫy lặp từ close.",
      },
      {
        speak: "How did the presentation go?",
        options: ["Better than I expected.", "I went by taxi.", "Present it to the board."],
        explain: "\"How did ... go?\" hỏi kết quả, diễn biến. \"Went by taxi\" là bẫy hiểu go theo nghĩa đi lại; \"Present\" là bẫy lặp âm.",
      },
      {
        speak: "What's the password for the guest Wi-Fi?",
        options: ["It's written on the card by the door.", "The guests arrived early.", "It passed the inspection."],
        explain: "Đáp án gián tiếp chỉ nơi ghi mật khẩu. \"Guests\" và \"passed\" là bẫy lặp âm.",
      },
      {
        speak: "Do you know if the café accepts credit cards?",
        options: ["Only cash, I'm afraid.", "Yes, I know the café owner.", "Coffee with milk, please."],
        explain: "Câu hỏi gián tiếp hỏi café có nhận thẻ không; đáp án cho biết chỉ nhận tiền mặt. \"Yes, I know\" lặp động từ know nhưng sai trọng tâm.",
      },
      {
        speak: "Isn't the museum closed on Mondays?",
        options: ["Not during the summer season.", "It's close to the hotel.", "On Monday morning."],
        explain: "Đáp án cho biết bảo tàng mở thứ Hai vào mùa hè. \"Close\" (gần) là bẫy đồng âm khác nghĩa với closed.",
      },
      {
        speak: "You've worked with this client before, haven't you?",
        options: ["Only on one small project.", "The client's office is downtown.", "It worked perfectly."],
        explain: "Câu hỏi đuôi xác nhận kinh nghiệm; đáp án xác nhận có nhưng ít. Hai câu còn lại lặp client, worked.",
      },
      {
        speak: "Would you rather meet in the morning or the afternoon?",
        options: ["Either is fine with me.", "Yes, I would.", "It's a nice morning."],
        explain: "Câu hỏi lựa chọn, \"Either is fine\" là đáp án kinh điển. \"Yes, I would\" sai dạng câu hỏi.",
      },
      {
        speak: "Should I print the agenda or send it by e-mail?",
        options: ["E-mail is fine, thanks.", "It's on the agenda.", "Yes, please send it."],
        explain: "Câu hỏi lựa chọn, đáp án chọn e-mail. Yes không phù hợp với câu hỏi or; \"agenda\" là bẫy lặp từ.",
      },
      {
        speak: "The new intern starts on Wednesday.",
        options: ["I'll prepare a desk for her.", "He started the car.", "Every Wednesday at three."],
        explain: "Câu trần thuật về thực tập sinh mới, đáp án phản hồi bằng việc chuẩn bị chỗ ngồi. \"Started\" và \"Wednesday\" là bẫy lặp từ.",
      },
      {
        speak: "I can't find the keys to the supply cabinet.",
        options: ["Check with the receptionist.", "Yes, it's a fine cabinet.", "The key points of the speech."],
        explain: "Đáp án gợi ý cách tìm chìa khoá. \"Fine\" là bẫy âm gần find, \"key points\" là bẫy cùng từ khác nghĩa.",
      },
      {
        speak: "Could you show the visitors around the factory?",
        options: ["I'm afraid I have a meeting then.", "The factory produces car parts.", "They visited last year."],
        explain: "Lời nhờ có thể từ chối lịch sự kèm lý do. Hai câu còn lại lặp factory, visit.",
      },
      {
        speak: "Why don't you apply for the manager position?",
        options: ["I don't think I have enough experience.", "Apply the cream twice a day.", "The manager is in a meeting."],
        explain: "\"Why don't you\" là lời khuyên; đáp án phản hồi bằng lý do còn e ngại. \"Apply\" (bôi kem) là bẫy cùng từ khác nghĩa.",
      },
      {
        speak: "How many people signed up for the workshop?",
        options: ["Over forty so far.", "Sign at the bottom.", "In the main hall."],
        explain: "How many hỏi số lượng. \"Sign\" là bẫy lặp từ, \"In the main hall\" trả lời Where.",
      },
      {
        speak: "Which train goes to the airport?",
        options: ["The express on platform three.", "It trains new staff.", "About forty minutes."],
        explain: "Which hỏi lựa chọn chuyến tàu, đáp án chỉ rõ tàu nhanh ở sân ga 3. \"Trains\" (đào tạo) là bẫy cùng từ, \"forty minutes\" trả lời How long.",
      },
      {
        speak: "Has the budget for next year been finalized?",
        options: ["The committee meets about it tomorrow.", "It's the final exam.", "The budget hotel was clean."],
        explain: "Đáp án gián tiếp: chưa chốt, ngày mai hội đồng họp. \"Final\" và \"budget hotel\" là bẫy lặp âm khác nghĩa.",
      },
      {
        speak: "Whose umbrella is this by the door?",
        options: ["I think it's Tom's.", "It's raining heavily.", "Close the door, please."],
        explain: "Whose hỏi chủ sở hữu, đáp án dùng sở hữu cách. \"Raining\" là bẫy liên tưởng, \"door\" là bẫy lặp từ.",
      },
      {
        speak: "Mr. Lopez called while you were out.",
        options: ["Did he leave a message?", "Yes, the store is out of stock.", "He's tall with dark hair."],
        explain: "Đáp lại câu trần thuật bằng một câu hỏi liên quan là kiểu đúng hay gặp. \"Out of stock\" là bẫy lặp từ out.",
      },
      {
        speak: "Shouldn't we confirm the hotel reservation?",
        options: ["I already did it this morning.", "The hotel has a pool.", "Reserve a table for four."],
        explain: "Câu hỏi phủ định gợi ý việc cần làm; đáp án cho biết đã xác nhận. \"Reserve\" là bẫy âm gần reservation.",
      },
      {
        speak: "What's the fastest way to the harbor?",
        options: ["Take the subway to Pier Street.", "He's the fastest runner on the team.", "I'll be there by noon."],
        explain: "Hỏi đường đi nhanh nhất, đáp án chỉ phương tiện và điểm xuống. \"Fastest\" là bẫy lặp từ, \"by noon\" trả lời When.",
      },
      {
        speak: "Can I get a refund on these shoes?",
        options: ["Do you have your receipt?", "They come in three colors.", "A fund for new equipment."],
        explain: "Đáp lại bằng câu hỏi về hoá đơn là phản hồi tự nhiên của nhân viên. \"Fund\" là bẫy âm gần refund.",
      },
      {
        speak: "How about ordering lunch for the team?",
        options: ["Good idea, I'll get the menu.", "About twelve people.", "We had lunch at noon."],
        explain: "\"How about + V-ing\" là lời đề nghị, đáp án đồng ý. \"About twelve people\" là bẫy hiểu nhầm thành How many.",
      },
    ],
  },
  {
    lessonId: "818714be-fc75-4516-9427-dcf788a4ded0",
    title: "Kiểm tra chặng 1",
    prompt: "Chọn câu tiếng Anh phù hợp và lịch sự nhất cho tình huống ở văn phòng.",
    type: "vocab-context",
    questions: [
      {
        text: "Bạn gặp một đối tác lần đầu và muốn giới thiệu tên cùng vai trò của mình.",
        options: [
          "Hi, I'm Linh Tran. I'm in charge of customer accounts here.",
          "Hey, call me Linh. What's up?",
          "I am Linh Tran, and you are who?",
          "Hi, I'm Linh Tran. I am working as accountant since 2020.",
        ],
        explain: "Câu đúng nêu tên và trách nhiệm (in charge of) một cách tự nhiên. Các câu khác quá suồng sã, sai trật tự câu hỏi, hoặc sai thì (since cần hiện tại hoàn thành) và thiếu mạo từ \"an\".",
      },
      {
        text: "Bạn muốn hỏi một người mới quen làm công việc gì ở công ty Brightline.",
        options: [
          "So, what do you do at Brightline?",
          "What are you doing at Brightline?",
          "How do you do at Brightline?",
          "What is your job position, please tell me.",
        ],
        explain: "\"What do you do?\" là cách hỏi nghề nghiệp chuẩn. \"What are you doing\" hỏi việc đang làm lúc này, \"How do you do\" là lời chào; câu cuối cứng nhắc.",
      },
      {
        text: "Sáng thứ Hai, đồng nghiệp hỏi: \"How was your weekend?\"",
        options: [
          "Pretty relaxing, thanks. I visited my parents. How about yours?",
          "I'm fine, thank you. And you?",
          "It was on Saturday and Sunday.",
          "Yes, I had a weekend.",
        ],
        explain: "Câu đúng trả lời cảm nhận, thêm chi tiết và hỏi lại. \"I'm fine\" đáp nhầm câu How are you; hai câu còn lại hiểu sai câu hỏi.",
      },
      {
        text: "Bạn muốn nhờ đồng nghiệp xem lại bản báo cáo khi họ rảnh.",
        options: [
          "Would you mind taking a look at this report when you have a moment?",
          "Would you mind to look at this report?",
          "Look at my report now.",
          "You must check my report.",
        ],
        explain: "\"Would you mind + V-ing\" kèm \"when you have a moment\" rất lịch sự. \"Mind to look\" sai ngữ pháp; hai câu còn lại là mệnh lệnh, thiếu lịch sự.",
      },
      {
        text: "Đồng nghiệp hỏi: \"Could you help me with these invoices this afternoon?\" Bạn bận nhưng muốn từ chối khéo.",
        options: [
          "I'd love to, but I have a client call at two. How about tomorrow morning?",
          "No, I can't. I'm busy.",
          "Sorry, I don't want.",
          "I'm afraid I can't helping you.",
        ],
        explain: "Từ chối lịch sự gồm: thiện chí, lý do và đề xuất thay thế. Câu B quá cộc, C thiếu tân ngữ và thô, D sai ngữ pháp (can't + V nguyên mẫu).",
      },
      {
        text: "Trưởng nhóm muốn giao cho nhân viên việc ghi biên bản họp tuần này.",
        options: [
          "Could you take care of the meeting notes this week?",
          "Take care!",
          "Could you care the meeting notes?",
          "You will take care notes.",
        ],
        explain: "\"Take care of\" nghĩa là phụ trách, lo việc gì. \"Take care!\" là lời chào tạm biệt; hai câu còn lại thiếu giới từ \"of\".",
      },
      {
        text: "Bạn là lễ tân công ty Orbis Solutions, nhấc máy trả lời cuộc gọi.",
        options: [
          "Good morning, Orbis Solutions. Mai speaking. How may I help you?",
          "Hello, who are you?",
          "Good morning, I am Mai. What do you want?",
          "Orbis Solutions, Mai is talking.",
        ],
        explain: "Mẫu chuẩn: chào, tên công ty, \"[Tên] speaking\", đề nghị giúp. \"What do you want\" thiếu lịch sự; \"Mai is talking\" không phải cách nói trên điện thoại.",
      },
      {
        text: "Khách gọi: \"Could I speak to Mr. Harris, please?\" Ông Harris đang ra ngoài.",
        options: [
          "I'm afraid he's out of the office at the moment. May I take a message?",
          "He's not here. Call later.",
          "Sorry, he is not exist today.",
          "Hold on, I take your message.",
        ],
        explain: "\"I'm afraid...\" làm câu báo tin nhẹ nhàng, \"May I take a message?\" là đề nghị chuẩn. Câu B cộc lốc, C sai ngữ pháp, D sai thì và nghĩa.",
      },
      {
        text: "Bạn cần khách chờ máy trong lúc chuyển cuộc gọi.",
        options: [
          "Could you hold the line for a moment, please?",
          "Hang up for a moment, please.",
          "Could you keep the line a moment?",
          "Please wait the phone.",
        ],
        explain: "\"Hold the line\" nghĩa là giữ máy. \"Hang up\" là cúp máy (bẫy nghĩa ngược); \"keep the line\" và \"wait the phone\" không tự nhiên, thiếu giới từ.",
      },
      {
        text: "Bạn hứa sẽ phản hồi khách hàng chậm nhất vào thứ Sáu. Câu nào đúng?",
        options: [
          "I'll get back to you by Friday.",
          "I'll call you back until Friday.",
          "I'll get back you by Friday.",
          "I call you back in Friday.",
        ],
        explain: "\"Get back to sb\" và \"by + thời điểm\" (chậm nhất là) đều đúng. \"Until\" chỉ sự kéo dài, thiếu \"to\" là lỗi, \"in Friday\" sai giới từ.",
      },
    ],
  },
  {
    lessonId: "72f8a0d8-58f5-476d-a08d-0fdb1eebece8",
    title: "Bài nói: thuyết trình 3 phút",
    prompt: "Chọn câu nói phù hợp nhất cho cuộc họp hoặc bài thuyết trình.",
    type: "speaking",
    questions: [
      {
        text: "Bạn mở đầu bài thuyết trình về kết quả bán hàng quý 2.",
        options: [
          "Good morning, everyone. Thank you for coming. Today I'd like to talk about our sales results for the second quarter.",
          "OK, I start now. Sales.",
          "Hello. I will talk you about sales.",
          "Good morning. Today I'd like talking about our sales results.",
        ],
        explain: "Mở đầu chuẩn gồm chào, cảm ơn và nêu chủ đề với \"I'd like to + V\". Các câu khác cộc lốc, thiếu \"to\" sau talk, hoặc sai \"would like + V-ing\".",
      },
      {
        text: "Bạn muốn giới thiệu dàn ý gồm 3 phần cho người nghe.",
        options: [
          "My talk is divided into three parts: first the results, then the causes, and finally our plan for next quarter.",
          "First, the results. Finally, the causes. Then, the plan.",
          "There are many things I talk today, maybe three or four.",
          "I'm going to talking about three parts.",
        ],
        explain: "Câu đúng dùng đúng thứ tự first, then, finally. Câu B đảo \"finally\" lên giữa, câu C mơ hồ và sai ngữ pháp, câu D sai \"going to + V-ing\".",
      },
      {
        text: "Bạn chuyển từ phần tổng quan sang phần số liệu theo khu vực.",
        options: [
          "Now, let's move on to the regional figures.",
          "Now, let's move to on the regional figures.",
          "After that, I finished the regional figures.",
          "Regional figures, they are next, OK?",
        ],
        explain: "\"Let's move on to...\" là cụm chuyển ý chuẩn. Câu B sai trật tự giới từ, câu C sai thì và nghĩa, câu D thiếu trang trọng.",
      },
      {
        text: "Biểu đồ: doanh số tăng từ 2 triệu USD (tháng 1) lên 3,5 triệu USD (tháng 3). Câu mô tả nào chính xác?",
        options: [
          "Sales rose sharply from 2 million in January to 3.5 million in March.",
          "Sales fell sharply from 2 million in January to 3.5 million in March.",
          "Sales rose slightly from 2 million in January to 3.5 million in March.",
          "Sales remained stable between January and March.",
        ],
        explain: "Tăng 75% trong hai tháng là \"rose sharply\". \"Fell\" sai chiều, \"slightly\" sai mức độ, \"remained stable\" sai xu hướng.",
      },
      {
        text: "Biểu đồ chi phí 3 tháng: 4,1 triệu - 4,2 triệu - 4,1 triệu USD. Câu nào mô tả đúng?",
        options: [
          "Costs remained fairly stable at around 4.1 million.",
          "Costs increased dramatically over the period.",
          "Costs dropped sharply in the third month.",
          "Costs fluctuated wildly from month to month.",
        ],
        explain: "Dao động chỉ 0,1 triệu nên là \"remained fairly stable\". Các trạng từ dramatically, sharply, wildly đều phóng đại mức thay đổi.",
      },
      {
        text: "Biểu đồ tròn: bán online chiếm 60%, bán tại cửa hàng chiếm 30%. Câu so sánh nào đúng?",
        options: [
          "Online sales were twice as high as in-store sales.",
          "Online sales were twice higher than in-store sales.",
          "In-store sales were twice as high as online sales.",
          "Online sales were as high as in-store sales.",
        ],
        explain: "So sánh gấp bội dùng \"twice as + adj + as\". \"Twice higher than\" là lỗi thường gặp; câu C đảo ngược số liệu, câu D sai vì hai con số khác nhau.",
      },
      {
        text: "Trong cuộc họp, bạn muốn nêu ý kiến rằng nên tập trung vào quảng cáo online.",
        options: [
          "In my opinion, we should focus on online advertising.",
          "According to me, we should focus on online advertising.",
          "I think that we must to focus on online advertising.",
          "My opinion, we focus online advertising.",
        ],
        explain: "\"In my opinion\" là cách nêu ý kiến chuẩn. \"According to me\" là lỗi người Việt hay mắc (according to dùng cho nguồn bên ngoài); \"must to\" sai; câu D thiếu giới từ.",
      },
      {
        text: "Đồng nghiệp đề xuất thuê thêm 5 người, bạn không đồng ý vì ngân sách hạn chế. Chọn cách phản đối lịch sự.",
        options: [
          "I see your point, but I'm not sure that's the best option given our budget.",
          "You're wrong. That's a bad idea.",
          "I'm not agree with you.",
          "I disagree you completely.",
        ],
        explain: "Phản đối lịch sự: ghi nhận ý kiến rồi nêu băn khoăn kèm lý do. Câu B quá thẳng, \"I'm not agree\" và \"disagree you\" sai ngữ pháp.",
      },
      {
        text: "Bạn kết thúc bài thuyết trình và mời đặt câu hỏi.",
        options: [
          "To sum up, online sales are driving our growth. Thank you for your attention. I'm happy to take any questions.",
          "That's all. Bye.",
          "In conclusion, thank you for listen.",
          "Finally, any question? No? OK.",
        ],
        explain: "Kết bài chuẩn gồm tóm tắt ý chính, cảm ơn, mời hỏi. Câu B cộc, câu C sai \"for + V-ing\", câu D thiếu tóm tắt và thiếu lịch sự.",
      },
      {
        text: "Sau bài thuyết trình, một người hỏi con số bạn không nhớ chính xác.",
        options: [
          "That's a good question. I don't have the exact figure with me, but I'll check and e-mail it to you after the session.",
          "I don't know.",
          "That question is not important.",
          "Maybe it's about 20 percent, I guess.",
        ],
        explain: "Khi chưa có đáp án: ghi nhận câu hỏi, thành thật và hứa gửi sau. Đoán bừa con số hoặc gạt câu hỏi đi đều thiếu chuyên nghiệp.",
      },
    ],
  },
  {
    lessonId: "e98739cb-ad18-43a0-927c-02408964df07",
    title: "Phỏng vấn thử cuối khoá",
    prompt: "Chọn câu trả lời phỏng vấn hoặc câu viết hồ sơ xin việc tốt nhất.",
    type: "speaking",
    questions: [
      {
        text: "Interviewer: \"Tell me about yourself.\"",
        options: [
          "I'm a marketing graduate with two years of experience in digital campaigns. Most recently, I increased social media engagement by 40% at Sunrise Retail, and I'm now looking for a larger role.",
          "I was born in 1999 in Hanoi, and I have two sisters and a dog.",
          "It's all on my CV, so you can read it there.",
          "I'm hard-working and friendly, and I like music and travel.",
        ],
        explain: "Câu trả lời tốt tóm tắt nền tảng, thành tích có số liệu và mục tiêu hiện tại. Kể đời tư, bảo đọc CV, hay liệt kê tính từ chung chung đều không thuyết phục.",
      },
      {
        text: "Interviewer: \"What is your greatest weakness?\"",
        options: [
          "I used to take on too many tasks at once. I've started setting priorities each morning with a task app, and it has helped a lot.",
          "I don't have any weaknesses.",
          "I'm often late, but my last boss didn't mind.",
          "I can't think of one right now. Can we skip this question?",
        ],
        explain: "Nêu điểm yếu thật nhưng không nghiêm trọng, kèm cách đang khắc phục. Nói không có điểm yếu, nêu lỗi nghiêm trọng hoặc né câu hỏi đều gây ấn tượng xấu.",
      },
      {
        text: "Interviewer: \"Why do you want to work for our company?\"",
        options: [
          "I admire your focus on sustainable products, and my supply chain experience could support your expansion into Southeast Asia.",
          "Because your office is near my house.",
          "I need a job with a higher salary.",
          "I applied to many companies, and you called me first.",
        ],
        explain: "Câu tốt cho thấy hiểu công ty và nối kinh nghiệm bản thân với nhu cầu của họ. Các lý do cá nhân như gần nhà, lương, được gọi trước không thuyết phục.",
      },
      {
        text: "Trong câu trả lời theo STAR, câu nào là phần Situation (bối cảnh)?",
        options: [
          "Last year, our biggest client threatened to cancel their contract because of late deliveries.",
          "I was asked to find out why the deliveries were delayed.",
          "I met with the warehouse team and set up a daily tracking sheet.",
          "Late deliveries dropped by 60%, and the client renewed for two years.",
        ],
        explain: "Situation mô tả bối cảnh, vấn đề. Câu B là Task (nhiệm vụ), C là Action (hành động), D là Result (kết quả).",
      },
      {
        text: "Câu nào là phần Result mạnh nhất để kết thúc một câu chuyện STAR?",
        options: [
          "As a result, customer complaints fell by 30% within three months.",
          "In the end, everything was fine, I think.",
          "Then I worked very hard every day.",
          "My manager was a very nice person.",
        ],
        explain: "Result tốt cần cụ thể, đo lường được. Câu B mơ hồ, câu C là hành động chung chung, câu D không liên quan đến kết quả.",
      },
      {
        text: "Người phỏng vấn muốn biết vai trò của riêng bạn. Câu Action nào tốt nhất?",
        options: [
          "I created a new onboarding checklist and trained three new staff members myself.",
          "We did many things to fix the problem.",
          "The team was helped by me somewhat.",
          "Somebody created a checklist, and it worked.",
        ],
        explain: "Phần Action nên dùng \"I\" và động từ hành động cụ thể. \"We did many things\" che mất vai trò cá nhân; hai câu còn lại bị động hoặc không rõ ai làm.",
      },
      {
        text: "Interviewer: \"What are your salary expectations?\"",
        options: [
          "Based on my research and experience, I'm looking for 15 to 18 million dong a month, but I'm open to discussing the full package.",
          "As much as possible.",
          "I don't care about money at all.",
          "How much do you pay your current staff?",
        ],
        explain: "Đưa khoảng lương có cơ sở và tỏ ra linh hoạt là cách trả lời chuyên nghiệp. Các câu còn lại tham lam, thiếu thật hoặc hỏi vặn lại không phù hợp.",
      },
      {
        text: "Cuối buổi, người phỏng vấn hỏi: \"Do you have any questions for us?\"",
        options: [
          "Yes. What would a typical day look like for someone in this role?",
          "No, I don't have any.",
          "How many days off can I take in my first month?",
          "So, did I get the job?",
        ],
        explain: "Câu hỏi về công việc thể hiện sự quan tâm thật. Không hỏi gì, hỏi ngày nghỉ ngay hoặc hỏi kết quả tại chỗ đều gây ấn tượng kém.",
      },
      {
        text: "Câu mở đầu nào phù hợp nhất cho thư xin việc (cover letter)?",
        options: [
          "I am writing to apply for the position of Sales Executive advertised on your website.",
          "I am writing for apply the Sales Executive position.",
          "Hi! I want this job very much.",
          "Please give me the Sales Executive job.",
        ],
        explain: "\"I am writing to apply for...\" kèm nguồn tin tuyển dụng là mở đầu chuẩn. Câu B sai ngữ pháp, câu C và D quá suồng sã.",
      },
      {
        text: "Dòng kinh nghiệm nào viết trong CV hiệu quả nhất?",
        options: [
          "Managed a team of five and reduced order processing time by 25%.",
          "Was responsible for some team things.",
          "I am a person who managing team.",
          "Helped with tasks when needed.",
        ],
        explain: "CV nên mở đầu bằng động từ hành động (Managed) và có kết quả đo được. Các dòng khác mơ hồ, sai ngữ pháp hoặc không nêu thành tích.",
      },
    ],
  },
  {
    lessonId: "3f9da615-29bd-4d13-baa5-a4cfcfcfee7b",
    title: "Bài viết: email gửi khách hàng",
    prompt: "Chọn câu viết phù hợp nhất cho email công việc gửi khách hàng.",
    type: "writing",
    questions: [
      {
        text: "Bạn cần báo khách hàng ngày giao hàng mới của đơn #4521. Chọn tiêu đề email tốt nhất.",
        options: [
          "Subject: Revised delivery date for Order #4521",
          "Subject: Hello",
          "Subject: Important!!! Please read now",
          "Subject: About the thing we discussed",
        ],
        explain: "Tiêu đề tốt nêu rõ nội dung và mã đơn để khách dễ tìm. Các tiêu đề còn lại mơ hồ hoặc gây khó chịu.",
      },
      {
        text: "Khách hàng tên Linda Park, bạn chưa thân và không biết tình trạng hôn nhân của bà. Chọn lời chào phù hợp.",
        options: ["Dear Ms. Park,", "Dear Mrs. Linda,", "Hi Linda Park!!", "Dear Madam Linda,"],
        explain: "\"Ms. + họ\" là cách gọi trang trọng, trung tính. Danh xưng không đi với tên riêng (Mrs. Linda), và dấu chấm than kép thiếu chuyên nghiệp.",
      },
      {
        text: "Câu nêu mục đích email nào phù hợp nhất?",
        options: [
          "I am writing to confirm the details of your order placed on March 3.",
          "I write this email for confirm your order.",
          "This email is about your order, you know.",
          "I want to tell you something about your order.",
        ],
        explain: "\"I am writing to + V\" là mẫu nêu mục đích chuẩn và cụ thể. Câu B sai \"for + V\", câu C suồng sã, câu D mơ hồ.",
      },
      {
        text: "Khách chưa phản hồi báo giá bạn gửi thứ Ba tuần trước. Chọn câu follow-up lịch sự.",
        options: [
          "I'm following up on the quotation I sent you last Tuesday.",
          "I follow up you about the quotation.",
          "Why haven't you answered my quotation?",
          "Did you forget my quotation?",
        ],
        explain: "\"Follow up on + sự việc\" là cụm chuẩn và trung tính. Câu B sai cấu trúc, câu C và D mang ý trách móc khách hàng.",
      },
      {
        text: "Bạn nhắc khách thanh toán hoá đơn #208 đến hạn vào thứ Sáu.",
        options: [
          "This is a friendly reminder that payment for invoice #208 is due on Friday.",
          "Remember paying invoice #208 on Friday.",
          "You must pay invoice #208 on Friday, or else.",
          "Don't forget to paying invoice #208.",
        ],
        explain: "\"This is a friendly reminder that...\" lịch sự và rõ hạn. \"Remember + V-ing\" nghĩa là nhớ đã làm (sai nghĩa), câu C đe doạ, câu D sai \"to + V-ing\".",
      },
      {
        text: "Đơn hàng bị giao trễ, bạn xin lỗi khách hàng.",
        options: [
          "We sincerely apologize for the delay and appreciate your patience.",
          "Sorry for late.",
          "We apologize about the delay, but it's not our fault.",
          "We are apologize for the delay.",
        ],
        explain: "\"Apologize for\" kèm lời cảm ơn sự kiên nhẫn là mẫu chuẩn. Câu B sai và cộc, câu C đổ lỗi, câu D sai ngữ pháp (are + V nguyên mẫu).",
      },
      {
        text: "Bạn gửi kèm bảng giá cập nhật trong email.",
        options: [
          "Please find attached the updated price list.",
          "Please find the attaching price list.",
          "I attach you the price list.",
          "Attached is price list, see it.",
        ],
        explain: "\"Please find attached...\" là mẫu chuẩn khi gửi tệp đính kèm. \"Attaching\" sai dạng từ, \"attach you\" sai cấu trúc, câu D thiếu mạo từ và cộc lốc.",
      },
      {
        text: "Chọn câu kết email mời khách liên hệ khi cần.",
        options: [
          "Please let me know if you have any questions.",
          "Please let me know if you will have any questions.",
          "Contact me if you have problem.",
          "Waiting your reply.",
        ],
        explain: "Mệnh đề if chỉ điều kiện dùng hiện tại đơn, không dùng will. Câu C thiếu mạo từ và tiêu cực, câu D thiếu \"for\".",
      },
      {
        text: "Chọn lời ký kết (sign-off) phù hợp cho email gửi khách hàng.",
        options: ["Best regards,", "Love,", "See ya,", "Yours truly friend,"],
        explain: "\"Best regards\" trang trọng, phổ biến trong email công việc. \"Love\" và \"See ya\" quá thân mật, \"Yours truly friend\" không phải cụm chuẩn.",
      },
      {
        text: "Sau cuộc họp, bạn viết email tóm tắt việc sẽ gửi hợp đồng sửa đổi trước ngày 10/5.",
        options: [
          "As agreed in our meeting, we will send the revised contract by May 10.",
          "As agreed in our meeting, the revised contract will sent by May 10.",
          "Like we agree in meeting, we send contract May 10.",
          "As agreed in our meeting, we sending the revised contract by May 10.",
        ],
        explain: "\"As agreed in our meeting\" nhắc lại thoả thuận, \"will send ... by\" nêu hạn rõ ràng. Câu B thiếu \"be\" ở bị động, câu C sai và suồng sã, câu D thiếu trợ động từ.",
      },
    ],
  },
];
