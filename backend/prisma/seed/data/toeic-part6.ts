/**
 * TOEIC Part 6 — 4 đoạn văn soạn mới (ngân hàng câu hỏi chỉ có bản dịch tiếng Việt, không có văn bản gốc để luyện).
 * Mỗi đoạn 4 câu như đề thật: 3 câu từ / ngữ pháp / liên kết + 1 câu chọn câu phù hợp điền vào đoạn.
 * options[0] = đáp án đúng (hệ thống xáo thứ tự khi nạp).
 */
export interface Part6Set {
  title: string;
  content: string;
  questions: { no: number; options: [string, string, string, string]; explain: string }[];
}

export const PART6_SETS: Part6Set[] = [
  {
    title: 'Questions 131–134 refer to the following e-mail.',
    content:
      'To: All staff\nFrom: Daniel Reyes, Facilities Manager\nSubject: Parking garage maintenance\n\nPlease be aware that the east parking garage will be closed for maintenance from Monday, 6 May, to Friday, 10 May. During this period, employees -------(131) in the east garage should use the visitor lot on Pine Street instead.\n\nThe work includes repainting the parking lines and -------(132) the lighting system. -------(133). We apologise for any inconvenience this may cause.\n\nIf you have any questions, please contact my office -------(134) Thursday afternoon.',
    questions: [
      { no: 131, options: ['who usually park', 'usually parks', 'whose park usually', 'are usually parked'], explain: 'Cần mệnh đề quan hệ bổ nghĩa cho "employees": employees who usually park … (những nhân viên thường đỗ xe ở …).' },
      { no: 132, options: ['upgrading', 'upgrade', 'upgraded', 'to upgrades'], explain: 'Cấu trúc song song sau "includes": repainting … and upgrading … (cùng dạng V-ing).' },
      { no: 133, options: ['The garage will reopen at 7 a.m. on Saturday, 11 May.', 'The visitor lot has been closed since last year.', 'Please submit your expense reports by Friday.', 'Our new office in Pine Street is now hiring.'], explain: 'Câu điền phải nối mạch thông báo đóng cửa bảo trì → báo thời điểm mở lại là hợp lý nhất; các câu khác lạc đề hoặc mâu thuẫn (bãi khách đang được dùng thay thế).' },
      { no: 134, options: ['by', 'until', 'since', 'during'], explain: '"by Thursday afternoon" = trước / muộn nhất là chiều thứ Năm. "until" cần hành động kéo dài; "since" dùng với thì hoàn thành; "during" + khoảng thời gian.' },
    ],
  },
  {
    title: 'Questions 135–138 refer to the following notice.',
    content:
      'Riverside Public Library — Notice to Members\n\nStarting on 1 July, the library will extend its opening hours on weekdays. The main reading room will stay open -------(135) 9 p.m. from Monday to Friday. This change is a response to many requests from students and working adults who cannot visit during the day.\n\nIn addition, members will be able to borrow up to eight books at a time, -------(136) of the current limit of five. -------(137).\n\nWe thank all members for their valuable feedback and look forward to -------(138) you more often.',
    questions: [
      { no: 135, options: ['until', 'by', 'at', 'from'], explain: 'Mở cửa kéo dài liên tục đến 9 giờ tối → stay open until 9 p.m.' },
      { no: 136, options: ['instead', 'because', 'despite', 'although'], explain: 'Cụm "instead of" = thay vì: tám cuốn thay vì giới hạn năm cuốn hiện nay.' },
      { no: 137, options: ['Weekend hours will remain the same.', 'The library was built in 1965.', 'Students must show their passports at the door.', 'All books must be returned by 1 July.'], explain: 'Đoạn đang nói về thay đổi giờ mở cửa ngày thường và số sách được mượn → nói thêm giờ cuối tuần giữ nguyên là phù hợp mạch; các câu khác không liên quan hoặc vô lý.' },
      { no: 138, options: ['welcoming', 'welcome', 'welcomed', 'be welcomed'], explain: '"look forward to" + V-ing (to là giới từ) → look forward to welcoming you.' },
    ],
  },
  {
    title: 'Questions 139–142 refer to the following advertisement.',
    content:
      'Brightway Office Supplies — Spring Sale!\n\nFor two weeks only, Brightway is offering discounts of up to 40 percent on all office furniture. Our -------(139) desks and chairs are designed to keep you comfortable throughout the working day.\n\nBusiness customers who place an order of $500 or more will also receive free delivery and installation. -------(140). Simply mention the code SPRING25 when you call our sales team.\n\nThe sale ends on 30 April, so act -------(141)! Visit our showroom on Market Street or browse our full catalogue online. Our staff will be happy to help you -------(142) the right furniture for your office.',
    questions: [
      { no: 139, options: ['adjustable', 'adjust', 'adjustment', 'adjustably'], explain: 'Trước danh từ "desks and chairs" cần tính từ → adjustable (có thể điều chỉnh).' },
      { no: 140, options: ['First-time customers can get an extra 5 percent off.', 'Our showroom will be closed for renovation next year.', 'Delivery usually takes three months.', 'We no longer sell office chairs.'], explain: 'Câu sau "Simply mention the code SPRING25…" cần một ưu đãi đi kèm mã → giảm thêm 5% cho khách mới; các câu khác mâu thuẫn với quảng cáo.' },
      { no: 141, options: ['quickly', 'quick', 'quickness', 'quicker than'], explain: 'Bổ nghĩa cho động từ "act" cần trạng từ → act quickly.' },
      { no: 142, options: ['choose', 'choosing to', 'chose', 'to choosing'], explain: 'help + O + V nguyên mẫu (hoặc to V) → help you choose.' },
    ],
  },
  {
    title: 'Questions 143–146 refer to the following memo.',
    content:
      'MEMO\nTo: Sales Department\nFrom: Laura Chen, Head of Sales\nRe: Quarterly results\n\nI am pleased to announce that our team exceeded its sales target for the third quarter by 12 percent. This is the -------(143) result our department has achieved in the past five years.\n\nMuch of this success is due to the new customer management software we introduced in June. -------(144), several of you attended extra training sessions to learn how to use it effectively. -------(145).\n\nTo celebrate, a team dinner will be held on Friday, 18 October. Please let my assistant know -------(146) you will attend by Wednesday.',
    questions: [
      { no: 143, options: ['best', 'better', 'good', 'well'], explain: '"the … result … in the past five years" → so sánh nhất: the best result.' },
      { no: 144, options: ['In addition', 'However', 'Otherwise', 'In contrast'], explain: 'Câu sau bổ sung thêm một lý do thành công → In addition. However / In contrast chỉ tương phản; Otherwise = nếu không thì.' },
      { no: 145, options: ['I would like to thank everyone for their hard work.', 'The software will be removed next month.', 'Our sales fell sharply in the third quarter.', 'Please do not attend the training sessions.'], explain: 'Sau khi nêu kết quả tốt và nỗ lực của nhân viên → lời cảm ơn là hợp lý; các câu khác mâu thuẫn với nội dung memo.' },
      { no: 146, options: ['whether', 'what', 'which', 'who'], explain: '"let … know whether you will attend" = cho biết bạn có tham dự hay không.' },
    ],
  },
];
