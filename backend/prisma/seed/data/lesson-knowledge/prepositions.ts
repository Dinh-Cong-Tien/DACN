/** Gói cây giới từ: node cha = giới từ, node con = từ/cụm đi kèm, node cháu = ví dụ cụ thể */
import type { Pack } from './types';

const TIME = `# Giới từ
in | trong (khoảng thời gian dài)
  tháng / năm | | in May, in 2025
  mùa | | in summer
  buổi trong ngày | | in the morning, in the afternoon
  khoảng thời gian tới | sau … nữa | The bus will arrive in ten minutes.
on | vào (ngày cụ thể)
  thứ trong tuần | | on Monday
  ngày tháng | | on 15 March
  ngày đặc biệt | | on my birthday, on Christmas Day
  on time | đúng giờ | The train left on time.
at | lúc (thời điểm chính xác)
  giờ | | at 9 a.m., at noon
  dịp lễ | | at Christmas, at the weekend (Anh–Anh)
  at night | vào ban đêm
  at the moment | hiện tại
by | trước / chậm nhất là
  by + mốc thời gian | | Please reply by Friday.
until | cho đến khi
  until + mốc | | The shop is open until 10 p.m.
for | trong khoảng
  for + khoảng thời gian | | We have worked here for five years.
since | từ (mốc) đến nay
  since + mốc thời gian | | since 2020, since last month`;

const PLACE = `# Giới từ
in | ở trong (không gian bao quanh)
  thành phố / quốc gia | | in Hanoi, in Japan
  phòng / toà nhà | | in the meeting room
  in the corner of the room | ở góc phòng
at | tại (một điểm cụ thể)
  địa chỉ có số nhà | | at 25 Le Loi Street
  địa điểm chức năng | | at the airport, at the reception desk
  at the end of the hall | ở cuối hành lang
on | ở trên (bề mặt)
  bề mặt | | on the desk, on the wall
  tầng | | on the third floor
  tên đường | | on Tran Hung Dao Street
  on the left / on the right | bên trái / bên phải
Vị trí khác | so với vật khác
  next to / beside | bên cạnh | The printer is next to the window.
  between … and … | ở giữa | between the bank and the post office
  opposite | đối diện | The café is opposite the station.
  in front of / behind | phía trước / phía sau
  above / below | phía trên / phía dưới (không chạm)
Phương hướng | chuyển động
  to | đến | Go to the second floor.
  into / out of | vào trong / ra khỏi | She walked into the office.
  through | xuyên qua | Walk through the lobby.
  across | băng qua | Go across the street.
  along | dọc theo | Walk along the river.
  past | đi qua | Go past the bank and turn left.`;

const COLLOC = `# Giới từ
in | đi sau động từ / tính từ
  interested in | quan tâm đến | She is interested in marketing.
  involved in | tham gia vào | He was involved in the project.
  succeed in + V-ing | thành công trong | They succeeded in reducing costs.
  invest in | đầu tư vào | The firm invested in new technology.
  participate in | tham gia | All staff must participate in the training.
  in charge of | phụ trách | Who is in charge of sales?
on | đi sau động từ / tính từ
  depend on / rely on | phụ thuộc vào | Prices depend on quantity.
  focus on / concentrate on | tập trung vào | Let's focus on the main issue.
  comment on | bình luận về | Please comment on the draft.
  insist on + V-ing | khăng khăng | He insisted on paying.
  based on | dựa trên | The report is based on survey data.
for | đi sau động từ / tính từ
  apply for | nộp đơn xin | She applied for the position.
  responsible for | chịu trách nhiệm | He is responsible for the budget.
  wait for | chờ | We are waiting for approval.
  pay for | trả tiền cho | Who will pay for the dinner?
  eligible for | đủ điều kiện | You are eligible for a refund.
  famous for | nổi tiếng về | The city is famous for its food.
to | đi sau động từ / tính từ
  respond to / reply to | phản hồi | Please reply to this email.
  contribute to | đóng góp vào | Everyone contributed to the success.
  look forward to + V-ing | mong đợi | I look forward to meeting you.
  similar to | tương tự | This model is similar to the old one.
  committed to | cam kết | We are committed to quality.
with | đi sau động từ / tính từ
  deal with | giải quyết | She deals with complaints.
  comply with | tuân thủ | All products comply with safety rules.
  satisfied with | hài lòng với | Clients are satisfied with the service.
  familiar with | quen thuộc với | Are you familiar with this software?
  provide sb with sth | cung cấp | We provide customers with free delivery.
of | đi sau động từ / tính từ
  aware of | nhận thức về | Are you aware of the new policy?
  consist of | bao gồm | The team consists of five members.
  capable of | có khả năng | She is capable of leading the team.
  take care of | chăm sóc, lo liệu | I'll take care of the booking.
about | đi sau động từ / tính từ
  worried about | lo lắng về | He is worried about the deadline.
  complain about | phàn nàn về | Guests complained about the noise.
  enthusiastic about | hào hứng về | She is enthusiastic about the plan.
from | đi sau động từ / tính từ
  different from | khác với | This is different from what we ordered.
  prevent sb from + V-ing | ngăn cản | Rain prevented us from leaving.
  benefit from | hưởng lợi từ | Students benefit from the program.`;

const VS_CONJ = `# Giới từ
because of / due to | bởi vì (+ N / V-ing)
  because of the weather | vì thời tiết | The flight was delayed because of the weather.
  due to heavy traffic | do kẹt xe
  ≠ because + S + V | liên từ, theo sau là mệnh đề
despite / in spite of | mặc dù (+ N / V-ing)
  despite the rain | mặc dù trời mưa | Despite the rain, the event continued.
  in spite of being tired | dù mệt
  ≠ although + S + V | liên từ, theo sau là mệnh đề
during | trong suốt (+ N)
  during the meeting | trong cuộc họp
  ≠ while + S + V | liên từ
instead of | thay vì (+ N / V-ing)
  instead of driving | thay vì lái xe | We took the train instead of driving.
according to | theo như
  according to the report | theo báo cáo`;

const TREND = `# Giới từ
by | (tăng / giảm) một lượng
  rise by 10% | tăng thêm 10% | Sales rose by 10% in May.
  fall by 200 units | giảm đi 200 đơn vị
to | (tăng / giảm) đến mức
  increase to $5 million | tăng lên đến 5 triệu USD
  drop to 3% | giảm xuống còn 3%
from … to … | từ … đến …
  from 20% to 35% | từ 20% lên 35% | Profit grew from 20% to 35%.
of | (danh từ chỉ thay đổi) của
  an increase of 15% | mức tăng 15%
  a decline of 5 points | mức giảm 5 điểm
in | (thay đổi) về mặt
  a rise in sales | sự tăng doanh số
  a fall in demand | sự giảm nhu cầu`;

const PHRASAL = `# Giới từ
look | cụm động từ với look
  look for | tìm kiếm | I'm looking for my keys.
  look after | chăm sóc | Can you look after my cat?
  look into | điều tra, xem xét | We will look into the problem.
  look up | tra cứu | Look up the word in a dictionary.
take | cụm động từ với take
  take off | cất cánh; cởi | The plane took off on time.
  take over | tiếp quản | She took over the project.
  take up | bắt đầu (sở thích); chiếm (chỗ) | He took up yoga.
set | cụm động từ với set
  set up | thành lập, lắp đặt | They set up a new company.
  set aside | để dành | Set aside some money each month.
turn | cụm động từ với turn
  turn on / turn off | bật / tắt | Turn off the lights.
  turn down | từ chối; vặn nhỏ | She turned down the offer.
  turn up | xuất hiện; vặn to | He turned up late.
fill | cụm động từ với fill
  fill in / fill out | điền (mẫu đơn) | Please fill out this form.
carry | cụm động từ với carry
  carry out | thực hiện | We carried out a survey.
  carry on | tiếp tục | Carry on with your work.`;

export const PREPOSITION_PACKS: Pack[] = [
  { match: /giới từ (chỉ )?thời gian|giới từ thời gian|in, on, at|thì tương lai và giới từ|lịch, hạn chót|đặt lịch hẹn/, text: TIME },
  { match: /nơi chốn|phương hướng|hỏi đường|nhà cửa và địa điểm|giới từ nơi chốn|đi lại/, text: PLACE },
  { match: /giới từ đi sau|giới từ và cụm giới từ|collocation|giới từ \(prepositions\)|^giới từ$|part 5 luyện tập/, text: COLLOC },
  { match: /liên từ phụ thuộc, giới từ|liên từ và giới từ đồng nghĩa|giới từ thường gặp|part 5 luyện tập/, text: VS_CONJ },
  { match: /biểu đồ|số liệu/, text: TREND },
  { match: /cụm động từ|phrasal/, text: PHRASAL },
];
