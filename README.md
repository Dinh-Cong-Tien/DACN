# OrbiLingo — Nền tảng luyện thi TOEIC–VSTEP cá nhân hóa
> **Đề tài**: Xây dựng nền tảng luyện thi tiếng Anh TOEIC–VSTEP thích ứng theo năng lực, tích hợp phân tích lỗi và lộ trình ôn tập cá nhân hóa.

---

## 📖 1. Giới thiệu tổng quan (Overview)

**OrbiLingo** không đơn thuần là website học tiếng Anh hay làm trắc nghiệm thông thường. Hệ thống giải quyết trọn vẹn bài toán nhức nhối nhất của người học: **học nhiều đề nhưng vẫn lặp lại các lỗi cũ do thiếu cơ chế chẩn đoán và ôn tập ngắt quãng khoa học.**

### Vòng học tập thích ứng khép kín 5 bước (Adaptive Learning Loop):
```
  ┌───────────────────────────────────────────────────────────┐
  │ 1. ĐÁNH GIÁ NĂNG LỰC BAN ĐẦU (Placement Diagnostic Test)   │
  └─────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ 2. THIẾT LẬP LỘ TRÌNH THÍCH ỨNG (Personalized Roadmap)   │
  └─────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ 3. LUYỆN TẬP ĐA KỸ NĂNG & THI THỬ (Practice & Mock Tests) │
  └─────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ 4. TỰ ĐỘNG PHÂN TÍCH LỖI SAI (Error Intelligence Engine)  │
  └─────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
  ┌───────────────────────────────────────────────────────────┐
  │ 5. ÔN TẬP LẶP LẠI NGẮT QUÃNG (SuperMemo SM-2 Algorithm)   │
  └─────────────────────────────┬─────────────────────────────┘
                                │ (Cập nhật năng lực & quay lại vòng lặp)
                                └─────────────────────────────► [ Vòng lặp tối ưu hóa ]
```

---

## 👥 2. Bốn đối tượng người dùng (Target Personas)

1. **Khách vãng lai (Guest)**: Tham quan giới thiệu, xem cấu trúc đề thi TOEIC/VSTEP, thư viện câu hỏi mẫu, bảng giá và đăng ký.
2. **Học viên (Student)**: Làm bài test đầu vào, học theo lộ trình cá nhân hóa, luyện nghe/đọc/nói/viết, thi thử phòng máy tính, quản lý Sổ tay lỗi và ôn tập thẻ từ vựng SRS.
3. **Giáo viên (Teacher)**: Quản lý lớp học, theo dõi học viên, giao bài tập về nhà, chấm điểm tự luận Writing & Speaking theo barem chính thức, xem phân tích cụm lỗi của lớp.
4. **Quản trị viên (Admin)**: Quản lý người dùng, phân quyền RBAC, quản lý ngân hàng câu hỏi, đề thi thử, khóa học, theo dõi nhật ký kiểm toán (Audit Logs) và thống kê máy chủ.

---

## 🏗️ 3. Kiến trúc công nghệ (Technical Stack)

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query v5, Zustand, React Router v6.
- **Backend**: Node.js, Express, TypeScript (Modular Architecture 14 modules), Zod, JWT, BCrypt, Pino Logger.
- **Database**: PostgreSQL quản lý qua **Prisma ORM** (28 bảng quan hệ chuẩn hóa 3NF).
- **Package Shared**: Thư viện dùng chung chứa TypeScript Types, Zod Schemas, Bảng quy đổi điểm ETS và Thuật toán SM-2.
- **Quản lý Monorepo**: Turborepo, NPM / PNPM Workspaces.

---

## 📂 4. Cấu trúc thư mục Monorepo

```
DACN/
├── packages/
│   └── shared/                  # Thư viện dùng chung giữa FE & BE
│       ├── src/
│       │   ├── constants/       # Bảng quy đổi ETS TOEIC, cấp bậc CEFR VSTEP
│       │   ├── logic/           # Thuật toán điểm ETS, VSTEP, SM-2, phân loại lỗi
│       │   ├── schemas/         # DTO Validation Schemas (Zod)
│       │   └── types/           # Domain TypeScript Interfaces
├── frontend/                    # Giao diện người dùng SPA (Vite + React)
│   ├── src/
│   │   ├── app/                 # Router, Providers, Guards, Config
│   │   ├── engines/             # ExamRunner, QuestionRenderer, FlashcardEngine
│   │   ├── layouts/             # GuestLayout, StudentLayout, TeacherLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, Forgot, Reset, Verify
│   │   │   ├── onboarding/      # Goal, Target, Schedule, Skills, Placement Test
│   │   │   └── marketing/       # Home, Toeic, Vstep, Courses, MockTests, Blog, FAQ...
│   │   └── roles/
│   │       ├── student/         # 21 màn hình Portal học tập cá nhân hóa
│   │       ├── teacher/         # 8 màn hình quản lý lớp & chấm bài
│   │       └── admin/           # 10 màn hình điều hành hệ thống
└── backend/                     # API Server Node.js + Express + Prisma
    ├── prisma/
    │   ├── schema.prisma        # 28 Models PostgreSQL quan hệ
    │   └── seed/index.ts        # Kịch bản nạp dữ liệu mẫu hoàn chỉnh
    └── src/
        ├── middleware/          # JWT Auth, RBAC, Zod Validator, Error Handler
        └── modules/             # 14 Modules nghiệp vụ chuẩn RESTful
            ├── auth/            # Xác thực, cấp phát token JWT
            ├── onboarding/      # Khảo sát mục tiêu và chẩn đoán ban đầu
            ├── courses/         # Quản lý khóa học, giáo trình
            ├── lessons/         # Bài giảng và tiến độ hoàn thành
            ├── vocabulary/      # Flashcard từ vựng & dữ liệu Spaced Repetition
            ├── grammar/         # 24 chuyên đề ngữ pháp
            ├── questions/       # Ngân hàng câu hỏi, Audio, Passages
            ├── tests/           # Cấu hình đề thi thử
            ├── exams/           # Phòng thi, chấm điểm ETS/VSTEP, snapshot đề
            ├── mistakes/        # Sổ tay lỗi sai & phân loại nguyên nhân
            ├── review/          # Bộ điều phối ôn tập ngắt quãng (SM-2)
            ├── analytics/       # Biểu đồ năng lực & thống kê tiến độ
            ├── grading/         # Hàng đợi chấm tự luận cho giáo viên
            └── users/           # Quản lý tài khoản & Audit Logs
```

---

## 🧮 5. Các thuật toán nghiệp vụ cốt lõi

### 1. Thuật toán quy đổi điểm TOEIC ETS (Non-linear Conversion)
Điểm bài thi TOEIC không áp dụng phép nhân tuyến tính $Điểm = Số\_câu \times 5$. Hệ thống sử dụng phép nội suy từng phân đoạn (*Piecewise Linear Interpolation*) chuẩn theo thang điểm chính thức của Viện Khảo thí ETS Hoa Kỳ, đảm bảo điểm số làm tròn về bội số của 5 và nằm trong khoảng [5, 495] cho mỗi kỹ năng.

### 2. Thuật toán Spaced Repetition (SuperMemo SM-2)
Áp dụng cho Sổ tay lỗi sai và Thẻ học từ vựng:
- Đánh giá chất lượng ghi nhớ: $q \in [0, 5]$.
- Nếu $q < 3$: Coi như quên $\rightarrow$ Reset số lần nhớ $Rep = 0$, ôn lại vào ngày mai ($Interval = 1$).
- Nếu $q \ge 3$:
  - Lần 1: $Interval = 1$ ngày
  - Lần 2: $Interval = 6$ ngày
  - Lần $n$: $Interval_n = \text{round}(Interval_{n-1} \times EF)$
- Cập nhật Hệ số ghi nhớ:
  $$EF' = \max\left(1.3, EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)\right)$$

### 3. Bộ phân loại lỗi tự động (Error Classifier)
Mỗi khi học viên chọn sai một câu hỏi, hệ thống sẽ tự động gán nhãn nguyên nhân chính:
- **`GRAMMAR_MISUNDERSTANDING`**: Sai các câu chứa thẻ thì (Tenses), hòa hợp chủ vị, mệnh đề quan hệ.
- **`VOCABULARY_DEFICIT`**: Sai các câu hỏi về collocation, từ cùng gốc, ngữ nghĩa từ vựng.
- **`LISTENING_MISHEARD`**: Bẫy âm đồng âm (Homophones), câu trả lời gián tiếp Part 2.
- **`READING_MISINTERPRETATION`**: Sai ý chính hoặc suy luận thông tin Part 7.
- **`CARELESS_MISTAKE`**: Thời gian trả lời câu hỏi dưới 5 giây.
- **`TIME_PRESSURE`**: Câu hỏi bị bỏ trống khi hết giờ làm bài.

---

## 🚀 6. Hướng dẫn cài đặt & Khởi chạy (Setup & Run)

### Yêu cầu môi trường:
- Node.js version 18.x trở lên
- PostgreSQL (hoặc pgAdmin 4)

### Bước 1: Cài đặt Dependencies
Tại thư mục gốc dự án:
```powershell
npm install
```

### Bước 2: Cấu hình biến môi trường
Kiểm tra file `backend/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orbilingo_db?schema=public"
JWT_SECRET="orbilingo-super-secure-jwt-secret-key-2026"
```

### Bước 3: Khởi tạo Database & Nạp dữ liệu mẫu (Seed Data)
```powershell
cd backend
npx prisma generate
npx prisma db push
npm run prisma:seed
cd ..
```

### Bước 4: Khởi chạy dự án (Frontend & Backend song song)
```powershell
npm run dev
```
- **Frontend** mở tại: `http://localhost:3000`
- **Backend API** mở tại: `http://localhost:5000/api/v1`

---

## 🔑 7. Tài khoản trải nghiệm nhanh (Demo Credentials)

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng kiểm thử |
|---|---|---|---|
| **Học viên (Student)** | `student@orbi.edu.vn` | `OrbiLingo@2026` | Lộ trình cá nhân, thi thử ETS, Sổ tay lỗi sai, thẻ từ vựng SRS |
| **Giáo viên (Teacher)** | `teacher@orbi.edu.vn` | `OrbiLingo@2026` | Quản lý lớp, giao bài tập, chấm Writing/Speaking |
| **Quản trị (Admin)** | `admin@orbi.edu.vn` | `OrbiLingo@2026` | Quản trị ngân hàng câu hỏi, đề thi, khóa học, Audit Logs |

---

## 📄 Bản quyền & Tác quyền
Dự án được thực hiện phục vụ học phần **Đồ án chuyên ngành (DACN)**. Toàn bộ mã nguồn, cấu trúc dữ liệu và tài liệu đã được hoàn thiện 100%.
