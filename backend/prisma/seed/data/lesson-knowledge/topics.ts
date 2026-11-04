/** Gói từ vựng / mẫu câu theo chủ đề (giao tiếp, công sở, TOEIC Part, phát âm, viết, nghe) */
import type { Pack } from './types';

export const TOPIC_PACKS: Pack[] = [
  // ---------- TOEIC tổng quan & từng Part ----------
  {
    match: /cấu trúc bài thi toeic|thang điểm|tìm hiểu bài thi/,
    text: `# Từ vựng
Listening | /ˈlɪsənɪŋ/ | n | phần Nghe: Part 1–4, 100 câu, khoảng 45 phút |
Reading | /ˈriːdɪŋ/ | n | phần Đọc: Part 5–7, 100 câu, 75 phút |
scaled score | /skeɪld skɔːr/ | n | điểm quy đổi: mỗi phần 5–495, tổng 10–990 |
answer sheet | /ˈænsər ʃiːt/ | n | phiếu trả lời | Mark your answers on the answer sheet.`,
  },
  {
    match: /part 1|tranh tả người|tranh tả cảnh/,
    text: `# Ngữ pháp
Tả người đang làm | S + is/are + V-ing | Tranh có người → chú ý hành động | A woman is typing on a keyboard.
Tả vật (bị động tiếp diễn) | S + is/are being + V3 | Chỉ đúng khi có người đang tác động | A car is being washed.
Tả trạng thái của vật | S + has/have been + V3; S + is/are + V3 | Không có người trong tranh | Chairs have been stacked against the wall.
# Từ vựng
stack | /stæk/ | v, n | xếp chồng | Boxes are stacked on the floor.
lean against | /liːn əˈɡenst/ | v | dựa vào | A ladder is leaning against the wall.
board | /bɔːrd/ | v | lên (xe, tàu) | Passengers are boarding a bus.
arrange | /əˈreɪndʒ/ | v | sắp xếp | Flowers have been arranged on the table.
wheelbarrow | /ˈwiːlbærəʊ/ | n | xe cút kít | A man is pushing a wheelbarrow.
pier / dock | /pɪər/ | n | bến tàu | Boats are tied to the dock.`,
  },
  {
    match: /part 2|205 từ vựng|hiểu sâu part 2|câu hỏi đuôi, câu hỏi phủ định/,
    text: `# Từ vựng
I'm not sure. | | | Tôi không chắc (đáp án gián tiếp hay đúng) |
It hasn't been decided yet. | | | Vẫn chưa quyết định |
Let me check. | | | Để tôi kiểm tra |
Didn't you get the memo? | | | Bạn không nhận được thông báo à? |
reimbursement | /ˌriːɪmˈbɜːrsmənt/ | n | sự hoàn tiền (công tác phí) | Submit receipts for reimbursement.
itinerary | /aɪˈtɪnəreri/ | n | lịch trình chuyến đi | I'll email you the itinerary.`,
  },
  {
    match: /part 6|đoạn văn/,
    text: `# Ngữ pháp
Từ nối | however, therefore, in addition, as a result | Dựa vào quan hệ ý: trái ngược, kết quả, bổ sung | In addition, we offer free delivery.
# Kỹ năng
Chọn thì theo ngữ cảnh | Đọc câu trước và sau chỗ trống | Part 6 kiểm tra mạch văn, không chỉ một câu |
Chọn câu điền vào đoạn | Câu phải nối ý với câu trước/sau | Chú ý đại từ (this, these, it) trỏ về ý nào |`,
  },

  // ---------- Giới từ (trình bày dạng ngữ pháp) ----------
  {
    match: /giới từ thời gian|giới từ (chỉ )?thời gian|in, on, at|giới từ và cụm giới từ|giới từ \(prepositions\)|^giới từ/,
    text: `# Ngữ pháp
in + tháng / năm / mùa / buổi | in May, in 2026, in summer, in the morning | Khoảng thời gian dài | The office opened in 2020.
on + thứ / ngày cụ thể | on Monday, on 15 March, on my birthday | | The meeting is on Friday.
at + giờ / thời điểm | at 9 a.m., at noon, at night, at the weekend | | The train leaves at 7:30.
in / at / on chỉ nơi chốn | in + không gian bao quanh; at + một điểm; on + bề mặt, tầng | | in the room, at the airport, on the third floor
by / until | by + mốc = chậm nhất là; until + mốc = kéo dài đến | | Please reply by Friday. / The shop is open until 10 p.m.
for / since | for + khoảng thời gian; since + mốc thời gian | Thường đi với thì hiện tại hoàn thành | I have worked here for five years / since 2020.
Giới từ + V-ing | interested in, good at, responsible for + V-ing | Sau giới từ dùng danh từ hoặc V-ing | She is good at managing people.`,
  },
  {
    match: /đi lại|hỏi đường|chỉ đường|nơi chốn|phương hướng/,
    text: `# Ngữ pháp
Vị trí | next to, opposite, between … and …, in front of, behind | | The bank is opposite the post office.
# Từ vựng
intersection | /ˌɪntərˈsekʃən/ | n | ngã tư | Turn left at the intersection.
block | /blɒk/ | n | dãy nhà | It's two blocks away.
landmark | /ˈlændmɑːrk/ | n | địa danh dễ nhận biết | The tower is a famous landmark.
ticket | /ˈtɪkɪt/ | n | vé | I bought a return ticket.
# Mẫu câu
Hỏi đường | Excuse me, how do I get to …? / Where is the nearest …? | | How do I get to the station?
Chỉ đường | Go straight; Turn left / right; Take the second street on the left | Dùng câu mệnh lệnh | Turn right at the traffic lights.`,
  },
  {
    match: /lịch, hạn chót|cuộc hẹn|đặt lịch hẹn/,
    text: `# Từ vựng
appointment | /əˈpɔɪntmənt/ | n | cuộc hẹn | I have an appointment with the dentist.
schedule | /ˈʃedjuːl/ | n, v | lịch trình; lên lịch | The schedule has changed.
deadline | /ˈdedlaɪn/ | n | hạn chót | We must meet the deadline.
reschedule | /ˌriːˈʃedjuːl/ | v | dời lịch | Can we reschedule the meeting?
calendar | /ˈkælɪndər/ | n | lịch | I'll check my calendar.
# Mẫu câu
Đặt lịch | Are you available on …? / How about …? | | Are you available on Thursday afternoon?
Hoãn / huỷ | I'm afraid I have to reschedule / cancel … | | I'm afraid I have to cancel our appointment.`,
  },
  {
    match: /collocation|những từ hay đi cùng/,
    text: `# Từ vựng
heavy traffic | | n | giao thông đông đúc | We were late because of heavy traffic.
strong coffee | | n | cà phê đậm | I need a strong coffee.
fast food | | n | đồ ăn nhanh | Fast food is cheap but unhealthy.
# Mẫu câu
make + N | make a decision, make a mistake, make progress, make an effort | make: tạo ra kết quả | She made a decision quickly.
do + N | do homework, do business, do research, do your best | do: thực hiện công việc | We do business with Japan.
take + N | take a break, take notes, take part in, take responsibility | | Let's take a break.
have + N | have a meeting, have lunch, have a look | | Can I have a look?`,
  },
  {
    match: /cụm động từ|phrasal/,
    text: `# Ngữ pháp
Cụm động từ | V + tiểu từ (up, off, out, on…) | Nghĩa thường khác động từ gốc | She turned down the offer.
Tách được | turn off the light / turn the light off | Đại từ phải nằm giữa: turn it off | Please turn it off.
# Từ vựng
look for | | phrasal v | tìm kiếm | I'm looking for my keys.
look after | | phrasal v | chăm sóc | Can you look after my cat?
set up | | phrasal v | thành lập, lắp đặt | They set up a new company.
fill out | | phrasal v | điền (mẫu đơn) | Please fill out this form.
carry out | | phrasal v | thực hiện | We carried out a survey.
turn down | | phrasal v | từ chối | She turned down the job offer.`,
  },
  {
    match: /part 5 luyện tập|câu 1\d\d/,
    text: `# Ngữ pháp
Câu từ loại | Xác định vị trí trống: trước N → adj; sau be → adj; giữa be và V3 → adv; sau mạo từ → N | | The company offers a (competitive) salary.
Câu chia động từ | Tìm dấu hiệu thời gian và chủ ngữ số ít/số nhiều; có tân ngữ → chủ động | | The report will be submitted next week.
Giới từ hay liên từ | Sau chỗ trống là N/V-ing → giới từ (despite, because of); là S + V → liên từ (although, because) | | Despite the rain, the event continued.
Đại từ | Trước N → tính từ sở hữu; làm tân ngữ trùng chủ ngữ → đại từ phản thân | | She completed the task by herself.
# Từ vựng
competitive | /kəmˈpetətɪv/ | adj | cạnh tranh | We offer competitive prices.
submit | /səbˈmɪt/ | v | nộp | Please submit the form by Friday.
proposal | /prəˈpəʊzəl/ | n | đề xuất | The proposal was approved.
invoice | /ˈɪnvɔɪs/ | n | hoá đơn | The invoice is attached.
# Kỹ năng
Bước 1: xem 4 đáp án | Cùng gốc khác đuôi → câu từ loại; khác thì → câu chia động từ; khác nghĩa → câu từ vựng | |`,
  },
  // ---------- Phát âm (mục # Phát âm, không phải ngữ pháp) ----------
  {
    match: /đuôi s|s\/es|-s\/-es/,
    text: `# Phát âm
/s/ | sau âm vô thanh /p/, /t/, /k/, /f/, /θ/ | | stops, books, laughs
/ɪz/ | sau /s/, /z/, /ʃ/, /ʒ/, /tʃ/, /dʒ/ | Thêm một âm tiết | buses, watches, changes
/z/ | các trường hợp còn lại (nguyên âm, âm hữu thanh) | | plays, bags, calls`,
  },
  {
    match: /đuôi ed|bài tập ed|-ed/,
    text: `# Phát âm
/ɪd/ | sau /t/, /d/ | Thêm một âm tiết | wanted, needed
/t/ | sau âm vô thanh /p/, /k/, /f/, /s/, /ʃ/, /tʃ/ | | stopped, looked, watched
/d/ | các trường hợp còn lại | | played, called, cleaned`,
  },
  {
    match: /trọng âm/,
    text: `# Phát âm
Danh từ, tính từ 2 âm tiết | thường nhấn âm 1 | | ˈoffice, ˈhappy
Động từ 2 âm tiết | thường nhấn âm 2 | | reˈceive, deˈcide
Đuôi -tion, -sion, -ic, -ity | nhấn âm ngay trước đuôi | | inforˈmation, ecoˈnomic, abiˈlity
Trọng âm câu | Nhấn từ nội dung (N, V, adj, adv), đọc lướt từ chức năng | | I NEED to FINISH the REPORT.`,
  },
  {
    match: /nối âm|nuốt âm|âm yếu|vì sao nghe không ra|shadowing/,
    text: `# Phát âm
Nối phụ âm – nguyên âm | Âm cuối của từ trước nối sang nguyên âm đầu từ sau | | turn‿off → /tɜːr nɒf/
Âm yếu | to /tə/, of /əv/, can /kən/, and /ən/ | Từ chức năng đọc nhẹ, nhanh | a cup of tea → /ə kʌp əv tiː/
Nuốt âm | /t/, /d/ giữa hai phụ âm thường bị lược | | next week → /neks wiːk/`,
  },
  {
    match: /nguyên âm|phụ âm|bảng phiên âm|phát âm bắt đầu|các cặp âm|ngữ điệu|âm cuối/,
    text: `# Phát âm
Nguyên âm ngắn – dài | /ɪ/–/iː/, /ʊ/–/uː/, /æ/–/e/ | Độ dài làm đổi nghĩa | ship /ʃɪp/ – sheep /ʃiːp/
Phụ âm vô thanh – hữu thanh | /p/–/b/, /t/–/d/, /k/–/ɡ/, /s/–/z/ | Hữu thanh rung dây thanh | pen – Ben
Âm cuối | Phát âm rõ âm cuối /t/, /s/, /k/ | Người Việt hay bỏ âm cuối | like /laɪk/, nice /naɪs/
Ngữ điệu | Câu hỏi Yes/No lên giọng; câu hỏi Wh- và câu kể xuống giọng | | Are you ready? ↗ / Where are you? ↘`,
  },

  // ---------- Từ vựng & cách học ----------
  {
    match: /tiền tố/,
    text: `# Từ vựng
un- | /ʌn/ | prefix | không (unhappy, unable) | The offer is unavailable.
re- | /riː/ | prefix | lại (redo, rewrite) | Please resubmit the form.
dis- | /dɪs/ | prefix | trái nghĩa (disagree, dislike) | I disagree with that idea.
pre- | /priː/ | prefix | trước (preview, prepay) | You can preview the file.
over- | /ˈəʊvər/ | prefix | quá mức (overwork, overcharge) | We were overcharged.
mis- | /mɪs/ | prefix | sai (misunderstand, misspell) | Sorry, I misunderstood.`,
  },
  {
    match: /hậu tố tạo|hậu tố nhận biết/,
    text: `# Từ vựng
-tion / -ment / -ness / -ity | | suffix | danh từ (creation, agreement, kindness, ability) |
-er / -or / -ant / -ee | | suffix | danh từ chỉ người (employer, director, assistant, employee) |
-ful / -less / -ive / -al | | suffix | tính từ (helpful, careless, active, national) |
-ly | | suffix | trạng từ (quickly) — lưu ý friendly, lovely là tính từ |`,
  },
  {
    match: /300 từ thông dụng|học từ vựng thế nào|mục từ trong từ điển|từ ghép/,
    text: `# Từ vựng
collocation | /ˌkɒləˈkeɪʃən/ | n | cụm từ hay đi cùng nhau | make a decision, do homework
word family | /wɜːrd ˈfæməli/ | n | họ từ | decide – decision – decisive – decisively
spaced repetition | /speɪst ˌrepəˈtɪʃən/ | n | ôn lặp lại ngắt quãng | Review new words after 1, 3 and 7 days.
compound noun | /ˈkɒmpaʊnd naʊn/ | n | danh từ ghép | toothbrush, bus stop, mother-in-law`,
  },
  {
    match: /cặp từ dễ nhầm/,
    text: `# Từ vựng
affect / effect | | v / n | ảnh hưởng (động từ) / sự ảnh hưởng (danh từ) | The weather affected sales.
borrow / lend | | v | mượn / cho mượn | Can you lend me a pen?
rise / raise | | v | tự tăng (nội động) / nâng lên (ngoại động) | They raised prices.
economic / economical | | adj | thuộc kinh tế / tiết kiệm | an economical car`,
  },
  {
    match: /thành ngữ/,
    text: `# Từ vựng
break the ice | | idiom | phá vỡ sự ngại ngùng | A short game helped break the ice.
a piece of cake | | idiom | dễ như ăn bánh | The test was a piece of cake.
on the same page | | idiom | cùng quan điểm | Let's make sure we're on the same page.
call it a day | | idiom | kết thúc công việc hôm nay | We're tired, let's call it a day.`,
  },
  {
    match: /số đếm|ngày tháng|giờ giấc|giá tiền/,
    text: `# Từ vựng
thirteen / thirty | /θɜːrˈtiːn/ – /ˈθɜːrti/ | num | 13 nhấn âm sau, 30 nhấn âm đầu |
quarter past / to | | phrase | hơn 15 phút / kém 15 phút | It's a quarter to nine.
the third of May | | phrase | ngày 3 tháng 5 (Anh–Anh) |
$19.99 | | phrase | nineteen ninety-nine |`,
  },
  {
    match: /gia đình|ngoại hình|tính cách|con người/,
    text: `# Từ vựng
relative | /ˈrelətɪv/ | n | họ hàng | All my relatives came to the wedding.
sibling | /ˈsɪblɪŋ/ | n | anh chị em ruột | I have two siblings.
outgoing | /ˌaʊtˈɡəʊɪŋ/ | adj | hướng ngoại | She is outgoing and friendly.
reliable | /rɪˈlaɪəbəl/ | adj | đáng tin cậy | He is a reliable friend.
take after | | phrasal v | giống (người lớn trong nhà) | She takes after her mother.`,
  },
  {
    match: /nhà cửa|sinh hoạt/,
    text: `# Từ vựng
apartment | /əˈpɑːrtmənt/ | n | căn hộ | I live in a small apartment.
rent | /rent/ | n, v | tiền thuê; thuê | The rent is due on the 1st.
furniture | /ˈfɜːrnɪtʃər/ | n | đồ nội thất (không đếm được) | We bought new furniture.
do the laundry | | phrase | giặt giũ | I do the laundry on Sundays.`,
  },
  {
    match: /ăn uống|mua sắm|gọi món|hỏi giá|đổi trả|cửa hàng và nhà hàng/,
    text: `# Từ vựng
menu | /ˈmenjuː/ | n | thực đơn | Can I see the menu?
receipt | /rɪˈsiːt/ | n | hoá đơn (biên lai) | Keep the receipt for returns.
refund | /ˈriːfʌnd/ | n, v | hoàn tiền | I'd like a refund, please.
exchange | /ɪksˈtʃeɪndʒ/ | v | đổi (hàng) | Can I exchange this for a bigger size?
discount | /ˈdɪskaʊnt/ | n | giảm giá | Is there a student discount?
# Mẫu câu
Gọi món lịch sự | I'd like + N / to V; Could I have …? | | Could I have the bill, please?
Hỏi giá | How much is/are …? | | How much are these shoes?`,
  },
  {
    match: /chào hỏi|giới thiệu bản thân|giới thiệu bản thân và công việc/,
    text: `# Từ vựng
colleague | /ˈkɒliːɡ/ | n | đồng nghiệp | This is my colleague, Lan.
department | /dɪˈpɑːrtmənt/ | n | phòng ban | I work in the sales department.
# Mẫu câu
Giới thiệu | I'm …; I work as a/an …; I'm in charge of … | Hiện tại đơn cho thông tin cố định | I work as an accountant.
Hỏi thăm | How's it going? / Nice to meet you. | |`,
  },
  {
    match: /hỏi lại|chưa nghe rõ|giữ cuộc trò chuyện|sở thích|thời gian rảnh/,
    text: `# Từ vựng
Sorry, could you repeat that? | | phrase | Xin lỗi, bạn nhắc lại được không? |
What do you mean by …? | | phrase | Ý bạn … là gì? |
Really? Tell me more. | | phrase | Thật à? Kể thêm đi |
be into sth | | phrase | thích, mê | I'm really into photography.`,
  },
  {
    match: /gọi điện|lời nhắn|điện thoại|tin nhắn thoại/,
    text: `# Từ vựng
Could I speak to …? | | phrase | Cho tôi gặp … được không? |
Can I take a message? | | phrase | Tôi có thể nhận lời nhắn không? |
hold on | | phrasal v | chờ máy | Hold on, please.
call back | | phrasal v | gọi lại | I'll call you back later.
extension | /ɪkˈstenʃən/ | n | số máy lẻ | Call extension 204.`,
  },
  {
    match: /sân bay|khách sạn|tuyển dụng, sân bay|du lịch|taxi|xe buýt/,
    text: `# Từ vựng
boarding pass | /ˈbɔːrdɪŋ pæs/ | n | thẻ lên máy bay | Show your boarding pass at the gate.
check in / check out | | phrasal v | làm thủ tục nhận / trả phòng | Check-out time is 11 a.m.
luggage | /ˈlʌɡɪdʒ/ | n | hành lý (không đếm được) | How much luggage do you have?
customs | /ˈkʌstəmz/ | n | hải quan | We went through customs quickly.
fare | /feər/ | n | giá vé | The bus fare is $2.
reservation | /ˌrezərˈveɪʃən/ | n | sự đặt chỗ | I have a reservation under Nguyen.`,
  },
  {
    match: /sự cố|lạc đồ|ốm|sức khoẻ|thời tiết/,
    text: `# Từ vựng
symptom | /ˈsɪmptəm/ | n | triệu chứng | What are your symptoms?
prescription | /prɪˈskrɪpʃən/ | n | đơn thuốc | You need a prescription.
lost and found | | n | quầy đồ thất lạc | Ask at the lost and found.
forecast | /ˈfɔːrkɑːst/ | n | dự báo | The forecast says it will rain.`,
  },
  {
    match: /đồng ý|không đồng ý|đưa lời khuyên|gợi ý|bài luận nêu ý kiến/,
    text: `# Mẫu câu
Đồng ý | I completely agree. / That's a good point. | |
Không đồng ý lịch sự | I see your point, but … / I'm not sure about that. | Dùng but để nêu ý khác |
Lời khuyên | You should / You'd better / If I were you, I would … | | If I were you, I would take the job.`,
  },
  {
    match: /kể chuyện|trải nghiệm|kể chuyến đi|đoạn văn kể/,
    text: `# Ngữ pháp
Bối cảnh | Quá khứ tiếp diễn tả bối cảnh, quá khứ đơn tả sự kiện | | It was raining when we arrived.
# Mẫu câu
Kể theo trình tự | First, … Then, … After that, … Finally, … | Dùng quá khứ đơn cho chuỗi sự kiện | First, we booked a hotel. Then, we flew to Da Lat.
Cảm xúc | I felt + adj; It was + adj + experience | | It was an unforgettable experience.`,
  },
  {
    match: /2 phút|nói về một chủ đề/,
    text: `# Mẫu câu
Mở đầu | I'd like to talk about … | |
Triển khai | The first reason is … / For example, … | |
Kết thúc | To sum up, … / That's why … | |`,
  },
  {
    match: /trường lớp|học tập|môn học|hoạt động ở trường|email cho giảng viên/,
    text: `# Từ vựng
assignment | /əˈsaɪnmənt/ | n | bài tập | The assignment is due on Monday.
lecturer | /ˈlektʃərər/ | n | giảng viên | I emailed my lecturer.
semester | /sɪˈmestər/ | n | học kỳ | The semester starts in September.
extension | /ɪkˈstenʃən/ | n | sự gia hạn | Could I have an extension on the deadline?`,
  },
  {
    match: /công việc và nghề nghiệp|phòng ban và chức danh|cv|thư xin việc|phỏng vấn|star|tin tuyển dụng/,
    text: `# Từ vựng
position | /pəˈzɪʃən/ | n | vị trí công việc | I'm applying for the position of accountant.
qualification | /ˌkwɒlɪfɪˈkeɪʃən/ | n | bằng cấp, trình độ | She has the right qualifications.
experience | /ɪkˈspɪəriəns/ | n | kinh nghiệm | I have three years of experience.
supervisor | /ˈsuːpərvaɪzər/ | n | người giám sát | My supervisor approved the leave.
STAR | | n | Situation – Task – Action – Result: cách kể kinh nghiệm |`,
  },
  {
    match: /công nghệ|mạng xã hội/,
    text: `# Từ vựng
device | /dɪˈvaɪs/ | n | thiết bị | Turn off all devices.
update | /ʌpˈdeɪt/ | v, n | cập nhật | Please update the software.
post | /pəʊst/ | v, n | đăng bài | She posted a photo online.
privacy | /ˈprɪvəsi/ | n | quyền riêng tư | Check your privacy settings.`,
  },
  {
    match: /môi trường|thiên nhiên|lễ hội/,
    text: `# Từ vựng
pollution | /pəˈluːʃən/ | n | ô nhiễm | Air pollution is a serious problem.
recycle | /riːˈsaɪkəl/ | v | tái chế | We recycle paper and plastic.
reduce | /rɪˈdjuːs/ | v | giảm | Reduce the use of plastic bags.
festival | /ˈfestɪvəl/ | n | lễ hội | The festival takes place in spring.`,
  },
  {
    match: /đồng nghiệp|nhờ giúp đỡ|giao việc|yêu cầu lịch sự/,
    text: `# Từ vựng
task | /tɑːsk/ | n | nhiệm vụ | I'll assign the task to Minh.
deadline | /ˈdedlaɪn/ | n | hạn chót | The deadline is next Friday.
# Mẫu câu
Nhờ lịch sự | Could you …? / Would you mind + V-ing? | Would you mind luôn đi với V-ing | Would you mind checking this report?
Giao việc | Can you take care of …? / I need you to … | |`,
  },
  {
    match: /email|thư từ|biên bản/,
    text: `# Từ vựng
attachment | /əˈtætʃmənt/ | n | tệp đính kèm | Please see the attachment.
inquire | /ɪnˈkwaɪər/ | v | hỏi thông tin | I'm writing to inquire about prices.
follow up | | phrasal v | theo dõi tiếp | I'm following up on my last email.
minutes | /ˈmɪnɪts/ | n | biên bản cuộc họp | Who will take the minutes?
# Mẫu câu
Mở đầu email trang trọng | Dear Mr./Ms. + họ, | Không rõ tên: Dear Sir or Madam, |
Nêu mục đích | I am writing to + V | | I am writing to inquire about the course.
Kết thư | I look forward to + V-ing; Best regards / Sincerely | | I look forward to hearing from you.
Nhắc việc | Just a quick reminder that …; Could you update me on …? | |`,
  },
  {
    match: /cuộc họp|thuyết trình/,
    text: `# Từ vựng
agenda | /əˈdʒendə/ | n | chương trình họp | The first item on the agenda is the budget.
postpone | /pəʊstˈpəʊn/ | v | hoãn lại | The meeting was postponed.
figure | /ˈfɪɡər/ | n | số liệu | The figures show strong growth.
# Mẫu câu
Mở đầu thuyết trình | Today I'm going to talk about … | |
Chuyển ý | Let's move on to … / Turning to … | |
Kết thúc | To sum up, … / Thank you for your attention. | |`,
  },
  {
    match: /báo giá|đơn hàng|hoá đơn|quảng cáo|chính sách đổi trả/,
    text: `# Từ vựng
quotation | /kwəʊˈteɪʃən/ | n | báo giá | Please send us a quotation.
invoice | /ˈɪnvɔɪs/ | n | hoá đơn | The invoice is attached.
order | /ˈɔːrdər/ | n, v | đơn hàng; đặt hàng | We ordered 50 units.
warranty | /ˈwɒrənti/ | n | bảo hành | The product has a two-year warranty.
in stock / out of stock | | phrase | còn hàng / hết hàng | This item is out of stock.`,
  },
  {
    match: /trang giới thiệu một công ty|hiện tại khi nói về công việc/,
    text: `# Từ vựng
headquarters | /ˈhedkwɔːrtərz/ | n | trụ sở chính | Our headquarters is in Ho Chi Minh City.
branch | /brɑːntʃ/ | n | chi nhánh | The company has ten branches.
found | /faʊnd/ | v | thành lập | The firm was founded in 1998.
employ | /ɪmˈplɔɪ/ | v | thuê, tuyển dụng | We employ over 500 people.`,
  },

  // ---------- Viết ----------
  {
    match: /câu chủ đề|câu triển khai|đoạn văn miêu tả|đoạn văn ngắn|dàn ý|mở bài|kết bài|tự sửa bài|dịch từng chữ|viết tiếng anh/,
    text: `# Từ vựng
firstly / in addition / moreover | | linker | thêm ý |
however / on the other hand | | linker | đối lập |
therefore / as a result | | linker | kết quả |
in conclusion / to sum up | | linker | kết luận |
# Kỹ năng
Câu chủ đề | Nêu ý chính của đoạn | Đặt ở đầu đoạn | Working from home has many benefits.
Câu triển khai | Giải thích + ví dụ cho ý chính | For example, …; This means … |
Câu kết đoạn | Nhắc lại ý chính bằng cách khác | In short, … |
Lỗi dịch từng chữ | Không viết "I very like" | Viết đúng: I like … very much / I really like … |`,
  },

  // ---------- Nghe ----------
  {
    match: /nghe ý chính|ghi chú khi nghe|podcast|bài giảng ngắn|tin tức|phim|thông báo nơi công cộng|giọng anh/,
    text: `# Từ vựng
announcement | /əˈnaʊnsmənt/ | n | thông báo | Please listen to the following announcement.
delay | /dɪˈleɪ/ | n, v | sự chậm trễ | The flight is delayed by one hour.
platform | /ˈplætfɔːrm/ | n | sân ga | The train departs from platform 3.
# Kỹ năng
Nghe ý chính trước | Đọc câu hỏi, đoán chủ đề trước khi nghe | |
Ghi chú nhanh | Viết từ khoá, số liệu, ký hiệu (↑ tăng, ↓ giảm, → dẫn đến) | |
Từ báo hiệu ý quan trọng | The main point is … / Most importantly … / However … | Sau however thường là thông tin chính |`,
  },
];
