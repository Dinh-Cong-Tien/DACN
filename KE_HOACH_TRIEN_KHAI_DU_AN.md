# KẾ HOẠCH TRIỂN KHAI TOÀN DIỆN & ĐẶC TẢ DỰ ÁN (PROJECT MASTER PLAN)

> **Tên đề tài:** Xây dựng nền tảng luyện thi tiếng Anh TOEIC–VSTEP thích ứng theo năng lực, tích hợp phân tích lỗi và lộ trình ôn tập cá nhân hóa  
> **Tên hệ thống:** **OrbiLingo Platform**  
> **Cấp độ:** Đồ án chuyên ngành / Đồ án tốt nghiệp (DACN)  
> **Thời gian:** 16 tuần (4 tháng cuốn chiếu - 8 Sprints)  
> **Mô hình kiến trúc:** Turborepo Monorepo (Frontend + Backend + Shared Packages)  
> **Công nghệ chính:** React 18, TypeScript, Tailwind CSS, TanStack Query, Zustand / Node.js, Express, Prisma ORM, PostgreSQL (Hỗ trợ cấu trúc tương đương cho Spring Boot / Next.js)  

---

## MỤC LỤC
1. [Vòng học tập thích ứng khép kín (The 5-Step Adaptive Loop)](#i-vòng-học-tập-thích-ứng-khép-kín-the-5-step-adaptive-loop)
2. [Phân quyền 5 đối tượng người dùng (5-Tier RBAC Hierarchy)](#ii-phân-quyền-5-đối-tượng-người-dùng-5-tier-rbac-hierarchy)
3. [Thuật toán khoa học & Đặc tả tính năng cốt lõi](#iii-thuật-toán-khoa-học--đặc-tả-tính-năng-cốt-lõi)
   - Thuật toán Khảo thí Thích ứng IRT 2PL (Item Response Theory)
   - Cơ chế chọn câu hỏi nhóm (Testlet / Passage Grouping)
   - Không gian Video học thông minh Đa vai trò & Chấm phát âm AI Shadowing
   - Thuật toán Lặp lại ngắt quãng SuperMemo SM-2 cho Sổ tay lỗi sai & Từ vựng
   - Kiến trúc Đàm thoại 2 Chiều với AI (Voice-to-Voice Realtime Pipeline & Study Co-pilot)
4. [Các tính năng nâng cấp đột phá (Innovative Enhancements)](#iv-các-tính-năng-nâng-cấp-đột-phá-innovative-enhancements)
   - Cơ chế Tạo Động lực & Duy trì Thói quen Tự học (Learning Motivation & Habit Retention Engine)
   - Chế độ Nghe chép chính tả (Dictation) & Luyện điểm yếu (Weak-point Drills)
   - Trung tâm Xuất Báo cáo: PDF Sổ tay Lỗi sai & Chứng chỉ số QR
5. [Đặc tả Cơ sở dữ liệu cốt lõi (30 Models Mapping)](#v-đặc-tả-cơ-sở-dữ-liệu-cốt-lõi-30-models-mapping)
6. [Kế hoạch phân rã công việc 16 tuần (Sprint Backlog & WBS)](#vi-kế-hoạch-phân-rã-công-việc-16-tuần-sprint-backlog--wbs)
7. [Bộ 7 câu hỏi bảo vệ hội đồng phản biện chắc chắn sẽ hỏi](#vii-bộ-7-câu-hỏi-bảo-vệ-hội-đồng-phản-biện)
8. [Chiến lược Mô hình Thương mại & Phân tầng Gói dịch vụ (Commercialization & Subscription Model)](#viii-chiến-lược-mô-hình-thương-mại-gói-dịch-vụ--bảo-vệ-doanh-thu-commercialization--subscription-model)
9. [Lộ trình Triển khai từ Cơ bản đến Nâng cao theo Từng Tính năng (Feature Progression Roadmap)](#ix-lộ-trình-triển-khai-từ-cơ-bản-đến-nâng-cao-theo-từng-tính-năng-feature-progression-roadmap)
10. [Đặc tả chi tiết Cơ sở dữ liệu toàn hệ thống (Full Database Specification – 59 bảng)](#x-đặc-tả-chi-tiết-cơ-sở-dữ-liệu-toàn-hệ-thống-full-database-specification)
11. [Thống kê Tiến độ Hoàn thành Dự án (Project Progress Report)](#xi-thống-kê-tiến-độ-hoàn-thành-dự-án-project-progress-report)
12. [Nghiên cứu chuyên sâu để nâng cấp chức năng chính (In-depth Research for Core Feature Enhancement)](#xii-nghiên-cứu-chuyên-sâu-để-nâng-cấp-chức-năng-chính-in-depth-research-for-core-feature-enhancement)

---

## I. VÒNG HỌC TẬP THÍCH ỨNG KHÉP KÍN (THE 5-STEP ADAPTIVE LOOP)

Dự án không đơn thuần là một website thi trắc nghiệm tĩnh, mà vận hành theo **vòng học tập thích ứng khép kín 5 bước**:

```
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. CHẨN ĐOÁN NĂNG LỰC BAN ĐẦU (Placement Diagnostic Test)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. THIẾT LẬP LỘ TRÌNH THÍCH ỨNG (Dynamic Learning Pathway)   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. ĐỘNG CƠ THI THÍCH ỨNG & VIDEO HỌC TƯƠNG TÁC (CAT & Video) │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. TỰ ĐỘNG PHÂN TÍCH LỖI SAI (Error Intelligence Engine)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. ÔN TẬP LẶP LẠI NGẮT QUÃNG & GAMIFICATION (SM-2 & Streak) │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ (Cập nhật năng lực θ & quay lại vòng lặp)
                                 └──────────────────────────────► [ Tối ưu hóa ]
```

1. **Bước 1 (Chẩn đoán đầu vào):** Thí sinh làm bài test nhanh 15–20 câu lúc Onboarding. Hệ thống xác định mức năng lực ban đầu θ₀ và cấp bậc CEFR / điểm số TOEIC tương đương.
2. **Bước 2 (Lộ trình cá nhân hóa):** Hệ thống phân rã mục tiêu thành 3 chặng Milestone: *Nền tảng (Foundation) → Rèn luyện chuyên sâu & Kho video tương tác được Trưởng bộ môn thẩm định → Thực chiến đề thi (Mock Tests)*.
3. **Bước 3 (Thi thích ứng CAT & Video tương tác):** 
   - Với trắc nghiệm: Thuật toán **2PL IRT** chọn câu hỏi/bài đọc Passage theo hàm thông tin Fisher lớn nhất theo năng lực ước lượng θ̂. 
   - Với video học: Giáo viên biên soạn và tải video; Trưởng bộ môn thẩm định chuyên môn; Admin kiểm duyệt hạ tầng; Học viên dùng **Smart Video Player** đồng bộ Transcript, tìm kiếm câu thoại, lặp câu Shadowing và được **AI Pronunciation Diagnostic (Công nghệ nhận diện phát âm cấp độ âm vị Phoneme-level chuẩn ELSA)**: bóc tách ngữ âm IPA, hệ thống 3 màu trực quan (Xanh - Vàng - Đỏ), hướng dẫn khẩu hình đặt lưỡi/môi, phân tích trọng âm từ và đường cong ngữ điệu câu (Pitch Contour).
   - Các chế độ luyện âm & đàm thoại chuyên sâu: **AI Speaking Partner (Đàm thoại luyện nói 2 chiều với Giám khảo ảo VSTEP & Nhập vai đàm thoại doanh nghiệp Roleplay Simulator)**, **Luyện phân biệt Cặp âm tối thiểu (Minimal Pairs Drill)**, **Trực quan hóa Nối âm & Nuốt âm (Connected Speech Visualizer)**, **Trình Tự tạo bài học phát âm từ văn bản tự do (Custom Study Sets)**, **Từ điển phát âm tương tác tích hợp Micro chấm điểm tại chỗ**, **Thực hành Nhóm Cùng tiến (Peer Learning Drill)**, **Nghe chép chính tả (Dictation)** và **Luyện điểm yếu trọng tâm (Weak-point Drills)**.
4. **Bước 4 (Phân tích lỗi sai):** Tự động bóc tách các câu sai vào **Sổ tay lỗi sai (Mistake Notebook)** và phân loại nguyên nhân cốt lõi (*Ngữ pháp, Từ vựng, Nghe nhầm âm, Đọc hiểu sai ý, Áp lực thời gian*). Hỗ trợ **Xuất Sổ tay lỗi ra bản in PDF**.
5. **Bước 5 (Ôn tập ngắt quãng & Duy trì thói quen học tập):** Kích hoạt lịch ôn tập ngắt quãng sau 1 ngày → 3 ngày → 7 ngày → 16 ngày cho cả câu hỏi sai và từ vựng. Duy trì động lực học bằng **Chỉ số Chuyên cần Hàng ngày (Study Consistency Index)** và **Bảng Vinh danh Học thuật (Academic Honor Roll)**.

---

## II. PHÂN QUYỀN 5 ĐỐI TƯỢNG NGƯỜI DÙNG (5-TIER RBAC HIERARCHY)

Hệ thống thiết lập phân cấp quyền hạn theo mô hình quản lý giáo dục chuyên nghiệp:  
`GUEST < STUDENT < TEACHER < HEAD_TEACHER (Giáo viên cấp cao / Trưởng bộ môn) < ADMIN`:

| Cấp bậc (Role) | Chức năng người dùng (Front-facing & Trải nghiệm thực tế) | Quyền hạn & Nghiệp vụ hệ thống (Backend / Database) |
| :--- | :--- | :--- |
| **1. Khách vãng lai (Guest)** | **[CÁC CHỨC NĂNG CƠ BẢN]**<br>• Xem trang chủ giới thiệu hệ thống, tra cứu cấu trúc đề thi TOEIC & VSTEP chuẩn quốc tế.<br>• **Bảng Quy đổi Điểm Đa Khung Tham chiếu (TOEIC ↔ VSTEP ↔ CEFR ↔ IELTS Conversion Tool):** Tra cứu và chuyển đổi điểm tương đương trực quan theo Khung năng lực ngoại ngữ 6 bậc Việt Nam (KNLNNVN) và CEFR.<br>• **Kho Tài liệu Mở (Free Resource Hub):** Tải tài liệu PDF tóm tắt 24 chủ điểm ngữ pháp và cẩm nang từ vựng cơ bản.<br>• Xem Bảng vinh danh Top học viên chuyên cần trong tuần; Đăng ký tài khoản để kích hoạt Lộ trình học cá nhân hóa.<br><br>**[CÁC CHỨC NĂNG NÂNG CAO]**<br>• **Nâng cao: Khảo sát Nhanh Năng lực 5 Phút (Micro-CAT Diagnostic Test):** Làm bài kiểm tra thích ứng ngắn 5 câu không cần tài khoản, thuật toán CAT ước lượng năng lực tức thời và xuất biểu đồ radar chỉ rõ điểm mạnh/yếu cốt lõi.<br>• **Nâng cao: Thử nghiệm Chẩn đoán Phát âm & Giọng đọc AI 1 chạm (Quick Speech Diagnostic chuẩn ELSA):** Đọc thử 1 câu ngắn qua Mic → AI soi lỗi chi tiết đến từng âm vị IPA, hiển thị hệ thống 3 màu (Xanh lá / Vàng / Đỏ) và gợi ý khẩu hình miệng tức thì mà không cần đăng nhập.<br>• **Nâng cao: Trải nghiệm Thử Video Tương tác Mẫu:** Xem thử 1 video bài giảng mở, transcript chạy song song đồng bộ theo thời gian thực, tìm kiếm từ khóa, lặp câu Shadowing chẵn/lẻ (A-B Toggle Looping), tra từ điển Cambridge 1 chạm.<br>• **Nâng cao: Công cụ Dự báo Điểm thi & Tính toán Kế hoạch Học tập AI (AI Score Predictor):** Nhập điểm hiện tại + mục tiêu mong muốn → AI tự động tính số giờ cần học/ngày và tạo bản đồ lộ trình học thử cá nhân hóa. | **[CƠ BẢN]**<br>• Đọc tài nguyên bài học công khai (Public APIs).<br>• Giới hạn số lượt tra từ điển đối với IP khách vãng lai.<br>• Rate limiting chống spam API.<br><br>**[NÂNG CAO]**<br>• **Nâng cao:** Cung cấp API chẩn đoán phát âm nhanh (Quick Speech Diagnostic API) và Micro-CAT API với cơ chế Rate Limiting nghiêm ngặt theo địa chỉ IP chống spam tài nguyên AI. |
| **2. Học viên (Student)** | **[CÁC CHỨC NĂNG CƠ BẢN]**<br>• Khảo sát Onboarding & Thi xếp lớp ban đầu (xác định θ₀).<br>• Học theo Lộ trình cá nhân hóa (Timeline Milestone 3 chặng: Nền tảng → Chuyên sâu → Thực chiến đề thi).<br>• **Kho Đề thi Thử Công khai (Public Mock Tests - Mô hình Study4 / Zenlish):** Làm đề Full Test và Practice từng Part hoàn toàn miễn phí, bấm giờ thật và xem giải thích cơ bản.<br>• Trình phát video bài giảng kèm Transcript văn bản và tra từ điển Cambridge Popover 1 chạm (nghĩa tiếng Việt, phiên âm IPA, audio phát âm chuẩn).<br>• **Sổ tay lỗi sai cơ bản:** Tự động lưu câu làm sai vào bảng `MistakeNotebook`, xem lại danh sách câu sai kèm đáp án đúng.<br>• **Chế độ Luyện chép chính tả (Dictation)** & **Luyện điểm yếu (Weak-point Drills)** cơ bản.<br>• **Động lực Học tập & Bảng Vinh danh:** Theo dõi Chỉ số chuyên cần hàng ngày (Study Consistency), tích lũy Điểm nỗ lực tự học (Effort Points), ghi nhận Huy hiệu cột mốc thành tích và Bảng vinh danh lớp học.<br>• **Đóng góp Học liệu Cộng đồng:** Bấm cờ phản hồi câu hỏi có nghi vấn ngữ pháp để Trưởng bộ môn hiệu đính và nhận điểm ghi nhận đóng góp học thuật.<br><br>**[CÁC CHỨC NĂNG NÂNG CAO]**<br>• **Nâng cao: Động cơ Thi Thích ứng CAT IRT 2PL:** Tự động điều chỉnh độ khó câu hỏi tiếp theo dựa trên năng lực tức thời $\hat{\theta}$; Thuật toán chọn câu hỏi theo cụm bài đọc (**Testlet Grouping**) đạt thông tin Fisher cực đại.<br>• **Nâng cao: Phòng thi Focus Mode Chuẩn Khảo thí Quốc tế:** Đồng hồ đếm ngược, tự động nộp bài khi hết giờ; **Giấy nháp điện tử (Digital Scratchpad)** để ghi chú khi nghe Listening; **Công cụ Gạch bỏ đáp án sai (Strike-through tool)** và Đánh dấu câu xem lại (Flag question); Tự động lưu tạm bài làm mỗi 15 giây (**Auto-snapshot**); Cảnh báo khi chuyển tab gian lận.<br>• **Nâng cao: Phân Tích Tốc Độ Làm Bài & Chiến Thuật Phân Bổ Thời Gian (Pacing & Time Allocation Analytics):** Biểu đồ thời gian dừng lại ở từng câu (Time per question); cảnh báo sa đà quá lâu vào câu khó, gợi ý chiến thuật phân bổ thời lượng phòng thi tối ưu.<br>• **Nâng cao: Không Gian Luyện Viết Tự Luận VSTEP Writing Studio tích hợp Trợ lý AI Rubric:** Giao diện làm bài Task 1 (thư/email) và Task 2 (nghị luận); bộ đếm từ thời gian thực, AI phân tích lỗi ngữ pháp, gợi ý mẫu câu nâng cấp band điểm (Paraphrasing & Collocation) bám sát barem Bộ GD&ĐT.<br>• **Nâng cao: Trợ lý Ảo AI Gia sư Đồng hành 24/7 (AI Study Co-pilot):** Nút "Hỏi AI Orbi" ở từng câu hỏi để giải thích cặn kẽ tại sao chọn A mà không chọn C, phân tích cấu trúc ngữ pháp tại chỗ theo phương pháp gợi mở Socrates.<br>• **Nâng cao: AI Speaking Partner & Conversational Roleplay Simulator:**<br>&nbsp;&nbsp;+ **Giám khảo Ảo VSTEP:** AI đối thoại giọng nói tự nhiên hỏi từng câu thi Nói VSTEP (Part 1-2-3) → Học viên trả lời qua Mic → AI hỏi câu tiếp theo theo ngữ cảnh hội thoại.<br>&nbsp;&nbsp;+ **Nhập vai Đàm thoại Doanh nghiệp (Roleplay Simulator):** Tùy chọn luyện đàm thoại theo tình huống doanh nghiệp & phỏng vấn xin việc (Job Interview, Customer Service, Business Meeting) chuẩn TOEIC Speaking; xuất báo cáo Rubric 4 tiêu chí CEFR.<br>• **Nâng cao: Không gian học Video thông minh + AI Shadowing & Bắt lỗi Âm vị Chuẩn ELSA:**<br>&nbsp;&nbsp;+ Video phát kèm Transcript chạy song song đồng bộ theo thời gian thực (Interactive Realtime Captions).<br>&nbsp;&nbsp;+ Cột hiển thị ngữ pháp & mẫu câu trọng tâm; Tìm kiếm từ khóa trong Script.<br>&nbsp;&nbsp;+ Cơ chế A-B Toggle Looping (lặp câu chẵn/lẻ) để nhại giọng.<br>&nbsp;&nbsp;+ **AI Phoneme-level Pronunciation Scoring (Chuẩn ELSA):** Thu âm qua Micro → AI bóc tách chuỗi âm vị IPA, soi lỗi chi tiết từng âm đơn lẻ (âm cuối /s/, /t/, /ed/, âm khó /θ/, /ʃ/, /tʃ/); hệ thống 3 màu trực quan (Xanh lá = chuẩn bản xứ ≥80%, Vàng = tạm chấp nhận 50-79%, Đỏ = sai/nuốt âm <50%).<br>&nbsp;&nbsp;+ **Mô hình Khẩu hình Miệng Trực quan (Mouth Articulation Guide):** Khi đọc sai âm nào, AI hiển thị hình ảnh mô phỏng vị trí răng, môi, đầu lưỡi và luồng hơi để sửa đúng ngay lập tức.<br>&nbsp;&nbsp;+ **Phân tích Trọng âm & Đường cong Ngữ điệu Câu (Stress & Pitch Contour):** Biểu đồ sóng âm hiển thị cao độ giọng nói lên/xuống nhịp nhàng, hướng dẫn ngắt nghỉ tự nhiên theo cụm nghĩa (Sense Groups).<br>• **Nâng cao: Kho Luyện Âm Chuyên Sâu (Minimal Pairs & Connected Speech):**<br>&nbsp;&nbsp;+ **Luyện Phân Biệt Cặp Âm Dễ Nhầm (Minimal Pairs Drill):** Rèn luyện các cặp âm tối thiểu kinh điển (/ɪ/ vs /iː/, /æ/ vs /e/, /θ/ vs /s/...) qua 2 dạng bài: nghe chọn từ đúng và đọc đối chiếu cả 2 từ để AI đo khoảng cách âm học Formant ($F_1 - F_2$).<br>&nbsp;&nbsp;+ **Luyện Nối Âm, Biến Âm & Nuốt Âm (Connected Speech Visualizer):** Hiển thị trực quan cung nối âm (Consonant-to-Vowel), quy tắc nuốt âm và biến âm thực tế (*pick it up → pi-ki-tup, want to → wanna*), giúp vượt bẫy tốc độ trong bài thi nghe TOEIC/VSTEP.<br>• **Nâng cao: Trình Tự Tạo Bài Học Cá Nhân Hóa (Custom Study Sets Builder):** Dán đoạn văn bản/kịch bản bất kỳ → AI tự động tách câu, đọc mẫu giọng bản xứ và chuyển thành bài luyện phát âm từng câu có chấm điểm âm vị.<br>• **Nâng cao: Từ Điển Phát Âm Tương Tác Có Micro Thu Âm Tại Chỗ (Interactive Pronunciation Dictionary):** Popover Cambridge tra từ tích hợp nút Mic thu âm đối chiếu và chấm điểm phát âm % tức thời cho từng từ vựng mới tra trước khi 1-click lưu vào thẻ từ vựng SM-2.<br>• **Nâng cao: Thực hành Nhóm Cùng tiến (Peer Learning & Timed Drill):** Luyện tập nhóm cùng bạn học giải 10 câu trắc nghiệm dưới áp lực thời gian mô phỏng phòng thi thật; đối chiếu phương pháp giải và tốc độ tư duy sau bài làm.<br>• **Nâng cao: Hệ thống Lặp lại Ngắt quãng SuperMemo SM-2 & Xuất Bản In PDF:** Cây phân loại nguyên nhân lỗi sai, thuật toán SM-2 tự động lên lịch nhắc ôn ngắt quãng (1, 3, 7, 14, 30 ngày) và 1-Click xuất Sổ tay lỗi sai ra file PDF bản in đẹp mắt.<br>• **Nâng cao: Đồng bộ Lịch Ôn tập SM-2 với Google Calendar / iCal (Smart Calendar Sync):** 1-Click xuất lịch nhắc ôn tập ngắt quãng SM-2 và hạn nộp bài tập về nhà vào ứng dụng lịch cá nhân.<br>• **Nâng cao: Chứng chỉ số QR:** Xuất chứng nhận hoàn thành lộ trình có mã QR xác thực kết quả trực tuyến.<br>• *(Lưu ý: Chi tiết phân tầng gói cước, hạn mức sử dụng Free/Premium và cơ chế thương mại được quy định độc lập tại [Mục VIII: Chiến lược Mô hình Thương mại & Phân tầng Gói dịch vụ](#viii-chiến-lược-mô-hình-thương-mại-gói-dịch-vụ--bảo-vệ-doanh-thu-commercialization--subscription-model)).* | **[CƠ BẢN]**<br>• Lưu phiên làm bài (`ExamAttempt`), ghi nhận đáp án lựa chọn và điểm số thô.<br>• Ghi nhật ký lỗi sai (`MistakeNotebook`).<br>• Lưu trữ tiến trình xem video, chuỗi ngày chuyên cần và danh sách từ vựng cá nhân (`UserVocabulary`).<br>• Cập nhật tiến độ học tập (`LearningPathItem`).<br><br>**[NÂNG CAO]**<br>• **Nâng cao:** Ghi nhận thời lượng làm từng câu (`question_duration_seconds`) phục vụ Pacing Analytics.<br>• **Nâng cao:** Lưu trữ bản thảo và bài nộp tự luận (`EssaySubmission`).<br>• **Nâng cao:** Xử lý snapshot định kỳ 15s phục hồi trạng thái bài thi khi rớt mạng.<br>• **Nâng cao:** Tính toán năng lực tức thời $\hat{\theta}$ và sai số chuẩn $SE$ sau từng câu hỏi theo thuật toán IRT CAT.<br>• **Nâng cao:** Cung cấp API xuất lịch định dạng `.ics` (`/api/calendar/export.ics`). |
| **3. Giáo viên (Teacher)** | **[CÁC CHỨC NĂNG CƠ BẢN]**<br>• Tạo và quản lý lớp học (`Class`), cấp mã code mời học sinh tham gia.<br>• Giao bài tập về nhà và đề thi theo hạn nộp (Deadline).<br>• Tải video bài giảng và tài liệu học tập thông thường cho lớp phụ trách.<br>• Bảng theo dõi tiến độ lớp học: Xem danh sách học sinh, tỷ lệ hoàn thành bài tập, điểm số trung bình và chỉ số chuyên cần cơ bản.<br>• Chấm điểm bài tập trắc nghiệm tự động của lớp.<br><br>**[CÁC CHỨC NĂNG NÂNG CAO]**<br>• **Nâng cao: Teacher Video Studio Đa Phương Tiện:** Tải video (MP4/YouTube), upload phụ đề SRT/VTT, gắn thẻ ngữ pháp/từ vựng vào từng mốc timeline, đính kèm Quiz kiểm tra củng cố xuất hiện đúng thời điểm phát video.<br>• **Nâng cao: Hệ thống Cảnh báo Sớm Học sinh Nguy cơ Trượt (At-Risk Early Warning):** Cờ đỏ cảnh báo học sinh có tỷ lệ làm sai vượt 60% hoặc đứt chuỗi chuyên cần 5 ngày liên tiếp → 1-click gửi gói bài tập phụ đạo cấp tốc.<br>• **Nâng cao: Phân Nhóm Học Sinh Tự Động Bằng AI (AI-driven Differentiated Learning Groups):** Dựa trên chỉ số năng lực $\theta$ và loại lỗi sai phổ biến từ Sổ tay lỗi, AI tự động gom nhóm học sinh (*Cần củng cố ngữ pháp, Luyện bẫy đề nâng cao, Rèn tốc độ đọc hiểu*); 1-click giao đúng gói bài tập chuyên biệt cho từng nhóm.<br>• **Nâng cao: Trình Tạo Đề thi Tự động bằng AI (AI Question & Exam Generator):** Dán đoạn văn bản hoặc nhập chủ đề → AI tự sinh 3–5 câu hỏi trắc nghiệm chuẩn TOEIC/VSTEP kèm đáp án, giải thích chi tiết và gợi ý tham số độ khó ban đầu ($b$).<br>• **Nâng cao: Phòng thi Trực tuyến Có giám sát (Live Proctored Classroom Exam):** Mở phòng thi tập trung cho cả lớp; Live Dashboard hiển thị trạng thái từng học sinh theo thời gian thực (đang làm câu mấy, cảnh báo chuyển tab/rời phòng thi).<br>• **Nâng cao: Báo cáo Tương tác Video Chuyên Sâu của Lớp:** Thống kê học sinh nào đã xem, thời lượng xem thực tế, số lần tra từ điển, số lượt luyện Shadowing trên từng phút bài giảng.<br>• **Nâng cao: Bàn Chấm Bài (Grading Studio) tích hợp AI Rubric Assistant & Voice Feedback:**<br>&nbsp;&nbsp;+ AI chấm nháp trước bài tự luận Speaking/Writing theo Barem 4 tiêu chuẩn của Bộ GD&ĐT (Task, Coherence, Lexical, Grammar); giáo viên duyệt và chỉnh sửa nhận xét, tiết kiệm 70% thời gian chấm.<br>&nbsp;&nbsp;+ **Nhận xét Giọng nói & Ngân hàng Phản hồi Mẫu (Voice Feedback & Smart Feedback Bank):** Thu âm lời nhận xét (Voice Note) gửi trực tiếp vào bài thi Nói/Viết của học sinh; chọn nhanh các mẫu nhận xét sư phạm chuẩn hóa từ ngân hàng gợi ý. | **[CƠ BẢN]**<br>• Toàn quyền tạo và quản lý nội dung bài giảng của lớp mình phụ trách.<br>• Ghi nhận thông số bài giảng vào bảng `Lesson`, `CourseSection`.<br>• Quyền chấm bài cho học viên thuộc lớp.<br>• Xem thống kê cơ bản về tỷ lệ nộp bài tập của lớp.<br><br>**[NÂNG CAO]**<br>• **Nâng cao:** Lưu trữ file ghi âm nhận xét (`TeacherVoiceFeedback`) và phân nhóm học tập AI (`ClassSubgroup`).<br>• **Nâng cao:** Lưu trữ snapshot trạng thái phòng thi Live Proctored theo thời gian thực.<br>• **Nâng cao:** Khai thác dữ liệu phân tích chuyên sâu mức độ tương tác học liệu của lớp. |
| **4. Giáo viên Cấp cao / Trưởng bộ môn (Head Teacher / Academic Lead)**<br>*(Lớn hơn Giáo viên, nhỏ hơn Admin)* | **[CÁC CHỨC NĂNG CƠ BẢN]**<br>• Quản lý toàn bộ danh mục môn học, ngân hàng câu hỏi và danh sách giáo viên, lớp học thuộc bộ môn phụ trách.<br>• Phê duyệt các bài viết, đề kiểm tra định kỳ tiêu chuẩn của giáo viên trong bộ môn.<br>• Xem báo cáo tổng kết điểm số, tỷ lệ chuyên cần và xếp loại học tập của các lớp trong bộ môn.<br>• Tiếp nhận và xử lý các ý kiến khiếu nại thông thường về câu hỏi hoặc điểm số.<br><br>**[CÁC CHỨC NĂNG NÂNG CAO]**<br>• **Nâng cao: Thẩm định & Phê duyệt Chuyên môn Cấp trường (Academic Peer-Review):**<br>&nbsp;&nbsp;+ Đóng vai trò *"Người gác cổng học thuật (Academic Gatekeeper)"*: Xem xét và thẩm định chất lượng nội dung học liệu, video bài giảng, câu hỏi do các Giáo viên cấp dưới gửi lên trước khi xuất bản ra toàn trường.<br>&nbsp;&nbsp;+ Đóng dấu xác nhận *"Đã thẩm định chuyên môn (Academically Verified)"*.<br>• **Nâng cao: Ma Trận Phủ Kiến Thức Đề Thi Chuẩn Hóa (Curriculum & Blueprint Coverage Matrix):**<br>&nbsp;&nbsp;+ Công cụ trực quan kiểm tra độ bao phủ của ngân hàng câu hỏi đối với 100% chủ điểm ngữ pháp, chủ đề từ vựng (Business, Workplace, Travel...) và cấu trúc đề thi TOEIC/VSTEP theo chuẩn ETS/Bộ GD&ĐT.<br>&nbsp;&nbsp;+ Tự động phát hiện và cảnh báo các phần thi đang thiếu câu hỏi để chỉ đạo giáo viên biên soạn bổ sung.<br>• **Nâng cao: Quản trị Ngân hàng Đề thi Thích ứng & Tự Động Hiệu Chuẩn Tham Số IRT (Item Bank Master & Recalibration):**<br>&nbsp;&nbsp;+ Thẩm định và điều chỉnh lại tham số độ khó ban đầu ($b$) và độ phân biệt ($a$) của câu hỏi trong ngân hàng thích ứng.<br>&nbsp;&nbsp;+ **Tự Động Hiệu Chuẩn Tham Số IRT Sau Kỳ Thi (Post-Exam Psychometric Recalibration):** Sau các kỳ thi lớn, thuật toán tự động tái tính toán lại tham số $b$ và $a$ bằng Marginal Maximum Likelihood (MML); gửi cảnh báo cờ vàng với câu hỏi có tham số dị biệt (câu quá khó/dễ bất thường hoặc đáp án gây nhiễu sai) để tinh chỉnh.<br>&nbsp;&nbsp;+ Phê duyệt cấu trúc các đề thi thử chính thức (Official Mock Tests) cấp trường/khoa.<br>• **Nâng cao: Thanh tra & Chuẩn hóa Chấm thi (Grading Audit & Appeals):**<br>&nbsp;&nbsp;+ Chấm phúc khảo các bài thi tự luận VSTEP Writing & Speaking khi học viên có khiếu nại điểm số (ra phán quyết điểm số cuối cùng).<br>&nbsp;&nbsp;+ Thanh tra ngẫu nhiên các bài chấm của giáo viên thường để đảm bảo công bằng, đúng barem của Bộ GD&ĐT.<br>• **Nâng cao: Dashboard Phân tích Học thuật Toàn bộ môn (Academic Analytics):**<br>&nbsp;&nbsp;+ **Bản đồ Nhiệt Lỗ hổng Toàn trường (Institutional Weakness Heatmap):** Tổng hợp dữ liệu từ tất cả các lớp: Xem biểu đồ nhiệt phân bố điểm yếu ngữ pháp toàn trường để đề xuất tổ chức chuyên đề phụ đạo tập trung.<br>&nbsp;&nbsp;+ **Chỉ số Ổn định Chấm điểm của Giảng viên (Grading Consistency Index):** Thống kê độ lệch điểm chấm tự luận giữa các giáo viên để chuẩn hóa chất lượng đánh giá theo barem Bộ GD&ĐT.<br>&nbsp;&nbsp;+ Báo cáo so sánh kết quả học tập giữa các lớp, đánh giá chất lượng giảng dạy của từng giáo viên trong bộ môn; phát hiện các lớp có tỷ lệ học sinh yếu cao để chỉ đạo điều chỉnh lộ trình học kịp thời. | **[CƠ BẢN]**<br>• Quyền xem và quản lý ngân hàng câu hỏi, các lớp học thuộc bộ môn phụ trách.<br>• *Phân định ranh giới:* Không có quyền cấu hình hạ tầng server, không can thiệp thanh toán, không xóa tài khoản Admin.<br><br>**[NÂNG CAO]**<br>• **Nâng cao:** Cập nhật cờ thẩm định chuyên môn: `is_academically_approved = true`, `reviewed_by_id`.<br>• **Nâng cao:** Lưu dữ liệu ma trận độ phủ đề thi (`BlueprintCoverage`) và nhật ký tái hiệu chuẩn IRT (`ItemRecalibrationLog`).<br>• **Nâng cao:** Quyền sửa điểm phúc khảo trong `ExamAttempt` và `AssignmentSubmission`. |
| **5. Quản trị viên (Admin)** | **[CÁC CHỨC NĂNG CƠ BẢN]**<br>• Quản lý tài khoản người dùng: Khởi tạo, kích hoạt, khóa/mở khóa tài khoản, cấp phát vai trò (`STUDENT`, `TEACHER`, `HEAD_TEACHER`, `ADMIN`).<br>• Quản lý danh mục kỹ năng (Skill Tags), cây thư mục khóa học và cấu hình chung hệ thống.<br>• Xem danh sách người dùng, nhật ký hoạt động hệ thống và thống kê tổng số lượng truy cập.<br>• Quản trị CSDL cơ bản: Phân quyền truy cập dữ liệu, kiểm tra trạng thái hoạt động của các dịch vụ.<br><br>**[CÁC CHỨC NĂNG NÂNG CAO]**<br>• **Nâng cao: Trung tâm Vận hành & Phân phối Nội dung (Content Publishing Center):** Cài đặt phạm vi hiển thị video/học liệu đa tầng (Public Demo cho khách, Global Library cho toàn trường, Private Class cho lớp học riêng).<br>• **Nâng cao: Giám Sát Hạn Mức Tiêu Thụ Token & Quản Lý Chi Phí AI (AI Token Usage & Cost Management Dashboard):** Biểu đồ thời gian thực theo dõi mức tiêu thụ token của từng tính năng (AI Speaking, Co-pilot, Whisper STT, TTS, Rubric chấm bài...); thiết lập ngân sách trần (Cost Budget Cap) và cảnh báo khi chi phí API vượt ngưỡng.<br>• **Nâng cao: Trung Tâm Sao Lưu & Khôi Phục Dữ Liệu Tự Động (Automated Backup & Disaster Recovery Hub):** Lập lịch sao lưu tự động CSDL PostgreSQL định kỳ hàng ngày, cho phép 1-click Rollback phiên bản an toàn khi có sự cố kỹ thuật.<br>• **Nâng cao: Quản lý Tài nguyên Media & Dung lượng Server:** Giám sát tổng dung lượng video/audio, hạn mức upload (Storage Quotas) cho giáo viên, cấu hình nén HLS đa độ phân giải tối ưu băng thông máy chủ.<br>• **Nâng cao: Hệ thống Phát hiện Gian lận & Bất thường (Anti-Cheat & Anomaly Analytics):** Báo cáo các tài khoản có hành vi bất thường (làm câu khó dưới 2 giây liên tục, mở nhiều phiên trên các IP khác nhau, spam request).<br>• **Nâng cao: Quản trị Khóa học & Gói Thành viên (Membership & Subscription Hub):** Quản lý danh mục các gói tài khoản (Gói Free, VIP TOEIC 90 ngày, VSTEP Master 180 ngày), tích hợp cổng thanh toán trực tuyến (VNPAY / MoMo), xử lý IPN/Webhook và quản trị Hard-gating bảo vệ tài nguyên.<br>• **Nâng cao: Trung tâm Tiếp nhận & Xử lý Báo lỗi Câu hỏi (Question Flagging Hub):** Nhận ticket báo lỗi từ cộng đồng người học, phối hợp với Trưởng bộ môn sửa lỗi và tự động cộng điểm ghi nhận đóng góp học thuật cho người báo lỗi.<br>• **Nâng cao: Hệ thống Thông báo Đa kênh (Multi-channel Notification Hub):** Tự động gửi thông báo đẩy (Web Push) và Email nhắc nhở giữ nhịp chuyên cần học tập, nhắc lịch ôn tập ngắt quãng SM-2.<br>• **Nâng cao: Quản lý Cây tri thức & Bộ đệm Từ điển:** Quản trị Cây danh mục kỹ năng (Skill Tags), giám sát Cache từ điển để tối ưu chi phí API.<br>• **Nâng cao: Quản trị Động lực Học tập Toàn diện:** Cấu hình quy tắc tính điểm nỗ lực học tập, hệ thống Huy hiệu thành tích và chu kỳ cập nhật Bảng vinh danh.<br>• **Nâng cao: Nhật ký Kiểm toán Toàn vẹn (Immutable Audit Logs) & Giám sát Hiệu năng Server:** Lưu vết chi tiết mọi thao tác nhạy cảm (thay đổi phân quyền, sửa điểm, xóa dữ liệu) và giám sát tải CPU/RAM/Database Connections thời gian thực. | **[CƠ BẢN]**<br>• Toàn quyền CRUD trên mọi bảng CSDL.<br>• Phân quyền và cấp phát vai trò tài khoản (`Role: STUDENT, TEACHER, HEAD_TEACHER, ADMIN`).<br><br>**[NÂNG CAO]**<br>• **Nâng cao:** Quản lý tài nguyên media server (CDN/S3/Local storage).<br>• **Nâng cao:** Cấu hình hạn mức token AI (`AiCostLimit`) và kích hoạt job sao lưu CSDL tự động (PostgreSQL pg_dump / Snapshot job).<br>• **Nâng cao:** Ghi nhận mọi hành động nhạy cảm vào bảng `AuditLog`. |

---

## III. THUẬT TOÁN KHOA HỌC & ĐẶC TẢ TÍNH NĂNG CỐT LÕI

### 3.1. Thuật toán Khảo thí Thích ứng IRT 2PL (Item Response Theory)

#### A. Mô hình xác suất 2 tham số Logistic (2PL):
```
P_i(θ) = 1 / [ 1 + exp( -1.702 × a_i × (θ - b_i) ) ]
```
* **θ (Theta):** Mức năng lực hiện thời của thí sinh (chuẩn hóa trong khoảng từ -3.0 đến +3.0).
* **b_i:** Độ khó của câu hỏi thứ i (câu càng khó thì b càng cao).
* **a_i:** Độ phân biệt của câu hỏi thứ i (khả năng phân loại thí sinh giỏi và yếu).

#### B. Hàm thông tin Fisher của câu hỏi:
```
I_i(θ) = a_i² × P_i(θ) × [ 1 - P_i(θ) ]
```
Hệ thống luôn chọn câu hỏi tiếp theo có hàm thông tin **I_i(θ̂)** lớn nhất tại năng lực hiện tại của thí sinh.

#### C. Cơ chế chọn bài đọc/audio theo Cụm (Testlet Selection):
Đối với bài đọc Passage hoặc file nghe có **k câu hỏi con** đi kèm (TOEIC Part 3, 4, 6, 7 và VSTEP Reading):
```
I_Passage(θ) = ∑ I_child_j(θ)   (với j chạy từ 1 đến k)
```
Hệ thống chọn cả bài đọc có tổng thông tin **I_Passage(θ̂)** lớn nhất để **giữ nguyên vẹn ngữ cảnh bài đọc**, không làm xé lẻ câu hỏi.

#### D. Tiêu chí dừng bài thi (Stopping Rule):
```
SE(θ̂) = 1 / √( ∑ I_i(θ̂) ) ≤ 0.30   HOẶC   Tổng số câu = 25 câu
```
Bài thi kết thúc ngay khi sai số chuẩn **SE(θ̂) ≤ 0.30** (độ chính xác đã hội tụ) hoặc khi làm đủ 25 câu hỏi.

---

### 3.2. Thuật toán Lặp lại ngắt quãng SuperMemo SM-2 (Spaced Repetition)
Áp dụng cho Sổ tay lỗi sai (`MistakeNotebook`) và Từ vựng tra từ video:
1. **Cập nhật hệ số dễ nhớ (Easiness Factor - EF):**
   ```
   EF' = EF + ( 0.1 - (5 - q) × (0.08 + (5 - q) × 0.02) )
   (Nếu EF' < 1.3 thì giữ nguyên mức sàn EF' = 1.3)
   ```
   * *q:* Điểm đánh giá mức độ nhớ của người học (từ 0 = quên hoàn toàn đến 5 = nhớ rất rõ).
   * *EF:* Hệ số dễ nhớ ban đầu (mặc định là 2.5).

2. **Khoảng cách ngày nhắc lại kế tiếp (Interval - I):**
   * Lần 1: I(1) = 1 ngày.
   * Lần 2: I(2) = 6 ngày.
   * Lần n (n > 2): I(n) = I(n-1) × EF' (khoảng 16 ngày, 35 ngày...).

---

### 3.3. Không gian Video học thông minh, AI Shadowing & Công nghệ Bắt lỗi Âm vị (Phoneme-level) Chuẩn ELSA
1. **Đồng bộ Video - Script:** Lắng nghe sự kiện `timeupdate` (250ms) để Highlight và Auto-scroll dòng thoại.
2. **Tìm kiếm & A-B Toggle Looping:** Click số lần lẻ lặp đoạn thoại từ mốc bắt đầu đến kết thúc; click số lần chẵn tiếp tục phát bình thường.
3. **Thuật toán Phân tích Âm vị & Chấm điểm Phát âm 3 Màu (Acoustic Phoneme Alignment & Tri-color Scoring):**
   - Thu âm qua Micro → Sử dụng mô hình HMM / CTC Forced Alignment bóc tách giọng nói thành từng âm vị đơn lẻ (Phonemes) theo bảng phiên âm quốc tế IPA.
   - So khớp ma trận xác suất âm vị (Phoneme Confidence Matrix) và trực quan hóa qua 3 màu chuẩn ELSA:
     * 🟢 **Xanh lá (Điểm ≥ 80%):** Phát âm chuẩn xác ngữ âm bản xứ.
     * 🟡 **Vàng (50% ≤ Điểm < 80%):** Tạm chấp nhận, phát âm gần chuẩn nhưng chưa tròn vành rõ chữ.
     * 🔴 **Đỏ (Điểm < 50%):** Phát âm sai hoặc nuốt âm/thiếu âm (đặc biệt âm cuối /s/, /t/, /d/, /ed/ và các âm khó /θ/, /ʃ/, /tʃ/).
4. **Mô hình Khẩu hình Miệng Trực quan (Mouth Articulation & Tongue Placement Guide):**
   - Khi học viên đọc sai âm đỏ, hệ thống hiển thị ảnh cắt giải phẫu vòm miệng 2D/3D: hướng dẫn chi tiết vị trí đặt đầu lưỡi (chạm răng trên, tụt sâu vòm họng), độ khép mở của môi và kỹ thuật đẩy luồng hơi để sửa đúng.
5. **Phân tích Trọng âm từ & Đường cong Ngữ điệu câu (Stress & F0 Pitch Contour Tracking):**
   - Trích xuất tần số cơ bản dao động thanh quản $F_0$ (Fundamental Frequency) để vẽ biểu đồ đường cong ngữ điệu câu (Pitch Contour).
   - So sánh trực tiếp với đường cong cao độ của người bản xứ: hướng dẫn lên giọng ở câu hỏi nghi vấn Yes/No, hạ giọng ở câu trần thuật, và ngắt nghỉ tự nhiên theo cụm nghĩa (Sense Groups).
6. **Từ điển phát âm tương tác tích hợp Micro chấm điểm tại chỗ (Interactive Pronunciation Dictionary with Instant Recording):**
   - Popover Cambridge không chỉ hiển thị nghĩa và audio mẫu mà tích hợp trực tiếp widget Micro thu âm đối chiếu tại chỗ: Học viên đọc thử từ vựng vừa tra → AI so khớp phổ âm và chấm điểm % phát âm tức thì trước khi bấm lưu vào Flashcard SM-2.
7. **Luyện phân biệt Cặp âm tối thiểu & Phân tích Formant Âm học (Minimal Pairs Drill & Formant Acoustic Analysis):**
   - Tập trung vào các cặp âm người Việt hay nhầm lẫn kinh điển: */ɪ/ vs /iː/* (ship vs sheep, fit vs feet), */æ/ vs /e/* (bad vs bed, man vs men), */b/ vs /p/*, */θ/ vs /s/*.
   - **Mô hình Phân tích Âm học Formant ($F_1 - F_2$ Euclidean Distance):** AI trích xuất tần số cộng hưởng Formant thứ nhất ($F_1$ - độ mở của hàm) và thứ hai ($F_2$ - vị trí trước/sau của lưỡi) để định vị nguyên âm trong không gian âm học (Vowel Space), tính toán khoảng cách Euclidean để xác định học viên đã tạo ra sự phân biệt rõ ràng giữa 2 âm tương phản hay chưa.
   - **2 Hình thức luyện tập:** (a) *Perception Drill (Nghe - Chọn):* Nghe audio phát âm và chọn đúng từ trong cặp; (b) *Production Drill (Đọc - Đối chiếu):* Học viên đọc lần lượt cả 2 từ để AI chấm điểm độ phân tách âm học.
8. **Trực quan hóa Nối âm, Biến âm & Nuốt âm (Connected Speech Visualizer):**
   - Giải quyết triệt để vấn đề nói giật cục từng từ ("rô-bốt") và khắc phục bẫy nghe nói nhanh trong các bài thi TOEIC Listening Part 3/4 và VSTEP:
     * **Nối phụ âm sang nguyên âm (Consonant-to-Vowel linking):** Vẽ cung nối âm trực quan giữa các từ liền kề (ví dụ: *pick_it_up* → *pi-ki-tup*).
     * **Nối nguyên âm sang nguyên âm (Intrusive Glides):** Chèn bán âm lướt nhẹ /j/ hoặc /w/ (ví dụ: *go_out* → *go-w-out*).
     * **Quy tắc Nuốt âm (Elision) & Biến âm (Assimilation):** Hiển thị ký hiệu gạch mờ các âm bị nuốt (ví dụ: *next door* → *nex-door*, *want to* → *wanna*).
9. **Trình Tự tạo Bài học Phát âm Cá nhân hóa từ Văn bản Tự do (Custom Study Sets & Dynamic Audio Synthesis):**
   - Cho phép học viên chuẩn bị bài thuyết trình, phỏng vấn hoặc danh sách từ vựng chuyên ngành bằng cách dán (paste) đoạn văn bản bất kỳ:
     * **Sentence Tokenization & Phonetic Transcription:** Hệ thống tự động phân tách câu, tra cứu từ điển CMU / IPA để gán phiên âm chuẩn cho từng từ.
     * **Neural TTS Synthesis:** Tự động tạo giọng đọc bản xứ mẫu cho từng câu.
     * **Dynamic Interactive Practice:** Tự động sinh giao diện luyện phát âm, đọc mẫu, thu âm và chấm điểm chi tiết 3 màu từng câu theo nội dung người học yêu cầu.
10. **Teacher Video Studio, Head Teacher Review & Admin Moderation:** Giáo viên upload video/phụ đề, Trưởng bộ môn thẩm định tính chính xác chuyên môn, Admin quản lý hạ tầng và phát hành.

---

### 3.4. Kiến trúc Đàm thoại 2 Chiều với Trí tuệ Nhân tạo (Voice-to-Voice AI, Roleplay & Study Co-pilot)

#### A. Quy trình Luồng âm thanh Thời gian thực (Voice-to-Voice Realtime Pipeline):
```
[ Micro Học viên ]
       │ (Audio Stream)
       ▼
[ 1. Web Audio API & VAD ] ──► (Phát hiện khoảng lặng 1.2s để tự động kích hoạt lượt nói của AI)
       │ (Audio Buffer)
       ▼
[ 2. Speech-to-Text (STT) ] ──► (Web Speech API / Whisper STT: Chuyển giọng nói thành văn bản)
       │ (User Transcript)
       ▼
[ 3. Conversational LLM ] ──► (Gemini / GPT đóng vai Giám khảo VSTEP & Luyện đàm thoại nhập vai Roleplay)
       │ (Sinh phản hồi tự nhiên & đặt câu hỏi tiếp nối Follow-up)
       ▼
[ 4. Text-to-Speech (TTS) ] ──► (Edge TTS / Cloud TTS: Tổng hợp giọng đọc bản xứ tự nhiên)
       │ (Audio Output)
       ▼
[ Loa / Tai nghe Học viên ] ◄── (Độ trễ thấp < 800ms)
```

#### B. Báo cáo Chẩn đoán Năng lực Nói sau Hội thoại (AI Speaking Rubric Diagnostic):
Kết thúc phiên luyện nói, AI tự động xuất bảng đánh giá đa chiều chuẩn 4 tiêu chí Bộ GD&ĐT / CEFR:
* **Fluency & Coherence:** Tốc độ nói WPM (Words Per Minute), đếm từ đệm ngập ngừng ("uhm", "ah").
* **Grammatical Accuracy:** Bắt lỗi sai thì, sai chia động từ, trật tự từ và đề xuất câu sửa mẫu chuẩn xác.
* **Lexical Resource:** Thống kê tỷ lệ từ vựng A1-A2 vs B1-B2-C1, gợi ý các cụm từ (Collocations / Idioms) nâng band điểm.
* **Pronunciation & Intonation:** Chấm điểm % độ chuẩn bản xứ (Native-speaker Score), bóc tách âm vị lỗi theo IPA, phân tích trọng âm và đường cong ngữ điệu; nút nghe lại âm mẫu.

#### C. Chế độ Luyện Đối thoại Nhập vai Tình huống Doanh nghiệp & Đời sống (Conversational Roleplay Simulator):
Bên cạnh bài thi Nói VSTEP, hệ thống tích hợp thư viện kịch bản đối thoại thực tế chuẩn TOEIC Speaking:
* **Phỏng vấn tuyển dụng (Job Interview):** Trả lời câu hỏi của nhà tuyển dụng về kinh nghiệm, thế mạnh, xử lý tình huống.
* **Chăm sóc khách hàng & Xử lý khiếu nại (Customer Service & Complaint Handling):** Giải quyết yêu cầu hoàn tiền, giao hàng trễ, đổi trả sản phẩm.
* **Đàm phán & Họp nội bộ (Business Meeting & Negotiation):** Thảo luận tiến độ dự án, báo cáo số liệu quý với cấp trên.
AI tương tác phản hồi tự nhiên dựa trên ngữ cảnh và cung cấp bảng tổng kết: gợi ý cách diễn đạt chuyên nghiệp hơn (Professional Tone) và sửa lỗi ngữ pháp.

#### D. Trợ lý Gia sư Đồng hành 24/7 (AI Study Co-pilot Chatbot):
* **Nút "Hỏi AI Orbi" ngữ cảnh:** Bấm tại bất kỳ câu hỏi nào làm sai → AI phân tích tại sao phương án chọn bị sai, phương án đúng chuẩn ngữ pháp thế nào, bẫy thường gặp của ETS là gì.
* **Khung Chatbot trao đổi 2 chiều:** Học viên có thể tự do đặt câu hỏi ngữ pháp hoặc từ vựng mở để AI giải đáp tức thì 24/7.

---

## IV. CÁC TÍNH NĂNG NÂNG CẤP ĐỘT PHÁ (INNOVATIVE ENHANCEMENTS)

### 4.1. Cơ chế Tạo Động lực & Duy trì Thói quen Tự học (Learning Motivation & Habit Retention Engine)
* **Chỉ số Chuyên cần Hàng ngày (Study Consistency Index):** Ứng dụng thuyết tâm lý học hành vi (Fogg Behavior Model) để theo dõi tính liên tục tự học; tính năng "Bảo lưu chuyên cần (Consistency Shield)" hỗ trợ khi có sự cố đột xuất.
* **Thực hành Nhóm Cùng tiến (Peer Learning & Timed Drill):** Luyện tập nhóm theo cặp cùng bạn học giải 10 câu trắc nghiệm dưới áp lực thời gian thực qua WebSockets nhằm rèn phản xạ tư duy nhanh như trong kỳ thi thật; đối chiếu bảng phân tích phương pháp giải sau bài làm.
* **Điểm Nỗ lực Học tập & Huy hiệu Cột mốc:** Ghi nhận sự tiến bộ khi hoàn thành bài test, tra từ điển, luyện phát âm qua các mốc học thuật: *Master of Tenses, 7-Day Dedicated Learner, TOEIC 750 Milestone*.
* **Bảng Vinh danh Học thuật (Academic Honor Roll):** Biểu dương Top học viên có thời lượng tự học tích cực và mức độ tiến bộ vượt bậc nhất tuần trong lớp.

### 4.2. Chế độ Luyện tập chuyên sâu: Nghe chép chính tả & Luyện điểm yếu
* **Dictation Mode:** Nghe từng câu ngắn và gõ lại chính xác từng ký tự, tự động sửa lỗi chính tả.
* **Weak-point Drills:** Tự động gom 10 câu hỏi thuộc Top lỗi hay sai nhất trong Sổ tay lỗi để luyện cấp tốc.

### 4.3. Trung tâm Xuất Báo cáo: PDF Sổ tay Lỗi sai & Chứng chỉ số QR
* **Xuất PDF Sổ tay Lỗi sai:** Đóng gói toàn bộ các câu làm sai kèm lời giải thích thành file PDF để in ra giấy.
* **Chứng chỉ điện tử (Digital Certificate):** Cấp giấy chứng nhận hoàn thành lộ trình có mã QR xác thực kết quả trực tuyến.

### 4.4. Đột phá Trải nghiệm Đa vai trò & Phân tích Học thuật Nâng cao
* **Khảo sát Nhanh Năng lực 5 Phút (Micro-CAT Diagnostic Test):** Bài test thích ứng 5 câu không cần đăng nhập cho Khách, trả ngay biểu đồ radar năng lực tức thời chỉ rõ điểm mạnh và điểm yếu.
* **Công nghệ Bắt lỗi Âm vị & Khẩu hình Trực quan Chuẩn ELSA:** Soi lỗi từng âm vị IPA, hiển thị 3 màu Xanh - Vàng - Đỏ, mô phỏng khẩu hình đặt lưỡi/môi và biểu đồ ngữ điệu câu F0.
* **Luyện Cặp Âm Tối Thiểu (Minimal Pairs Drill) & Trực Quan Hóa Nối Âm (Connected Speech):** Ứng dụng phân tích Formant ($F_1 - F_2$) đo độ phân tách âm học các cặp từ dễ nhầm lẫn (*ship vs sheep, bad vs bed*) và vẽ cung nối âm, nuốt âm (*pick it up → pi-ki-tup*) giúp người học giao tiếp tự nhiên và giải quyết triệt để bẫy nghe nhanh trong TOEIC/VSTEP.
* **Trình Tự Tạo Bài Học Phát Âm Từ Văn Bản Tự Do (Custom Study Sets):** Cho phép người học dán kịch bản thuyết trình, phỏng vấn hoặc tài liệu chuyên ngành bất kỳ → AI tách câu, đọc mẫu giọng bản xứ và chuyển thành bài luyện phát âm chấm điểm từng câu.
* **Phòng Luyện Đàm thoại Nhập vai Tình huống Doanh nghiệp (Roleplay Simulator):** AI nhập vai nhà tuyển dụng, khách hàng, đối tác để rèn phản xạ giao tiếp công sở chuẩn TOEIC Speaking.
* **AI Speaking Partner (Giám khảo Ảo VSTEP):** AI đối thoại giọng nói tự nhiên hỏi từng câu thi Nói VSTEP → Học viên trả lời qua Mic → AI hỏi câu tiếp theo theo ngữ cảnh hội thoại.
* **Hệ thống Cảnh báo Sớm Học sinh Nguy cơ Trượt (At-Risk Early Warning):** Giáo viên nhận cờ đỏ cảnh báo học sinh có tỷ lệ sai >60% hoặc đứt nhịp chuyên cần 5 ngày → 1-click gửi gói bài tập phụ đạo cấp tốc.
* **Bản đồ Nhiệt Lỗ hổng Toàn trường (Institutional Weakness Heatmap):** Trưởng bộ môn tổng hợp dữ liệu từ tất cả các lớp, xem biểu đồ nhiệt phân bố điểm yếu ngữ pháp toàn trường để tổ chức chuyên đề phụ đạo tập trung.
* **Chỉ số Ổn định Chấm điểm của Giảng viên (Grading Consistency Index):** Thống kê độ lệch điểm chấm tự luận giữa các giáo viên để chuẩn hóa chất lượng đánh giá theo barem Bộ GD&ĐT.
* **Trung tâm Tiếp nhận & Xử lý Báo lỗi Câu hỏi (Question Flagging Hub):** Tiếp nhận ticket báo lỗi từ cộng đồng người học, phối hợp với Trưởng bộ môn sửa lỗi và thưởng điểm đóng góp học thuật.

### 4.5. Phân Định Quyền Lợi & Mô Hình Thương Mại
Toàn bộ ma trận phân tầng quyền lợi người dùng (*Free Learner vs. Khóa học vs. VIP Pro*), quy định miễn phí 100% kho đề thi thử công khai, chính sách khóa cứng tính năng video cá nhân cho gói Premium và sơ đồ luồng kiểm soát truy cập 3 tầng được quy định tập trung, độc lập tại **[Mục VIII: Chiến lược Mô hình Thương mại & Phân tầng Gói dịch vụ](#viii-chiến-lược-mô-hình-thương-mại-gói-dịch-vụ--bảo-vệ-doanh-thu-commercialization--subscription-model)** nhằm đảm bảo tính mạch lạc và thuần túy học thuật của Mục IV.

---

## V. ĐẶC TẢ CƠ SỞ DỮ LIỆU CỐT LÕI (30 MODELS MAPPING)

> *Bản tóm tắt định hướng. Đặc tả đầy đủ 59 bảng xem tại **Mục X**.*

1. **Tài khoản, Phân quyền 5 cấp & Hồ sơ năng lực:** `User` (lưu `streakCount`, `xp`, `lastStudyAt`, enum `Role`: `STUDENT, TEACHER, HEAD_TEACHER, ADMIN`), `UserProfile`, `RefreshToken`, `AuditLog`.
2. **Khảo sát, Lộ trình & Chuyên cần:** `LearningGoal`, `LearningSchedule`, `LearningPath`, `LearningPathItem`.
3. **Kho tri thức & Video Studio:** `Passage`, `Question`, `Course`, `CourseSection`, `Lesson` (lưu Video URL, JSON Transcript kèm timestamp, cờ `isAcademicallyApproved`, `reviewedById`, `isPublic`), `LessonProgress`.
4. **Từ vựng & Ngữ pháp SRS:** `VocabularyTopic`, `VocabularyEntry`, `UserVocabulary`, `VocabularyReviewLog`, `GrammarTopic`, `GrammarLesson`.
5. **Phòng thi & Đánh giá năng lực:** `MockTest` (do Trưởng bộ môn thẩm định), `MockTestSection`, `MockTestQuestion`, `ExamAttempt` (lưu snapshot, điểm ETS/VSTEP, năng lực θ).
6. **Sổ tay lỗi & Phân hệ Lớp học:** `MistakeNotebook`, `ReviewSchedule`, `Class`, `ClassMember`, `Assignment`, `AssignmentSubmission` (hỗ trợ lưu điểm chấm của giáo viên và điểm phúc khảo của Trưởng bộ môn).
7. **Gói Thành viên & Cổng Thanh toán:** `SubscriptionPlan`, `UserSubscription`, `PaymentTransaction` (Quản lý các gói Free, VIP TOEIC 90 ngày, VSTEP Master 180 ngày, trạng thái kích hoạt, thời hạn hiệu lực, kiểm soát phân quyền tính năng Feature Gating và nhật ký giao dịch thanh toán trực tuyến).

---

## VI. KẾ HOẠCH PHÂN RÃ CÔNG VIỆC 16 TUẦN (SPRINT BACKLOG)

### SPRINT 1 & 2 (Tuần 1 – 4): Khởi tạo Monorepo, Database & Authentication 5 Cấp
* **Frontend:** Khởi tạo Monorepo, cấu hình Tailwind CSS, Router, UI Auth, Giao diện Content Studio thêm bài đọc Passage, video và câu hỏi con.
* **Backend:** Khởi tạo Backend (Node.js/Prisma hoặc Spring Boot JPA), kết nối PostgreSQL, phân quyền RBAC 5 cấp bậc (`STUDENT, TEACHER, HEAD_TEACHER, ADMIN`), API CRUD câu hỏi, bài đọc và video bài giảng.
* **Database & Data:** Chạy migration 30 bảng, seed 300 câu hỏi trắc nghiệm kèm tham số độ khó b.

### SPRINT 3 & 4 (Tuần 5 – 8): Onboarding, ExamRunner & Video Studio Đa vai trò
* **Frontend:** 
  - Flow Onboarding 4 bước, Màn hình thi Focus Mode (đồng hồ đếm ngược, audio chống tua).
  - **Micro-CAT Diagnostic Test (Khách):** Khảo sát năng lực nhanh 5 câu không cần đăng nhập, trả kết quả radar ngay lập tức.
  - **Teacher Video Studio:** Upload video/YouTube, upload phụ đề SRT/VTT, gắn thẻ ngữ pháp và giao bài cho lớp.
  - **Head Teacher Academic Review:** Màn hình duyệt học liệu chuyên môn của Trưởng bộ môn, thẩm định tham số độ khó câu hỏi.
  - **Admin Moderation & Media:** Quản lý dung lượng lưu trữ media server, cấu hình Public/Private.
  - **Student Smart Video Player UI:** Phát video đồng bộ Transcript theo thời gian thực.
  - **Tính năng A-B Toggle Looping & AI Shadowing:** Bấm số lần lẻ = lặp lại đoạn thoại để luyện nghe; bấm số lần chẵn = tiếp tục phát; tích hợp AI chấm điểm phát âm từ micro.
  - **Cambridge Dictionary Popover & Cache Service:** Tra từ 1-chạm (IPA, audio, nghĩa, ví dụ) và lưu cache CSDL để tối ưu tốc độ.
  - **Guest Video Demo:** Mở 1 video mẫu tương tác trên trang chủ cho khách trải nghiệm thử để tăng tỷ lệ đăng ký.
  - Sổ tay lỗi sai (Mistake Notebook UI).
* **Backend:** 
  - API nộp bài thi, Auto-save snapshot bài làm mỗi 15 giây, Service chấm điểm tự động TOEIC/VSTEP.
  - API quản lý Script video, timestamp và ghi nhận từ vựng tra mới vào `UserVocabulary`.
  - Service bóc tách câu sai vào `MistakeNotebook`.

### SPRINT 5 & 6 (Tuần 9 – 12): Thuật toán Adaptive CAT (IRT), Dictation & Động lực Học tập
* **Frontend:** Giao diện thi thích ứng, Giao diện Lộ trình của tôi, Dictation Mode, Motivation UI (Chỉ số Chuyên cần, Điểm nỗ lực, Thực hành nhóm cùng tiến, Bảng vinh danh), AI Speaking Partner VSTEP Speaking, Bàn chấm bài cho Giáo viên (kèm cảnh báo At-Risk) và màn hình phúc khảo của Trưởng bộ môn.
* **Backend:** Lập trình Adaptive Engine (tính 2PL IRT, hàm thông tin Fisher, chọn câu hỏi/testlet, cập nhật θ̂), Lập trình thuật toán SM-2 nhắc ôn tập câu sai và từ vựng theo chu kỳ, Service tính Chỉ số Chuyên cần & Điểm nỗ lực, WebSocket Thực hành nhóm cùng tiến, API chấm bài tự luận Writing & Speaking và quy trình phúc khảo.

### SPRINT 7 & 8 (Tuần 13 – 16): Dashboard Analytics, Export PDF, Docker & Nghiệm thu
* **Frontend:** Analytics Dashboard (Radar Chart năng lực, Line Chart tiến độ điểm qua các bài test), Institutional Weakness Heatmap toàn trường cho Trưởng bộ môn, Dashboard phân tích cụm lỗi sai, dung lượng server và mức độ chuyên cần xem video cho giáo viên/trưởng bộ môn/admin.
* **Backend & DevOps:** 
  - Service xuất PDF Sổ tay lỗi sai, cấp Chứng chỉ số QR.
  - **Subscription & Payment Gateway:** Tích hợp cổng thanh toán trực tuyến (VNPay/MoMo), Webhook tự động kích hoạt gói Premium và kiểm soát quyền truy cập tài nguyên (Feature Gating Middleware).
  - Viết Dockerfile, `docker-compose.yml`, tối ưu hóa index truy vấn CSDL.
* **Thực nghiệm & Báo cáo:** Chạy kịch bản mô phỏng kiểm chứng độ hội tụ của thuật toán CAT, hoàn thiện báo cáo và slide bảo vệ đồ án.

---

## VII. BỘ 7 CÂU HỎI BẢO VỆ HỘI ĐỒNG PHẢN BIỆN CHẮC CHẮN SẼ HỎI

1. **"Tại sao gọi là 'Thi thích ứng' mà không phải là thi trắc nghiệm thông thường?"**  
   * *Trả lời:* Đề thi truyền thống là đề cố định cho mọi thí sinh. Hệ thống áp dụng lý thuyết **IRT (Item Response Theory)**: Sau mỗi câu trả lời, thuật toán lập tức tái ước lượng năng lực tức thời θ và dùng hàm thông tin Fisher để chọn câu hỏi kế tiếp vừa vặn với trình độ của thí sinh. Thí sinh làm đúng gặp câu khó hơn, làm sai gặp câu dễ hơn, giúp giảm 50% thời gian thi mà độ chính xác đo lường vẫn tương đương.

2. **"Các câu hỏi TOEIC Part 3, 4, 7 có bài đọc/audio chung, em xử lý thi thích ứng ra sao?"**  
   * *Trả lời:* Thuật toán chọn câu hỏi theo **Testlet (Cụm câu hỏi)**. Hệ thống tính tổng thông tin Fisher tích lũy của cả bài đọc: **I_Passage(θ) = ∑ I_child(θ)** và chọn bài đọc có thông tin lớn nhất. Điều này bảo toàn ngữ cảnh bài thi mà không làm xé lẻ câu hỏi.

3. **"Vai trò của Giáo viên Cấp cao / Trưởng bộ môn khác gì so với Giáo viên thường và Admin?"**  
   * *Trả lời:* Trong mô hình vận hành của trường học, **Giáo viên thường** chỉ quản lý lớp học và tạo nội dung của lớp mình. **Giáo viên Cấp cao (Trưởng bộ môn)** đóng vai trò là 'Người gác cổng chuyên môn' (Academic Gatekeeper): thẩm định tính chính xác của đề thi, phê duyệt video bài giảng trước khi phát hành toàn trường, hiệu chuẩn tham số độ khó IRT, và xử lý các khiếu nại phúc khảo bài chấm tự luận VSTEP. Còn **Admin** thuần túy là quản trị viên kỹ thuật hạ tầng (server, bảo mật, phân quyền tài khoản, thanh toán) mà không can thiệp sâu vào chuyên môn học thuật tiếng Anh.

4. **"Làm sao em có được tham số độ khó ban đầu (b) và độ phân biệt (a) của câu hỏi?"**  
   * *Trả lời:* Ban đầu em dùng **Heuristic Calibration** (ánh xạ từ thang điểm chuẩn của ETS và CEFR sang thang logit từ -3.0 đến +3.0). Khi hệ thống thu thập đủ dữ liệu thực tế (>200 lượt làm), hệ thống sẽ chạy thuật toán **MML (Marginal Maximum Likelihood)** để chuẩn hóa lại tham số chính xác theo dữ liệu thực tế dưới sự giám sát của Trưởng bộ môn.

5. **"Sổ tay lỗi sai có gì vượt trội so với việc chỉ lưu lại lịch sử làm bài?"**  
   * *Trả lời:* Hệ thống gắn liền lỗi sai với **Cây phân loại nguyên nhân** (Ngữ pháp, Từ vựng, Bẫy nghe) và kích hoạt thuật toán **Lặp lại ngắt quãng SuperMemo SM-2**. Lỗi sai sẽ tự động được lên lịch nhắc nhở ôn lại sau 1 ngày, 3 ngày, 7 ngày, 16 ngày để triệt tiêu lỗ hổng kiến thức trước khi não bộ quên lãng. Học viên có thể xuất Sổ tay lỗi này ra bản in PDF tiện lợi.

6. **"Phần VSTEP Speaking và Writing chấm điểm như thế nào?"**  
   * *Trả lời:* Hai kỹ năng này mang tính chủ quan nên không đưa vào vòng lặp chọn câu CAT. Thay vào đó, hệ thống cung cấp **Grading Studio** cho Giảng viên chấm điểm theo Barem 4 tiêu chuẩn của Bộ GD&ĐT, đồng thời tích hợp API LLM (Gemini/OpenAI) và công nghệ nhận diện giọng nói AI để hỗ trợ chấm nháp và phát hiện lỗi ngữ pháp tự động cho người học khi tự ôn tập. Nếu có khiếu nại, Trưởng bộ môn sẽ là người chấm phúc khảo.

7. **"Nếu thí sinh đang thi thích ứng mà bị rớt mạng thì sao?"**  
   * *Trả lời:* Hệ thống có cơ chế **Auto-snapshot** định kỳ 15 giây lưu trạng thái bài làm xuống cơ sở dữ liệu. Mọi câu hỏi đã làm và năng lực θ hiện thời đều được gắn với `ExamAttempt` trên máy chủ. Khi vào lại, thí sinh sẽ được khôi phục đúng câu hỏi đang làm dở mà không bị mất tiến trình.

---

## VIII. CHIẾN LƯỢC MÔ HÌNH THƯƠNG MẠI, GÓI DỊCH VỤ & BẢO VỆ DOANH THU (COMMERCIALIZATION & SUBSCRIPTION MODEL)

Hệ thống triển khai chiến lược kinh doanh đa tầng kết hợp giữa **Tài nguyên Giáo dục Mở (Open Educational Resources - OER)** để thu hút người học tự nhiên (mô hình Study4, Zenlish) và **Mô hình Thuê bao Cao cấp (SaaS Freemium)** để bảo vệ nguồn thu và tối ưu hóa chi phí vận hành máy chủ:

### 8.1. Bảng Ma trận Phân tầng Chi tiết Quyền lợi & Học liệu

| Phân Tầng Dịch vụ & Gói Cước | Quyền lợi Người dùng & Phạm vi Học liệu (Front-facing / User Experience) | Cơ chế Kiểm soát Hệ thống & Ánh xạ CSDL (Backend Logic & Database Mapping) |
| :--- | :--- | :--- |
| **1. Trải nghiệm Công khai Miễn phí (Public Free Tier)<br>*(Mô hình Study4 / Zenlish)*** | • **Kho Đề thi Thử Công khai (Public Mock Tests):** Luyện thi Full Test (bấm giờ thật) và Practice từng Part chuẩn ETS TOEIC (Part 1–7) và VSTEP hoàn toàn **MIỄN PHÍ 100% & KHÔNG GIỚI HẠN**.<br>• Hệ thống chấm điểm tự động, xem đáp án đúng/sai và lời giải thích cơ bản.<br>• Trải nghiệm Động cơ thi thích ứng CAT: Tối đa 3 bài test/tuần (15 câu/bài).<br>• Trải nghiệm AI Speaking Partner cơ bản: 1 phiên/ngày (tối đa 3 phút) với chủ đề VSTEP Part 1.<br>• Xem toàn bộ Video bài giảng mở công khai (Public Lessons); Tra từ điển Cambridge 1 chạm (tối đa 50 từ/ngày).<br>• Luyện thử 3 cặp Minimal Pairs cơ bản/ngày; Tạo tối đa 1 bộ Custom Study Set/tuần (dưới 3 câu).<br>• Ghép cặp giải đề Peer Learning cùng bạn học: tối đa 2 lượt/ngày.<br>• Sổ tay lỗi sai: Lưu tối đa 30 câu làm sai gần nhất trên web.<br>• Nhận chứng nhận hoàn thành khóa học online (không có mã QR xác thực).<br>• **Rào cản Paywall (Giới hạn Free):**<br>&nbsp;&nbsp;+ **Khóa cứng 100%** tính năng Tự tải video MP4 / dán link YouTube ngoài vào học.<br>&nbsp;&nbsp;+ Không hỗ trợ xuất file in ấn PDF Sổ tay lỗi sai.<br>&nbsp;&nbsp;+ Giới hạn tối đa 5 lượt hỏi Trợ lý AI Orbi/ngày (từ câu thứ 6 chỉ xem giải thích tĩnh). | • Khởi tạo bản ghi mặc định: `UserSubscription` (`plan_id = 'FREE'`, `status = 'ACTIVE'`, `expires_at = null`).<br>• Kiểm soát hạn mức hàng ngày bằng Redis In-memory Counters:<br>&nbsp;&nbsp;+ `ratelimit:ai_speaking:{userId}:{date}` (Max: 1).<br>&nbsp;&nbsp;+ `ratelimit:ai_copilot:{userId}:{date}` (Max: 5).<br>&nbsp;&nbsp;+ `ratelimit:dictionary:{userId}:{date}` (Max: 50).<br>• Middleware `FeatureGateMiddleware` chặn các API Premium:<br>&nbsp;&nbsp;+ Chặn API bóc tách video cá nhân (`POST /api/video/custom-import` $\rightarrow$ Trả về `403 Forbidden` kèm payload mở Paywall Modal).<br>&nbsp;&nbsp;+ Chặn API xuất file PDF (`POST /api/mistakes/export-pdf`).<br>• Băng thông hàng đợi AI ở mức tiêu chuẩn. |
| **2. Gói Khóa Học Chuyên Sâu (Course-Exclusive Content)<br>*(Do Giáo viên / Bộ môn biên soạn)*** | • **Độc quyền tiếp cận Kho Đề thi Riêng của Khóa học:** Làm các bộ đề ôn luyện chuyên sâu, đề dự đoán bám sát bài giảng do chính Giáo viên phụ trách biên soạn và tải lên.<br>• Xem toàn bộ chuỗi Video Masterclass & Bài giảng chuyên đề độc quyền thuộc lộ trình khóa học.<br>• **Bàn Chấm bài & Nhận xét Trực tiếp từ Giáo viên:** Được giáo viên chấm bài tự luận VSTEP Writing và gửi nhận xét bằng giọng nói (Voice Note Feedback) sửa lỗi chi tiết.<br>• **Tham gia Phòng thi Trực tuyến Có giám sát (Live Proctored Classroom Exam):** Làm bài thi chung cùng cả lớp theo thời gian thực có giáo viên coi thi.<br>• *Quy định truy cập:* Quyền lợi gắn liền theo từng Khóa học (`Course`) cụ thể mà học viên đã ghi danh, độc lập với gói Premium toàn hệ thống. | • Xác thực quyền truy cập thông qua bảng `CourseEnrollment` (`user_id`, `course_id`, `status = 'ACTIVE'`, `enrolled_at`).<br>• Nếu chưa mua khóa học: Endpoint API trả về `402 Payment Required` và tự động điều hướng sang trang giới thiệu khóa học (`Course Landing Page`).<br>• Cho phép truy vấn học liệu được gắn thẻ khóa học: `Question.course_id`, `Lesson.course_id`, `Assignment.class_id`.<br>• Lưu trữ bài làm và nhận xét của giáo viên trong `AssignmentSubmission` và `TeacherVoiceFeedback`. |
| **3. Gói Thành Viên Nâng Cấp Toàn Diện (Premium / VIP Pro Subscription)<br>*(Mở khóa Toàn bộ Siêu Trí tuệ AI)*** | • **Động cơ Thi Thích ứng AI (CAT Engine) Không Giới Hạn:** Làm bài test thích ứng 2PL IRT không giới hạn số lượt, thuật toán liên tục hiệu chuẩn năng lực $\theta$ (-3.0 đến +3.0) chuẩn xác tuyệt đối.<br>• **AI Speaking Partner & Roleplay Đàm Thoại Doanh Nghiệp Không Giới Hạn:** Đối thoại giọng nói 2 chiều với Giám khảo ảo VSTEP Part 1-2-3 và toàn bộ kịch bản nhập vai tình huống công sở chuẩn TOEIC Speaking; xuất báo cáo Rubric 4 tiêu chí CEFR.<br>• **Công nghệ Bắt lỗi Âm vị & Khẩu hình 3D Chuẩn ELSA:** Mở khóa toàn bộ phân tích âm vị IPA 3 màu, hướng dẫn giải phẫu vòm miệng răng/môi/lưỡi 2D/3D và biểu đồ ngữ điệu F0.<br>• **Mở khóa Toàn bộ Kho Luyện Âm Chuyên Sâu:** Toàn quyền luyện Kho Cặp âm tối thiểu (Minimal Pairs Drill) và Trực quan hóa Nối âm/Nuốt âm (Connected Speech Visualizer).<br>• **ĐẶC QUYỀN KHÓA CỨNG: Tự tạo Bài học từ Video cá nhân / Link YouTube ngoài:** Toàn quyền dán link YouTube/TED Talk hoặc tải video MP4 cá nhân (dưới 100MB) để AI tự bóc tách phụ đề song ngữ và biến thành bài học cá nhân không giới hạn!<br>• **Tự tạo Custom Study Sets không giới hạn:** Dán kịch bản thuyết trình/phỏng vấn bất kỳ để AI tự sinh bài luyện phát âm từng câu.<br>• **Trợ lý Gia sư AI Orbi 24/7 Không Giới Hạn:** Hỏi đáp cặn kẽ bẫy đề thi và phân tích ngữ pháp không giới hạn số lượt.<br>• **Sổ tay Lỗi sai SM-2 & Xuất Bản in PDF:** Lưu trữ lịch sử câu sai không giới hạn, thuật toán SM-2 nhắc ôn tập định kỳ, 1-Click Xuất PDF Sổ tay Lỗi sai đóng gói đẹp mắt để in ra giấy.<br>• **Chứng chỉ số QR & Nhận diện VIP:** Cấp Chứng chỉ số có mã QR xác thực kết quả trực tuyến cho hồ sơ/CV; Ưu tiên băng thông hàng đợi AI siêu tốc (< 500ms); Huy hiệu **VIP Pro** mạ vàng. | • Bản ghi `UserSubscription`: `plan_id` (`VIP_30D`, `VIP_90D`, `VIP_365D`), `status = 'ACTIVE'`, `start_at`, `expires_at`, `auto_renew = true/false`.<br>• Cờ phân quyền tính năng `FeatureGate`: `can_upload_custom_video = true`, `can_export_pdf = true`, `can_issue_qr_cert = true`.<br>• Miễn trừ toàn bộ Rate Limiting đối với các API gọi mô hình AI (Whisper, Gemini, TTS).<br>• Lưu nhật ký giao dịch và cổng thanh toán trong `PaymentTransaction` (`amount`, `payment_method`: VNPAY/MoMo/Stripe, `transaction_code`, `status = 'SUCCESS'`).<br>• Job nền (Cronjob) tự động quét mỗi 00:00 hàng ngày: Chuyển `status = 'EXPIRED'` khi quá hạn và gửi Email/Push Notification nhắc gia hạn trước 3 ngày. |
| **4. Gói Bản Quyền Tổ Chức / Trường Học (Institutional / Enterprise B2B)<br>*(Dành cho Khoa / Trường / Trung tâm)*** | • Cấp phát tài khoản VIP Pro hàng loạt cho toàn bộ sinh viên/học viên thuộc đơn vị.<br>• **Dashboard Quản trị Học thuật Cấp cao:** Trưởng bộ môn & Ban giám hiệu xem Bản đồ nhiệt lỗ hổng toàn trường (Institutional Weakness Heatmap), Thống kê độ lệch chuẩn chấm điểm của giáo viên (Grading Consistency Index).<br>• Tổ chức các kỳ thi thử trực tuyến tập trung cấp trường với Live Dashboard giám sát phòng thi chống gian lận.<br>• Tích hợp hệ thống dữ liệu sinh viên (LMS / SSO Integration) theo yêu cầu của nhà trường. | • Bảng CSDL tổ chức: `Institution` (`org_id`, `org_name`, `license_quota`, `contract_expires_at`).<br>• Khóa ngoại `User.institution_id` định danh thành viên thuộc tổ chức.<br>• Endpoint API thống kê dữ liệu tổng hợp cấp trường (Institutional Analytics API). |

---

### 8.2. Quy trình Phân Quyền 3 Tầng Học Liệu & Kích Hoạt Quyền Lợi (Access Control Flowchart)

```
[ Học viên lựa chọn hoạt động học tập trên hệ thống ]
                                │
    ┌───────────────────────────┼───────────────────────────────────────────┐
    ▼                                           ▼                           ▼
[ 1. KHO ĐỀ THI THỬ CÔNG KHAI ]     [ 2. ĐỀ THI RIÊNG KHÓA HỌC ]    [ 3. TÍNH NĂNG CAO CẤP & CÔNG CỤ AI ]
  (Chuẩn TOEIC/VSTEP Study4/Zenlish)     (Do Giáo viên Upload)         (CAT IRT, AI Voice & Phoneme IPA,
                                                                        Minimal Pairs, Connected Speech,
                                                                        Custom Video/Link Import, Roleplay,
                                                                        Hỏi AI Orbi, Xuất PDF, QR)
    │                                           │                           │
    ▼                                           ▼                           ▼
  TẤT CẢ TÀI KHOẢN (KỂ CẢ FREE)     Kiểm tra CourseEnrollment:      Kiểm tra UserSubscription:
  • Làm Full Test / Part test       ├── ĐÃ MUA / CÓ MÃ LỚP:         ├── PREMIUM (Status: ACTIVE):
  • Bấm giờ thật, chấm điểm         │   └──► Cho phép làm bài       │   └──► Sử dụng KHÔNG GIỚI HẠN
  • Xem đáp án & giải thích cơ bản  │                               │
  ==> HOÀN TOÀN MIỄN PHÍ 100%       └── CHƯA MUA KHÓA HỌC:          └── TÀI KHOẢN FREE:
                                        └──► Paywall Khóa học:          ├── Còn hạn mức ngày/tuần:
                                             Chuyển hướng trang             └──► Ghi nhận lượt & Cho dùng
                                             giới thiệu & đăng ký       └── Chạm hạn mức / VIP-only:
                                             khóa học (Enroll Page)         └──► Mở Modal Nâng cấp VIP Pro
```

---

### 8.3. Cơ chế Khóa cứng Đặc quyền VIP & Phòng chống "Xài chùa" (Anti-Abuse & Paywall Strategy)

1. **Khóa cứng tính năng "Tự tạo bài học từ Video/Link ngoài" cho gói Premium:**
   - Người học Free không được cấp quota hàng tuần để tránh tình trạng tạo tài khoản clone "xài chùa trường kỳ" làm cạn kiệt tài nguyên máy chủ và chi phí GPU bóc tách Whisper.
   - Khi người học Free bấm vào tính năng này: Hệ thống hiển thị **Paywall Modal** kèm video demo 15 giây trực quan mô tả khả năng tự sinh phụ đề song ngữ và chấm phát âm để thúc đẩy chuyển đổi mua gói.
2. **Chiến lược Định giá & Chu kỳ Gói cước:**
   - **Gói VIP TOEIC Cấp tốc (30 ngày):** Phù hợp học viên ôn thi nước rút.
   - **Gói VIP VSTEP Master (90 ngày):** Phù hợp học viên ôn thi chuẩn đầu ra đại học B1/B2.
   - **Gói VIP Pro Trọn năm (365 ngày):** Tối ưu chi phí cho sinh viên rèn luyện dài hạn.
3. **Cơ chế Cổng Thanh toán & Kích hoạt Tự động:**
   - Tích hợp cổng thanh toán trực tuyến bảo mật (VNPAY / MoMo / Napas).
   - Cơ chế IPN (Instant Payment Notification) & Webhook đối soát giao dịch thời gian thực: Sau khi thanh toán thành công, hệ thống lập tức cập nhật trạng thái `ACTIVE` trong bảng `UserSubscription` chỉ sau 1 giây mà không cần con người phê duyệt thủ công.

---

## IX. LỘ TRÌNH TRIỂN KHAI TỪ CƠ BẢN ĐẾN NÂNG CAO THEO TỪNG TÍNH NĂNG (FEATURE PROGRESSION ROADMAP)

Để đảm bảo dự án hoàn thành đúng tiến độ, vận hành ổn định và đạt điểm tối đa trước Hội đồng Bảo vệ Đồ án, toàn bộ hệ thống được phân rã thành **3 Cấp độ Trưởng thành Tính năng (3-Tier Maturity Levels)**:
- **Cấp độ 1: Nền tảng Cơ bản (Level 1 - MVP & Baseline Foundation):** Xây dựng luồng dữ liệu chuẩn (CRUD), bảo mật xác thực (Auth), và các tính năng luyện thi/học tập tĩnh. Đảm bảo toàn bộ hệ thống chạy thông suốt, không phát sinh lỗi luồng cơ bản.
- **Cấp độ 2: Trung cấp & Tích hợp Nghiệp vụ Sâu (Level 2 - Interactive & Feature-Complete):** Tích hợp tương tác thời gian thực, thuật toán thích ứng (Adaptive CAT IRT), vòng lặp ôn tập ngắt quãng (SM-2), Video Player đồng bộ phụ đề, phân quyền 5 cấp bậc và bàn chấm bài lớp học.
- **Cấp độ 3: Nâng cao & Trí tuệ Nhân tạo Đột phá (Level 3 - Advanced AI & Production-Grade):** Trí tuệ nhân tạo chuyên sâu (AI Whisper bóc tách video tự động từ link YouTube/MP4, AI Speaking Partner 2 chiều full-duplex, Phân tích âm vị IPA 3 màu & Khẩu hình 3D chuẩn ELSA, F0 pitch contour), Cổng thanh toán trực tuyến tự động (IPN/Webhook), Hard-gating chống lạm dụng tài nguyên, Xuất PDF/Chứng chỉ QR. Đây là "vũ khí ghi điểm tuyệt đối" chứng minh năng lực kỹ thuật công nghệ cao.

---

### 9.1. Bảng Ma trận Lộ trình Tiến hóa Chi tiết Cho 6 Cụm Tính Năng Cốt Lõi

| Cụm Chức năng Cốt lõi | Cấp độ 1: Cơ bản (Baseline / MVP) | Cấp độ 2: Trung cấp (Intermediate) | Cấp độ 3: Nâng cao & Đột phá AI (Advanced) | Tiêu chí Nghiệm thu & Giá trị Học thuật (DoD) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Khảo Thí & Luyện Đề (Exam & Testing Engine)** | • Làm bài thi tĩnh (Full Test & Part Test) chuẩn TOEIC Part 1–7 và VSTEP.<br>• Bộ đếm ngược thời gian làm bài, audio chống tua lùi gian lận.<br>• Tự động chấm điểm thô (Raw Score) và xem đáp án đúng/sai, lời giải thích tĩnh. | • **Động cơ Thi Thích ứng CAT IRT 2PL:** Tự động điều chỉnh độ khó câu hỏi tiếp theo dựa trên năng lực tức thời $\hat{\theta}$.<br>• Thuật toán chọn câu hỏi theo cụm bài đọc (**Testlet Grouping**) đạt thông tin Fisher cực đại.<br>• Cơ chế **Auto-snapshot** lưu tiến trình mỗi 15s khôi phục bài làm khi rớt mạng.<br>• **Micro-CAT:** Bài test chẩn đoán nhanh 5 câu cho Khách vãng lai không cần đăng nhập. | • **Phòng thi Trực tuyến Có giám sát (Live Proctored Classroom Exam):** Giáo viên theo dõi trực tiếp trạng thái làm bài của cả lớp thời gian thực.<br>• Biểu đồ Radar Chart năng lực 4 kỹ năng cập nhật tức thời.<br>• Bàn chấm thi mô phỏng VSTEP Speaking & Writing theo Barem 4 tiêu chuẩn Bộ GD&ĐT. | • Hoàn thành kiểm thử luồng thi CAT 2PL chứng minh $\hat{\theta}$ hội tụ sau 15–20 câu.<br>• Tốc độ truy vấn câu hỏi đạt $< 200\text{ms}$. |
| **2. Không Gian Video & Luyện Phát Âm (Video & Pronunciation)** | • Trình phát video bài giảng HTML5 chuẩn.<br>• Hiển thị Transcript văn bản tĩnh bên dưới video.<br>• Tra cứu từ vựng Cambridge Popover 1 chạm (hiển thị nghĩa tiếng Việt, phiên âm IPA, phát audio phát âm chuẩn). | • **Trình phát Video Thông minh (Smart Video Player):** Transcript chạy song song đồng bộ theo thời gian thực (Interactive Realtime Captions), click vào dòng phụ đề để nhảy video.<br>• Chế độ **A-B Toggle Looping** (bấm số lẻ lặp lại câu thoại để nghe kỹ, bấm số chẵn tiếp tục phát).<br>• Chấm điểm phát âm Shadowing cơ bản (0–100%) so khớp chuỗi âm thanh qua Web Speech API / Whisper STT. | • **Tự động Bóc tách Video Ngoại vi (YouTube & MP4 Upload):** Nhập link YouTube/TED hoặc tải file MP4 $\rightarrow$ AI Whisper tự động bóc tách phụ đề song ngữ và chia câu chuẩn xác.<br>• **Bắt lỗi Âm vị IPA 3 màu (Xanh / Vàng / Đỏ) chuẩn ELSA:** Chỉ rõ từng ký tự phát âm sai trong từ.<br>• **Mô phỏng Khẩu hình 2D/3D & Biểu đồ Ngữ điệu F0 (Pitch Contour):** Hướng dẫn vị trí đặt răng/môi/lưỡi.<br>• Kho luyện **Cặp âm tối thiểu (Minimal Pairs)** & Trực quan hóa **Nối âm/Nuốt âm (Connected Speech)**. | • Video phát mượt mà, phụ đề đồng bộ chuẩn xác sai lệch $< 100\text{ms}$.<br>• Whisper AI bóc tách video 3 phút trong thời gian $< 15\text{s}$. |
| **3. Sổ Tay Lỗi Sai & Lặp Lại Ngắt Quãng (Error Intelligence & SRS)** | • Tự động bóc tách câu trả lời sai sau khi nộp bài thi.<br>• Lưu danh sách câu sai vào CSDL bảng `MistakeNotebook`.<br>• Giao diện xem lại danh sách câu sai kèm đáp án đúng. | • **Cây Phân loại Nguyên nhân Lỗi (Error Taxonomy Tree):** Gắn thẻ nguyên nhân sai (bẫy ngữ pháp, từ vựng mới, bẫy phát âm gây nhiễu).<br>• Tích hợp **Thuật toán Lặp lại Ngắt quãng SuperMemo SM-2**: Tự động tính toán chu kỳ ôn tập tối ưu (sau 1 ngày, 3 ngày, 7 ngày, 14 ngày, 30 ngày) chống đường cong quên lãng Ebbinghaus.<br>• Hệ thống Flashcard từ vựng SRS theo chủ đề. | • **Luyện tập Điểm yếu Cấp tốc (Weak-point Drills):** Tạo đề ôn tập 10 câu bám sát đúng các lỗi sai có tần suất cao nhất của học viên.<br>• **Chế độ Luyện Chép Chính tả (Dictation Mode):** Tự động đục lỗ các từ then chốt theo trình độ.<br>• **1-Click Export Sổ tay Lỗi sai ra PDF:** Xuất bản in PDF đóng gói chuyên nghiệp kèm mã QR tra cứu trực tuyến phục vụ học tập ngoại tuyến. | • Thuật toán SM-2 cập nhật chính xác hệ số Easiness Factor ($EF$) sau mỗi lần đánh giá từ 0–5.<br>• File PDF xuất chuẩn in ấn trang bìa, mục lục, bảng phân tích. |
| **4. Trợ Lý AI & Đàm Thoại 2 Chiều (AI Co-pilot & Speaking Partner)** | • Hộp thoại Hỏi đáp Trợ lý cơ bản (Text QA) giải thích ngữ pháp các câu hỏi trắc nghiệm.<br>• Trả lời dựa trên các mẫu prompt template tĩnh cấu hình sẵn. | • **Trợ lý Gia sư AI Orbi Nhận thức Ngữ cảnh (Context-Aware Co-pilot):** Nhận biết câu hỏi hiện tại, phương án thí sinh đã chọn, phân tích nguyên nhân sai lầm.<br>• Áp dụng phương pháp gợi mở Socrates (đặt câu hỏi dẫn dắt người học tự nhận ra lỗi sai thay vì mớm ngay đáp án). | • **AI Speaking Partner Thời gian thực 2 Chiều (Voice-to-Voice Pipeline):** Đối thoại đàm thoại trực tiếp bằng giọng nói (Audio In $\rightarrow$ Whisper STT $\rightarrow$ LLM Reasoning $\rightarrow$ TTS Streaming Audio Out) với độ trễ $< 800\text{ms}$.<br>• **Nhập vai Doanh nghiệp & VSTEP:** Mô phỏng phòng thi VSTEP Speaking Part 1-2-3 và Phỏng vấn công sở TOEIC Speaking.<br>• Tự động xuất **Báo cáo Rubric 4 Tiêu chuẩn CEFR** (Pronunciation, Grammar, Vocabulary, Fluency). | • Luồng hội thoại giọng nói mượt mà, không gián đoạn, hỗ trợ ngắt lời (Barge-in).<br>• Đánh giá năng lực phát âm chuẩn Barem học thuật quốc tế. |
| **5. Phân Quyền 5 Cấp & Quản Trị Học Thuật (5-Tier RBAC & Governance)** | • Xác thực tài khoản người dùng JWT (Đăng ký, Đăng nhập, Quên mật khẩu).<br>• Phân quyền 2 vai trò cơ bản: `STUDENT` và `ADMIN`.<br>• Trang hồ sơ cá nhân và quản lý tài khoản người dùng. | • **Phân quyền Hoàn chỉnh 5 Cấp bậc:** `GUEST < STUDENT < TEACHER < HEAD_TEACHER < ADMIN`.<br>• **Lớp học & Giáo viên:** Giáo viên tạo lớp học, mời học sinh, giao bài tập (Assignment), bàn chấm bài tự luận Speaking/Writing với Voice Note Feedback (nhận xét bằng ghi âm).<br>• Trải nghiệm **Khách vãng lai (Guest)** với bài thi Micro-CAT và video tương tác mẫu. | • **Cơ chế Kiểm duyệt Chuyên môn Trưởng Bộ Môn (Academic Gatekeeping):** Thẩm định tham số độ khó IRT $b, a$ của ngân hàng câu hỏi trước khi phát hành; phê duyệt video bài giảng toàn trường.<br>• **Thanh tra & Xử lý Phúc khảo:** Trưởng bộ môn thanh tra bài chấm của giáo viên và ra quyết định điểm phúc khảo cuối cùng.<br>• **Institutional Weakness Heatmap & Grading Consistency Index:** Báo cáo năng lực cấp trường dành cho B2B. | • Phân tầng truy cập kiểm soát chặt chẽ ở cả API Middleware và Giao diện UI.<br>• Toàn bộ thao tác phê duyệt chuyên môn đều lưu vết `reviewedById`, `timestamp`. |
| **6. Thương Mại Hóa & Bảo Vệ Tài Nguyên (Monetization & Feature Gating)** | • Thêm trường `plan_id` / `isPremium` trong bảng `UserSubscription`.<br>• Ẩn/hiện các nút tính năng tĩnh trên giao diện khi người dùng là tài khoản Free. | • **Kiểm soát Hạn mức Động (Dynamic Quota Management):** Tích hợp Redis In-memory Counters giới hạn tài khoản Free (1 phiên speaking/ngày, 5 lượt hỏi AI/ngày, 50 từ tra cứu/ngày).<br>• **Giao diện Paywall Modal:** Hiển thị video demo trực quan 15 giây thúc đẩy nâng cấp VIP Pro khi người dùng chạm giới hạn.<br>• Cấu hình các gói chu kỳ: VIP TOEIC 30 ngày, VSTEP Master 90 ngày, VIP Pro 365 ngày. | • **Tích hợp Cổng Thanh toán Trực tuyến (VNPAY / MoMo / Stripe):** Xử lý giao dịch tức thì qua IPN / Webhook, tự động nâng cấp trạng thái `ACTIVE` trong vòng 1 giây.<br>• **Hard-gating 100% Chống Lạm dụng:** Khóa cứng tính năng đắt đỏ (Tự tải video/link YouTube cá nhân, Xuất PDF, Cấp Chứng chỉ QR) đối với tài khoản Free để triệt tiêu tài khoản spam clone hao tốn GPU.<br>• Hệ thống Job nền Cronjob quét hết hạn thuê bao mỗi 00:00 và tự động gửi email thông báo gia hạn. | • Giao dịch thanh toán an toàn, xác thực chữ ký số SHA256/HMAC chống sửa đổi số tiền.<br>• Tài khoản Free không thể lách luật gọi trực tiếp API Premium (Middleware chặn `403 Forbidden`). |

---

### 9.2. Lộ trình Triển khai Thực chiến 4 Chặng (Execution Milestones Alignment)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHẶNG 1 (Tuần 1 – 4): NỀN TẢNG HỆ THỐNG & NGHIỆP VỤ CƠ BẢN (LEVEL 1)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Khởi tạo Monorepo, cài đặt thư viện chia sẻ (shared packages), cấu hình CI/CD.      │
│ • Thiết kế Prisma Schema 30 Models và chạy Migration lên PostgreSQL.                  │
│ • Xây dựng module Xác thực JWT & Phân quyền RBAC 5 cấp bậc cơ bản.                     │
│ • Lập trình Engine thi thử tĩnh Full Test / Part Test chuẩn TOEIC & VSTEP.             │
│ • Xây dựng Video Player HTML5 với phụ đề tĩnh và Cambridge Dictionary Popover.         │
│ • Tự động bóc tách và lưu câu trả lời sai vào bảng MistakeNotebook.                   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHẶNG 2 (Tuần 5 – 8): HOÀN THIỆN TƯƠNG TÁC THỜI GIAN THỰC & KHẢO THÍ HỌC THUẬT (LEVEL 2) │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Nâng cấp Smart Video Player: Phụ đề song ngữ Interactive đồng bộ thời gian thực.    │
│ • Tích hợp A-B Toggle Looping & Ghi âm Shadowing cơ bản so khớp giọng nói.             │
│ • Xây dựng Micro-CAT Diagnostic Test cho Khách vãng lai (5 câu không cần đăng nhập).  │
│ • Lập trình tính năng Lớp học: Giáo viên giao bài tập, Bàn chấm Speaking/Writing.      │
│ • Xây dựng Màn hình Duyệt học liệu & Thẩm định chuyên môn của Trưởng bộ môn.          │
│ • Tích hợp Cây nguyên nhân lỗi sai và Thuật toán Lặp lại ngắt quãng SM-2.              │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHẶNG 3 (Tuần 9 – 12): ĐỘNG CƠ THÍCH ỨNG CAT IRT & CÔNG NGHỆ BẮT LỖI ÂM VỊ (LEVEL 2 & 3)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Lập trình Thuật toán Khảo thí Thích ứng CAT IRT 2PL và hàm thông tin Fisher I(θ).   │
│ • Xây dựng Logic chọn câu hỏi theo cụm bài đọc (Testlet Grouping) tối ưu thông tin.    │
│ • Thuật toán cập nhật năng lực tức thời θ̂ và sai số chuẩn SE sau từng câu trả lời.    │
│ • Xây dựng Công nghệ Bắt lỗi Âm vị IPA 3 màu (Xanh / Vàng / Đỏ) chuẩn ELSA.           │
│ • Tích hợp Mô phỏng Khẩu hình 2D/3D, Biểu đồ Ngữ điệu F0, Minimal Pairs, Connected.   │
│ • Lập trình Chế độ Nghe chép chính tả (Dictation) & Luyện điểm yếu cấp tốc.            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CHẶNG 4 (Tuần 13 – 16): SIÊU TRÍ TUỆ AI, THANH TOÁN, DOCKER & NGHIỆM THU (LEVEL 3)    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Xây dựng AI Speaking Partner 2 chiều giọng nói thời gian thực (Voice-to-Voice).      │
│ • Hoàn thiện Pipeline bóc tách video tự động từ YouTube URL & file MP4 tải lên.       │
│ • Tích hợp Cổng thanh toán trực tuyến (VNPAY / MoMo) với Webhook tự động kích hoạt.   │
│ • Áp dụng Feature Gating Middleware và Redis Rate Limiter bảo vệ tài nguyên chống spam.│
│ • Xây dựng Service Xuất Sổ tay Lỗi sai ra PDF chuẩn in ấn và Cấp Chứng chỉ số QR.     │
│ • Chạy mô phỏng (Simulation) chứng minh độ hội tụ IRT CAT phục vụ báo cáo Đồ án.       │
│ • Đóng gói Docker Compose toàn bộ hệ thống và hoàn thiện Slide bảo vệ Hội đồng.       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 9.3. Bảng Checklist Đánh Giá Tiến Độ Hoàn Thành (Definition of Done - DoD)

| Mã Hạng mục | Tên Chức năng Chi tiết | Cấp độ | Trạng thái Dự kiến | Trách nhiệm Thực hiện |
| :---: | :--- | :---: | :---: | :---: |
| **AUTH-01** | Xác thực JWT, Refresh Token & Quản lý Phiên đăng nhập | Level 1 | `ĐÃ XONG` | Backend Lead |
| **RBAC-01** | Phân quyền 5 cấp bậc (`GUEST < STUDENT < TEACHER < HEAD_TEACHER < ADMIN`) | Level 2 | `ĐANG LÀM` | Fullstack |
| **EXAM-01** | Phòng thi trắc nghiệm tĩnh TOEIC & VSTEP (Đếm ngược, Chấm điểm, Giải thích) | Level 1 | `ĐÃ XONG` | Frontend / Backend |
| **EXAM-02** | Động cơ thi thích ứng CAT IRT 2PL & Cơ chế chọn Testlet theo Fisher Information | Level 2 | `ĐANG LÀM` | Algorithm / AI Lead |
| **EXAM-03** | Auto-snapshot lưu tiến trình bài thi định kỳ 15s phòng ngừa rớt mạng | Level 2 | `ĐANG LÀM` | Backend |
| **EXAM-04** | Micro-CAT Diagnostic Test chẩn đoán nhanh 5 câu cho Khách vãng lai | Level 2 | `CHƯA LÀM` | Fullstack |
| **VID-01** | Trình phát video bài giảng HTML5 kèm tra từ điển Cambridge 1-chạm | Level 1 | `ĐÃ XONG` | Frontend |
| **VID-02** | Smart Video Player: Phụ đề chạy song song thời gian thực & A-B Looping | Level 2 | `ĐANG LÀM` | Frontend Lead |
| **VID-03** | Bóc tách phụ đề song ngữ tự động từ link YouTube / Video MP4 (Whisper AI) | Level 3 | `CHƯA LÀM` | AI Engineer |
| **PRON-01** | Bắt lỗi âm vị IPA 3 màu, Khẩu hình 2D/3D & Biểu đồ Ngữ điệu F0 chuẩn ELSA | Level 3 | `CHƯA LÀM` | AI Engineer |
| **PRON-02** | Kho luyện Cặp âm tối thiểu (Minimal Pairs) & Trực quan hóa Nối/Nuốt âm | Level 3 | `CHƯA LÀM` | Frontend / Audio |
| **ERR-01** | Tự động bóc tách và lưu câu trả lời sai vào bảng `MistakeNotebook` | Level 1 | `ĐÃ XONG` | Backend |
| **ERR-02** | Cây phân loại nguyên nhân lỗi & Thuật toán Lặp lại ngắt quãng SuperMemo SM-2 | Level 2 | `ĐANG LÀM` | Algorithm / Backend |
| **ERR-03** | Chế độ Nghe chép chính tả (Dictation) & Luyện điểm yếu cấp tốc 10 câu | Level 3 | `CHƯA LÀM` | Fullstack |
| **EXP-01** | Service xuất Sổ tay Lỗi sai ra file PDF bản in đẹp mắt & Cấp Chứng chỉ số QR | Level 3 | `CHƯA LÀM` | Backend |
| **AI-01** | Trợ lý gia sư AI Orbi giải thích bẫy đề thi theo ngữ cảnh (Contextual Co-pilot) | Level 2 | `ĐANG LÀM` | AI Engineer |
| **AI-02** | AI Speaking Partner 2 chiều thời gian thực (Voice-to-Voice Realtime Pipeline) | Level 3 | `CHƯA LÀM` | AI Lead |
| **CLASS-01** | Giáo viên tạo lớp học, giao bài tập và Bàn chấm Speaking/Writing với Voice Note | Level 2 | `ĐANG LÀM` | Fullstack |
| **AUDIT-01** | Màn hình Trưởng bộ môn kiểm duyệt chuyên môn câu hỏi/video & duyệt phúc khảo | Level 3 | `CHƯA LÀM` | Fullstack |
| **PAY-01** | Tích hợp Cổng thanh toán VNPAY/MoMo với Webhook tự động kích hoạt gói VIP | Level 3 | `CHƯA LÀM` | Backend Lead |
| **GATE-01** | Redis Rate Limiting & Hard-gating Middleware khóa cứng tính năng VIP chống spam | Level 3 | `CHƯA LÀM` | Backend / DevOps |

> *Trạng thái thực tế đo trên code và tỷ lệ hoàn thành xem tại **Mục XI. Thống kê Tiến độ Hoàn thành Dự án**.*

---

## X. ĐẶC TẢ CHI TIẾT CƠ SỞ DỮ LIỆU TOÀN HỆ THỐNG (FULL DATABASE SPECIFICATION)

> Mục này là **bản đặc tả CSDL chính thức (single source of truth)** cho toàn bộ OrbiLingo, thay thế và mở rộng bản tóm tắt ở Mục V. Mọi thay đổi `backend/prisma/schema.prisma`, `packages/shared/src/types` và DTO của API phải bám theo mục này (nguyên tắc **Contract-First**).  
> **Phạm vi:** 18 phân hệ · **59 bảng** · phủ đủ 5 vai trò (Guest, Student, Teacher, Head Teacher, Admin) và toàn bộ màn hình hiện có trong `frontend/src/roles/*`.

### 10.1. Nguyên tắc thiết kế & Quy ước chung

| Hạng mục | Quy ước |
|---|---|
| **DBMS** | PostgreSQL 16 (extension: `pgcrypto`, `pg_trgm`, `citext`, `unaccent`, `btree_gist`). ORM: Prisma 5. Cache/Realtime: Redis 7 (leaderboard, rate-limit, hàng đợi BullMQ, phiên thi đang làm). |
| **Đặt tên** | Bảng `snake_case` số nhiều (`exam_attempts`); cột `snake_case`; Prisma model `PascalCase` số ít + `@@map("exam_attempts")`, field `camelCase` + `@map`. |
| **Khóa chính** | `id UUID DEFAULT gen_random_uuid()` cho mọi bảng thực thể. Bảng nối dùng **khóa chính ghép**, không có `id`. |
| **Cột chuẩn** | Mọi bảng thực thể có `created_at TIMESTAMPTZ DEFAULT now()` và `updated_at TIMESTAMPTZ` (`@updatedAt`). Bảng log (append-only) chỉ có `created_at`. *Không lặp lại các cột này trong đặc tả bên dưới.* |
| **Xóa mềm** | Bảng đánh dấu **(S)** có `deleted_at TIMESTAMPTZ NULL`; truy vấn mặc định lọc `deleted_at IS NULL` (Prisma extension). Unique trên bảng (S) là **partial index** `WHERE deleted_at IS NULL`. |
| **Thời gian** | Lưu UTC (`TIMESTAMPTZ`); hiển thị theo `users.settings.timezone` (mặc định `Asia/Ho_Chi_Minh`). Ngày thuần (lịch học, hoạt động ngày) dùng `DATE` theo giờ VN. |
| **Tiền tệ** | `BIGINT` đơn vị **VND** (không dùng FLOAT). |
| **Văn bản** | Email dùng `CITEXT`. Nội dung dài dùng `TEXT` (Markdown). Tìm kiếm tiếng Việt: `unaccent` + GIN `pg_trgm`. |
| **JSONB** | Dùng cho dữ liệu **đi kèm bảng cha, đọc/ghi cùng lúc với cha, không cần JOIN hay ràng buộc FK** (cài đặt người dùng, phụ đề, mốc lộ trình, phần thi, tiêu chí rubric, điểm danh…). Mỗi cột JSONB **bắt buộc có Zod schema** trong `packages/shared/src/schemas` để kiểm tra khi ghi; cấu trúc JSON ghi rõ trong cột Mô tả. |
| **Khóa ngoại** | `CASCADE` cho dữ liệu sở hữu; `SET NULL` cho tham chiếu tác giả/người duyệt; `RESTRICT` cho kết quả thi & tài chính (không xóa cứng). |
| **Ký hiệu** | **PK** khóa chính · **FK→bảng** khóa ngoại · **UQ** duy nhất · **IDX** chỉ mục · **NN** NOT NULL · **CK** CHECK · **(S)** xóa mềm. |

### 10.2. Nguyên tắc Tinh gọn Bảng dữ liệu

Mục tiêu: **không tách bảng khi không có lý do kỹ thuật**, tránh nhiễu schema và JOIN thừa. Một nhóm dữ liệu chỉ được tách thành bảng riêng khi thoả ít nhất 1 trong 4 tiêu chí: **(1)** quan hệ 1–N lớn, tăng không giới hạn theo thời gian; **(2)** cần FK/UNIQUE để giữ toàn vẹn; **(3)** cần lọc/thống kê/xếp hạng riêng; **(4)** vòng đời khác hẳn bảng cha.

**Các bảng được tách riêng có chủ đích:**

| Bảng | Không gộp vì |
|---|---|
| `attempt_answers` | Hàng triệu dòng; đầu vào hiệu chỉnh IRT, thống kê tỷ lệ đúng từng câu (tiêu chí 1, 3) |
| `mistake_entries` ↔ `srs_cards` | Lỗi sai có vòng đời riêng (nguyên nhân, ghi chú); thẻ SRS dùng chung cho từ vựng + lỗi sai (tiêu chí 4) |
| `srs_review_logs`, `ai_messages`, `ticket_messages`, `notifications`, `audit_logs` | Append-only, tăng không giới hạn (tiêu chí 1) |
| `question_versions` | Bài làm cũ phải hiển thị đúng phiên bản câu hỏi lúc thi (tiêu chí 2) |
| `mock_test_questions` | Cần FK tới `questions` để chặn xoá câu đang nằm trong đề (tiêu chí 2) |
| `class_members`, `course_enrollments`, `lesson_progress`, `assignment_submissions` | Quan hệ N–N có trạng thái riêng, cần lọc/thống kê (tiêu chí 2, 3) |
| `user_tokens` | Tra cứu nhanh theo hash, thu hồi theo family (tiêu chí 2) |

### 10.3. Bản đồ 18 Phân hệ Dữ liệu (59 bảng)

| # | Phân hệ | Số bảng | Các bảng |
|---|---|---|---|
| 1 | Định danh & phân quyền | 4 | `users`, `user_tokens`, `role_permissions`, `audit_logs` |
| 2 | Tổ chức bộ môn | 1 | `departments` |
| 3 | Mục tiêu, năng lực & lộ trình | 4 | `learning_goals`, `user_abilities`, `learning_paths`, `learning_path_items` |
| 4 | Kho tệp đa phương tiện | 1 | `media_files` |
| 5 | Khoá học & bài học (Lesson Engine) | 6 | `courses`, `course_sections`, `lessons`, `course_enrollments`, `lesson_progress`, `bookmarks` |
| 6 | Từ vựng & ngữ pháp | 3 | `vocab_topics`, `words`, `grammar_topics` |
| 7 | Ngân hàng câu hỏi & IRT | 5 | `skill_tags`, `passages`, `questions`, `question_versions`, `rubrics` |
| 8 | Đề thi & phòng thi (Exam / Practice Engine) | 4 | `mock_tests`, `mock_test_questions`, `exam_attempts`, `attempt_answers` |
| 9 | Chấm tự luận & kiểm định | 1 | `gradings` |
| 10 | Sổ tay lỗi sai & SRS (SM-2) | 3 | `mistake_entries`, `srs_cards`, `srs_review_logs` |
| 11 | Phát âm & AI | 4 | `speaking_materials`, `speaking_recordings`, `ai_conversations`, `ai_messages` |
| 12 | Lớp học & giảng dạy | 8 | `classes`, `class_members`, `class_sessions`, `class_announcements`, `materials`, `assignments`, `assignment_submissions`, `student_notes` |
| 13 | Động lực & chứng chỉ | 3 | `daily_activities`, `user_achievements`, `certificates` |
| 14 | Thông báo | 2 | `notifications`, `broadcasts` |
| 15 | Gói dịch vụ & thanh toán | 4 | `subscription_plans`, `user_subscriptions`, `coupons`, `payment_transactions` |
| 16 | Hỗ trợ & khiếu nại | 3 | `tickets`, `ticket_messages`, `faqs` |
| 17 | CMS & marketing | 2 | `posts`, `testimonials` |
| 18 | Cấu hình hệ thống | 1 | `system_settings` |
| | **Tổng** | **59** | |

### 10.4. Danh mục Enum

> Enum chỉ dùng cho tập giá trị **ổn định, dùng ở nhiều nơi**; định nghĩa 1 lần ở Prisma, sinh sang `packages/shared` để Frontend dùng chung. Tập giá trị nhỏ chỉ dùng ở 1 cột (theme, channel, priority, audience, kind…) dùng **`VARCHAR` + CHECK constraint**, giá trị liệt kê ngay trong cột Mô tả của bảng.

| Enum | Giá trị | Dùng tại |
|---|---|---|
| `user_role` | `STUDENT`, `TEACHER`, `HEAD_TEACHER`, `ADMIN` *(GUEST = chưa đăng nhập, không lưu)* | users, role_permissions, audit_logs |
| `user_status` | `PENDING`, `ACTIVE`, `LOCKED` | users |
| `token_type` | `REFRESH`, `EMAIL_VERIFY`, `PASSWORD_RESET`, `EMAIL_CHANGE` | user_tokens |
| `exam_type` | `TOEIC`, `VSTEP` | nhiều bảng |
| `skill_type` | `LISTENING`, `READING`, `WRITING`, `SPEAKING`, `VOCABULARY`, `GRAMMAR` | nhiều bảng |
| `exam_part` | `TOEIC_P1`…`TOEIC_P7`, `VSTEP_L1`…`VSTEP_L3`, `VSTEP_R1`…`VSTEP_R4`, `VSTEP_W1`, `VSTEP_W2`, `VSTEP_S1`…`VSTEP_S3` | passages, questions, mock_test_questions, exam_attempts |
| `cefr_level` | `A1`, `A2`, `B1`, `B2`, `C1`, `C2` | nhiều bảng |
| `content_status` | `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `ARCHIVED` | courses, lessons, passages, questions, mock_tests, grammar_topics, speaking_materials, posts |
| `question_type` | `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE_NOT_GIVEN`, `FILL_IN_BLANK`, `MATCHING`, `ESSAY`, `SPEAKING_RESPONSE` | questions |
| `course_category` | `FOUNDATION`, `GRAMMAR`, `VOCABULARY`, `SKILL`, `EXAM_PREP` | courses |
| `lesson_type` | `VIDEO`, `READING`, `QUIZ`, `CHECKPOINT` *(bài kiểm tra giữa khoá)* | lessons |
| `progress_status` | `LOCKED`, `AVAILABLE`, `IN_PROGRESS`, `COMPLETED` | lesson_progress, learning_path_items |
| `test_kind` | `FULL`, `MINI`, `PLACEMENT`, `DIAGNOSTIC`, `QUIZ`, `CHECKPOINT` | mock_tests |
| `attempt_mode` | `FULL`, `PRACTICE`, `ADAPTIVE`, `DRILL`, `PART_SESSION`, `LESSON_QUIZ`, `DICTATION` | exam_attempts |
| `attempt_status` | `IN_PROGRESS`, `SUBMITTED`, `GRADING`, `COMPLETED`, `ABANDONED`, `EXPIRED` | exam_attempts |
| `mistake_cause` | `GRAMMAR`, `VOCABULARY`, `LISTENING`, `READING`, `TIME_PRESSURE`, `CARELESS`, `UNCLASSIFIED` | mistake_entries |
| `srs_status` | `NEW`, `LEARNING`, `REVIEWING`, `MASTERED`, `SUSPENDED` | srs_cards |
| `path_item_type` | `LESSON`, `PRACTICE`, `MOCK_TEST`, `REVIEW`, `VOCAB`, `GRAMMAR` | learning_path_items |
| `assignment_type` | `MOCK_TEST`, `PRACTICE`, `LESSON`, `GRAMMAR`, `VOCAB`, `ESSAY`, `SPEAKING` | assignments |
| `submission_status` | `TODO`, `SUBMITTED`, `LATE`, `GRADED`, `MISSED` | assignment_submissions |
| `attendance_mark` | `PRESENT`, `LATE`, `ABSENT`, `EXCUSED` | class_sessions.attendance (JSONB, kiểm tra bằng Zod) |
| `grader_type` | `AI`, `TEACHER` | gradings |
| `review_result` | `PENDING`, `AGREED`, `ADJUSTED` | gradings.review_status |
| `notification_type` | `REVIEW`, `ASSIGNMENT`, `ACHIEVEMENT`, `SYSTEM`, `CLASS`, `PAYMENT` | notifications |
| `subscription_status` | `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELLED` | user_subscriptions |
| `payment_method` / `payment_status` | `MOMO`, `VNPAY`, `CARD`, `BANK` / `PENDING`, `PAID`, `FAILED`, `REFUNDED` | payment_transactions |
| `ticket_category` / `ticket_status` | `ACCOUNT`, `PAYMENT`, `EXAM`, `CONTENT`, `ACADEMIC`, `OTHER` / `OPEN`, `IN_REVIEW`, `PENDING`, `RESOLVED`, `REJECTED` | tickets |
| `ai_mode` | `COPILOT`, `ROLEPLAY`, `SPEAKING_PARTNER` | ai_conversations |

### 10.5. Đặc tả chi tiết từng bảng

#### 10.5.1. Phân hệ 1 — Định danh & phân quyền

**`users`** (S) — Tài khoản + hồ sơ + cài đặt (gộp `UserProfile`, settings, OAuth).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| email | CITEXT | NN, UQ (partial) | Email đăng nhập |
| password_hash | VARCHAR(255) | NULL | Argon2id; NULL nếu chỉ đăng nhập Google/Facebook |
| google_id | VARCHAR(64) | NULL, UQ | |
| facebook_id | VARCHAR(64) | NULL, UQ | |
| role | `user_role` | NN, DEFAULT `STUDENT`, IDX | |
| status | `user_status` | NN, DEFAULT `PENDING` | |
| email_verified_at | TIMESTAMPTZ | NULL | |
| locked_reason | TEXT | NULL | Lý do Admin khoá |
| full_name | VARCHAR(120) | NN, GIN trgm | |
| avatar_url | TEXT | NULL | |
| phone | VARCHAR(20) | NULL | Mã hoá cột (pgcrypto) |
| date_of_birth | DATE | NULL | |
| gender | VARCHAR(10) | NULL | |
| organization | VARCHAR(160) | NULL | Trường / công ty |
| city | VARCHAR(80) | NULL | |
| bio | TEXT | NULL | Giới thiệu (giáo viên) |
| department_id | UUID | FK→departments SET NULL | Bộ môn của giáo viên / trưởng bộ môn |
| xp_total | INT | NN, DEFAULT 0, CK ≥ 0 | Tổng điểm nỗ lực |
| streak_current | INT | NN, DEFAULT 0 | Chuỗi ngày học hiện tại |
| streak_longest | INT | NN, DEFAULT 0 | |
| streak_freezes | SMALLINT | NN, DEFAULT 0 | Lượt "đóng băng chuỗi" còn lại |
| last_study_date | DATE | NULL | Ngày học gần nhất (tính streak) |
| last_active_at | TIMESTAMPTZ | NULL, IDX | Phát hiện học viên bỏ học |
| settings | JSONB | NN, DEFAULT `'{}'` | `{theme, locale, timezone, dailyGoalMinutes, reminderTime, notifyEmail, notifyInApp, notifyTypes, showOnLeaderboard}` |

**`user_tokens`** — Refresh token + token xác thực email / quên mật khẩu.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX | |
| type | `token_type` | NN | |
| token_hash | CHAR(64) | NN, UQ | SHA-256, không lưu token gốc |
| family_id | UUID | NULL, IDX | Chuỗi xoay vòng refresh token; dùng lại token cũ → thu hồi cả family |
| user_agent | TEXT | NULL | |
| ip_address | INET | NULL | |
| expires_at | TIMESTAMPTZ | NN | Refresh 30 ngày · verify 24h · reset 15 phút |
| used_at | TIMESTAMPTZ | NULL | Token 1 lần đã dùng / refresh đã xoay |
| revoked_at | TIMESTAMPTZ | NULL | Đăng xuất / thu hồi |

**`role_permissions`** — Ma trận vai trò ↔ quyền. PK(role, permission_code).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| role | `user_role` | PK | |
| permission_code | VARCHAR(80) | PK | Mã quyền định nghĩa trong `packages/shared/src/constants` (`question.approve`, `user.lock`, `payment.refund`…) |
| granted_by | UUID | FK→users SET NULL | |

**`audit_logs`** — Nhật ký thao tác nhạy cảm, gồm cả lịch sử duyệt nội dung (append-only, phân vùng theo tháng).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| actor_id | UUID | FK→users SET NULL, IDX | NULL = hệ thống |
| actor_role | `user_role` | NULL | |
| action | VARCHAR(80) | NN, IDX(action, created_at) | `USER_LOCK`, `QUESTION_APPROVE`, `SCORE_ADJUST`, `PAYMENT_REFUND`… |
| resource_type | VARCHAR(40) | NN | |
| resource_id | UUID | NULL | |
| severity | VARCHAR(8) | NN, DEFAULT `'INFO'` | `INFO`, `WARN`, `CRITICAL` |
| ip_address | INET | NULL | |
| before_data | JSONB | NULL | |
| after_data | JSONB | NULL | |

#### 10.5.2. Phân hệ 2 — Tổ chức bộ môn

**`departments`** (S) — Bộ môn (thành viên = `users.department_id`).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| code | VARCHAR(20) | NN, UQ | `TOEIC-LR`, `VSTEP-B1B2` |
| name | VARCHAR(120) | NN | |
| exam_type | `exam_type` | NN | |
| head_id | UUID | FK→users SET NULL | Trưởng bộ môn |
| description | TEXT | NULL | |

#### 10.5.3. Phân hệ 3 — Mục tiêu, năng lực & lộ trình

**`learning_goals`** — Mục tiêu thi + lịch tự học cam kết (gộp `LearningSchedule`).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX | |
| exam_type | `exam_type` | NN | |
| current_level | VARCHAR(20) | NULL | Tự khai (`TOEIC 450`, `B1`) |
| target_score | SMALLINT | NULL, CK 10–990 | Điểm TOEIC mục tiêu |
| target_level | `cefr_level` | NULL | Bậc VSTEP mục tiêu |
| target_date | DATE | NULL | |
| purpose | VARCHAR(20) | NULL | `GRADUATION`, `CAREER`, `STUDY_ABROAD`, `PERSONAL` |
| study_days | SMALLINT[] | NN | Thứ học trong tuần (1 = T2 … 7 = CN) |
| minutes_per_day | SMALLINT | NN, DEFAULT 60, CK 10–480 | |
| preferred_slot | VARCHAR(10) | NULL | `MORNING`, `AFTERNOON`, `EVENING` |
| is_active | BOOL | NN, DEFAULT true | **UQ partial (user_id) WHERE is_active** — giữ lịch sử đổi mục tiêu |
| | | CK | Phải có `target_score` hoặc `target_level` |

**`user_abilities`** — Năng lực học viên ở cấp **kỹ năng** (θ IRT) và cấp **chủ điểm** (độ thành thạo — nguồn cho Luyện điểm yếu và tiến độ ngữ pháp).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| exam_type | `exam_type` | NN | |
| skill | `skill_type` | NN | |
| tag_id | UUID | FK→skill_tags CASCADE, NULL | NULL = dòng cấp kỹ năng; có giá trị = dòng cấp chủ điểm |
| theta | NUMERIC(5,3) | NULL, CK −4…4 | Năng lực θ (dòng cấp kỹ năng) |
| theta_se | NUMERIC(5,3) | NULL | Sai số chuẩn |
| estimated_score | SMALLINT | NULL | Điểm dự báo |
| correct_count | INT | NN, DEFAULT 0 | |
| total_count | INT | NN, DEFAULT 0 | |
| mastery | NUMERIC(4,3) | NN, DEFAULT 0, CK 0–1 | Tỷ lệ đúng làm trơn (EWMA) |
| last_practiced_at | TIMESTAMPTZ | NULL | |
| | | **UQ(user_id, exam_type, skill, tag_id) NULLS NOT DISTINCT**; IDX(user_id, mastery) | |

**`learning_paths`** — Lộ trình cá nhân, chứa luôn 3 chặng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX | |
| goal_id | UUID | FK→learning_goals SET NULL | |
| exam_type | `exam_type` | NN | |
| generated_by | VARCHAR(10) | NN, DEFAULT `'ALGORITHM'` | `ALGORITHM`, `TEACHER` |
| version | SMALLINT | NN, DEFAULT 1 | Tăng khi tái sinh lộ trình |
| is_active | BOOL | NN, DEFAULT true | **UQ partial (user_id) WHERE is_active** |
| progress_pct | NUMERIC(5,2) | NN, DEFAULT 0 | |
| milestones | JSONB | NN | `[{phase:1-3, title, subtitle, description, weeksLabel, status, progress}]` |

**`learning_path_items`** — Nhiệm vụ trong lộ trình.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| path_id | UUID | FK→learning_paths CASCADE | |
| phase | SMALLINT | NN, CK 1–3 | Thuộc chặng nào |
| title | VARCHAR(160) | NN | |
| item_type | `path_item_type` | NN | |
| ref_id | UUID | NULL | lesson / mock_test / vocab_topic / grammar_topic theo `item_type` |
| ref_config | JSONB | NULL | `{parts:["TOEIC_P5"], questions:20}` |
| skill | `skill_type` | NULL | |
| duration_min | SMALLINT | NN | |
| order_index | SMALLINT | NN | |
| status | `progress_status` | NN, DEFAULT `LOCKED` | |
| completed_at | TIMESTAMPTZ | NULL | |
| | | UQ(path_id, phase, order_index) | |

#### 10.5.4. Phân hệ 4 — Kho tệp đa phương tiện

**`media_files`** (S) — Mọi file upload (video, audio, ảnh, PDF, ghi âm) trên S3/MinIO; bảng khác lưu `*_url`.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| owner_id | UUID | FK→users SET NULL, IDX | |
| storage_key | TEXT | NN, UQ | |
| url | TEXT | NN | |
| mime_type | VARCHAR(100) | NN | |
| size_bytes | BIGINT | NN | |
| duration_sec | NUMERIC(8,2) | NULL | |
| checksum_sha256 | CHAR(64) | NULL, IDX | Chống trùng file |
| purpose | VARCHAR(20) | NN | `LESSON_VIDEO`, `QUESTION_AUDIO`, `RECORDING`, `MATERIAL`, `AVATAR`, `CERTIFICATE` |
| is_private | BOOL | NN, DEFAULT false | Ghi âm học viên = private, truy cập qua signed URL |

#### 10.5.5. Phân hệ 5 — Khoá học & bài học (Lesson Engine)

**`courses`** (S) — Khoá học.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| slug | VARCHAR(140) | NN, UQ (partial) | |
| title | VARCHAR(200) | NN | |
| category | `course_category` | NN, IDX | |
| exam_type | `exam_type` | NULL | |
| level | `cefr_level` | NULL | |
| description | TEXT | NN | |
| cover_url | TEXT | NULL | |
| theme_gradient | VARCHAR(80) | NULL | |
| is_sequential | BOOL | NN, DEFAULT true | Bài sau mở khi xong bài trước |
| is_free | BOOL | NN, DEFAULT false | |
| author_id | UUID | FK→users SET NULL | |
| department_id | UUID | FK→departments SET NULL | |
| status | `content_status` | NN, DEFAULT `DRAFT`, IDX | |
| reviewed_by | UUID | FK→users SET NULL | |
| review_note | TEXT | NULL | Góp ý khi từ chối |
| lessons_count | SMALLINT | NN, DEFAULT 0 | Cache |
| duration_min | INT | NN, DEFAULT 0 | Cache |
| students_count | INT | NN, DEFAULT 0 | Cache |
| rating_avg | NUMERIC(3,2) | NN, DEFAULT 0 | Cache từ `course_enrollments.rating` |
| rating_count | INT | NN, DEFAULT 0 | |
| published_at | TIMESTAMPTZ | NULL | |

**`course_sections`** — Chặng trong khoá, gom theo Phần (Phần 1: Ôn kiến thức chung → Phần 2: Luyện theo chủ đề).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| course_id | UUID | FK→courses CASCADE | |
| part_no | SMALLINT | NN, DEFAULT 1 | |
| part_title | VARCHAR(120) | NULL | |
| title | VARCHAR(200) | NN | |
| order_index | SMALLINT | NN | |
| | | UQ(course_id, order_index) | |

**`lessons`** (S) — Bài học: video + phụ đề, bài đọc, quiz, bài kiểm tra giữa khoá.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| section_id | UUID | FK→course_sections CASCADE | |
| title | VARCHAR(200) | NN | |
| type | `lesson_type` | NN | |
| summary | VARCHAR(300) | NULL | |
| content_md | TEXT | NULL | |
| skill | `skill_type` | NULL | |
| video_url | TEXT | NULL | File nội bộ hoặc link HLS/YouTube |
| audio_url | TEXT | NULL | |
| transcript | JSONB | NULL | `[{startMs, endMs, en, vi}]` — Smart Player, Shadowing, Dictation |
| quiz_test_id | UUID | FK→mock_tests RESTRICT, NULL | Bộ câu hỏi của QUIZ / CHECKPOINT (dùng lại Exam Engine) |
| pass_score_pct | SMALLINT | NULL, CK 0–100 | Bắt buộc với QUIZ / CHECKPOINT |
| duration_min | SMALLINT | NN, DEFAULT 10 | |
| is_free_preview | BOOL | NN, DEFAULT false | |
| order_index | SMALLINT | NN | |
| status | `content_status` | NN, DEFAULT `DRAFT` | `PUBLISHED` = Trưởng bộ môn đã thẩm định |
| reviewed_by | UUID | FK→users SET NULL | |
| review_note | TEXT | NULL | |
| | | UQ(section_id, order_index) | |

**`course_enrollments`** — Ghi danh + đánh giá khoá học.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| course_id | UUID | FK→courses CASCADE | |
| source | VARCHAR(10) | NN, DEFAULT `'SELF'` | `SELF`, `CLASS`, `ASSIGNMENT`, `PATH` |
| progress_pct | NUMERIC(5,2) | NN, DEFAULT 0 | |
| current_lesson_id | UUID | FK→lessons SET NULL | Nút "Học tiếp" |
| completed_at | TIMESTAMPTZ | NULL | |
| rating | SMALLINT | NULL, CK 1–5 | |
| review | TEXT | NULL | |
| | | UQ(user_id, course_id) | |

**`lesson_progress`** — Tiến độ từng bài.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| lesson_id | UUID | FK→lessons CASCADE | |
| status | `progress_status` | NN, DEFAULT `AVAILABLE` | |
| last_position_sec | INT | NN, DEFAULT 0 | Vị trí video |
| time_spent_sec | INT | NN, DEFAULT 0 | |
| best_score_pct | SMALLINT | NULL | QUIZ / CHECKPOINT |
| completed_at | TIMESTAMPTZ | NULL | |
| | | UQ(user_id, lesson_id); IDX(user_id, status) | |

**`bookmarks`** — Mục đã lưu.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| target_type | VARCHAR(16) | NN | `QUESTION`, `LESSON`, `WORD`, `GRAMMAR_TOPIC`, `POST`, `TEST` |
| target_id | UUID | NN | |
| note | TEXT | NULL | |
| | | UQ(user_id, target_type, target_id) | |

#### 10.5.6. Phân hệ 6 — Từ vựng & ngữ pháp

**`vocab_topics`** (S) — Bộ flashcard theo chủ đề.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| slug | VARCHAR(120) | NN, UQ | |
| name | VARCHAR(120) | NN | |
| icon | VARCHAR(40) | NULL | |
| theme_gradient | VARCHAR(80) | NULL | |
| exam_type | `exam_type` | NULL | |
| level | `cefr_level` | NULL | |
| is_free | BOOL | NN, DEFAULT true | |
| words_count | SMALLINT | NN, DEFAULT 0 | Cache |
| order_index | SMALLINT | NN, DEFAULT 0 | |

**`words`** — Kho từ; dùng cho flashcard và tra từ 1-chạm.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| topic_id | UUID | FK→vocab_topics SET NULL, IDX | NULL = từ chỉ phục vụ tra cứu |
| headword | VARCHAR(80) | NN, GIN trgm | |
| pos | VARCHAR(12) | NN | n, v, adj, adv, phr… |
| ipa_uk | VARCHAR(80) | NULL | |
| ipa_us | VARCHAR(80) | NULL | |
| meaning_vi | TEXT | NN | |
| meaning_en | TEXT | NULL | |
| example_en | TEXT | NULL | |
| example_vi | TEXT | NULL | |
| audio_url | TEXT | NULL | |
| image_url | TEXT | NULL | |
| level | `cefr_level` | NULL | |
| order_in_topic | SMALLINT | NULL | |
| | | UQ(topic_id, headword, pos) NULLS NOT DISTINCT | |

**`grammar_topics`** (S) — Chủ điểm ngữ pháp kèm quy tắc.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| slug | VARCHAR(120) | NN, UQ | |
| title | VARCHAR(160) | NN | |
| category | VARCHAR(40) | NN | Thì, Mệnh đề, Bị động… |
| level | `cefr_level` | NULL | |
| summary | TEXT | NN | |
| rules | JSONB | NN | `[{title, detailMd, example, commonErrors:[{wrong, right, why}]}]` |
| tag_id | UUID | FK→skill_tags SET NULL | Nối ngân hàng câu hỏi + tiến độ (`user_abilities`) |
| order_index | SMALLINT | NN, DEFAULT 0 | |
| status | `content_status` | NN, DEFAULT `DRAFT` | |

#### 10.5.7. Phân hệ 7 — Ngân hàng câu hỏi & IRT

**`skill_tags`** — Cây chủ điểm kỹ năng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| parent_id | UUID | FK→skill_tags SET NULL, IDX | |
| slug | VARCHAR(120) | NN, UQ | `p5-verb-tense` |
| name | VARCHAR(160) | NN | |
| skill | `skill_type` | NN | |
| exam_type | `exam_type` | NULL | NULL = dùng chung |
| questions_count | INT | NN, DEFAULT 0 | Cache |

**`passages`** (S) — Nhóm câu hỏi (testlet) **và** bài nghe chép chính tả.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| purpose | VARCHAR(10) | NN, DEFAULT `'EXAM'` | `EXAM` (testlet), `DICTATION` |
| exam_type | `exam_type` | NULL | |
| part | `exam_part` | NULL, IDX | Bắt buộc khi `purpose = EXAM` (CK) |
| title | VARCHAR(200) | NULL | |
| content_md | TEXT | NULL | Đoạn văn đọc |
| transcript | TEXT | NULL | Transcript bài nghe / đáp án chép chính tả |
| segments | JSONB | NULL | `[{startMs, endMs, text}]` từng câu (Dictation) |
| audio_url | TEXT | NULL | |
| image_url | TEXT | NULL | |
| level | `cefr_level` | NULL | |
| source_lesson_id | UUID | FK→lessons SET NULL | Cắt từ video bài học |
| is_free | BOOL | NN, DEFAULT true | |
| status | `content_status` | NN, DEFAULT `DRAFT` | |
| author_id | UUID | FK→users SET NULL | |
| reviewed_by | UUID | FK→users SET NULL | |
| review_note | TEXT | NULL | |

**`questions`** (S) — Câu hỏi trắc nghiệm + đề Viết/Nói, có tham số IRT 2PL.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| passage_id | UUID | FK→passages SET NULL, IDX | NULL = câu đơn |
| order_in_passage | SMALLINT | NULL | |
| exam_type | `exam_type` | NN | |
| part | `exam_part` | NN | |
| skill | `skill_type` | NN | |
| type | `question_type` | NN, DEFAULT `SINGLE_CHOICE` | |
| level | `cefr_level` | NULL | |
| tag_ids | UUID[] | NN, DEFAULT `'{}'`, GIN | Chủ điểm |
| stem | TEXT | NN, GIN trgm | |
| options | JSONB | NULL | `[{key:"A", text}]` |
| correct_answer | JSONB | NULL | `{keys:["B"]}` hoặc `{text:["..."]}` |
| explanation_md | TEXT | NULL | |
| translation_vi | TEXT | NULL | |
| audio_url | TEXT | NULL | |
| image_url | TEXT | NULL | |
| task_config | JSONB | NULL | Đề Viết/Nói: `{minWords, prepSec, responseSec, sampleAnswer}` |
| rubric_id | UUID | FK→rubrics SET NULL | |
| irt_a | NUMERIC(5,3) | NN, DEFAULT 1, CK 0.2–3 | Độ phân biệt |
| irt_b | NUMERIC(5,3) | NN, DEFAULT 0, CK −4…4 | Độ khó |
| calibrated_n | INT | NN, DEFAULT 0 | |
| exposure_count | INT | NN, DEFAULT 0 | Kiểm soát lộ đề trong CAT |
| correct_rate | NUMERIC(4,3) | NULL | Cache |
| version | SMALLINT | NN, DEFAULT 1 | |
| source | VARCHAR(10) | NN, DEFAULT `'ORIGINAL'` | `ORIGINAL`, `IMPORT`, `AI_DRAFT` |
| status | `content_status` | NN, DEFAULT `DRAFT` | |
| author_id | UUID | FK→users SET NULL | |
| reviewed_by | UUID | FK→users SET NULL | |
| review_note | TEXT | NULL | |
| | | IDX(exam_type, part, status); IDX(irt_b) | |

**`question_versions`** — Lịch sử phiên bản câu hỏi.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| question_id | UUID | FK→questions CASCADE | |
| version | SMALLINT | NN | |
| snapshot | JSONB | NN | stem / options / answer / explanation tại phiên bản đó |
| changed_by | UUID | FK→users SET NULL | |
| | | UQ(question_id, version) | |

**`rubrics`** — Bộ tiêu chí chấm Viết/Nói (dùng chung trang học viên, bàn chấm GV, kiểm định TBM).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| code | VARCHAR(40) | NN, UQ | `VSTEP_WRITING_T2` |
| name | VARCHAR(160) | NN | |
| exam_type | `exam_type` | NN | |
| skill | `skill_type` | NN, CK in (WRITING, SPEAKING) | |
| scale_max | NUMERIC(4,1) | NN, DEFAULT 10 | |
| criteria | JSONB | NN | `[{key, label, description, weight}]`, tổng weight = 1 |

#### 10.5.8. Phân hệ 8 — Đề thi & phòng thi (Exam / Practice Engine)

**`mock_tests`** (S) — Đề thi thử, đề đầu vào, đề chẩn đoán, quiz bài học, bài kiểm tra giữa khoá.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| slug | VARCHAR(140) | NN, UQ | |
| title | VARCHAR(200) | NN | |
| exam_type | `exam_type` | NN | |
| kind | `test_kind` | NN, DEFAULT `FULL` | |
| level | VARCHAR(20) | NULL | |
| year | SMALLINT | NULL | |
| duration_min | SMALLINT | NN | Giờ thi chuẩn |
| total_questions | SMALLINT | NN | Cache |
| sections | JSONB | NN | `[{part, title, skill, order, durationMin, instructionsMd, audioUrl}]` |
| score_table | JSONB | NULL | Bảng quy đổi riêng của đề; NULL = dùng mặc định trong `system_settings` |
| is_free | BOOL | NN, DEFAULT true | |
| is_adaptive | BOOL | NN, DEFAULT false | |
| tags | TEXT[] | NN, DEFAULT `'{}'` | |
| cover_url | TEXT | NULL | |
| version | SMALLINT | NN, DEFAULT 1 | |
| status | `content_status` | NN, DEFAULT `DRAFT` | |
| author_id | UUID | FK→users SET NULL | |
| reviewed_by | UUID | FK→users SET NULL | |
| review_note | TEXT | NULL | |
| attempts_count | INT | NN, DEFAULT 0 | Cache |

**`mock_test_questions`** — Câu hỏi trong đề. PK(test_id, question_id).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| test_id | UUID | PK, FK→mock_tests CASCADE | |
| question_id | UUID | PK, FK→questions RESTRICT | |
| part | `exam_part` | NN | Khớp `mock_tests.sections[].part` |
| question_no | SMALLINT | NN | Số câu hiển thị (1–200) |
| points | NUMERIC(4,2) | NN, DEFAULT 1 | |
| | | UQ(test_id, question_no) | |

**`exam_attempts`** — Mọi lượt làm bài: thi thử, luyện Part, CAT, luyện điểm yếu, quiz bài học, chép chính tả.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX(user_id, created_at) | |
| test_id | UUID | FK→mock_tests RESTRICT, NULL | NULL với DRILL / PART_SESSION / DICTATION |
| test_version | SMALLINT | NULL | |
| passage_id | UUID | FK→passages RESTRICT, NULL | Bài chép chính tả |
| lesson_id | UUID | FK→lessons SET NULL | LESSON_QUIZ / CHECKPOINT |
| assignment_id | UUID | FK→assignments SET NULL | Làm theo bài giao |
| mode | `attempt_mode` | NN | |
| purpose | VARCHAR(12) | NN, DEFAULT `'SELF'` | `SELF`, `ASSIGNMENT`, `PLACEMENT`, `CHECKPOINT`, `PATH` |
| selected_parts | `exam_part`[] | NN, DEFAULT `'{}'` | |
| time_limit_sec | INT | NULL | NULL = không giới hạn |
| status | `attempt_status` | NN, DEFAULT `IN_PROGRESS`, IDX | |
| question_order | JSONB | NN, DEFAULT `'[]'` | `[{questionId, version}]` theo thứ tự hiển thị |
| cat_state | JSONB | NULL | Lịch sử θ từng bước (CAT) |
| started_at | TIMESTAMPTZ | NN, DEFAULT now() | |
| last_saved_at | TIMESTAMPTZ | NULL | Auto-save 15 giây |
| submitted_at | TIMESTAMPTZ | NULL | |
| time_spent_sec | INT | NN, DEFAULT 0 | |
| correct_count | SMALLINT | NULL | |
| total_count | SMALLINT | NN, DEFAULT 0 | |
| score_total | NUMERIC(6,1) | NULL | TOEIC 10–990 · VSTEP 0–10 · Dictation % chính xác |
| score_listening | NUMERIC(5,1) | NULL | |
| score_reading | NUMERIC(5,1) | NULL | |
| score_writing | NUMERIC(4,1) | NULL | |
| score_speaking | NUMERIC(4,1) | NULL | |
| cefr_result | `cefr_level` | NULL | |
| theta | NUMERIC(5,3) | NULL | |
| part_results | JSONB | NULL | `[{part, correct, total, timeSec, scaled}]` |
| result_detail | JSONB | NULL | Dictation: `{typedText, diff, replays}`; điểm yếu: `[{tagId, rate}]` |
| client_info | JSONB | NULL | Trình duyệt, số lần rời tab |
| | | **UQ partial (user_id, test_id) WHERE status = 'IN_PROGRESS'** | |

**`attempt_answers`** — Đáp án từng câu (phân vùng theo tháng).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| attempt_id | UUID | FK→exam_attempts CASCADE | |
| question_id | UUID | FK→questions RESTRICT, IDX | |
| question_version | SMALLINT | NN | |
| order_index | SMALLINT | NN | |
| selected | JSONB | NULL | `{keys:["C"]}` / `{text:"..."}` |
| text_answer | TEXT | NULL | Bài viết |
| audio_url | TEXT | NULL | Bài nói (file private) |
| is_correct | BOOL | NULL | NULL = chờ chấm tự luận |
| score | NUMERIC(5,2) | NULL | |
| time_spent_ms | INT | NN, DEFAULT 0 | |
| is_flagged | BOOL | NN, DEFAULT false | |
| answered_at | TIMESTAMPTZ | NULL | |
| | | UQ(attempt_id, question_id) | |

#### 10.5.9. Phân hệ 9 — Chấm tự luận & kiểm định

**`gradings`** — Lần chấm bài Viết/Nói (AI chấm sơ bộ, GV chấm chính thức) **kèm kết quả kiểm định của Trưởng bộ môn**.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| answer_id | UUID | FK→attempt_answers CASCADE, NULL | Bài trong phòng thi / trang luyện |
| submission_id | UUID | FK→assignment_submissions CASCADE, NULL | Bài nộp theo bài giao |
| grader_type | `grader_type` | NN | |
| grader_id | UUID | FK→users SET NULL | NULL khi AI chấm |
| rubric_id | UUID | FK→rubrics RESTRICT | |
| criteria_scores | JSONB | NN | `{task: 7, coherence: 6.5, …}` theo `rubrics.criteria[].key` |
| total_score | NUMERIC(4,1) | NN | |
| feedback | TEXT | NULL | |
| inline_comments | JSONB | NULL | Nhận xét gắn đoạn văn |
| voice_note_url | TEXT | NULL | Ghi âm nhận xét |
| is_final | BOOL | NN, DEFAULT false | Điểm chính thức trả học viên |
| graded_at | TIMESTAMPTZ | NN, DEFAULT now() | |
| review_status | `review_result` | NULL, IDX | NULL = không được lấy mẫu kiểm định |
| reviewer_id | UUID | FK→users SET NULL | Trưởng bộ môn |
| review_scores | JSONB | NULL | Điểm theo tiêu chí sau điều chỉnh |
| review_total | NUMERIC(4,1) | NULL | |
| review_note | TEXT | NULL | Góp ý cho giáo viên |
| reviewed_at | TIMESTAMPTZ | NULL | |
| | | CK `num_nonnulls(answer_id, submission_id) = 1` | |

#### 10.5.10. Phân hệ 10 — Sổ tay lỗi sai & SRS (SM-2)

**`mistake_entries`** — Sổ tay lỗi sai: mỗi (học viên, câu hỏi) 1 dòng, cộng dồn số lần sai.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| question_id | UUID | FK→questions RESTRICT | |
| last_wrong_answer | JSONB | NN | |
| wrong_count | SMALLINT | NN, DEFAULT 1 | |
| source | VARCHAR(12) | NN | `MOCK_TEST`, `PRACTICE`, `PLACEMENT`, `LESSON_QUIZ`, `ASSIGNMENT`, `DRILL` |
| last_attempt_id | UUID | FK→exam_attempts SET NULL | |
| cause | `mistake_cause` | NN, DEFAULT `UNCLASSIFIED` | |
| cause_source | VARCHAR(5) | NN, DEFAULT `'RULE'` | `RULE`, `AI`, `USER` |
| tag_id | UUID | FK→skill_tags SET NULL | |
| note | TEXT | NULL | |
| is_resolved | BOOL | NN, DEFAULT false | |
| first_wrong_at | TIMESTAMPTZ | NN | |
| last_wrong_at | TIMESTAMPTZ | NN | |
| resolved_at | TIMESTAMPTZ | NULL | |
| | | UQ(user_id, question_id); IDX(user_id, is_resolved, cause) | |

**`srs_cards`** — Thẻ ôn ngắt quãng **dùng chung** cho từ vựng và lỗi sai.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| word_id | UUID | FK→words CASCADE, NULL | Thẻ từ vựng |
| mistake_id | UUID | FK→mistake_entries CASCADE, NULL | Thẻ lỗi sai |
| status | `srs_status` | NN, DEFAULT `NEW` | |
| ease_factor | NUMERIC(4,2) | NN, DEFAULT 2.5, CK ≥ 1.3 | |
| interval_days | INT | NN, DEFAULT 0 | |
| repetitions | SMALLINT | NN, DEFAULT 0 | |
| lapses | SMALLINT | NN, DEFAULT 0 | |
| next_review_at | TIMESTAMPTZ | NN, DEFAULT now() | |
| last_reviewed_at | TIMESTAMPTZ | NULL | |
| | | CK `num_nonnulls(word_id, mistake_id) = 1`; UQ(user_id, word_id); UQ(user_id, mistake_id); **IDX(user_id, next_review_at) WHERE status <> 'SUSPENDED'** | Dùng 2 FK thật thay cho tham chiếu đa hình |

**`srs_review_logs`** — Lịch sử ôn (append-only).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| card_id | UUID | FK→srs_cards CASCADE, IDX | |
| user_id | UUID | FK→users CASCADE, IDX(user_id, created_at) | |
| quality | SMALLINT | NN, CK 0–5 | |
| prev_interval | INT | NN | |
| new_interval | INT | NN | |
| new_ease | NUMERIC(4,2) | NN | |
| response_ms | INT | NULL | |

#### 10.5.11. Phân hệ 11 — Phát âm & AI

**`speaking_materials`** (S) — Học liệu luyện nói: cặp âm tối thiểu và kịch bản nhập vai.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| kind | VARCHAR(14) | NN, IDX | `MINIMAL_PAIR`, `ROLEPLAY` |
| title | VARCHAR(160) | NN | "ship / sheep", "Phỏng vấn xin việc" |
| exam_type | `exam_type` | NULL | |
| level | `cefr_level` | NULL | |
| data | JSONB | NN | MINIMAL_PAIR: `{wordA, wordB, phonemeA, phonemeB, audioA, audioB, tipVi}` · ROLEPLAY: `{contextMd, aiPersona, goals[]}` |
| is_vip | BOOL | NN, DEFAULT false | |
| status | `content_status` | NN, DEFAULT `DRAFT` | |

**`speaking_recordings`** — Bản ghi âm shadowing / luyện nói và kết quả chấm âm vị.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX | |
| source_type | VARCHAR(14) | NN | `TRANSCRIPT`, `SPEAKING_TASK`, `MINIMAL_PAIR`, `FREE` |
| source_id | UUID | NULL | |
| reference_text | TEXT | NULL | |
| audio_url | TEXT | NN | File private |
| asr_text | TEXT | NULL | |
| score_overall | SMALLINT | NULL, CK 0–100 | |
| score_accuracy | SMALLINT | NULL | |
| score_fluency | SMALLINT | NULL | |
| score_prosody | SMALLINT | NULL | |
| phoneme_result | JSONB | NULL | `[{word, phonemes:[{ipa, score}]}]` |
| pitch_contour | JSONB | NULL | Đường F0 |

**`ai_conversations`** — Phiên trò chuyện AI + báo cáo năng lực nói.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX(user_id, created_at) | |
| mode | `ai_mode` | NN | |
| material_id | UUID | FK→speaking_materials SET NULL | Kịch bản roleplay |
| context_type | VARCHAR(10) | NULL | `QUESTION`, `LESSON`, `MISTAKE` (Co-pilot theo ngữ cảnh) |
| context_id | UUID | NULL | |
| title | VARCHAR(200) | NULL | |
| tokens_in | INT | NN, DEFAULT 0 | |
| tokens_out | INT | NN, DEFAULT 0 | |
| report | JSONB | NULL | `{fluency, lexical, grammar, pronunciation, band, summary, suggestions:[{original, better, why}]}` |
| ended_at | TIMESTAMPTZ | NULL | |

**`ai_messages`** — Tin nhắn trong phiên AI (append-only).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| conversation_id | UUID | FK→ai_conversations CASCADE, IDX | |
| role | VARCHAR(10) | NN | `USER`, `ASSISTANT`, `SYSTEM`, `TOOL` |
| content | TEXT | NN | |
| audio_url | TEXT | NULL | |
| model | VARCHAR(60) | NULL | |
| tokens_in | INT | NULL | |
| tokens_out | INT | NULL | |
| latency_ms | INT | NULL | |

#### 10.5.12. Phân hệ 12 — Lớp học & giảng dạy

**`classes`** (S) — Lớp học.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| department_id | UUID | FK→departments SET NULL, IDX | |
| teacher_id | UUID | FK→users RESTRICT, IDX | |
| name | VARCHAR(160) | NN | |
| code | VARCHAR(16) | NN, UQ | Mã tham gia lớp |
| exam_type | `exam_type` | NN | |
| level | VARCHAR(20) | NULL | |
| description | TEXT | NULL | |
| room | VARCHAR(80) | NULL | |
| schedule_text | VARCHAR(120) | NULL | "T3–T5, 19:00–21:00" |
| cover_url | TEXT | NULL | |
| start_date | DATE | NULL | |
| end_date | DATE | NULL, CK ≥ start_date | |
| max_students | SMALLINT | NULL | |
| is_archived | BOOL | NN, DEFAULT false | |

**`class_members`** — Học viên trong lớp.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| class_id | UUID | FK→classes CASCADE | |
| student_id | UUID | FK→users CASCADE, IDX | |
| status | VARCHAR(8) | NN, DEFAULT `'ACTIVE'` | `ACTIVE`, `LEFT`, `REMOVED` |
| risk_level | VARCHAR(8) | NN, DEFAULT `'GOOD'` | `GOOD`, `WARNING`, `RISK` (cache) |
| joined_at | TIMESTAMPTZ | NN, DEFAULT now() | |
| | | UQ(class_id, student_id) | |

**`class_sessions`** — Buổi dạy, kèm điểm danh và phiếu dự giờ.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| class_id | UUID | FK→classes CASCADE, IDX(class_id, session_date) | |
| teacher_id | UUID | FK→users SET NULL | Có thể dạy thay |
| session_date | DATE | NN | |
| start_time | TIME | NN | |
| end_time | TIME | NN, CK > start_time | |
| room | VARCHAR(80) | NULL | |
| topic | VARCHAR(200) | NULL | Giáo án |
| status | VARCHAR(10) | NN, DEFAULT `'UPCOMING'` | `UPCOMING`, `DONE`, `CANCELLED` |
| note | TEXT | NULL | Ghi chú sau buổi |
| attendance | JSONB | NULL | `{"<studentId>": {mark: attendance_mark, note}}` |
| observer_id | UUID | FK→users SET NULL, IDX | Trưởng bộ môn dự giờ |
| observation | JSONB | NULL | `{status: PLANNED/DONE, rating 1–5, strengths, improvements}` |

**`class_announcements`** (S) — Bảng tin lớp (trạng thái "đã đọc" theo `notifications`).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| class_id | UUID | FK→classes CASCADE, IDX | |
| author_id | UUID | FK→users SET NULL | |
| title | VARCHAR(200) | NN | |
| body | TEXT | NN | |
| is_pinned | BOOL | NN, DEFAULT false | |
| read_count | INT | NN, DEFAULT 0 | Cache |

**`materials`** (S) — Tài liệu lớp **và** tài nguyên công khai (trang Tài nguyên).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| class_id | UUID | FK→classes CASCADE, NULL, IDX | NULL = tài nguyên công khai |
| uploaded_by | UUID | FK→users SET NULL | |
| title | VARCHAR(200) | NN | |
| description | TEXT | NULL | |
| type | VARCHAR(6) | NN | `VIDEO`, `PDF`, `DOC`, `AUDIO`, `LINK` |
| category | VARCHAR(60) | NULL | |
| file_url | TEXT | NULL | |
| size_bytes | BIGINT | NULL | |
| pages | SMALLINT | NULL | |
| downloads_count | INT | NN, DEFAULT 0 | |
| is_vip | BOOL | NN, DEFAULT false | |

**`assignments`** (S) — Bài giao, trỏ thẳng tới chức năng học viên đang dùng.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| class_id | UUID | FK→classes CASCADE, IDX | |
| created_by | UUID | FK→users SET NULL | |
| title | VARCHAR(200) | NN | |
| type | `assignment_type` | NN | |
| target_id | UUID | NULL | mock_test / course / grammar_topic / vocab_topic / question |
| target_config | JSONB | NN | `{mode, parts, minutes}` hoặc `{lessonIds:[…]}` (khớp `AssignmentTarget` ở frontend) |
| note | TEXT | NULL | |
| open_at | TIMESTAMPTZ | NULL | |
| due_at | TIMESTAMPTZ | NULL, IDX | |
| allow_late | BOOL | NN, DEFAULT true | |
| max_score | NUMERIC(5,1) | NN, DEFAULT 10 | |
| status | VARCHAR(6) | NN, DEFAULT `'DRAFT'` | `DRAFT`, `OPEN`, `CLOSED` |

**`assignment_submissions`** — Bài của từng học viên (tạo sẵn `TODO` khi giao).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| assignment_id | UUID | FK→assignments CASCADE | |
| student_id | UUID | FK→users CASCADE, IDX | |
| status | `submission_status` | NN, DEFAULT `TODO`, IDX | |
| attempt_id | UUID | FK→exam_attempts SET NULL | Bài trắc nghiệm |
| content | TEXT | NULL | Bài viết |
| audio_url | TEXT | NULL | Bài nói |
| submitted_at | TIMESTAMPTZ | NULL | |
| score | NUMERIC(5,1) | NULL | Lấy từ `gradings.is_final` |
| feedback | TEXT | NULL | |
| graded_at | TIMESTAMPTZ | NULL | |
| | | UQ(assignment_id, student_id) | |

**`student_notes`** (S) — Ghi chú của GV về học viên.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| teacher_id | UUID | FK→users CASCADE | |
| student_id | UUID | FK→users CASCADE, IDX | |
| class_id | UUID | FK→classes SET NULL | |
| kind | VARCHAR(8) | NN | `NOTE`, `REMINDER`, `CONTACT` |
| content | TEXT | NN | |
| note_date | DATE | NN | |

#### 10.5.13. Phân hệ 13 — Động lực & chứng chỉ

**`daily_activities`** — Tổng hợp theo (học viên, ngày): heatmap, streak, XP, bảng xếp hạng, hạn mức AI. PK(user_id, activity_date).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | PK, FK→users CASCADE | |
| activity_date | DATE | PK, IDX(activity_date) | |
| minutes | SMALLINT | NN, DEFAULT 0 | |
| questions_answered | SMALLINT | NN, DEFAULT 0 | |
| lessons_completed | SMALLINT | NN, DEFAULT 0 | |
| cards_reviewed | SMALLINT | NN, DEFAULT 0 | |
| xp | INT | NN, DEFAULT 0 | BXH tuần/tháng = SUM(xp) theo khoảng ngày |
| goal_met | BOOL | NN, DEFAULT false | |
| ai_usage | JSONB | NN, DEFAULT `'{}'` | `{AI_COPILOT: 3, AI_ROLEPLAY: 1, AI_GRADING: 2}` đối chiếu hạn mức gói |

**`user_achievements`** — Huy hiệu của học viên (danh mục huy hiệu là hằng số trong `packages/shared`). PK(user_id, achievement_code).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | PK, FK→users CASCADE | |
| achievement_code | VARCHAR(40) | PK | `STREAK_30`, `FIRST_FULL_TEST`… |
| progress | INT | NN, DEFAULT 0 | |
| earned_at | TIMESTAMPTZ | NULL | |

**`certificates`** — Chứng chỉ số, mã QR xác minh công khai.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| type | VARCHAR(20) | NN | `COURSE_COMPLETION`, `MOCK_TEST_RESULT` |
| course_id | UUID | FK→courses SET NULL | |
| attempt_id | UUID | FK→exam_attempts SET NULL | |
| serial_no | VARCHAR(30) | NN, UQ | |
| verify_token | CHAR(32) | NN, UQ | Nằm trong QR |
| score_text | VARCHAR(40) | NULL | |
| pdf_url | TEXT | NULL | |
| issued_at | TIMESTAMPTZ | NN, DEFAULT now() | |
| revoked_at | TIMESTAMPTZ | NULL | |

#### 10.5.14. Phân hệ 14 — Thông báo

**`notifications`** — Thông báo trong chuông (gồm cả thông báo lớp, thông báo hàng loạt).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE | |
| type | `notification_type` | NN | |
| title | VARCHAR(200) | NN | |
| message | TEXT | NN | |
| link | TEXT | NULL | |
| ref_type | VARCHAR(20) | NULL | `ANNOUNCEMENT`, `BROADCAST`, `ASSIGNMENT`… |
| ref_id | UUID | NULL | |
| read_at | TIMESTAMPTZ | NULL | |
| | | **IDX(user_id, created_at DESC) WHERE read_at IS NULL** | |

**`broadcasts`** — Thông báo hàng loạt của Admin.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| title | VARCHAR(200) | NN | |
| body | TEXT | NN | |
| audience | VARCHAR(12) | NN | `ALL`, `STUDENT`, `VIP`, `TEACHER`, `HEAD_TEACHER` |
| channels | TEXT[] | NN | `IN_APP`, `EMAIL` |
| status | VARCHAR(10) | NN, DEFAULT `'DRAFT'` | `DRAFT`, `SCHEDULED`, `SENT` |
| scheduled_at | TIMESTAMPTZ | NULL | |
| sent_at | TIMESTAMPTZ | NULL | |
| created_by | UUID | FK→users SET NULL | |
| reach_count | INT | NN, DEFAULT 0 | |
| open_count | INT | NN, DEFAULT 0 | |

#### 10.5.15. Phân hệ 15 — Gói dịch vụ & thanh toán

**`subscription_plans`** — Gói + quyền lợi/hạn mức (Feature Gating).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| code | VARCHAR(30) | NN, UQ | `FREE`, `VIP_TOEIC_90`, `VSTEP_MASTER_180` |
| name | VARCHAR(80) | NN | |
| description | TEXT | NULL | |
| price | BIGINT | NN, CK ≥ 0 | VND |
| compare_at_price | BIGINT | NULL | Giá gạch |
| duration_days | SMALLINT | NULL | NULL = vĩnh viễn |
| exam_scope | `exam_type` | NULL | NULL = cả hai kỳ thi |
| entitlements | JSONB | NN | `{AI_COPILOT:{limit:20, period:"DAY"}, MOCK_TEST_VIP:{limit:null}, PDF_EXPORT:{limit:0}}` |
| features_display | JSONB | NN | `[{text, included}]` hiển thị trang Bảng giá |
| badge | VARCHAR(30) | NULL | |
| is_highlighted | BOOL | NN, DEFAULT false | |
| is_active | BOOL | NN, DEFAULT true | |
| order_index | SMALLINT | NN, DEFAULT 0 | |

**`user_subscriptions`** — Gói người dùng sở hữu.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users CASCADE, IDX | |
| plan_id | UUID | FK→subscription_plans RESTRICT | |
| status | `subscription_status` | NN, DEFAULT `PENDING` | |
| starts_at | TIMESTAMPTZ | NULL | |
| ends_at | TIMESTAMPTZ | NULL, IDX | Cron hết hạn → `EXPIRED` |
| payment_id | UUID | FK→payment_transactions SET NULL | |
| granted_by | UUID | FK→users SET NULL | Admin tặng gói |
| cancelled_at | TIMESTAMPTZ | NULL | |

**`coupons`** — Mã giảm giá.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| code | VARCHAR(30) | NN, UQ | |
| discount_type | VARCHAR(7) | NN | `PERCENT`, `AMOUNT` |
| discount_value | BIGINT | NN, CK > 0 | |
| plan_ids | UUID[] | NULL | NULL = mọi gói |
| max_redemptions | INT | NULL | |
| redeemed_count | INT | NN, DEFAULT 0 | |
| valid_from | TIMESTAMPTZ | NULL | |
| valid_to | TIMESTAMPTZ | NULL | |
| is_active | BOOL | NN, DEFAULT true | |

**`payment_transactions`** — Giao dịch (không xoá cứng), kèm mã giảm giá và nhật ký IPN.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users RESTRICT, IDX | |
| plan_id | UUID | FK→subscription_plans RESTRICT | |
| coupon_id | UUID | FK→coupons SET NULL | |
| order_code | VARCHAR(40) | NN, UQ | Mã đơn gửi sang cổng |
| method | `payment_method` | NN | |
| amount | BIGINT | NN, CK > 0 | Số tiền thực trả |
| discount_amount | BIGINT | NN, DEFAULT 0 | |
| status | `payment_status` | NN, DEFAULT `PENDING`, IDX(status, created_at) | |
| provider_txn_id | VARCHAR(100) | NULL, UQ | Mã giao dịch VNPAY/MoMo — chống xử lý trùng |
| ipn_logs | JSONB | NN, DEFAULT `'[]'` | `[{receivedAt, signatureValid, payload}]` (đã lọc dữ liệu nhạy cảm) |
| ip_address | INET | NULL | |
| paid_at | TIMESTAMPTZ | NULL | |
| refunded_at | TIMESTAMPTZ | NULL | |
| refund_reason | TEXT | NULL | |
| | | UQ partial (coupon_id, user_id) WHERE status = 'PAID' — mỗi người 1 mã 1 lần | |

#### 10.5.16. Phân hệ 16 — Hỗ trợ & khiếu nại

**`tickets`** — Yêu cầu hỗ trợ **và** khiếu nại/phúc khảo học thuật (`category = ACADEMIC` → chuyển Trưởng bộ môn).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users SET NULL | NULL = khách vãng lai |
| guest_name | VARCHAR(120) | NULL | |
| guest_email | CITEXT | NULL | |
| channel | VARCHAR(6) | NN | `CHAT`, `EMAIL`, `PHONE`, `IN_APP` |
| category | `ticket_category` | NN, DEFAULT `OTHER` | |
| academic_issue | VARCHAR(12) | NULL | `WRONG_KEY`, `TYPO`, `AUDIO_ISSUE`, `EXPLANATION`, `REGRADE` |
| question_id | UUID | FK→questions SET NULL | |
| attempt_id | UUID | FK→exam_attempts SET NULL | |
| submission_id | UUID | FK→assignment_submissions SET NULL | Phúc khảo bài chấm |
| subject | VARCHAR(200) | NN | |
| status | `ticket_status` | NN, DEFAULT `OPEN`, IDX | |
| priority | VARCHAR(6) | NN, DEFAULT `'NORMAL'` | `LOW`, `NORMAL`, `HIGH` |
| assignee_id | UUID | FK→users SET NULL | Nhân viên / Trưởng bộ môn |
| resolution | TEXT | NULL | |
| resolved_at | TIMESTAMPTZ | NULL | |
| | | CK user_id IS NOT NULL OR guest_email IS NOT NULL | |

**`ticket_messages`** — Tin nhắn trong ticket.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| ticket_id | UUID | FK→tickets CASCADE, IDX | |
| sender_type | VARCHAR(6) | NN | `USER`, `STAFF`, `BOT`, `SYSTEM` |
| sender_id | UUID | FK→users SET NULL | |
| text | TEXT | NN | |
| links | JSONB | NULL | `[{label, to}]` |

**`faqs`** — Câu hỏi thường gặp **và** câu trả lời mẫu cho chat hỗ trợ.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| category | VARCHAR(40) | NN | |
| question | TEXT | NN | |
| answer | TEXT | NN | |
| keywords | TEXT[] | NN, DEFAULT `'{}'`, GIN | Từ khoá không dấu để bot khớp |
| chat_texts | TEXT[] | NULL | Mỗi phần tử 1 bóng tin; NULL = dùng `answer` |
| links | JSONB | NULL | |
| show_in_faq | BOOL | NN, DEFAULT true | |
| show_in_chat | BOOL | NN, DEFAULT false | |
| order_index | SMALLINT | NN, DEFAULT 0 | |

#### 10.5.17. Phân hệ 17 — CMS & marketing

**`posts`** (S) — Blog và bộ bài Giới thiệu kỳ thi TOEIC/VSTEP.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| kind | VARCHAR(10) | NN, DEFAULT `'BLOG'` | `BLOG`, `EXAM_GUIDE`, `NEWS` |
| slug | VARCHAR(160) | NN, UQ | |
| title | VARCHAR(220) | NN | |
| excerpt | VARCHAR(400) | NN | |
| content_blocks | JSONB | NN | Khối nội dung (heading / đoạn / gạch đầu dòng) |
| category | VARCHAR(60) | NULL | |
| category_slug | VARCHAR(60) | NULL, IDX | |
| tags | TEXT[] | NN, DEFAULT `'{}'`, GIN | |
| exam_type | `exam_type` | NULL | Với EXAM_GUIDE |
| series_order | SMALLINT | NULL | Thứ tự trong bộ 8 bài |
| author_id | UUID | FK→users SET NULL | |
| cover_url | TEXT | NULL | |
| read_minutes | SMALLINT | NN | |
| views_count | INT | NN, DEFAULT 0 | |
| status | `content_status` | NN, DEFAULT `DRAFT` | |
| published_at | TIMESTAMPTZ | NULL, IDX | |
| | | UQ partial (exam_type, series_order) WHERE kind = 'EXAM_GUIDE' | |

**`testimonials`** — Cảm nhận học viên (điểm trước/sau).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | UUID | FK→users SET NULL | |
| name | VARCHAR(120) | NN | |
| role_text | VARCHAR(120) | NULL | |
| avatar_url | TEXT | NULL | |
| exam_type | `exam_type` | NN | |
| test_name | VARCHAR(120) | NN | |
| score_before | VARCHAR(20) | NN | |
| score_after | VARCHAR(20) | NN | |
| weeks | SMALLINT | NN | |
| exam_date | DATE | NULL | |
| venue | VARCHAR(160) | NULL | |
| certificate_masked | VARCHAR(30) | NULL | |
| quote | TEXT | NN | |
| consent_at | TIMESTAMPTZ | NULL | Học viên đồng ý công khai |
| is_published | BOOL | NN, DEFAULT false | |

#### 10.5.18. Phân hệ 18 — Cấu hình hệ thống

**`system_settings`** — Tham số vận hành + dữ liệu tham chiếu tĩnh.

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| key | VARCHAR(80) | PK | `exam.autosave_seconds`, `srs.max_new_per_day`, `maintenance.enabled`, `score.conversion.TOEIC`, `score.conversion.VSTEP`, `score.equivalences` |
| group_name | VARCHAR(40) | NN | |
| label | VARCHAR(160) | NN | |
| description | TEXT | NULL | |
| value_type | VARCHAR(10) | NN | `TOGGLE`, `NUMBER`, `TEXT`, `SELECT`, `JSON` |
| value | JSONB | NN | Bảng quy đổi: `{LISTENING:{"0":5,…,"100":495}, READING:{…}}`; bảng tương đương: `[{cefr, vstep, toeic, ielts, toefl, description}]` |
| options | JSONB | NULL | |
| updated_by | UUID | FK→users SET NULL | |

**View (không phải bảng):** `v_review_queue` = UNION các bản ghi `status = 'PENDING_REVIEW'` từ `courses`, `lessons`, `passages`, `questions`, `mock_tests`, `grammar_topics`, `speaking_materials`, `posts` → màn hình Phê duyệt của Trưởng bộ môn.

### 10.6. Sơ đồ Thực thể – Quan hệ (ERD) tổng thể

> Một sơ đồ duy nhất chứa **toàn bộ 59 bảng · 109 khoá ngoại**, sinh trực tiếp từ đặc tả ở 10.5 nên luôn khớp. Mỗi bảng thể hiện đủ cột, kiểu dữ liệu và khoá **PK / FK / UK** (kể cả `id`, `created_at`, `updated_at`, `deleted_at`). Ký hiệu Crow's Foot: `||` đúng 1 · `|o` 0 hoặc 1 · `o{` 0 hoặc nhiều. Nhãn trên đường nối là **tên cột khoá ngoại** ở bảng con.

![ERD tổng thể 59 bảng – OrbiLingo](docs/database/erd-tong-the.png)

*Ảnh kích thước gốc 13.221 × 6.408 px. Mở [bản SVG (phóng to không vỡ nét)](docs/database/erd-tong-the.svg) hoặc [bản PNG](docs/database/erd-tong-the.png) để xem chi tiết từng bảng.*

**Mã nguồn Mermaid của sơ đồ** (dùng để sinh lại ảnh khi đặc tả 10.5 thay đổi):

```mermaid
erDiagram
  users {
    uuid id PK
    citext email UK
    varchar(255) password_hash
    varchar(64) google_id UK
    varchar(64) facebook_id UK
    user_role role
    user_status status
    timestamptz email_verified_at
    text locked_reason
    varchar(120) full_name
    text avatar_url
    varchar(20) phone
    date date_of_birth
    varchar(10) gender
    varchar(160) organization
    varchar(80) city
    text bio
    uuid department_id FK
    int xp_total
    int streak_current
    int streak_longest
    smallint streak_freezes
    date last_study_date
    timestamptz last_active_at
    jsonb settings
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  user_tokens {
    uuid id PK
    uuid user_id FK
    token_type type
    char(64) token_hash UK
    uuid family_id
    text user_agent
    inet ip_address
    timestamptz expires_at
    timestamptz used_at
    timestamptz revoked_at
    timestamptz created_at
    timestamptz updated_at
  }
  role_permissions {
    user_role role PK
    varchar(80) permission_code PK
    uuid granted_by FK
    timestamptz created_at
    timestamptz updated_at
  }
  audit_logs {
    uuid id PK
    uuid actor_id FK
    user_role actor_role
    varchar(80) action
    varchar(40) resource_type
    uuid resource_id
    varchar(8) severity
    inet ip_address
    jsonb before_data
    jsonb after_data
    timestamptz created_at
  }
  departments {
    uuid id PK
    varchar(20) code UK
    varchar(120) name
    exam_type exam_type
    uuid head_id FK
    text description
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  learning_goals {
    uuid id PK
    uuid user_id FK
    exam_type exam_type
    varchar(20) current_level
    smallint target_score
    cefr_level target_level
    date target_date
    varchar(20) purpose
    smallint[] study_days
    smallint minutes_per_day
    varchar(10) preferred_slot
    bool is_active
    timestamptz created_at
    timestamptz updated_at
  }
  user_abilities {
    uuid id PK
    uuid user_id FK
    exam_type exam_type
    skill_type skill
    uuid tag_id FK
    numeric theta
    numeric theta_se
    smallint estimated_score
    int correct_count
    int total_count
    numeric mastery
    timestamptz last_practiced_at
    timestamptz created_at
    timestamptz updated_at
  }
  learning_paths {
    uuid id PK
    uuid user_id FK
    uuid goal_id FK
    exam_type exam_type
    varchar(10) generated_by
    smallint version
    bool is_active
    numeric progress_pct
    jsonb milestones
    timestamptz created_at
    timestamptz updated_at
  }
  learning_path_items {
    uuid id PK
    uuid path_id FK
    smallint phase
    varchar(160) title
    path_item_type item_type
    uuid ref_id
    jsonb ref_config
    skill_type skill
    smallint duration_min
    smallint order_index
    progress_status status
    timestamptz completed_at
    timestamptz created_at
    timestamptz updated_at
  }
  media_files {
    uuid id PK
    uuid owner_id FK
    text storage_key UK
    text url
    varchar(100) mime_type
    bigint size_bytes
    numeric duration_sec
    char(64) checksum_sha256
    varchar(20) purpose
    bool is_private
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  courses {
    uuid id PK
    varchar(140) slug UK
    varchar(200) title
    course_category category
    exam_type exam_type
    cefr_level level
    text description
    text cover_url
    varchar(80) theme_gradient
    bool is_sequential
    bool is_free
    uuid author_id FK
    uuid department_id FK
    content_status status
    uuid reviewed_by FK
    text review_note
    smallint lessons_count
    int duration_min
    int students_count
    numeric rating_avg
    int rating_count
    timestamptz published_at
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  course_sections {
    uuid id PK
    uuid course_id FK
    smallint part_no
    varchar(120) part_title
    varchar(200) title
    smallint order_index
    timestamptz created_at
    timestamptz updated_at
  }
  lessons {
    uuid id PK
    uuid section_id FK
    varchar(200) title
    lesson_type type
    varchar(300) summary
    text content_md
    skill_type skill
    text video_url
    text audio_url
    jsonb transcript
    uuid quiz_test_id FK
    smallint pass_score_pct
    smallint duration_min
    bool is_free_preview
    smallint order_index
    content_status status
    uuid reviewed_by FK
    text review_note
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  course_enrollments {
    uuid id PK
    uuid user_id FK
    uuid course_id FK
    varchar(10) source
    numeric progress_pct
    uuid current_lesson_id FK
    timestamptz completed_at
    smallint rating
    text review
    timestamptz created_at
    timestamptz updated_at
  }
  lesson_progress {
    uuid id PK
    uuid user_id FK
    uuid lesson_id FK
    progress_status status
    int last_position_sec
    int time_spent_sec
    smallint best_score_pct
    timestamptz completed_at
    timestamptz created_at
    timestamptz updated_at
  }
  bookmarks {
    uuid id PK
    uuid user_id FK
    varchar(16) target_type
    uuid target_id
    text note
    timestamptz created_at
    timestamptz updated_at
  }
  vocab_topics {
    uuid id PK
    varchar(120) slug UK
    varchar(120) name
    varchar(40) icon
    varchar(80) theme_gradient
    exam_type exam_type
    cefr_level level
    bool is_free
    smallint words_count
    smallint order_index
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  words {
    uuid id PK
    uuid topic_id FK
    varchar(80) headword
    varchar(12) pos
    varchar(80) ipa_uk
    varchar(80) ipa_us
    text meaning_vi
    text meaning_en
    text example_en
    text example_vi
    text audio_url
    text image_url
    cefr_level level
    smallint order_in_topic
    timestamptz created_at
    timestamptz updated_at
  }
  grammar_topics {
    uuid id PK
    varchar(120) slug UK
    varchar(160) title
    varchar(40) category
    cefr_level level
    text summary
    jsonb rules
    uuid tag_id FK
    smallint order_index
    content_status status
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  skill_tags {
    uuid id PK
    uuid parent_id FK
    varchar(120) slug UK
    varchar(160) name
    skill_type skill
    exam_type exam_type
    int questions_count
    timestamptz created_at
    timestamptz updated_at
  }
  passages {
    uuid id PK
    varchar(10) purpose
    exam_type exam_type
    exam_part part
    varchar(200) title
    text content_md
    text transcript
    jsonb segments
    text audio_url
    text image_url
    cefr_level level
    uuid source_lesson_id FK
    bool is_free
    content_status status
    uuid author_id FK
    uuid reviewed_by FK
    text review_note
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  questions {
    uuid id PK
    uuid passage_id FK
    smallint order_in_passage
    exam_type exam_type
    exam_part part
    skill_type skill
    question_type type
    cefr_level level
    uuid[] tag_ids
    text stem
    jsonb options
    jsonb correct_answer
    text explanation_md
    text translation_vi
    text audio_url
    text image_url
    jsonb task_config
    uuid rubric_id FK
    numeric irt_a
    numeric irt_b
    int calibrated_n
    int exposure_count
    numeric correct_rate
    smallint version
    varchar(10) source
    content_status status
    uuid author_id FK
    uuid reviewed_by FK
    text review_note
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  question_versions {
    uuid id PK
    uuid question_id FK
    smallint version
    jsonb snapshot
    uuid changed_by FK
    timestamptz created_at
    timestamptz updated_at
  }
  rubrics {
    uuid id PK
    varchar(40) code UK
    varchar(160) name
    exam_type exam_type
    skill_type skill
    numeric scale_max
    jsonb criteria
    timestamptz created_at
    timestamptz updated_at
  }
  mock_tests {
    uuid id PK
    varchar(140) slug UK
    varchar(200) title
    exam_type exam_type
    test_kind kind
    varchar(20) level
    smallint year
    smallint duration_min
    smallint total_questions
    jsonb sections
    jsonb score_table
    bool is_free
    bool is_adaptive
    text[] tags
    text cover_url
    smallint version
    content_status status
    uuid author_id FK
    uuid reviewed_by FK
    text review_note
    int attempts_count
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  mock_test_questions {
    uuid test_id PK, FK
    uuid question_id PK, FK
    exam_part part
    smallint question_no
    numeric points
    timestamptz created_at
    timestamptz updated_at
  }
  exam_attempts {
    uuid id PK
    uuid user_id FK
    uuid test_id FK
    smallint test_version
    uuid passage_id FK
    uuid lesson_id FK
    uuid assignment_id FK
    attempt_mode mode
    varchar(12) purpose
    exam_part[] selected_parts
    int time_limit_sec
    attempt_status status
    jsonb question_order
    jsonb cat_state
    timestamptz started_at
    timestamptz last_saved_at
    timestamptz submitted_at
    int time_spent_sec
    smallint correct_count
    smallint total_count
    numeric score_total
    numeric score_listening
    numeric score_reading
    numeric score_writing
    numeric score_speaking
    cefr_level cefr_result
    numeric theta
    jsonb part_results
    jsonb result_detail
    jsonb client_info
    timestamptz created_at
    timestamptz updated_at
  }
  attempt_answers {
    uuid id PK
    uuid attempt_id FK
    uuid question_id FK
    smallint question_version
    smallint order_index
    jsonb selected
    text text_answer
    text audio_url
    bool is_correct
    numeric score
    int time_spent_ms
    bool is_flagged
    timestamptz answered_at
    timestamptz created_at
    timestamptz updated_at
  }
  gradings {
    uuid id PK
    uuid answer_id FK
    uuid submission_id FK
    grader_type grader_type
    uuid grader_id FK
    uuid rubric_id FK
    jsonb criteria_scores
    numeric total_score
    text feedback
    jsonb inline_comments
    text voice_note_url
    bool is_final
    timestamptz graded_at
    review_result review_status
    uuid reviewer_id FK
    jsonb review_scores
    numeric review_total
    text review_note
    timestamptz reviewed_at
    timestamptz created_at
    timestamptz updated_at
  }
  mistake_entries {
    uuid id PK
    uuid user_id FK
    uuid question_id FK
    jsonb last_wrong_answer
    smallint wrong_count
    varchar(12) source
    uuid last_attempt_id FK
    mistake_cause cause
    varchar(5) cause_source
    uuid tag_id FK
    text note
    bool is_resolved
    timestamptz first_wrong_at
    timestamptz last_wrong_at
    timestamptz resolved_at
    timestamptz created_at
    timestamptz updated_at
  }
  srs_cards {
    uuid id PK
    uuid user_id FK
    uuid word_id FK
    uuid mistake_id FK
    srs_status status
    numeric ease_factor
    int interval_days
    smallint repetitions
    smallint lapses
    timestamptz next_review_at
    timestamptz last_reviewed_at
    timestamptz created_at
    timestamptz updated_at
  }
  srs_review_logs {
    uuid id PK
    uuid card_id FK
    uuid user_id FK
    smallint quality
    int prev_interval
    int new_interval
    numeric new_ease
    int response_ms
    timestamptz created_at
  }
  speaking_materials {
    uuid id PK
    varchar(14) kind
    varchar(160) title
    exam_type exam_type
    cefr_level level
    jsonb data
    bool is_vip
    content_status status
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  speaking_recordings {
    uuid id PK
    uuid user_id FK
    varchar(14) source_type
    uuid source_id
    text reference_text
    text audio_url
    text asr_text
    smallint score_overall
    smallint score_accuracy
    smallint score_fluency
    smallint score_prosody
    jsonb phoneme_result
    jsonb pitch_contour
    timestamptz created_at
    timestamptz updated_at
  }
  ai_conversations {
    uuid id PK
    uuid user_id FK
    ai_mode mode
    uuid material_id FK
    varchar(10) context_type
    uuid context_id
    varchar(200) title
    int tokens_in
    int tokens_out
    jsonb report
    timestamptz ended_at
    timestamptz created_at
    timestamptz updated_at
  }
  ai_messages {
    uuid id PK
    uuid conversation_id FK
    varchar(10) role
    text content
    text audio_url
    varchar(60) model
    int tokens_in
    int tokens_out
    int latency_ms
    timestamptz created_at
  }
  classes {
    uuid id PK
    uuid department_id FK
    uuid teacher_id FK
    varchar(160) name
    varchar(16) code UK
    exam_type exam_type
    varchar(20) level
    text description
    varchar(80) room
    varchar(120) schedule_text
    text cover_url
    date start_date
    date end_date
    smallint max_students
    bool is_archived
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  class_members {
    uuid id PK
    uuid class_id FK
    uuid student_id FK
    varchar(8) status
    varchar(8) risk_level
    timestamptz joined_at
    timestamptz created_at
    timestamptz updated_at
  }
  class_sessions {
    uuid id PK
    uuid class_id FK
    uuid teacher_id FK
    date session_date
    time start_time
    time end_time
    varchar(80) room
    varchar(200) topic
    varchar(10) status
    text note
    jsonb attendance
    uuid observer_id FK
    jsonb observation
    timestamptz created_at
    timestamptz updated_at
  }
  class_announcements {
    uuid id PK
    uuid class_id FK
    uuid author_id FK
    varchar(200) title
    text body
    bool is_pinned
    int read_count
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  materials {
    uuid id PK
    uuid class_id FK
    uuid uploaded_by FK
    varchar(200) title
    text description
    varchar(6) type
    varchar(60) category
    text file_url
    bigint size_bytes
    smallint pages
    int downloads_count
    bool is_vip
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  assignments {
    uuid id PK
    uuid class_id FK
    uuid created_by FK
    varchar(200) title
    assignment_type type
    uuid target_id
    jsonb target_config
    text note
    timestamptz open_at
    timestamptz due_at
    bool allow_late
    numeric max_score
    varchar(6) status
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  assignment_submissions {
    uuid id PK
    uuid assignment_id FK
    uuid student_id FK
    submission_status status
    uuid attempt_id FK
    text content
    text audio_url
    timestamptz submitted_at
    numeric score
    text feedback
    timestamptz graded_at
    timestamptz created_at
    timestamptz updated_at
  }
  student_notes {
    uuid id PK
    uuid teacher_id FK
    uuid student_id FK
    uuid class_id FK
    varchar(8) kind
    text content
    date note_date
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  daily_activities {
    uuid user_id PK, FK
    date activity_date PK
    smallint minutes
    smallint questions_answered
    smallint lessons_completed
    smallint cards_reviewed
    int xp
    bool goal_met
    jsonb ai_usage
    timestamptz created_at
    timestamptz updated_at
  }
  user_achievements {
    uuid user_id PK, FK
    varchar(40) achievement_code PK
    int progress
    timestamptz earned_at
    timestamptz created_at
    timestamptz updated_at
  }
  certificates {
    uuid id PK
    uuid user_id FK
    varchar(20) type
    uuid course_id FK
    uuid attempt_id FK
    varchar(30) serial_no UK
    char(32) verify_token UK
    varchar(40) score_text
    text pdf_url
    timestamptz issued_at
    timestamptz revoked_at
    timestamptz created_at
    timestamptz updated_at
  }
  notifications {
    uuid id PK
    uuid user_id FK
    notification_type type
    varchar(200) title
    text message
    text link
    varchar(20) ref_type
    uuid ref_id
    timestamptz read_at
    timestamptz created_at
    timestamptz updated_at
  }
  broadcasts {
    uuid id PK
    varchar(200) title
    text body
    varchar(12) audience
    text[] channels
    varchar(10) status
    timestamptz scheduled_at
    timestamptz sent_at
    uuid created_by FK
    int reach_count
    int open_count
    timestamptz created_at
    timestamptz updated_at
  }
  subscription_plans {
    uuid id PK
    varchar(30) code UK
    varchar(80) name
    text description
    bigint price
    bigint compare_at_price
    smallint duration_days
    exam_type exam_scope
    jsonb entitlements
    jsonb features_display
    varchar(30) badge
    bool is_highlighted
    bool is_active
    smallint order_index
    timestamptz created_at
    timestamptz updated_at
  }
  user_subscriptions {
    uuid id PK
    uuid user_id FK
    uuid plan_id FK
    subscription_status status
    timestamptz starts_at
    timestamptz ends_at
    uuid payment_id FK
    uuid granted_by FK
    timestamptz cancelled_at
    timestamptz created_at
    timestamptz updated_at
  }
  coupons {
    uuid id PK
    varchar(30) code UK
    varchar(7) discount_type
    bigint discount_value
    uuid[] plan_ids
    int max_redemptions
    int redeemed_count
    timestamptz valid_from
    timestamptz valid_to
    bool is_active
    timestamptz created_at
    timestamptz updated_at
  }
  payment_transactions {
    uuid id PK
    uuid user_id FK
    uuid plan_id FK
    uuid coupon_id FK
    varchar(40) order_code UK
    payment_method method
    bigint amount
    bigint discount_amount
    payment_status status
    varchar(100) provider_txn_id UK
    jsonb ipn_logs
    inet ip_address
    timestamptz paid_at
    timestamptz refunded_at
    text refund_reason
    timestamptz created_at
    timestamptz updated_at
  }
  tickets {
    uuid id PK
    uuid user_id FK
    varchar(120) guest_name
    citext guest_email
    varchar(6) channel
    ticket_category category
    varchar(12) academic_issue
    uuid question_id FK
    uuid attempt_id FK
    uuid submission_id FK
    varchar(200) subject
    ticket_status status
    varchar(6) priority
    uuid assignee_id FK
    text resolution
    timestamptz resolved_at
    timestamptz created_at
    timestamptz updated_at
  }
  ticket_messages {
    uuid id PK
    uuid ticket_id FK
    varchar(6) sender_type
    uuid sender_id FK
    text text
    jsonb links
    timestamptz created_at
  }
  faqs {
    uuid id PK
    varchar(40) category
    text question
    text answer
    text[] keywords
    text[] chat_texts
    jsonb links
    bool show_in_faq
    bool show_in_chat
    smallint order_index
    timestamptz created_at
    timestamptz updated_at
  }
  posts {
    uuid id PK
    varchar(10) kind
    varchar(160) slug UK
    varchar(220) title
    varchar(400) excerpt
    jsonb content_blocks
    varchar(60) category
    varchar(60) category_slug
    text[] tags
    exam_type exam_type
    smallint series_order
    uuid author_id FK
    text cover_url
    smallint read_minutes
    int views_count
    content_status status
    timestamptz published_at
    timestamptz created_at
    timestamptz updated_at
    timestamptz deleted_at
  }
  testimonials {
    uuid id PK
    uuid user_id FK
    varchar(120) name
    varchar(120) role_text
    text avatar_url
    exam_type exam_type
    varchar(120) test_name
    varchar(20) score_before
    varchar(20) score_after
    smallint weeks
    date exam_date
    varchar(160) venue
    varchar(30) certificate_masked
    text quote
    timestamptz consent_at
    bool is_published
    timestamptz created_at
    timestamptz updated_at
  }
  system_settings {
    varchar(80) key PK
    varchar(40) group_name
    varchar(160) label
    text description
    varchar(10) value_type
    jsonb value
    jsonb options
    uuid updated_by FK
    timestamptz created_at
    timestamptz updated_at
  }
  departments |o--o{ users : "department_id"
  users |o--o{ user_tokens : "user_id"
  users |o--o{ role_permissions : "granted_by"
  users |o--o{ audit_logs : "actor_id"
  users |o--o{ departments : "head_id"
  users |o--o{ learning_goals : "user_id"
  users |o--o{ user_abilities : "user_id"
  skill_tags |o--o{ user_abilities : "tag_id"
  users |o--o{ learning_paths : "user_id"
  learning_goals |o--o{ learning_paths : "goal_id"
  learning_paths |o--o{ learning_path_items : "path_id"
  users |o--o{ media_files : "owner_id"
  users |o--o{ courses : "author_id"
  departments |o--o{ courses : "department_id"
  users |o--o{ courses : "reviewed_by"
  courses |o--o{ course_sections : "course_id"
  course_sections |o--o{ lessons : "section_id"
  mock_tests |o--o{ lessons : "quiz_test_id"
  users |o--o{ lessons : "reviewed_by"
  users |o--o{ course_enrollments : "user_id"
  courses |o--o{ course_enrollments : "course_id"
  lessons |o--o{ course_enrollments : "current_lesson_id"
  users |o--o{ lesson_progress : "user_id"
  lessons |o--o{ lesson_progress : "lesson_id"
  users |o--o{ bookmarks : "user_id"
  vocab_topics |o--o{ words : "topic_id"
  skill_tags |o--o{ grammar_topics : "tag_id"
  skill_tags |o--o{ skill_tags : "parent_id"
  lessons |o--o{ passages : "source_lesson_id"
  users |o--o{ passages : "author_id"
  users |o--o{ passages : "reviewed_by"
  passages |o--o{ questions : "passage_id"
  rubrics |o--o{ questions : "rubric_id"
  users |o--o{ questions : "author_id"
  users |o--o{ questions : "reviewed_by"
  questions |o--o{ question_versions : "question_id"
  users |o--o{ question_versions : "changed_by"
  users |o--o{ mock_tests : "author_id"
  users |o--o{ mock_tests : "reviewed_by"
  mock_tests ||--o{ mock_test_questions : "test_id"
  questions ||--o{ mock_test_questions : "question_id"
  users |o--o{ exam_attempts : "user_id"
  mock_tests |o--o{ exam_attempts : "test_id"
  passages |o--o{ exam_attempts : "passage_id"
  lessons |o--o{ exam_attempts : "lesson_id"
  assignments |o--o{ exam_attempts : "assignment_id"
  exam_attempts |o--o{ attempt_answers : "attempt_id"
  questions |o--o{ attempt_answers : "question_id"
  attempt_answers |o--o{ gradings : "answer_id"
  assignment_submissions |o--o{ gradings : "submission_id"
  users |o--o{ gradings : "grader_id"
  rubrics |o--o{ gradings : "rubric_id"
  users |o--o{ gradings : "reviewer_id"
  users |o--o{ mistake_entries : "user_id"
  questions |o--o{ mistake_entries : "question_id"
  exam_attempts |o--o{ mistake_entries : "last_attempt_id"
  skill_tags |o--o{ mistake_entries : "tag_id"
  users |o--o{ srs_cards : "user_id"
  words |o--o{ srs_cards : "word_id"
  mistake_entries |o--o{ srs_cards : "mistake_id"
  srs_cards |o--o{ srs_review_logs : "card_id"
  users |o--o{ srs_review_logs : "user_id"
  users |o--o{ speaking_recordings : "user_id"
  users |o--o{ ai_conversations : "user_id"
  speaking_materials |o--o{ ai_conversations : "material_id"
  ai_conversations |o--o{ ai_messages : "conversation_id"
  departments |o--o{ classes : "department_id"
  users |o--o{ classes : "teacher_id"
  classes |o--o{ class_members : "class_id"
  users |o--o{ class_members : "student_id"
  classes |o--o{ class_sessions : "class_id"
  users |o--o{ class_sessions : "teacher_id"
  users |o--o{ class_sessions : "observer_id"
  classes |o--o{ class_announcements : "class_id"
  users |o--o{ class_announcements : "author_id"
  classes |o--o{ materials : "class_id"
  users |o--o{ materials : "uploaded_by"
  classes |o--o{ assignments : "class_id"
  users |o--o{ assignments : "created_by"
  assignments |o--o{ assignment_submissions : "assignment_id"
  users |o--o{ assignment_submissions : "student_id"
  exam_attempts |o--o{ assignment_submissions : "attempt_id"
  users |o--o{ student_notes : "teacher_id"
  users |o--o{ student_notes : "student_id"
  classes |o--o{ student_notes : "class_id"
  users ||--o{ daily_activities : "user_id"
  users ||--o{ user_achievements : "user_id"
  users |o--o{ certificates : "user_id"
  courses |o--o{ certificates : "course_id"
  exam_attempts |o--o{ certificates : "attempt_id"
  users |o--o{ notifications : "user_id"
  users |o--o{ broadcasts : "created_by"
  users |o--o{ user_subscriptions : "user_id"
  subscription_plans |o--o{ user_subscriptions : "plan_id"
  payment_transactions |o--o{ user_subscriptions : "payment_id"
  users |o--o{ user_subscriptions : "granted_by"
  users |o--o{ payment_transactions : "user_id"
  subscription_plans |o--o{ payment_transactions : "plan_id"
  coupons |o--o{ payment_transactions : "coupon_id"
  users |o--o{ tickets : "user_id"
  questions |o--o{ tickets : "question_id"
  exam_attempts |o--o{ tickets : "attempt_id"
  assignment_submissions |o--o{ tickets : "submission_id"
  users |o--o{ tickets : "assignee_id"
  tickets |o--o{ ticket_messages : "ticket_id"
  users |o--o{ ticket_messages : "sender_id"
  users |o--o{ posts : "author_id"
  users |o--o{ testimonials : "user_id"
  users |o--o{ system_settings : "updated_by"
```

### 10.7. Luồng ghi dữ liệu nghiệp vụ trọng yếu (Transaction Boundaries)

| # | Nghiệp vụ | Ghi trong **1 transaction** | Xử lý nền (BullMQ) sau commit |
|---|---|---|---|
| 1 | **Đăng ký** | `users` (PENDING) → `user_tokens` (EMAIL_VERIFY) | Gửi email xác thực |
| 2 | **Onboarding + Placement** | `learning_goals` → `exam_attempts` (purpose = PLACEMENT) → `user_abilities` | Sinh `learning_paths` + `learning_path_items` |
| 3 | **Bắt đầu làm đề** | Kiểm tra `subscription_plans.entitlements` (đề VIP) → `exam_attempts` (snapshot `question_order`) | Khoá Redis `attempt:{id}` |
| 4 | **Auto-save 15s** | UPSERT `attempt_answers` + `exam_attempts.last_saved_at` | — |
| 5 | **Nộp bài** | `exam_attempts` (điểm theo bảng quy đổi, `part_results`) → `attempt_answers.is_correct` → UPSERT `mistake_entries` → INSERT `srs_cards` → UPSERT `daily_activities` (xp, questions) → `users` (xp_total, streak) → `assignment_submissions` (nếu có) | Cập nhật θ & mastery (`user_abilities`), AI phân loại nguyên nhân lỗi, `user_achievements`, Redis leaderboard, `questions.correct_rate` |
| 6 | **Nộp Viết/Nói** | `attempt_answers` (text/audio) → `exam_attempts` (GRADING) | AI chấm → `gradings` (AI) → thông báo GV |
| 7 | **GV chấm bài** | `gradings` (TEACHER, is_final) → `assignment_submissions` (GRADED) → `notifications` | Lấy mẫu 10% → `gradings.review_status = PENDING` |
| 8 | **TBM kiểm định** | `gradings.review_*` → nếu ADJUSTED: cập nhật `assignment_submissions.score` → `audit_logs` | Thông báo GV + học viên |
| 9 | **Ôn tập SRS** | `srs_cards` (SM-2) → `srs_review_logs` → `daily_activities`; MASTERED → `mistake_entries.is_resolved` | — |
| 10 | **Thanh toán (IPN)** | `SELECT … FOR UPDATE` giao dịch theo `order_code` → kiểm chữ ký → nối `ipn_logs` → nếu đang PENDING: `PAID` → `user_subscriptions` (ACTIVE) → `coupons.redeemed_count` → `notifications` → `audit_logs` | Gửi email hoá đơn |
| 11 | **Duyệt nội dung** | Bảng đích: `status = PUBLISHED`, `reviewed_by`, `review_note` → `audit_logs` | Thông báo tác giả |
| 12 | **Điểm danh** | `class_sessions.attendance` + `status = DONE` | Tính lại `class_members.risk_level` |

### 10.8. Chỉ mục, phân vùng & tối ưu hiệu năng

1. **Chỉ mục truy vấn nóng:**
   - `srs_cards (user_id, next_review_at) WHERE status <> 'SUSPENDED'` — thẻ đến hạn hôm nay.
   - `questions (exam_type, part, status)`, `questions (irt_b)`, GIN `questions (tag_ids)` — CAT & luyện điểm yếu.
   - `exam_attempts (user_id, created_at DESC)` — lịch sử làm bài.
   - `notifications (user_id, created_at DESC) WHERE read_at IS NULL` — đếm chuông.
   - `assignment_submissions (student_id, status)` — "Bài tập của tôi".
   - `daily_activities (activity_date)` — tổng XP theo tuần cho BXH.
   - GIN `pg_trgm` trên `questions.stem`, `words.headword`, `users.full_name`, `posts.title`.
   - GIN `jsonb_path_ops` trên `class_sessions.attendance` (thống kê chuyên cần theo học viên).
2. **Phân vùng theo tháng** (`created_at`): `attempt_answers`, `srs_review_logs`, `audit_logs`, `ai_messages`.
3. **Materialized View** (refresh 15 phút): `mv_class_stats` (điểm TB, hoàn thành, chuyên cần theo lớp), `mv_question_stats` (tỷ lệ đúng, thời gian TB theo câu), `mv_admin_kpis` (DAU/MAU, doanh thu, chuyển đổi Free→VIP), `mv_tag_weakness` (chủ điểm yếu theo lớp/bộ môn).
4. **Cột cache** (`users.xp_total`, `courses.rating_avg`, `mock_tests.attempts_count`…) cập nhật trong transaction; job `reconcile-counters` chạy hằng đêm để tự sửa lệch.
5. **Redis:** leaderboard (ZSET tuần), đếm hạn mức AI theo ngày (chốt vào `daily_activities.ai_usage`), cache `subscription_plans` / `system_settings`, hàng đợi email & job nền.
6. **PgBouncer** (transaction pooling) trước PostgreSQL.

### 10.9. Ràng buộc toàn vẹn & Quy tắc nghiệp vụ trong CSDL

| Quy tắc | Cách cài đặt |
|---|---|
| 1 mục tiêu & 1 lộ trình đang hiệu lực / học viên | Partial unique `WHERE is_active` |
| 1 lượt làm dở / đề / học viên | Partial unique `(user_id, test_id) WHERE status = 'IN_PROGRESS'` |
| Không có 2 gói ACTIVE chồng thời gian | `EXCLUDE USING gist (user_id WITH =, tstzrange(starts_at, ends_at) WITH &&) WHERE status = 'ACTIVE'` |
| IPN thanh toán không xử lý 2 lần | `UQ provider_txn_id` + khoá dòng + chỉ chuyển `PENDING → PAID` |
| Thẻ SRS trỏ đúng 1 đối tượng | CHECK `num_nonnulls(word_id, mistake_id) = 1` |
| Chấm bài thuộc đúng 1 nguồn | CHECK `num_nonnulls(answer_id, submission_id) = 1` |
| Giá trị trong miền hợp lệ | CHECK: `target_score 10–990`, `irt_a 0.2–3`, `irt_b −4…4`, `ease_factor ≥ 1.3`, `quality 0–5`, `rating 1–5` |
| Cột JSONB đúng cấu trúc | Zod schema trong `packages/shared` kiểm tra ở Repository trước khi ghi |
| Chỉ GV/TBM làm chủ lớp, duyệt nội dung | Trigger `check_role()` trên `classes.teacher_id`, `departments.head_id`, cột `reviewed_by` |
| Kết quả thi & giao dịch không bị xoá cứng | FK `RESTRICT`; thu hồi quyền `DELETE` của role ứng dụng trên `exam_attempts`, `payment_transactions` |
| Câu hỏi trong đề đã PUBLISHED không sửa trực tiếp | Trigger chặn UPDATE nội dung → tạo `question_versions` mới và gửi duyệt lại |

### 10.10. Bảo mật, quyền riêng tư & vận hành dữ liệu

1. **Mật khẩu & token:** Argon2id; mọi token chỉ lưu SHA-256; Access token JWT 15 phút không lưu DB.
2. **Role DB:** `orbi_app` (không DDL), `orbi_readonly` (báo cáo), `orbi_migrator` (migration). Bật **Row-Level Security** cho `attempt_answers`, `speaking_recordings`, `ai_messages` theo `current_setting('app.user_id')`.
3. **Dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP):** mã hoá cột `phone`, `date_of_birth` bằng `pgcrypto`; ghi âm học viên chỉ truy cập qua signed URL 10 phút; hỗ trợ xuất dữ liệu cá nhân và xoá tài khoản (ẩn danh hoá, giữ số liệu thống kê).
4. **Thanh toán:** không lưu số thẻ/CVV; lọc trường nhạy cảm trước khi ghi `ipn_logs`; mọi thay đổi trạng thái giao dịch ghi `audit_logs` mức `CRITICAL`.
5. **Sao lưu:** WAL archiving + base backup hằng ngày (pgBackRest), giữ 14 ngày, PITR; RPO ≤ 5 phút, RTO ≤ 1 giờ; diễn tập khôi phục hằng tháng.
6. **Lưu giữ:** `audit_logs` 24 tháng; `ai_messages` 12 tháng; `user_tokens` hết hạn xoá sau 30 ngày.

### 10.11. Đối chiếu Schema hiện tại → Schema chuẩn & Kế hoạch Migration

`backend/prisma/schema.prisma` hiện có **33 models** → schema chuẩn **59 bảng** (26 bảng kế thừa/gộp từ model cũ + 33 bảng mới).

| Model hiện tại | Hành động | Bảng mới |
|---|---|---|
| `enum Role` | Thêm `HEAD_TEACHER` | `user_role` |
| `User` + `UserProfile` | **Gộp**; thêm `status`, `xp_total`, `streak_*`, `settings`, `department_id`, OAuth id | `users` |
| `RefreshToken` | Mở rộng thành token chung | `user_tokens` |
| `LearningGoal` + `LearningSchedule` | **Gộp**; thêm `is_active` | `learning_goals` |
| `LearningPath` + `LearningPathItem` | Giữ JSON `milestones`; item thêm `phase`, `status` | `learning_paths`, `learning_path_items` |
| `Course`, `CourseSection`, `Lesson` | Thêm `category`, `status`, `part_no`, `lesson.type`, `transcript`, `quiz_test_id` | `courses`, `course_sections`, `lessons` |
| `Enrollment`, `LessonProgress` | Đổi tên, thêm `rating/review`, `status` | `course_enrollments`, `lesson_progress` |
| `VocabularyTopic`, `VocabularyEntry` | Đổi tên | `vocab_topics`, `words` |
| `UserVocabulary` + `ReviewSchedule` | **Gộp** thành SRS chung | `srs_cards` |
| `VocabularyReviewLog` | Dùng chung cho mọi thẻ | `srs_review_logs` |
| `GrammarTopic` + `GrammarLesson` | **Gộp**, quy tắc thành JSONB `rules` | `grammar_topics` |
| `Passage`, `Question` | `part` dùng enum; thêm IRT, `status`, `tag_ids`, `rubric_id`, `task_config`; passage thêm `purpose` | `passages`, `questions` |
| `MockTest` + `MockTestSection` | **Gộp**, phần thi thành JSONB `sections` | `mock_tests` |
| `MockTestQuestion` | Đổi khoá thành (test_id, question_id) + `part` | `mock_test_questions` |
| `ExamAttempt` (JSON `answers`) | Tách đáp án ra bảng riêng; thêm `mode`, `part_results` | `exam_attempts`, `attempt_answers` |
| `MistakeNotebook` | Đổi tên, thêm `source`, `tag_id` | `mistake_entries` |
| `Class`, `ClassMember` | Thêm `department_id`, `exam_type`, `risk_level` | `classes`, `class_members` |
| `Assignment`, `AssignmentSubmission` | Thêm `type`, `target_config`, `status`; điểm chi tiết sang `gradings` | `assignments`, `assignment_submissions` |
| `AuditLog` | Thêm `actor_role`, `severity`, `before/after_data` | `audit_logs` |
| *(chưa có)* | **Thêm 33 bảng** | `role_permissions`, `departments`, `user_abilities`, `media_files`, `bookmarks`, `skill_tags`, `question_versions`, `rubrics`, `gradings`, `speaking_materials`, `speaking_recordings`, `ai_conversations`, `ai_messages`, `class_sessions`, `class_announcements`, `materials`, `student_notes`, `daily_activities`, `user_achievements`, `certificates`, `notifications`, `broadcasts`, `subscription_plans`, `user_subscriptions`, `coupons`, `payment_transactions`, `tickets`, `ticket_messages`, `faqs`, `posts`, `testimonials`, `system_settings`, `attempt_answers` |

**Trình tự migration (mỗi bước 1 migration Prisma, có thể rollback):**

1. `001_extensions_enums` — extension + enum.
2. `002_identity_org` — `users` (gộp profile), `user_tokens`, `role_permissions`, `audit_logs`, `departments`.
3. `003_content` — `media_files`, khoá học/bài học, từ vựng, ngữ pháp, `skill_tags`, `passages`, `questions`, `question_versions`, `rubrics`.
4. `004_exam_engine` — `mock_tests`, `mock_test_questions`, `exam_attempts`, `attempt_answers` (+ partition, script tách JSON `answers` cũ).
5. `005_learning_loop` — `learning_goals`, `user_abilities`, lộ trình, `mistake_entries`, `srs_cards`, `srs_review_logs` (script chuyển dữ liệu từ `UserVocabulary` / `ReviewSchedule`).
6. `006_classroom_grading` — phân hệ 9, 12.
7. `007_engagement_ai_notify` — phân hệ 11, 13, 14.
8. `008_commerce_support_cms` — phân hệ 15–18.
9. `009_indexes_views_rls` — partial index, GIN, `v_review_queue`, materialized views, RLS, trigger.

### 10.12. Truy vết Màn hình → Bảng dữ liệu

| Vai trò | Màn hình | Bảng chính |
|---|---|---|
| Guest | Trang chủ, Blog, Giới thiệu TOEIC/VSTEP, Bảng giá, FAQ, Tài nguyên, Quy đổi điểm, Thi thử nhanh, Chat hỗ trợ | `posts`, `subscription_plans`, `faqs`, `materials` (class_id NULL), `system_settings`, `testimonials`, `mock_tests`, `tickets`, `ticket_messages` |
| Guest | Đăng ký / Đăng nhập / Quên mật khẩu / Xác thực | `users`, `user_tokens` |
| Student | Onboarding, Mục tiêu, Test đầu vào | `learning_goals`, `exam_attempts`, `user_abilities`, `learning_paths` |
| Student | Dashboard, Lộ trình học | `learning_paths`, `learning_path_items`, `daily_activities`, `srs_cards`, `assignment_submissions` |
| Student | Khoá học, Bài học | `courses`, `course_sections`, `lessons`, `course_enrollments`, `lesson_progress`, `words` |
| Student | Đề thi thử, Làm bài, Kết quả, Luyện Part, Luyện điểm yếu | `mock_tests`, `mock_test_questions`, `questions`, `passages`, `exam_attempts`, `attempt_answers`, `user_abilities` |
| Student | Luyện Viết, Luyện Nói, Shadowing, Chép chính tả | `questions`, `rubrics`, `gradings`, `speaking_recordings`, `speaking_materials`, `passages` (DICTATION), `exam_attempts` |
| Student | Từ vựng, Flashcard, Ngữ pháp | `vocab_topics`, `words`, `srs_cards`, `grammar_topics`, `user_abilities` |
| Student | Sổ tay lỗi sai, Ôn tập | `mistake_entries`, `srs_cards`, `srs_review_logs` |
| Student | Tiến độ, Thành tích, Bảng xếp hạng | `daily_activities`, `user_abilities`, `user_achievements`, `certificates` |
| Student | Lớp của tôi, Bài tập, Thông báo, Đã lưu | `class_members`, `class_announcements`, `assignments`, `assignment_submissions`, `notifications`, `bookmarks` |
| Student | Hồ sơ, Cài đặt, Gói & thanh toán, AI Co-pilot | `users`, `user_subscriptions`, `payment_transactions`, `coupons`, `ai_conversations`, `ai_messages` |
| Teacher | Dashboard, Lớp, Học viên | `classes`, `class_members`, `student_notes`, `mv_class_stats` |
| Teacher | Lịch dạy, Điểm danh | `class_sessions` |
| Teacher | Giao bài, Chấm bài, Sổ điểm | `assignments`, `assignment_submissions`, `gradings`, `exam_attempts` |
| Teacher | Thư viện, Tài liệu, Phân tích | `questions`, `mock_tests`, `courses`, `materials`, `mv_tag_weakness` |
| Head Teacher | Bộ môn, Giáo viên, Lớp, Học viên, Lịch dự giờ | `departments`, `users`, `classes`, `class_members`, `class_sessions` (observation) |
| Head Teacher | Phê duyệt, Ngân hàng câu hỏi | `v_review_queue`, `questions`, `question_versions`, `passages`, `mock_tests`, `lessons` |
| Head Teacher | Kiểm định chấm, Khiếu nại, Báo cáo | `gradings` (review_*), `tickets` (ACADEMIC), `mv_class_stats`, `mv_question_stats` |
| Admin | Người dùng, Phân quyền, Audit log | `users`, `role_permissions`, `audit_logs` |
| Admin | Câu hỏi, Đề thi, Khoá học, Học liệu, Skill tags, Lớp | `questions`, `passages`, `mock_tests`, `courses`, `lessons`, `vocab_topics`, `grammar_topics`, `skill_tags`, `classes` |
| Admin | Thanh toán, Hỗ trợ, Thông báo hàng loạt, Blog | `payment_transactions`, `user_subscriptions`, `subscription_plans`, `coupons`, `tickets`, `broadcasts`, `notifications`, `posts` |
| Admin | Hệ thống, Cài đặt, Phân tích | `system_settings`, `mv_admin_kpis` |

### 10.13. Dữ liệu khởi tạo (Seed) & Tiêu chí nghiệm thu CSDL

**Seed bắt buộc (`backend/prisma/seed.ts`):**
- 5 tài khoản cho 5 vai trò, 2 bộ môn, 3 lớp, 30 học viên; `role_permissions` đầy đủ; `system_settings` mặc định kèm bảng quy đổi điểm TOEIC/VSTEP và bảng tương đương CEFR.
- `subscription_plans` (FREE, VIP_TOEIC_90, VSTEP_MASTER_180) kèm `entitlements`.
- `rubrics` VSTEP Writing Task 1/2, Speaking Part 1–3.
- `skill_tags`; ≥ 600 câu hỏi đủ Part 1–7 TOEIC và 4 kỹ năng VSTEP, có `irt_a/irt_b` khởi tạo; 4 đề TOEIC + 2 đề VSTEP.
- 3 lộ trình kiến thức chung (Phần 1 + bài kiểm tra giữa khoá + Phần 2); 16 bài Giới thiệu TOEIC/VSTEP (`posts.kind = EXAM_GUIDE`).
- `faqs` (gồm câu trả lời mẫu cho chat), `speaking_materials` (cặp âm + kịch bản nhập vai).

**Definition of Done cho CSDL:**

| Mã | Tiêu chí | Cách kiểm tra |
|---|---|---|
| DB-01 | `prisma migrate deploy` chạy sạch trên DB rỗng; reset + seed < 60 giây | CI job `db-check` |
| DB-02 | 100% FK có index ở cột con | Truy vấn `pg_constraint` đối chiếu `pg_index` |
| DB-03 | Mọi ràng buộc ở 10.9 có test tích hợp | Jest + Testcontainers PostgreSQL |
| DB-04 | Mọi cột JSONB có Zod schema và test parse dữ liệu seed | `pnpm test` ở `packages/shared` |
| DB-05 | Truy vấn nóng (thẻ đến hạn, lịch sử thi, chọn câu CAT) < 50 ms với 100k học viên giả lập | `EXPLAIN ANALYZE` + k6 |
| DB-06 | Nộp bài 200 câu (luồng #5) < 300 ms p95 | k6 load test |
| DB-07 | Enum/Types `packages/shared` khớp Prisma Client | `tsc --noEmit` + test so khớp enum |
| DB-08 | Backup/PITR khôi phục thành công trên staging | Biên bản diễn tập |

---

## XI. THỐNG KÊ TIẾN ĐỘ HOÀN THÀNH DỰ ÁN (PROJECT PROGRESS REPORT)

> **Thời điểm kiểm tra:** 07/11/2026, nhánh `master` (commit `246428d` và các thay đổi chưa commit). Tiến độ đo bằng cách đối chiếu từng hạng mục của Mục 9.3 và Mục VI với code thật trong `backend/src`, `frontend/src`, `packages/shared`, `backend/prisma`, cùng số liệu đếm trực tiếp trong CSDL `orbilingo_db`. Lịch sử các lần kiểm tra xem **Mục 11.7**.  
> **Cách quy đổi:** Đã xong = 100% · Đang làm (đã có một phần chạy được) = 50% · Chưa làm = 0%. Tỷ lệ = (Đã xong + 0,5 × Đang làm) / Tổng.

### 11.1. Bảng tổng hợp tỷ lệ hoàn thành

| Thước đo | Nhóm | Tổng | Đã xong | Đang làm | Chưa làm | Tỷ lệ hoàn thành |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| Checklist DoD (Mục 9.3) | Level 1 – Cơ bản | 4 | 4 | 0 | 0 | **100%** |
| | Level 2 – Trung cấp | 8 | 3 | 3 | 2 | **56%** |
| | Level 3 – Nâng cao | 9 | 2 | 2 | 5 | **33%** |
| | **Toàn bộ DoD** | **21** | **9** | **5** | **7** | **55%** |
| Sprint Backlog 16 tuần (Mục VI) | Sprint 1 & 2 – Monorepo, CSDL, Xác thực 5 cấp | 7 | 7 | 0 | 0 | **100%** |
| | Sprint 3 & 4 – Onboarding, Phòng thi, Video Studio | 13 | 9 | 2 | 2 | **77%** |
| | Sprint 5 & 6 – CAT, Dictation, Động lực học tập | 12 | 7 | 1 | 4 | **63%** |
| | Sprint 7 & 8 – Analytics, PDF, Thanh toán, Docker | 9 | 3 | 4 | 2 | **56%** |
| | **Toàn bộ Sprint** | **41** | **26** | **7** | **8** | **72%** |
| Chức năng theo phân hệ (Mục 11.2) | 7 phân hệ, 5 vai trò | 54 | 34 | 9 | 11 | **71%** |
| Cơ sở dữ liệu (Mục X) | Bảng đã tạo và nạp dữ liệu thật | 59 | 59 | 0 | 0 | **100%** |
| **Tổng hợp chung** | Trung bình của DoD và Sprint | | | | | **63%** |

**Đánh giá nhanh:** Chức năng cơ bản của cả **5 vai trò** (Khách, Học viên, Giáo viên, Trưởng bộ môn, Admin) đã chạy bằng dữ liệu thật — Level 1 đạt 100%. Phần còn thiếu nằm ở **tính năng nâng cao**: thi thích ứng CAT/IRT, nhóm tính năng AI, cổng thanh toán, xuất PDF/chứng chỉ, kiểm thử tự động và đóng gói Docker (chi tiết ở Mục 11.6).

### 11.2. Thống kê theo chức năng (mức độ hoàn thiện)

> **Mức độ:** `HOÀN CHỈNH` = chạy đủ luồng bằng dữ liệu thật (100%) · `MỘT PHẦN` = đã dùng được phần chính, còn thiếu phần nâng cao (50%) · `CHƯA CÓ` = chưa làm (0%). Đếm theo nhóm chức năng người dùng thấy được trên giao diện, không trùng với cách đếm DoD.

| Phân hệ | Số chức năng | Hoàn chỉnh | Một phần | Chưa có | Mức độ hoàn thiện |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Khách (trang công khai) | 5 | 3 | 1 | 1 | **70%** |
| Tài khoản & xác thực | 5 | 3 | 1 | 1 | **70%** |
| Học viên | 17 | 10 | 2 | 5 | **65%** |
| Giáo viên | 8 | 6 | 0 | 2 | **75%** |
| Trưởng bộ môn | 6 | 5 | 1 | 0 | **92%** |
| Admin | 9 | 6 | 2 | 1 | **78%** |
| Hệ thống & vận hành | 4 | 1 | 2 | 1 | **50%** |
| **Toàn hệ thống** | **54** | **34** | **9** | **11** | **71%** |

**Nhận xét:** Trưởng bộ môn (92%), Admin (78%) và Giáo viên (75%) đã đủ các chức năng quản lý hằng ngày. Học viên có nhiều chức năng nhất (17) nhưng còn 5 chức năng chưa có, đều thuộc nhóm nâng cao: thi thích ứng CAT, nhóm AI, xuất PDF, thực hành nhóm. Hệ thống & vận hành thấp nhất (50%) do thiếu test, Docker và sao lưu.

| Phân hệ | Chức năng | Mức độ | Ghi chú |
| :--- | :--- | :---: | :--- |
| Khách (trang công khai) | Trang giới thiệu: Trang chủ, TOEIC, VSTEP, Blog, FAQ, Tài nguyên, Liên hệ | `HOÀN CHỈNH` | Nội dung lấy từ CMS, form liên hệ / đăng ký nhận tin lưu vào CSDL |
|  | Danh mục khoá học, đề thi, ngân hàng câu hỏi, luyện tập mẫu | `HOÀN CHỈNH` | Dữ liệu thật từ `catalog` |
|  | Bảng giá, quy đổi điểm, bảng xếp hạng công khai | `HOÀN CHỈNH` |  |
|  | Thi thử nhanh `/try` | `MỘT PHẦN` | Bài thử 5–7 câu cố định; chưa chọn câu thích ứng, chưa ước lượng trình độ |
|  | Video demo ở trang chủ | `CHƯA CÓ` |  |
| Tài khoản & xác thực | Đăng ký, đăng nhập, đăng xuất, refresh token, khoá khi sai nhiều lần | `HOÀN CHỈNH` |  |
|  | Đổi mật khẩu, cài đặt tài khoản, trung tâm thông báo | `HOÀN CHỈNH` | Dùng chung cho mọi vai trò |
|  | Onboarding: mục tiêu, lịch học, kỹ năng, bài xếp lớp | `HOÀN CHỈNH` | Lưu mục tiêu sau bài xếp lớp |
|  | Xác thực email, quên / đặt lại mật khẩu | `MỘT PHẦN` | Mới có giao diện, chưa có API gửi email |
|  | Đăng nhập Google / Facebook | `CHƯA CÓ` | Nút hiện thông báo chưa hỗ trợ |
| Học viên | Học bài giảng video, mục Tóm tắt, tra từ 1-chạm, học tiếp đúng phút | `HOÀN CHỈNH` |  |
|  | Kiến thức trong bài (mạo từ a/an/the bằng GraphRAG) | `HOÀN CHỈNH` | Chạy trên 358/454 bài |
|  | Bài tập sau mỗi bài (đạt 70% mới mở bài tiếp) | `HOÀN CHỈNH` |  |
|  | Phụ đề song ngữ chạy theo video | `MỘT PHẦN` | Thiếu lặp đoạn A-B |
|  | Lộ trình học, lớp học của tôi, nộp bài được giao | `HOÀN CHỈNH` |  |
|  | Luyện tập theo Part | `HOÀN CHỈNH` |  |
|  | Thi thử full test / theo Part, auto-save, kết quả, lời giải | `HOÀN CHỈNH` |  |
|  | Thi thích ứng CAT | `CHƯA CÓ` | Mới có cột IRT trong CSDL |
|  | Sổ tay lỗi sai, ôn tập SM-2, luyện điểm yếu, chép chính tả | `HOÀN CHỈNH` |  |
|  | Từ vựng + flashcard, ngữ pháp | `HOÀN CHỈNH` |  |
|  | Luyện Viết / Nói: nộp bài, ghi âm, nhận điểm và nhận xét | `HOÀN CHỈNH` | Giáo viên chấm theo rubric |
|  | Tiến độ, thành tích, bảng xếp hạng, đánh dấu câu hỏi | `HOÀN CHỈNH` |  |
|  | Mua gói dịch vụ | `MỘT PHẦN` | Chuyển khoản + Admin xác nhận; chưa có cổng VNPAY/MoMo |
|  | Thực hành nhóm cùng tiến | `CHƯA CÓ` |  |
|  | Xuất PDF Sổ tay lỗi sai, chứng chỉ QR | `CHƯA CÓ` |  |
|  | Chấm phát âm AI, kho cặp âm tối thiểu | `CHƯA CÓ` |  |
|  | Trợ lý AI giải thích lỗi, AI Speaking Partner | `CHƯA CÓ` |  |
| Giáo viên | Tổng quan, cảnh báo học viên có nguy cơ, thống kê lớp | `HOÀN CHỈNH` |  |
|  | Lớp học: mã tham gia, bảng tin, tài liệu, danh sách học viên | `HOÀN CHỈNH` |  |
|  | Lịch dạy, điểm danh | `HOÀN CHỈNH` |  |
|  | Giao bài (gồm bài giảng tự chấm), bàn chấm theo rubric | `HOÀN CHỈNH` |  |
|  | Sổ điểm, xếp hạng lớp, bảng điểm thi TOEIC / VSTEP | `HOÀN CHỈNH` | Tự xét Bậc 3 / Bậc 4 |
|  | Thư viện, soạn câu hỏi / đề, nhập đề từ file Word, đăng video bài giảng | `HOÀN CHỈNH` |  |
|  | Tự tải phụ đề `.srt` / `.vtt` khi đăng video | `CHƯA CÓ` | Hiện chỉ Admin làm được |
|  | Ghi âm nhận xét khi chấm (Voice Note) | `CHƯA CÓ` |  |
| Trưởng bộ môn | Tổng quan, bộ môn, giáo viên, học viên, lớp, khoá học | `HOÀN CHỈNH` |  |
|  | Phê duyệt nội dung, ngân hàng câu hỏi theo kỳ thi | `HOÀN CHỈNH` |  |
|  | Kiểm định chấm, khiếu nại / phúc khảo, dự giờ | `HOÀN CHỈNH` |  |
|  | Bài tập, kết quả, lịch, nội dung lớp toàn bộ môn | `HOÀN CHỈNH` |  |
|  | Báo cáo tổng kết có biểu đồ | `HOÀN CHỈNH` |  |
|  | Bản đồ nhiệt điểm yếu toàn trường | `MỘT PHẦN` | Có thống kê chủ điểm yếu, chưa có heatmap |
| Admin | Người dùng, phân quyền, khoá / mở tài khoản | `HOÀN CHỈNH` |  |
|  | Nội dung: khoá học, câu hỏi, đề thi, blog, FAQ, từ vựng, ngữ pháp, chép chính tả, rubric, nhãn kỹ năng | `HOÀN CHỈNH` |  |
|  | Video bài giảng + tải phụ đề `.srt` / `.vtt` | `HOÀN CHỈNH` |  |
|  | Quản lý lớp, giáo viên, học viên (dùng chung trang Trưởng bộ môn) | `HOÀN CHỈNH` |  |
|  | Đơn hàng, mã giảm giá, xác nhận thanh toán, hoàn tiền | `HOÀN CHỈNH` |  |
|  | Hỗ trợ, thông báo hàng loạt, nhật ký hệ thống, trạng thái dịch vụ, cài đặt, phân tích | `HOÀN CHỈNH` |  |
|  | Thư viện media | `MỘT PHẦN` | Có upload ảnh / âm thanh, chưa có trang quản lý media |
|  | Cổng VNPAY/MoMo + webhook tự kích hoạt gói | `CHƯA CÓ` |  |
|  | Giới hạn tần suất & hạn mức theo gói | `MỘT PHẦN` | Rate-limit trong bộ nhớ, khoá đề VIP; chưa dùng Redis, chưa áp hạn mức theo ngày |
| Hệ thống & vận hành | Giao diện 2 ngôn ngữ (Việt / Anh), chế độ tối, điện thoại | `HOÀN CHỈNH` |  |
|  | Kiểm thử tự động | `MỘT PHẦN` | 2 file test thuật toán; chưa có test backend / e2e |
|  | Đóng gói Docker, CI | `MỘT PHẦN` | Có PostgreSQL + Redis trong compose, CI cơ bản; thiếu Dockerfile backend / frontend |
|  | Sao lưu, khôi phục, RLS cho CSDL | `CHƯA CÓ` |  |

### 11.3. Chi tiết 21 hạng mục DoD

| Mã | Chức năng | Cấp độ | Tỷ lệ | Đã hoàn thành | Còn thiếu |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **AUTH-01** | JWT, Refresh Token & phiên đăng nhập | Level 1 | 100% | Đăng ký, đăng nhập, refresh token xoay vòng, đăng xuất, đổi mật khẩu, giới hạn đăng nhập sai | API xác thực email, quên / đặt lại mật khẩu (mới có giao diện) |
| **RBAC-01** | Phân quyền 5 cấp bậc | Level 2 | 100% | 4 vai trò trong CSDL + khách, kiểm tra quyền ở backend (`allow()`) và route frontend, 5 khu giao diện riêng | — |
| **EXAM-01** | Phòng thi trắc nghiệm TOEIC & VSTEP | Level 1 | 100% | Làm full test hoặc chọn Part + tự đặt giờ, đếm ngược, chấm theo bảng quy đổi, kết quả theo Part, lời giải | — |
| **EXAM-02** | Thi thích ứng CAT IRT 2PL + Fisher | Level 2 | 0% | Đã có cột `irt_a`, `irt_b`, `theta`, `exposure_count` trong CSDL | Thuật toán ước lượng θ, chọn câu theo Fisher, tiêu chí dừng, giao diện thi thích ứng |
| **EXAM-03** | Auto-save bài thi 15 giây | Level 2 | 100% | API lưu đáp án định kỳ, làm tiếp lượt thi đang dở | — |
| **EXAM-04** | Micro-CAT chẩn đoán cho khách | Level 2 | 50% | Trang Thi thử nhanh `/try` 5–7 câu lấy từ ngân hàng câu hỏi | Chọn câu thích ứng, ước lượng trình độ sau bài |
| **VID-01** | Video bài giảng + tra từ 1-chạm | Level 1 | 100% | Lesson Engine phát video, học tiếp đúng phút đã xem, API tra từ điển; giáo viên đăng video cho từng bài (link YouTube/Vimeo hoặc tải MP4/WebM) | — |
| **VID-02** | Phụ đề chạy theo video & A-B Looping | Level 2 | 50% | Script/phụ đề song ngữ chạy theo thời gian video, bấm câu để tua, nút Ẩn/Hiện | Lặp đoạn A-B |
| **VID-03** | Tự bóc phụ đề bằng Whisper AI | Level 3 | 0% | — | Toàn bộ |
| **PRON-01** | Chấm âm vị IPA, biểu đồ ngữ điệu | Level 3 | 0% | Ghi âm bài nói trên trình duyệt và upload | Chấm âm vị, biểu đồ ngữ điệu F0 |
| **PRON-02** | Kho cặp âm tối thiểu | Level 3 | 0% | Có bảng `speaking_materials` | API và giao diện luyện cặp âm |
| **ERR-01** | Tự lưu câu sai vào Sổ tay lỗi sai | Level 1 | 100% | Nộp bài tự ghi `mistake_entries`, trang Sổ tay lỗi sai | — |
| **ERR-02** | Phân loại nguyên nhân lỗi & SM-2 | Level 2 | 100% | Phân loại nguyên nhân bằng luật, SM-2 dùng chung cho từ vựng và lỗi sai, ôn tập đến hạn | (Nâng cấp) phân loại nguyên nhân bằng AI |
| **ERR-03** | Chép chính tả & Luyện điểm yếu | Level 3 | 100% | Trang + API Chép chính tả có lịch sử, giáo viên giao bài chép chính tả, Luyện điểm yếu chế độ `DRILL` | — |
| **EXP-01** | Xuất PDF Sổ tay lỗi sai & chứng chỉ QR | Level 3 | 0% | Có bảng `certificates` | Service PDF, mã QR, trang xác minh |
| **AI-01** | Trợ lý AI giải thích lỗi theo ngữ cảnh | Level 2 | 0% | Có bảng `ai_conversations`, `ai_messages` | Tích hợp mô hình AI, API và giao diện chat |
| **AI-02** | AI Speaking Partner thời gian thực | Level 3 | 0% | — | Toàn bộ (thư mục `backend/src/realtime` còn trống) |
| **CLASS-01** | Lớp học, giao bài, bàn chấm | Level 2 | 50% | Lớp học, mã tham gia, lịch dạy, điểm danh, bảng tin, tài liệu, giao bài (gồm bài giảng tự chấm), chấm theo rubric, sổ điểm, xếp hạng lớp; lớp nằm trong khoá học (mã lớp dạng T203A1); bảng điểm thi riêng TOEIC / VSTEP xét Bậc 3 – Bậc 4 | Ghi âm nhận xét (Voice Note) |
| **AUDIT-01** | Trưởng bộ môn kiểm duyệt & phúc khảo | Level 3 | 100% | Phê duyệt nội dung, ngân hàng câu hỏi, kiểm định chấm, khiếu nại, dự giờ, báo cáo tổng kết có biểu đồ | — |
| **PAY-01** | Cổng VNPAY/MoMo + webhook kích hoạt VIP | Level 3 | 50% | Chọn gói → tạo đơn chuyển khoản, mã giảm giá, Admin xác nhận → kích hoạt gói, hoàn tiền | Kết nối cổng VNPAY/MoMo, webhook IPN tự kích hoạt |
| **GATE-01** | Redis rate-limit & khoá tính năng VIP | Level 3 | 50% | Giới hạn tần suất theo nhóm API, khoá đề VIP theo gói | Chuyển rate-limit sang Redis, áp hạn mức `entitlements` theo ngày |

### 11.4. Chi tiết Sprint Backlog (Mục VI)

- **Sprint 1 & 2 (100%)**
  - Đã xong: Monorepo + Tailwind + Router; giao diện đăng nhập/đăng ký; trình soạn câu hỏi, bài đọc, video (CRUD Editor + nhập đề từ file Word); backend Express + Prisma + PostgreSQL; phân quyền 5 cấp; API CRUD câu hỏi / bài đọc / bài giảng; CSDL 59 bảng (vượt mốc 30 bảng) + 21.009 câu hỏi có tham số độ khó (vượt mốc 300 câu).
- **Sprint 3 & 4 (77%)**
  - Đã xong: Onboarding + phòng thi đếm ngược; duyệt học liệu của Trưởng bộ môn; video đồng bộ script theo thời gian; tra từ 1-chạm; giao diện Sổ tay lỗi sai; API nộp bài + auto-save + chấm điểm; API script video + lưu từ đã tra; service bóc câu sai; Video Studio (giáo viên đăng video từng bài, Admin sửa video và tải phụ đề `.srt` / `.vtt`).
  - Đang làm: Micro-CAT cho khách (mới là bài thử tĩnh); quản lý media của Admin (chưa có trang thư viện media).
  - Chưa làm: A-B Looping + chấm phát âm AI Shadowing; video demo cho khách ở trang chủ.
- **Sprint 5 & 6 (63%)**
  - Đã xong: Lộ trình của tôi; Chép chính tả; bàn chấm giáo viên + cảnh báo học viên có nguy cơ; phúc khảo của Trưởng bộ môn; SM-2; chỉ số chuyên cần & điểm nỗ lực; chấm Viết/Nói + quy trình phúc khảo.
  - Đang làm: giao diện động lực (đã có chuỗi ngày học, điểm nỗ lực, bảng xếp hạng, thành tích; chưa có "Thực hành nhóm cùng tiến").
  - Chưa làm: giao diện thi thích ứng; Adaptive Engine (2PL IRT, Fisher, θ̂); AI Speaking Partner; WebSocket thực hành nhóm.
- **Sprint 7 & 8 (56%)**
  - Đã xong: dashboard phân tích (radar năng lực, biểu đồ tiến độ điểm); dashboard cho giáo viên / trưởng bộ môn / admin; tối ưu chỉ mục CSDL (171 index, view, trigger trong migration).
  - Đang làm: bản đồ điểm yếu toàn trường (đã có thống kê chủ điểm yếu, chưa có heatmap); thanh toán (chuyển khoản + admin xác nhận, chưa có cổng VNPay/MoMo); Feature Gating (khoá đề VIP, chưa áp hạn mức); Docker (`docker-compose.yml` mới có PostgreSQL + Redis, chưa có Dockerfile cho backend/frontend).
  - Chưa làm: xuất PDF Sổ tay lỗi sai + chứng chỉ QR; mô phỏng kiểm chứng độ hội tụ CAT.
  - Không tính vào tỷ lệ: báo cáo và slide bảo vệ đồ án (không nằm trong code).

### 11.5. Khối lượng đã xây dựng & dữ liệu thật

| Nhóm | Hạng mục | Số lượng | Ghi chú |
| :--- | :--- | :---: | :--- |
| Hệ thống | Bảng CSDL | **59 / 59** | Đúng đặc tả Mục X, 8 migration |
| | Chỉ mục CSDL | **171** | Trong đó 43 unique index, 8 GIN index (tìm kiếm) |
| | API backend | **255 route** | auth 7 · catalog 14 · cms 19 · learner 52 · teacher 65 · head 43 · admin 52 · import 3 |
| | Màn hình frontend | **107** | Học viên 25 · Giáo viên 15 · Trưởng bộ môn 19 · Admin 16 · Trang công khai 21 · Đăng nhập/đăng ký 5 · Onboarding 6 |
| | Engine giao diện dùng chung | **5** | Exam · Practice · Lesson · CRUD Editor · Vocab Flashcard |
| | Thuật toán dùng chung (`packages/shared`) | **4** | Quy đổi điểm TOEIC/VSTEP · SM-2 · phân loại nguyên nhân lỗi · GraphRAG mạo từ (Leiden phân cấp, global/local search) |
| | Ngôn ngữ giao diện | **2** | Tiếng Việt, English |
| Dữ liệu thật (`orbilingo_db`) | Câu hỏi | **21.009** | Có tham số độ khó IRT |
| | Bài đọc / bài nghe (passage) | **1.390** | |
| | Đề thi | **29** | |
| | Khoá học / Bài học | **6 / 454** | 15 bài đã có video |
| | Từ vựng / Bộ từ vựng | **5.986 / 17** | |
| | Chủ điểm ngữ pháp | **48** | |
| | Bài viết / bài giới thiệu kỳ thi | **22** | |
| | Bộ tiêu chí chấm (rubric) | **7** | |
| | Tài khoản / Lớp học / Gói dịch vụ | **54 / 10 / 3** | |

### 11.6. Việc còn lại để hoàn thiện (theo ưu tiên)

| Ưu tiên | Việc cần làm | Hạng mục | Vai trò | Hiện trạng / Tác động |
| :---: | :--- | :--- | :--- | :--- |
| 1 | Adaptive Engine CAT IRT 2PL (ước lượng θ, chọn câu theo Fisher, tiêu chí dừng) + giao diện thi thích ứng | EXAM-02, EXAM-04 | Học viên, Khách | DoD **+7%** |
| 2 | Hoàn thiện phần dở: A-B Looping, Voice Note khi chấm, cổng VNPAY/MoMo + webhook, Redis + hạn mức gói | VID-02, CLASS-01, PAY-01, GATE-01 | Học viên, Giáo viên, Admin | DoD **+10%** |
| 3 | Trợ lý AI giải thích lỗi theo ngữ cảnh | AI-01 | Học viên | DoD **+5%** |
| 4 | Xuất PDF Sổ tay lỗi sai + chứng chỉ QR | EXP-01 | Học viên | DoD **+5%** |
| 5 | Nhóm AI giọng nói: chấm phát âm, cặp âm tối thiểu, bóc phụ đề Whisper, AI Speaking Partner | PRON-01, PRON-02, VID-03, AI-02 | Học viên | DoD **+19%** |
| Ngoài DoD | Kiểm thử tự động | Chất lượng | — | **Thấp** — 2 file test trong `packages/shared` (quy đổi điểm / SM-2, GraphRAG mạo từ) nhưng **chưa chạy được** vì chưa cài `vitest`, trong đó 1 test sẽ fail (xem Mục 12.2); chưa có test backend và e2e frontend |
| Ngoài DoD | Đóng gói & triển khai | Vận hành | — | **Thấp** — `docker-compose.yml` mới có PostgreSQL + Redis; chưa có Dockerfile backend/frontend; CI cơ bản (`infra/ci.yml`) |
| Ngoài DoD | Sao lưu, bảo mật CSDL (Mục 10.10) | Vận hành | — | **Chưa làm** — backup/PITR, RLS |
| Ngoài DoD | API xác thực email, quên / đặt lại mật khẩu | AUTH-01 | Mọi vai trò | Mới có giao diện |
| Ngoài DoD | Phần nhỏ theo vai trò: video demo trang chủ, giáo viên tự tải phụ đề `.srt` / `.vtt` khi đăng video, heatmap điểm yếu toàn trường | Sprint 3–8 | Khách, Giáo viên, Trưởng bộ môn | Đang làm / chưa làm (đã tính trong Sprint) |

> Làm xong ưu tiên 1–2, tỷ lệ DoD tăng từ **55% lên 71%**. Làm xong ưu tiên 1–4, tỷ lệ DoD lên **81%**.

### 11.7. Nhật ký các lần kiểm tra

| Lần kiểm tra | Phạm vi | DoD | Sprint | Tổng hợp | Thay đổi chính |
| :--- | :--- | :---: | :---: | :---: | :--- |
| 06/11/2026 | commit `344a0fb` | 55% | 71% | 63% | Lần đo đầu tiên theo code thật |
| 07/11/2026 | 38 commit (`344a0fb` → `246428d`) | 55% | 72% | 63% | **Video bài giảng:** giáo viên đăng video từng bài (link YouTube/Vimeo hoặc MP4/WebM), học viên học trên video + mục Tóm tắt → Video Studio chuyển Đã xong (Sprint 3 & 4: 73% → 77%). **Khoá học:** 17 khoá gộp còn 6, chia 3 mục TOEIC / VSTEP / THPT, bài tập sau mỗi bài (đạt 70% mới mở bài tiếp). **Lớp học:** lớp nằm trong khoá (`classes.course_id`, `track` – migration 8), mã lớp T203A1. **Bảng điểm:** tách TOEIC / VSTEP, tự xét Bậc 3 / Bậc 4. Giao diện GV/TBM/Admin và sửa lỗi API — không đổi tỷ lệ |
| 07/11/2026 (chưa commit) | Kiến thức trong bài – Mạo từ | 55% | 72% | 63% | Thay cây mạo từ bằng **GraphRAG**: chia câu → trích claim (12 quy tắc a/an/the) → đồ thị tri thức → Leiden phân cấp → báo cáo cộng đồng → global/local search có dẫn chứng; chạy trên 358/454 bài; thêm 1 file test. Không thuộc hạng mục DoD nên không đổi tỷ lệ. Bổ sung **Mục 11.2** thống kê 54 chức năng theo 7 phân hệ: mức độ hoàn thiện **71%**. Thêm **Mục XII** – nghiên cứu chuyên sâu để nâng cấp 8 chức năng chính (trọng tâm: Knowledge Tracing cho Luyện điểm yếu, mô hình trí nhớ cho ôn tập), kèm 6 phát hiện khi rà code |

---

## XII. NGHIÊN CỨU CHUYÊN SÂU ĐỂ NÂNG CẤP CHỨC NĂNG CHÍNH (IN-DEPTH RESEARCH FOR CORE FEATURE ENHANCEMENT)

> **Mục đích:** không thêm chức năng mới. Lấy các **chức năng chính đã chạy**, nghiên cứu lý thuyết / mô hình khoa học đứng sau chức năng đó, rồi **nâng cấp chính chức năng ấy** cho chính xác hơn theo kết quả nghiên cứu, có số liệu kiểm chứng trước và sau.  
> **Quy trình cho mỗi chức năng:** Hiện trạng trong code → Hạn chế → Nghiên cứu (lý thuyết, mô hình) → Nâng cấp (thuật toán mới thay thế) → Kiểm chứng (chỉ số đo, so sánh trước / sau).  
> **Thời điểm rà code:** 08/11/2026.

### 12.1. Danh sách chức năng chính & hướng nghiên cứu

| Mã | Chức năng chính đang có | Cách làm hiện tại | Hướng nghiên cứu để nâng cấp | Ưu tiên |
| :---: | :--- | :--- | :--- | :---: |
| **N1** | Luyện điểm yếu & đo năng lực từng chủ điểm | Lấy ngẫu nhiên câu trong Sổ tay lỗi sai, bù thêm câu ngẫu nhiên của Part có điểm thấp nhất | **Knowledge Tracing** (BKT, Elo, PFA): ước lượng mức thành thạo từng chủ điểm, chọn câu vừa sức | **1 – Trọng tâm** |
| **N2** | Ôn tập từ vựng & lỗi sai (SM-2) | Công thức SM-2 cố định, mọi học viên dùng chung tham số | **Mô hình trí nhớ** (đường cong quên, Half-Life Regression, FSRS): dự đoán xác suất còn nhớ, lập lịch theo mục tiêu nhớ | **1 – Trọng tâm** |
| **N3** | Phân loại nguyên nhân lỗi sai | Luật cố định theo Part + ngưỡng 3 giây | **Phân tích lỗi trong học ngoại ngữ** + **thời gian phản hồi** (rapid guessing) | 2 |
| **N4** | Chép chính tả | Độ chính xác = số từ khớp / số từ đáp án (LCS theo từ) | **Word Error Rate**, khoảng cách Levenshtein mức ký tự, chuẩn hoá văn bản | 2 |
| **N5** | Chấm & quy đổi điểm TOEIC / VSTEP | Quy về thang 100 câu rồi tra bảng / nội suy tuyến tính | **Lý thuyết quy đổi – đối sánh điểm** (equating), sai số đo lường | 2 |
| **N6** | Lộ trình học | Mẫu 3 chặng cố định theo kỳ thi, giống nhau cho mọi học viên cùng mục tiêu | **Học tập làm chủ** (mastery learning), lộ trình thích ứng theo năng lực | 3 |
| **N7** | Cảnh báo học viên có nguy cơ | Ngưỡng cứng: chuyên cần < 60% / hoàn thành < 50% | **Hệ thống cảnh báo sớm** trong Learning Analytics | 3 |
| **N8** | Kiến thức mạo từ (GraphRAG) | Trích xuất bằng 12 luật, Leiden phân cấp | Đánh giá trích xuất, tách cụm danh từ | 3 |

**Dữ liệu sẵn có trong `orbilingo_db` (đếm ngày 08/11/2026):**

| Dữ liệu | Số lượng | Dùng cho |
| :--- | :---: | :--- |
| Câu trả lời trong `attempt_answers` | **8.949** (86 lượt làm bài) | N1, N3, N5 |
| Nhãn chủ điểm `skill_tags` | **110** (85 ngữ pháp, 6 từ vựng, 7 nghe, 7 đọc, 3 viết, 2 nói) | N1, N3 |
| Câu hỏi có nhãn chủ điểm ngoài nhãn Part | **8.850 / 21.009** (khoảng 42%) | N1 |
| Lịch sử ôn tập `srs_review_logs` | **0** | N2 — cần tích luỹ hoặc dùng bộ dữ liệu công khai |
| Lượt chép chính tả | **0** | N4 — cần tự tạo bài chép để đánh giá |

**Khuyến nghị:** chọn **N1 làm trọng tâm** — có sẵn dữ liệu trả lời và nhãn chủ điểm, đo được bằng AUC ngay. **N2 làm hướng thứ hai**: hai hướng bổ trợ nhau (N1 biết học viên *chưa nắm* chủ điểm nào, N2 biết học viên *sắp quên* gì), nhưng vì `srs_review_logs` đang trống nên giai đoạn đầu dùng bộ dữ liệu công khai của Duolingo (kèm bài Half-Life Regression) để so sánh mô hình, sau đó kiểm lại trên dữ liệu của hệ thống. N4 là hướng nhỏ, làm nhanh.

### 12.2. N1 – Luyện điểm yếu bằng Knowledge Tracing (trọng tâm)

- **Hiện trạng:** `frontend/src/roles/student/pages/StudentDrillsPage.tsx` chọn ngẫu nhiên tối đa *n* câu từ Sổ tay lỗi sai; thiếu thì lấy thêm câu ngẫu nhiên của Part có điểm thấp nhất (`progress.skillScores`). Hệ thống chỉ biết "Part nào điểm thấp", **không biết** học viên đã thành thạo chủ điểm nào (thì, mệnh đề quan hệ, từ loại…), và không chọn câu theo độ khó.
- **Hạn chế:** câu luyện có thể quá dễ (lãng phí) hoặc quá khó (nản); không đo được học viên có tiến bộ ở chủ điểm đó không; câu đã hiểu rồi vẫn bị lấy lại.
- **Nghiên cứu:**
  - **Bayesian Knowledge Tracing (BKT):** mỗi chủ điểm là một trạng thái ẩn "đã thành thạo / chưa", với 4 tham số: biết sẵn P(L0), học được P(T), đoán đúng P(G), sơ suất P(S). Sau mỗi câu trả lời, cập nhật P(thành thạo) theo công thức Bayes.
  - **Elo cho giáo dục:** năng lực học viên θ và độ khó câu b cùng cập nhật sau mỗi lần trả lời: θ ← θ + K·(kết quả − P), P = 1 / (1 + e^−(θ − b)). Tận dụng được cột `irt_b` sẵn có làm độ khó khởi đầu.
  - **Performance Factors Analysis (PFA):** hồi quy logistic theo số lần đúng / sai trước đó của từng chủ điểm.
  - So sánh 3 mô hình để chọn mô hình phù hợp với dữ liệu của hệ thống.
- **Nâng cấp:**
  - Tính mức thành thạo cho từng `skill_tag` của mỗi học viên từ lịch sử `attempt_answers`.
  - Chọn câu luyện: ưu tiên chủ điểm có mức thành thạo thấp nhất, trong chủ điểm đó chọn câu có xác suất đúng khoảng 60–75% (vừa sức), loại câu học viên đã làm đúng nhiều lần.
  - Một chủ điểm đạt P(thành thạo) ≥ 0,95 thì coi là "đã nắm", ngừng ưu tiên.
  - Hiện cho học viên bản đồ mức thành thạo theo chủ điểm thay cho điểm theo Part.
- **Điều kiện dữ liệu:** 58% câu hỏi mới chỉ có nhãn Part → cần gán bổ sung nhãn chủ điểm (ít nhất cho Part 5, 6 — nhóm ngữ pháp / từ vựng) trước khi tính mức thành thạo theo chủ điểm.
- **Kiểm chứng:**
  - Chia lịch sử trả lời theo thời gian (80% đầu để học tham số, 20% sau để kiểm tra), dự đoán câu tiếp theo đúng hay sai.
  - Chỉ số: **AUC**, **RMSE**, so với mốc cơ sở "tỷ lệ đúng trung bình của Part" (cách đang dùng).
  - So sánh bộ câu luyện cũ (ngẫu nhiên) và mới: tỷ lệ đúng trong phiên luyện, số câu cần để một chủ điểm đạt "đã nắm".
- **Tài liệu:** Corbett & Anderson (1995) *Knowledge tracing: Modeling the acquisition of procedural knowledge*; Pelánek (2016) *Applications of the Elo rating system in adaptive educational systems*; Pavlik, Cen & Koedinger (2009) *Performance Factors Analysis*; Piech et al. (2015) *Deep Knowledge Tracing* (để tham khảo, không bắt buộc làm).

### 12.3. N2 – Ôn tập theo mô hình trí nhớ (hướng thứ hai)

- **Hiện trạng:** `sm2()` trong `backend/src/modules/learner/learner.shared.ts`: khoảng ôn 1 → 6 → khoảng cũ × EF; EF thay đổi theo mức nhớ q; khoảng ôn ≥ 21 ngày → `MASTERED`. Mỗi lần ôn ghi vào `srs_review_logs` (q, khoảng cũ, khoảng mới).
- **Hạn chế:** tham số cố định cho mọi người và mọi từ; không dự đoán được "xác suất còn nhớ hôm nay"; giảm EF cả khi quên nên thẻ khó tụt nhanh về 1,3; ngưỡng 21 ngày không có căn cứ.
- **Nghiên cứu:**
  - **Đường cong quên Ebbinghaus:** xác suất nhớ R = e^(−t / S), với t là số ngày từ lần ôn trước và S là độ bền trí nhớ.
  - **Half-Life Regression (Duolingo):** học "chu kỳ bán rã" của trí nhớ cho từng từ từ dữ liệu ôn tập.
  - **FSRS (mô hình DSR):** mỗi thẻ có Độ khó D, Độ bền S và Khả năng nhớ R; lập lịch sao cho R đạt mục tiêu (ví dụ 90%) vào ngày ôn.
- **Nâng cấp:**
  - Thay `sm2()` bằng bộ lập lịch theo mô hình trí nhớ: khoảng ôn = thời điểm xác suất nhớ dự đoán giảm xuống mức mục tiêu.
  - Học tham số từ `srs_review_logs` của hệ thống (giữ SM-2 làm phương án dự phòng khi chưa đủ dữ liệu).
  - Cho học viên chọn mục tiêu nhớ (85% / 90% / 95%) — đánh đổi giữa số thẻ phải ôn mỗi ngày và mức nhớ.
  - `MASTERED` xác định theo độ bền S thay cho ngưỡng 21 ngày.
- **Dữ liệu:** `srs_review_logs` hiện có 0 dòng → (1) so sánh mô hình trên bộ dữ liệu công khai; (2) bật ghi log đầy đủ và tích luỹ dữ liệu từ học viên thật; (3) kiểm lại trên dữ liệu hệ thống khi đủ vài nghìn lượt ôn.
- **Kiểm chứng:** dùng lịch sử ôn tập dự đoán lần ôn kế tiếp nhớ hay quên; so sánh SM-2 hiện tại với mô hình mới bằng **log-loss** và **RMSE**; mô phỏng 30 ngày để so số lượt ôn cần thiết với cùng mức nhớ.
- **Tài liệu:** Ebbinghaus (1885) *Über das Gedächtnis*; Wozniak (1990) về SM-2; Settles & Meeder (2016) *A Trainable Spaced Repetition Model for Language Learning*; Ye, Su & Cao (2022) *A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling*.

### 12.4. N3 – Phân loại nguyên nhân lỗi sai

- **Hiện trạng:** `causeOf()` trong `backend/src/modules/learner/attempts.ts`: dưới 3 giây → `CARELESS`; theo kỹ năng / Part → `GRAMMAR`, `VOCABULARY`, `LISTENING`, `READING`. Không dùng nhãn chủ điểm của câu, không xét học viên chọn phương án nhiễu nào; `TIME_PRESSURE` chưa có luật.
- **Nghiên cứu:**
  - **Phân tích lỗi (Error Analysis):** phân biệt *lỗi do chưa biết* (error) và *sơ suất* (mistake); phân loại lỗi theo nguồn gốc (ảnh hưởng tiếng mẹ đẻ, khái quát hoá quá mức…).
  - **Thời gian phản hồi:** phát hiện "đoán bừa" bằng ngưỡng theo từng câu (ví dụ 10% thời gian làm trung bình của câu đó) thay cho ngưỡng cứng 3 giây.
  - **Phân tích phương án nhiễu:** mỗi phương án sai của câu TOEIC thường bẫy một kiểu lỗi (sai từ loại, sai thì, từ đồng âm…).
- **Nâng cấp:** phân loại dựa trên 3 nguồn: nhãn chủ điểm của câu (`skill_tags`), phương án học viên đã chọn, thời gian so với chuẩn của câu đó; thêm `TIME_PRESSURE` cho câu bỏ trống / làm trong những phút cuối; kết quả phân loại đưa vào N1 để chọn chủ điểm cần luyện.
- **Kiểm chứng:** tự gán nhãn nguyên nhân cho khoảng 100–200 lỗi sai thật; đo **độ chính xác** và **hệ số Cohen's kappa** của luật cũ và luật mới so với nhãn tay.
- **Tài liệu:** Corder (1967) *The significance of learners' errors*; James (1998) *Errors in Language Learning and Use*; Wise & Kong (2005) *Response time effort*; Wise & Ma (2012) về ngưỡng thời gian chuẩn.

### 12.5. N4 – Chấm chép chính tả

- **Hiện trạng:** `diffWords()` trong `backend/src/modules/learner/study.ts` tìm dãy con chung dài nhất (LCS) theo từ; **độ chính xác = số từ khớp / số từ đáp án** → gõ thừa từ không bị trừ; sai 1 chữ cái ("recieve") bị tính sai cả từ như bỏ trống.
- **Nghiên cứu:** **Word Error Rate** WER = (Thay thế + Xoá + Chèn) / Số từ đáp án — chỉ số chuẩn trong nhận dạng giọng nói; **khoảng cách Levenshtein** mức ký tự để nhận ra lỗi chính tả gần đúng; chuẩn hoá văn bản (viết tắt *don't* / *do not*, số *5* / *five*, dấu câu).
- **Nâng cấp:** chấm theo WER (có trừ từ thừa); cho điểm một phần với từ sai 1–2 ký tự; phân loại lỗi từng từ (sai chính tả / thiếu từ / nghe nhầm từ khác) và đưa từ sai vào ôn tập N2.
- **Kiểm chứng:** hệ thống chưa có lượt chép nào → tự làm 30–50 bài chép (có lỗi cố ý: thiếu từ, thừa từ, sai chính tả), giáo viên chấm tay; so độ lệch điểm máy – điểm giáo viên của cách cũ và cách mới.
- **Tài liệu:** Levenshtein (1966) *Binary codes capable of correcting deletions, insertions, and reversals*; tài liệu về chỉ số WER trong nhận dạng giọng nói.

### 12.6. N5 – Chấm & quy đổi điểm TOEIC / VSTEP

- **Hiện trạng:** `toeicScaled()` trong `learner.shared.ts` quy số câu đúng về thang 100 câu rồi tra bảng `score.conversion.TOEIC`, thiếu mốc thì nội suy tuyến tính; VSTEP: tỷ lệ đúng × 10, làm tròn 0,5.
- **Hạn chế:** làm 10 câu đúng 7 cũng được quy thành điểm như làm 100 câu đúng 70 → sai số rất lớn nhưng vẫn hiện một con số chính xác; mọi đề dùng chung một bảng dù độ khó các đề khác nhau.
- **Nghiên cứu:** **quy đổi – đối sánh điểm** (equating) giữa các đề có độ khó khác nhau; **sai số đo lường chuẩn (SEM)** và khoảng tin cậy của điểm; quy tắc tính điểm chính thức của TOEIC và VSTEP.
- **Nâng cấp:** hiện **khoảng điểm ước tính** (ví dụ 650–720) thay cho một con số khi làm ít câu; hiệu chỉnh bảng quy đổi theo độ khó từng đề (dùng `irt_b` của các câu trong đề); gộp hai bản cài đặt (`packages/shared` và backend) về một hàm duy nhất.
- **Kiểm chứng:** với học viên có cả điểm luyện theo Part và điểm full test, đo độ lệch giữa điểm ước tính và điểm full test; kiểm tra tỷ lệ điểm thật rơi vào khoảng ước tính.
- **Tài liệu:** Kolen & Brennan (2014) *Test Equating, Scaling, and Linking*; tài liệu chính thức của ETS về thang điểm TOEIC; định dạng đề thi VSTEP.3-5 của Bộ GD&ĐT.

### 12.7. N6, N7, N8 – Các hướng phụ

- **N6 – Lộ trình học thích ứng:**
  - Hiện trạng: `backend/src/modules/learner/path.ts` sinh mẫu 3 chặng cố định theo kỳ thi.
  - Nghiên cứu: học tập làm chủ (*mastery learning* – Bloom, 1968) và lộ trình thích ứng.
  - Nâng cấp: sắp xếp và bỏ bớt bài theo kết quả bài xếp lớp và mức thành thạo từ N1; chỉ mở chặng sau khi các chủ điểm của chặng trước đạt mức thành thạo.
- **N7 – Cảnh báo sớm:**
  - Hiện trạng: `riskLevel()` trong `backend/src/core/metrics.ts` dùng ngưỡng cứng.
  - Nghiên cứu: hệ thống cảnh báo sớm trong Learning Analytics (Arnold & Pistilli, 2012 – Course Signals).
  - Nâng cấp: thêm xu hướng điểm, số ngày không học, tỷ lệ nộp muộn; tính điểm nguy cơ bằng hồi quy logistic thay cho ngưỡng cứng.
  - Kiểm chứng: precision / recall khi so với kết quả thi cuối khoá.
- **N8 – GraphRAG mạo từ:**
  - Nghiên cứu: đánh giá trích xuất (precision / recall cho 12 quy tắc trên khoảng 200 câu gán nhãn tay), so sánh Leiden và Louvain (Traag et al., 2019; Edge et al., 2024).
  - Nâng cấp: tách cụm danh từ chính xác hơn (khắc phục lỗi kiểu "the immune").

### 12.8. Việc cần sửa trước khi nâng cấp (phát hiện khi rà code)

| # | Phát hiện | Vị trí | Liên quan |
| :---: | :--- | :--- | :--- |
| 1 | 2 file test chưa từng chạy: chưa cài `vitest`, `packages/shared` không có lệnh `test` | `packages/shared/package.json` | Tất cả — cần có test để so trước / sau |
| 2 | Test "trả lời quá nhanh → `CARELESS_MISTAKE`" sẽ fail: `classifyMistake` xét kỹ năng READING trước thời gian (đã chạy thử, trả về `READING_MISINTERPRETATION`) | `packages/shared/src/logic/index.ts` dòng 172–182 | N3 |
| 3 | Quy đổi điểm, SM-2, phân loại lỗi có 2 bản cài đặt (shared và backend), backend không dùng bản shared | `logic/index.ts` ↔ `learner.shared.ts`, `attempts.ts` | N2, N3, N5 |
| 4 | Nguyên nhân `TIME_PRESSURE` có trong danh sách nhưng không luật nào gán | `study.ts` dòng 13, `attempts.ts` | N3 |
| 5 | Điểm bài tập để mở khoá bài lấy từ `scorePct` do trình duyệt gửi, server không tự chấm lại | `catalog/courses.ts` dòng 228–230 | N6 |
| 6 | SM-2 giảm EF cả khi quên (SM-2 gốc giữ nguyên EF) | `learner.shared.ts` `sm2` | N2 |

### 12.9. Lộ trình nghiên cứu đề xuất

| Tuần | Việc | Kết quả |
| :---: | :--- | :--- |
| 1 | Sửa phát hiện #1–#3 (cài `vitest`, gộp hàm trùng); gán bổ sung nhãn chủ điểm cho Part 5–6; trích `attempt_answers` + `skill_tags` ra tập phân tích | Có test chạy được, có tập dữ liệu |
| 2 | N1: cài BKT và Elo, đánh giá AUC so với mốc cơ sở | Bảng so sánh mô hình |
| 3 | N1: tích hợp vào Luyện điểm yếu (chọn câu theo mức thành thạo), bản đồ thành thạo theo chủ điểm | Chức năng Luyện điểm yếu bản nâng cấp |
| 4 | N2: dựng mô hình trí nhớ trên bộ dữ liệu công khai, so log-loss với SM-2, mô phỏng 30 ngày; bật ghi `srs_review_logs` để tích luỹ dữ liệu thật | Bộ lập lịch ôn tập bản nâng cấp |
| 5 | N4 (WER + Levenshtein) và N3 (gán nhãn, đo kappa) | 2 chức năng nâng cấp nhỏ có số liệu |
| 6 | Tổng hợp số liệu trước / sau, viết chương nghiên cứu trong báo cáo | Chương "Nghiên cứu & cải tiến" |
