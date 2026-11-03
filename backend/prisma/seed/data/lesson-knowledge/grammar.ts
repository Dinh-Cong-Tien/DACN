/** Gói kiến thức ngữ pháp cho video bài giảng — định dạng văn bản của catalog/lesson-knowledge.ts */
import type { Pack } from './types';

export const GRAMMAR_PACKS: Pack[] = [
  {
    match: /từ loại|word form|parts of speech|hậu tố|xác định từ loại|8 từ loại/,
    text: `# Ngữ pháp
Danh từ (noun) | sau a/an/the, tính từ sở hữu, giới từ | Làm chủ ngữ hoặc tân ngữ | The manager approved the proposal.
Động từ (verb) | đứng sau chủ ngữ | Chỉ hành động/trạng thái, chia theo thì | Our team completes the report every Friday.
Tính từ (adjective) | trước danh từ, sau be/seem/become | Bổ nghĩa cho danh từ | It was a successful launch.
Trạng từ (adverb) | trước/sau động từ, trước tính từ | Bổ nghĩa cho động từ, tính từ, cả câu | The new system works efficiently.
# Từ vựng
-tion / -sion | /ʃən/ | suffix | hậu tố danh từ (information, decision) | The decision was made yesterday.
-ment | /mənt/ | suffix | hậu tố danh từ (management, payment) | Payment is due on Monday.
-ness | /nəs/ | suffix | hậu tố danh từ (awareness, effectiveness) | Brand awareness has increased.
-ive / -ful / -able | | suffix | hậu tố tính từ (effective, useful, available) | The room is available now.
-ly | /li/ | suffix | hậu tố trạng từ (quickly, carefully) | Please read the contract carefully.
-ize / -ify / -en | | suffix | hậu tố động từ (organize, simplify, widen) | We need to simplify the process.`,
  },
  {
    match: /danh từ|cụm danh từ|noun/,
    text: `# Ngữ pháp
Danh từ đếm được | a/an + N số ít; N-s/es số nhiều | Đếm được: chair, employee, invoice | Two employees were promoted.
Danh từ không đếm được | không có a/an, không thêm -s | information, equipment, advice, furniture, luggage | The equipment is expensive.
Cụm danh từ | (mạo từ) + (trạng từ) + tính từ + N | Danh từ chính đứng cuối cụm | a highly qualified candidate
Danh từ ghép | N + N | Danh từ đầu thường ở dạng số ít | a sales report, a job application
Danh từ số ít đếm được không đứng một mình | a/an/the/my/this + N | Không viết "She is manager" | She is a manager.
# Từ vựng
equipment | /ɪˈkwɪpmənt/ | n | thiết bị (không đếm được) | The office equipment was replaced.
applicant | /ˈæplɪkənt/ | n | người nộp đơn | Each applicant must submit a résumé.
approval | /əˈpruːvəl/ | n | sự chấp thuận | The plan needs approval from the director.
professional | /prəˈfeʃənəl/ | n, adj | chuyên gia; chuyên nghiệp | She is a professional in marketing.`,
  },
  {
    match: /mạo từ|a, an, the/,
    text: `# Ngữ pháp
a / an | a + phụ âm, an + nguyên âm (theo âm đọc) | Danh từ số ít, nhắc lần đầu | an hour, a university
the | the + N đã xác định | Đã nhắc trước, duy nhất, so sánh nhất | The meeting we planned is cancelled.
Không dùng mạo từ | Ø + N số nhiều/không đếm được (nói chung) | Bữa ăn, môn học, phương tiện sau by | I go to work by bus.
# Từ vựng
unique | /juˈniːk/ | adj | duy nhất (đọc /j/ → a unique) | It is a unique opportunity.
honest | /ˈɒnɪst/ | adj | trung thực (h câm → an honest) | He is an honest person.`,
  },
  {
    match: /đại từ|pronoun|phản thân|sở hữu/,
    text: `# Ngữ pháp
Đại từ nhân xưng chủ ngữ | I, you, he, she, it, we, they | Đứng trước động từ | They will arrive soon.
Đại từ tân ngữ | me, you, him, her, it, us, them | Sau động từ hoặc giới từ | Please send it to us.
Tính từ sở hữu | my, your, his, her, its, our, their + N | Luôn đi kèm danh từ | Their office is on the 5th floor.
Đại từ sở hữu | mine, yours, his, hers, ours, theirs | Thay cho tính từ sở hữu + N | This desk is mine.
Đại từ phản thân | myself, yourself, himself, ourselves… | Chủ ngữ = tân ngữ; nhấn mạnh; by + oneself = tự mình | She finished the project by herself.`,
  },
  {
    match: /số lượng|some, any|much, many|a few|a little/,
    text: `# Ngữ pháp
many / a few / few | + N đếm được số nhiều | a few = vài (đủ), few = rất ít (không đủ) | A few clients called this morning.
much / a little / little | + N không đếm được | a little = một ít, little = rất ít | We have little time left.
some / any | some: câu khẳng định, lời mời; any: phủ định, câu hỏi | Dùng cho cả hai loại danh từ | Do you have any questions?
a lot of / lots of | + cả hai loại danh từ | Thường dùng trong câu khẳng định | A lot of staff work remotely.`,
  },
  {
    match: /to be\b|động từ to be/,
    text: `# Ngữ pháp
Hiện tại | I am, he/she/it is, you/we/they are | Phủ định thêm not; câu hỏi đảo be lên đầu | Are you ready?
Quá khứ | was (I/he/she/it), were (you/we/they) | | The office was closed yesterday.
be + tính từ / danh từ / nơi chốn | S + be + adj/N/prep phrase | | The manager is in a meeting.`,
  },
  {
    match: /hiện tại đơn|hiện tại tiếp diễn|các thì hiện tại/,
    text: `# Ngữ pháp
Hiện tại đơn | S + V(s/es) | Thói quen, sự thật, lịch trình | The train leaves at 8 a.m.
Hiện tại tiếp diễn | S + am/is/are + V-ing | Đang xảy ra, kế hoạch gần đã sắp xếp | We are meeting the client tomorrow.
Dấu hiệu | always, usually, every day / now, at the moment, currently | | She usually checks emails first.
Động từ trạng thái | know, want, like, belong, need | Không dùng ở dạng tiếp diễn | I know the answer.`,
  },
  {
    match: /quá khứ đơn|quá khứ tiếp diễn|các thì quá khứ|bất quy tắc/,
    text: `# Ngữ pháp
Quá khứ đơn | S + V2/ed | Hành động đã kết thúc tại thời điểm xác định | They signed the contract last week.
Quá khứ tiếp diễn | S + was/were + V-ing | Đang diễn ra tại một thời điểm trong quá khứ | I was preparing slides at 9 p.m.
when / while | QK tiếp diễn + when + QK đơn | Hành động đang xảy ra thì bị chen ngang | While I was driving, my phone rang.
Dấu hiệu | yesterday, ago, last + time, in + năm | |
# Từ vựng
go – went – gone | | v | đi | She went to Hanoi last month.
buy – bought – bought | | v | mua | We bought new laptops.
send – sent – sent | | v | gửi | I sent the file this morning.`,
  },
  {
    match: /tương lai|will và be going to|be going to/,
    text: `# Ngữ pháp
will + V | Quyết định tức thời, dự đoán, lời hứa | | I will call you back.
be going to + V | Dự định đã có, dự đoán có căn cứ | | We are going to open a new branch.
Tương lai tiếp diễn | will be + V-ing | Đang diễn ra tại thời điểm trong tương lai | This time tomorrow I will be flying to Tokyo.
Tương lai hoàn thành | will have + V3 | Hoàn thành trước mốc tương lai, dấu hiệu by + time | By Friday, we will have finished the report.`,
  },
  {
    match: /hoàn thành|câu tường thuật/,
    text: `# Ngữ pháp
Hiện tại hoàn thành | S + have/has + V3 | Kinh nghiệm, việc vừa xong, kéo dài tới hiện tại | We have worked here since 2020.
HTHT tiếp diễn | have/has been + V-ing | Nhấn mạnh quá trình kéo dài | She has been waiting for an hour.
HTHT hay quá khứ đơn | HTHT: không rõ thời điểm; QKĐ: có thời điểm xác định | | I have lost my key. / I lost it yesterday.
Quá khứ hoàn thành | had + V3 | Hành động xảy ra trước một hành động khác trong quá khứ | The meeting had started when I arrived.
Dấu hiệu | since, for, already, yet, just, recently, so far | |`,
  },
  {
    match: /12 thì|chia động từ|động từ tổng hợp|số ít số nhiều/,
    text: `# Ngữ pháp
Hoà hợp chủ – vị | S số ít + V(s/es); S số nhiều + V nguyên mẫu | Xác định danh từ chính của chủ ngữ | The list of items is on the desk.
each / every / either / neither | + V số ít | | Each employee has a badge.
A and B | + V số nhiều | | The manager and the assistant are here.
Chọn thì theo dấu hiệu | yesterday → QKĐ; since/for → HTHT; next/tomorrow → tương lai | Part 5 thường kiểm tra thì + bị động | The report will be submitted next week.`,
  },
  {
    match: /bị động|passive|chủ động/,
    text: `# Ngữ pháp
Công thức chung | S + be (chia thì) + V3/ed (+ by O) | Dùng khi đối tượng chịu tác động quan trọng hơn người làm | The invoice was sent yesterday.
Hiện tại đơn / tiếp diễn | is/are + V3; is/are being + V3 | | The room is being cleaned now.
Hoàn thành / tương lai / modal | has been + V3; will be + V3; must be + V3 | | All forms must be signed.
Mẹo Part 5 | Sau chỗ trống có tân ngữ → chủ động; không có tân ngữ → bị động | | The package was delivered.
# Từ vựng
deliver | /dɪˈlɪvər/ | v | giao hàng | The goods were delivered on time.
postpone | /pəʊstˈpəʊn/ | v | hoãn lại | The event has been postponed.
require | /rɪˈkwaɪər/ | v | yêu cầu | A passport is required.`,
  },
  {
    match: /tính từ|trạng từ|adjective|adverb|tần suất/,
    text: `# Ngữ pháp
Tính từ trước danh từ | (a/the) + adj + N | | a reliable supplier
Tính từ sau động từ nối | be, become, seem, remain, look, feel, sound + adj | Không dùng trạng từ sau động từ nối | The results seem promising.
make / keep / find + O + adj | | | Please keep the door closed.
Trạng từ bổ nghĩa động từ | V + (O) + adv; adv + V | | He spoke clearly.
Trạng từ bổ nghĩa tính từ | adv + adj | | an extremely busy week
Trạng từ tần suất | always > usually > often > sometimes > rarely > never | Đứng trước V thường, sau be | She is always on time.
Trật tự tính từ | Ý kiến – kích cỡ – tuổi – màu – nguồn gốc – chất liệu + N | | a beautiful small old wooden table`,
  },
  {
    match: /so sánh/,
    text: `# Ngữ pháp
So sánh bằng | as + adj/adv + as | Phủ định: not as/so … as | This model is as fast as the old one.
So sánh hơn | adj-er + than; more + adj + than | Nhấn mạnh: much, far, even | Sales are much higher than last year.
So sánh nhất | the + adj-est; the most + adj | Thường có in/of + nhóm | It is the most popular product in our line.
Bất quy tắc | good – better – best; bad – worse – worst; far – further – furthest | |
So sánh kép | the + so sánh hơn …, the + so sánh hơn … | Càng … càng … | The earlier you apply, the better your chances.`,
  },
  {
    match: /liên từ|từ nối|song song|câu ghép|câu phức|and, but, because/,
    text: `# Ngữ pháp
Liên từ đẳng lập | for, and, nor, but, or, yet, so (FANBOYS) | Nối 2 mệnh đề ngang hàng, thường có dấu phẩy | I called, but nobody answered.
Liên từ tương quan | both … and; either … or; neither … nor; not only … but also | Hai vế phải cùng dạng (song song) | She is both creative and reliable.
Cấu trúc song song | A, B, and C cùng loại từ | | The job requires planning, organizing, and reporting.
Từ nối câu | however, therefore, moreover, otherwise | Đứng đầu câu/sau dấu chấm phẩy, theo sau là dấu phẩy | The price rose; however, demand stayed high.
# Mệnh đề
Mệnh đề trạng ngữ chỉ nguyên nhân | because, since, as | Theo sau là một mệnh đề (S + V) | We stayed inside because it was raining.
Mệnh đề nhượng bộ | although, even though, though | Trái ngược với vế còn lại | Although the price is high, sales are strong.
Mệnh đề thời gian | when, while, before, after, until, as soon as | Không dùng will trong mệnh đề thời gian | I will call you as soon as I arrive.
Mệnh đề điều kiện | if, unless, as long as, provided that | | You can join unless the room is full.`,
  },
  {
    match: /mệnh đề quan hệ|đại từ quan hệ|rút gọn/,
    text: `# Ngữ pháp
Rút gọn chủ động | who/which + V → V-ing | | The man standing at the door is our CEO.
Rút gọn bị động | who/which + be + V3 → V3 | | The documents sent yesterday were incomplete.
Rút gọn bằng to V | sau the first/the last/the only | | She was the first person to arrive.
# Mệnh đề
Mệnh đề quan hệ chỉ người | who, whom, that | who làm chủ ngữ, whom làm tân ngữ | The candidate who applied yesterday is qualified.
Mệnh đề quan hệ chỉ vật | which, that | Không dùng that sau dấu phẩy | The report which you requested is ready.
Sở hữu | whose + N | Thay cho his/her/its/their | The client whose order was delayed called again.
Trạng từ quan hệ | where (nơi chốn), when (thời gian), why (lý do) | | This is the office where I work.`,
  },
  {
    match: /câu điều kiện|câu ước|wish|if only/,
    text: `# Ngữ pháp
Câu ước hiện tại | S + wish + S + V2/were | Điều trái với hiện tại | I wish I had more time.
Câu ước quá khứ | S + wish + S + had + V3 | Tiếc điều đã qua | I wish I had studied harder.
# Mệnh đề
Điều kiện loại 0 | If + HTĐ, HTĐ | Sự thật hiển nhiên | If you heat water to 100°C, it boils.
Điều kiện loại 1 | If + HTĐ, will + V | Có thể xảy ra ở hiện tại/tương lai | If it rains, we will cancel the trip.
Điều kiện loại 2 | If + V2/were, would + V | Không có thật ở hiện tại | If I were you, I would accept the offer.
Điều kiện loại 3 | If + had + V3, would have + V3 | Không có thật trong quá khứ | If we had left earlier, we would have caught the train.
Từ thay if | unless, provided that, as long as, in case | unless = if … not |`,
  },
  {
    match: /câu tường thuật|reported/,
    text: `# Ngữ pháp
Lùi thì | HTĐ → QKĐ; HTHT → QKHT; will → would; can → could | Khi động từ tường thuật ở quá khứ | She said she was busy.
Câu hỏi tường thuật | asked + if/whether / wh- + S + V | Không đảo ngữ | He asked where the meeting was.
Câu mệnh lệnh | told/asked + O + (not) to V | | The manager told us to leave early.
Đổi trạng từ | now → then; today → that day; tomorrow → the next day | |`,
  },
  {
    match: /mệnh đề danh từ|that, what, whether/,
    text: `# Mệnh đề
Mệnh đề danh từ | that, what, whether, if, wh- | Làm chủ ngữ, tân ngữ hoặc bổ ngữ trong câu | What she said surprised everyone.
that-clause | S + V + that + S + V | that có thể lược bỏ khi làm tân ngữ | I think (that) the plan works.
whether / if | whether (or not) + S + V | Chỉ whether đứng đầu câu / sau giới từ | Whether we win depends on you.`,
  },
  {
    match: /v-ing|to v|gerund|infinitive/,
    text: `# Ngữ pháp
Động từ + V-ing | enjoy, avoid, finish, consider, suggest, mind, keep, postpone | | We considered hiring more staff.
Động từ + to V | want, decide, plan, agree, hope, refuse, expect, afford | | They decided to expand overseas.
Đổi nghĩa | remember/forget/stop/try + to V (sẽ làm) / V-ing (đã làm) | | Remember to lock the door.
Giới từ + V-ing | interested in, good at, look forward to + V-ing | to trong look forward to là giới từ | I look forward to hearing from you.`,
  },
  {
    match: /khuyết thiếu|modal|can, could|should, must|lời khuyên/,
    text: `# Ngữ pháp
Khả năng | can / could / be able to + V | | She can speak three languages.
Bắt buộc | must / have to + V; mustn't = cấm | don't have to = không cần | Visitors must sign in at reception.
Lời khuyên | should / ought to / had better + V | | You should back up your files.
Khả năng xảy ra | may / might / could + V | | The flight might be delayed.
Suy đoán quá khứ | must/might/can't + have + V3 | | He must have missed the bus.`,
  },
  {
    match: /câu hỏi|câu hỏi đuôi|wh-|yes\/no|who what which|when where why how|be do have/,
    text: `# Ngữ pháp
Câu hỏi Yes/No | Trợ động từ (be/do/have/modal) + S + V? | Trả lời Yes/No hoặc gián tiếp | Did you send the file?
Câu hỏi Wh- | Wh- + trợ động từ + S + V? | Nghe kỹ từ để hỏi đầu câu | Where is the conference held?
Câu hỏi đuôi | Mệnh đề khẳng định, trợ động từ phủ định + đại từ? | Ngược lại với vế trước | You've met Tom, haven't you?
Câu hỏi lựa chọn | … A or B? | Không trả lời Yes/No | Would you like tea or coffee?
# Từ vựng
Who | | | hỏi người → tên, chức danh, phòng ban | Who is in charge? — The manager.
When | | | hỏi thời gian → mốc thời gian | When does it start? — At noon.
Where | | | hỏi nơi chốn → địa điểm, giới từ nơi chốn | Where is the file? — On your desk.
Why | | | hỏi lý do → because, to V | Why was it delayed? — Because of the weather.
How long / How often | | | hỏi khoảng thời gian / tần suất | How often do you meet? — Every Monday.`,
  },
  {
    match: /there is|mệnh lệnh|lời mời|đề nghị/,
    text: `# Ngữ pháp
There is / There are | There is + N số ít/không đếm được; There are + N số nhiều | | There are two printers on this floor.
Câu mệnh lệnh | V nguyên mẫu …; Don't + V | Thêm please để lịch sự | Please turn off your phone.
Lời mời | Would you like + to V / N? | | Would you like to join us for lunch?
Lời đề nghị | Let's + V; Why don't we + V?; How about + V-ing? | | How about meeting on Friday?`,
  },
  {
    match: /nhờ vả|have \/ get|used to/,
    text: `# Ngữ pháp
have something done | have/get + O + V3 | Nhờ người khác làm | I had my car repaired.
have someone do | have + người + V | | I'll have my assistant call you.
used to + V | Thói quen trong quá khứ, nay không còn | | I used to work in Da Nang.
be / get used to + V-ing | Đã quen / dần quen với | | She is used to working late.`,
  },
  {
    match: /so … that|such … that|too, enough|so .* that/,
    text: `# Ngữ pháp
so … that | so + adj/adv + that + S + V | Quá … đến nỗi | The test was so hard that few passed.
such … that | such + (a/an) + adj + N + that | | It was such a long meeting that we missed lunch.
too … to | too + adj + (for O) + to V | Quá … không thể | The box is too heavy to lift.
enough | adj + enough + to V; enough + N | | She is experienced enough to lead the team.`,
  },
  {
    match: /câu chẻ|giả định|đảo ngữ|suggest|recommend/,
    text: `# Ngữ pháp
Câu chẻ | It is/was + phần nhấn mạnh + that/who + … | | It was Anna who found the mistake.
Câu giả định | suggest/recommend/insist + that + S + V nguyên mẫu | It is important/essential that + S + V | The manager suggested that he take a break.
Đảo ngữ với trạng từ phủ định | Never/Rarely/Seldom + trợ động từ + S + V | | Rarely do we see such results.
Đảo ngữ Not only | Not only + trợ động từ + S + V, but … also | | Not only did she finish early, but she also helped others.
Đảo ngữ câu điều kiện | Should + S + V; Were + S + to V; Had + S + V3 | Bỏ if | Should you need help, please call us.`,
  },
  {
    match: /cấu trúc câu|câu đơn|một câu tiếng anh|chủ ngữ/,
    text: `# Ngữ pháp
S + V | Nội động từ không cần tân ngữ | | The price increased.
S + V + O | Ngoại động từ cần tân ngữ | | She signed the contract.
S + V + C | Động từ nối + bổ ngữ (adj/N) | | The plan sounds good.
S + V + O + O | give, send, offer, show + người + vật | | He sent me the invoice.
S + V + O + C | make, keep, find, consider + O + adj/N | | They made him team leader.`,
  },
  {
    match: /dấu câu|viết hoa/,
    text: `# Ngữ pháp
Dấu phẩy | sau mệnh đề phụ đứng đầu câu; trước FANBOYS nối 2 mệnh đề | | When I arrived, the meeting had started.
Dấu chấm phẩy | nối 2 mệnh đề độc lập có liên quan | Thường đi với however, therefore | The deadline is close; therefore, we must hurry.
Viết hoa | đầu câu, tên riêng, ngày trong tuần, tháng, quốc tịch | | We met on Monday in March.`,
  },
];
