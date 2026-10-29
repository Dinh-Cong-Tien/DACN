# Frontend Architecture

- **Pattern:** Feature-Sliced & Role-Based Modular Architecture (React 18 + Vite + TypeScript + Tailwind).
- **Routing:** React Router v6 `createBrowserRouter`; guards `AuthGuard` (đăng nhập), `GuestGuard` (chặn trang auth khi đã login), `RoleGuard minRole` (phân cấp GUEST < STUDENT < TEACHER < HEAD_TEACHER < ADMIN).
- **State:** Zustand `authStore` (persist `orbi-auth`: user, token, onboardingDone) + `uiStore` (sidebar, toasts). TanStack Query giữ sẵn cho server state.
- **Engines:** 5 engine dùng chung (xem `engine-architecture.md`).

## Cấu trúc thư mục `frontend/src`

| Thư mục | Vai trò |
|---|---|
| `app/` | config, providers, router (`public/auth/onboarding/student/teacher/head/admin.routes.tsx`), guards |
| `layouts/` | `GuestLayout`, `AuthLayout`, `OnboardingLayout`, và 4 layout portal (`student/teacher/head/admin`) đều cấu hình từ `shared/components/layout/AppShell` (sidebar thu gọn, mobile drawer, header, dropdown user) |
| `pages/marketing` | 20 trang public (Home, TOEIC, VSTEP, Courses, Mock tests, Score converter, Resources, Blog, FAQ, Pricing, 404…) |
| `pages/auth`, `pages/onboarding` | Auth 5 trang; Onboarding 6 bước (Goal → Target → Schedule → Skills → Placement test → Result) |
| `roles/student/pages` | 25 trang học viên (`/app/*`) |
| `roles/teacher/pages` | 8 trang giáo viên (`/teacher/*`) |
| `roles/head/pages` | 8 trang trưởng bộ môn (`/head/*`) |
| `roles/admin/pages` | 11 trang quản trị (`/admin/*`) |
| `roles/common` | `NotificationsPage`, `AccountSettingsPage` dùng chung nhiều role |
| `shared/components/ui` | UI kit: Button, Badge, Card, StatCard, Input/Select/Textarea, Modal/Drawer/Dropdown/Toast, Tabs/Segmented/Chip, ProgressBar/RingProgress, MiniBars/Sparkline/RadarChart/Heatmap, DataTable/Pagination, Accordion/Stepper/Timeline… |
| `shared/components/motion` | `Reveal`, `Stagger`, `PageTransition`, `CountUp`, `FloatingBlobs` |
| `shared/components/media` | `AudioPlayer` (chế độ thi: phát 1 lần, không tua) |
| `shared/mocks` | Mock data toàn hệ thống (questions, tests, courses, student, teacher, head, admin, marketing) |
| `shared/types` | Contract types UI (`AppUser`, `Course`, `Lesson`, `Mistake`, `ClassRoom`, `Assignment`, `AuditLog`, …) |
| `shared/stores`, `shared/hooks`, `shared/utils` | Zustand stores, hooks (`useInView`, `useCountUp`, `useCountdown`, `useLocalStorage`…), helpers (`cn`, `formatDate`, `ROLE_HOME`…) |

## Tài khoản demo (mock auth)
`student@ / teacher@ / head@ / admin@orbi.edu.vn` — mật khẩu bất kỳ (gợi ý `OrbiLingo@2026`). Role được suy ra từ tiền tố email (`resolveDemoRole`).

## Animation system
- Keyframes/animation khai báo trong `tailwind.config.js` (`fade-up`, `scale-in`, `slide-in-*`, `shimmer`, `float`, `pop`, `shake`, `blob`…), safelist cho class động.
- `index.css`: `.card-hover`, `.glass`, `.shine`, `.skeleton`, `.flip-card`, `.stagger`, `prefers-reduced-motion`.
