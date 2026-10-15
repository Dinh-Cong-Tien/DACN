const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileIfNotExist(filePath, content) {
  const fullPath = path.join(rootDir, filePath);
  ensureDir(path.dirname(fullPath));
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
    console.log(`Created: ${filePath}`);
  } else {
    console.log(`Skipped (already exists): ${filePath}`);
  }
}

function writeKeep(dirPath) {
  const fullDirPath = path.join(rootDir, dirPath);
  ensureDir(fullDirPath);
  const files = fs.readdirSync(fullDirPath);
  if (files.length === 0) {
    fs.writeFileSync(path.join(fullDirPath, '.gitkeep'), '', 'utf8');
  }
}

console.log('--- Generating Monorepo Structure ---');

// 1. Root configuration files
writeFileIfNotExist('package.json', JSON.stringify({
  name: "toeic-vstep-platform",
  version: "1.0.0",
  private: true,
  scripts: {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean"
  },
  devDependencies: {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0"
  },
  packageManager: "pnpm@9.15.0",
  workspaces: [
    "frontend",
    "backend",
    "packages/*"
  ]
}, null, 2));

writeFileIfNotExist('pnpm-workspace.yaml', `packages:
  - 'frontend'
  - 'backend'
  - 'packages/*'
`);

writeFileIfNotExist('turbo.json', JSON.stringify({
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}, null, 2));

writeFileIfNotExist('tsconfig.base.json', JSON.stringify({
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}, null, 2));

writeFileIfNotExist('tsconfig.json', JSON.stringify({
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "."
  },
  "references": [
    { "path": "./frontend" },
    { "path": "./backend" },
    { "path": "./packages/shared" }
  ]
}, null, 2));

writeFileIfNotExist('.gitignore', `# Dependencies
node_modules
.pnpm-store

# Environment
.env
.env.local
.env.*.local
!.env.example

# Build outputs
dist
build
.turbo
out

# Prisma & DB
*.sqlite
*.sqlite-journal

# Logs
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
*.log

# OS
.DS_Store
Thumbs.db
`);

writeFileIfNotExist('.env.example', `# Platform Environment Variables
NODE_ENV=development

# Backend API
PORT=5000
API_BASE_URL=http://localhost:5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/toeic_vstep_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend Client
VITE_API_BASE_URL=http://localhost:5000/api
`);

writeFileIfNotExist('docker-compose.yml', `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: toeic_vstep_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: toeic_vstep_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: toeic_vstep_redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
`);

writeFileIfNotExist('README.md', `# TOEIC & VSTEP Prep Platform

Monorepo for TOEIC and VSTEP adaptive test preparation platform.

## Architecture & Structure
- \`frontend/\`: React 18+ Single Page App with Vite, Tailwind CSS, TanStack Query, and Zustand.
- \`backend/\`: Node.js / Express / TypeScript modular monolith backed by PostgreSQL, Prisma ORM, and Redis.
- \`packages/shared/\`: Domain types, DTO schemas (Zod), shared scoring/validation logic, and constants.
- \`packages/eslint-config/\`: Shared ESLint configurations.
- \`packages/tsconfig/\`: Shared TypeScript compiler configurations.
- \`docs/\`: Architecture diagrams, DB schema, and API documentation.
`);

// 2. .github / workflows, infra, scripts
writeFileIfNotExist('.github/workflows/ci.yml', `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run test
`);

writeKeep('infra');
writeKeep('scripts');

// 3. docs
writeFileIfNotExist('docs/architecture/overview.md', `# Architecture Overview

Hệ thống TOEIC & VSTEP Prep Platform là nền tảng EdTech hỗ trợ học tập và luyện thi chuyên sâu theo chuẩn TOEIC và VSTEP.
Hệ thống sử dụng kiến trúc Monorepo phân tách rõ rệt giữa Presentation (Frontend), Domain/Application Services (Backend), và Shared Packages.
`);

writeFileIfNotExist('docs/architecture/frontend-architecture.md', `# Frontend Architecture

- **Pattern:** Feature-Sliced & Role-Based Modular Architecture.
- **Routing:** Router v6 Data API (\`createBrowserRouter\`), RoleGuard, AuthGuard, GuestGuard.
- **State Management:** TanStack Query cho Server State, Zustand cho Client/Session State.
- **Engines:** 4 Reusable UI Engines (Practice, Exam, Lesson, Flashcard).
`);

writeFileIfNotExist('docs/architecture/backend-architecture.md', `# Backend Architecture

- **Pattern:** Modular Monolith chia theo domain module độc lập.
- **Data Access:** Prisma ORM, PostgreSQL.
- **Security:** JWT Authentication, Role-based Access Control (RBAC), Rate limiting, Helmet.
- **Jobs & Realtime:** BullMQ / Redis cho cron jobs, WebSockets cho thi trực tuyến / phòng luyện nói.
`);

writeFileIfNotExist('docs/architecture/engine-architecture.md', `# Reusable UI Engines

1. **PracticeEngine:** Luyện tập từng phần (TOEIC Part 1-7, VSTEP Skills) kèm giải thích đáp án và bookmark lỗi sai.
2. **ExamRunner:** Trình thi thử full-screen focus mode, đồng hồ đếm ngược, tự động lưu nháp, chấm điểm tự động.
3. **VocabFlashcardEngine:** Flashcard SRS (Spaced Repetition System) học từ vựng hiệu quả.
4. **AdminContentStudio:** Quản trị ngân hàng câu hỏi, soạn thảo đề thi, phân loại câu hỏi cha-con (Passage / Audio group).
`);

writeFileIfNotExist('docs/architecture/feature-status.md', `# Feature Status Matrix

| Module | Tính năng | Trạng thái |
|---|---|---|
| Auth | Đăng ký, Đăng nhập, Quên mật khẩu, Xác thực | Thiết kế & Khởi tạo |
| Onboarding | Goal -> Target -> Schedule -> Placement Test | Thiết kế & Khởi tạo |
| Practice | TOEIC Part 1-7, VSTEP Skills | Thiết kế & Khởi tạo |
| Exam | Mock Tests Full Engine | Thiết kế & Khởi tạo |
`);

writeKeep('docs/database');
writeKeep('docs/api');
writeKeep('docs/frontend');
writeKeep('docs/backend');
writeKeep('docs/deployment');

// 4. packages/shared, eslint-config, tsconfig
writeFileIfNotExist('packages/shared/package.json', JSON.stringify({
  name: "@toeic-vstep/shared",
  version: "1.0.0",
  main: "./src/index.ts",
  types: "./src/index.ts",
  devDependencies: {
    "typescript": "^5.7.0"
  }
}, null, 2));

writeFileIfNotExist('packages/shared/tsconfig.json', JSON.stringify({
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}, null, 2));

writeFileIfNotExist('packages/shared/src/index.ts', `export * from './types';
export * from './schemas';
export * from './logic';
export * from './constants';
`);

writeFileIfNotExist('packages/shared/src/types/index.ts', `export type ExamType = 'TOEIC' | 'VSTEP';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  currentLevel?: string;
  targetLevel?: string;
  targetExam?: ExamType;
  streakCount: number;
}
`);

writeFileIfNotExist('packages/shared/src/schemas/index.ts', `// DTO & Validation Schemas (Zod)
export const USER_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
`);

writeFileIfNotExist('packages/shared/src/logic/index.ts', `// Core business calculation logic (e.g. TOEIC/VSTEP score conversion)
export function calculateToeicScore(rawListening: number, rawReading: number) {
  return { listeningScore: rawListening * 5, readingScore: rawReading * 5, total: (rawListening + rawReading) * 5 };
}
`);

writeFileIfNotExist('packages/shared/src/constants/index.ts', `export const EXAM_TYPES = ['TOEIC', 'VSTEP'] as const;
export const DEFAULT_PAGE_SIZE = 20;
`);

writeFileIfNotExist('packages/eslint-config/package.json', JSON.stringify({
  name: "@toeic-vstep/eslint-config",
  version: "1.0.0",
  main: "index.js"
}, null, 2));

writeFileIfNotExist('packages/eslint-config/index.js', `module.exports = {
  extends: ["eslint:recommended"],
  env: { node: true, es2022: true },
};
`);

writeFileIfNotExist('packages/tsconfig/package.json', JSON.stringify({
  name: "@toeic-vstep/tsconfig",
  version: "1.0.0"
}, null, 2));

writeFileIfNotExist('packages/tsconfig/base.json', JSON.stringify({
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}, null, 2));

// 5. Frontend
writeFileIfNotExist('frontend/package.json', JSON.stringify({
  name: "@toeic-vstep/frontend",
  version: "1.0.0",
  private: true,
  type: "module",
  scripts: {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  },
  dependencies: {
    "@toeic-vstep/shared": "workspace:*",
    "@tanstack/react-query": "^5.62.0",
    "axios": "^1.7.9",
    "lucide-react": "^0.468.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "zustand": "^5.0.2"
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.0",
    "vite": "^6.0.3"
  }
}, null, 2));

writeFileIfNotExist('frontend/tsconfig.json', JSON.stringify({
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}, null, 2));

writeFileIfNotExist('frontend/vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
`);

// frontend public
writeFileIfNotExist('frontend/public/favicon.ico', '');
writeKeep('frontend/public/images');
writeKeep('frontend/public/icons');
writeKeep('frontend/public/audio');

// frontend src app
writeFileIfNotExist('frontend/src/app/config/env.ts', `export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  IS_DEV: import.meta.env.DEV,
};
`);

writeFileIfNotExist('frontend/src/app/config/routes.ts', `export const ROUTES = {
  HOME: '/',
  TOEIC: '/toeic',
  VSTEP: '/vstep',
  COURSES: '/courses',
  PRACTICE: '/practice',
  MOCK_TESTS: '/mock-tests',
  PRICING: '/pricing',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  ONBOARDING: {
    GOAL: '/onboarding/goal',
    TARGET: '/onboarding/target',
    SCHEDULE: '/onboarding/schedule',
    SKILLS: '/onboarding/skills',
    PLACEMENT_TEST: '/onboarding/placement-test',
    PLACEMENT_RESULT: '/onboarding/placement-result',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
  },
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
  },
} as const;
`);

writeFileIfNotExist('frontend/src/app/config/app.config.ts', `export const appConfig = {
  appName: 'TOEIC & VSTEP Prep Platform',
  version: '1.0.0',
};
`);

writeFileIfNotExist('frontend/src/app/guards/AuthGuard.tsx', `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export const AuthGuard: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }
  return <Outlet />;
};
`);

writeFileIfNotExist('frontend/src/app/guards/GuestGuard.tsx', `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes';

export const GuestGuard: React.FC = () => {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'));
  if (isAuthenticated) {
    return <Navigate to={ROUTES.STUDENT.DASHBOARD} replace />;
  }
  return <Outlet />;
};
`);

writeFileIfNotExist('frontend/src/app/guards/RoleGuard.tsx', `import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../config/routes';

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const userRole = localStorage.getItem('user_role') || 'STUDENT';
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
};
`);

writeFileIfNotExist('frontend/src/app/providers/QueryProvider.tsx', `import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
`);

writeFileIfNotExist('frontend/src/app/providers/RouterProvider.tsx', `import React from 'react';
import { RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { router } from '../router';

export const RouterProvider: React.FC = () => {
  return <ReactRouterProvider router={router} />;
};
`);

writeFileIfNotExist('frontend/src/app/providers/AppProviders.tsx', `import React from 'react';
import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';

export const AppProviders: React.FC = () => {
  return (
    <QueryProvider>
      <RouterProvider />
    </QueryProvider>
  );
};
`);

// frontend routes
writeFileIfNotExist('frontend/src/app/router/public.routes.tsx', `import { RouteObject } from 'react-router-dom';
import { HomePage } from '@/pages/marketing/HomePage';
import { ToeicPage } from '@/pages/marketing/ToeicPage';
import { VstepPage } from '@/pages/marketing/VstepPage';
import { CoursesPage } from '@/pages/marketing/CoursesPage';
import { CourseDetailPage } from '@/pages/marketing/CourseDetailPage';
import { PracticePage } from '@/pages/marketing/PracticePage';
import { MockTestsPage } from '@/pages/marketing/MockTestsPage';
import { QuestionBankPage } from '@/pages/marketing/QuestionBankPage';
import { LeaderboardPage } from '@/pages/marketing/LeaderboardPage';
import { PricingPage } from '@/pages/marketing/PricingPage';
import { BlogPage } from '@/pages/marketing/BlogPage';
import { BlogDetailPage } from '@/pages/marketing/BlogDetailPage';
import { BlogCategoryPage } from '@/pages/marketing/BlogCategoryPage';
import { FAQPage } from '@/pages/marketing/FAQPage';
import { AboutPage } from '@/pages/marketing/AboutPage';
import { ContactPage } from '@/pages/marketing/ContactPage';
import { HelpPage } from '@/pages/marketing/HelpPage';

export const publicRoutes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/toeic', element: <ToeicPage /> },
  { path: '/vstep', element: <VstepPage /> },
  { path: '/courses', element: <CoursesPage /> },
  { path: '/courses/:id', element: <CourseDetailPage /> },
  { path: '/practice', element: <PracticePage /> },
  { path: '/mock-tests', element: <MockTestsPage /> },
  { path: '/question-bank', element: <QuestionBankPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/pricing', element: <PricingPage /> },
  { path: '/blog', element: <BlogPage /> },
  { path: '/blog/category/:slug', element: <BlogCategoryPage /> },
  { path: '/blog/:slug', element: <BlogDetailPage /> },
  { path: '/faq', element: <FAQPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/help', element: <HelpPage /> },
];
`);

writeFileIfNotExist('frontend/src/app/router/auth.routes.tsx', `import { RouteObject } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { VerifyPage } from '@/pages/auth/VerifyPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { GuestGuard } from '../guards/GuestGuard';

export const authRoutes: RouteObject[] = [
  {
    path: '/auth',
    element: <GuestGuard />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'verify', element: <VerifyPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  },
];
`);

writeFileIfNotExist('frontend/src/app/router/onboarding.routes.tsx', `import { RouteObject } from 'react-router-dom';
import { GoalPage } from '@/pages/onboarding/GoalPage';
import { TargetPage } from '@/pages/onboarding/TargetPage';
import { SchedulePage } from '@/pages/onboarding/SchedulePage';
import { SkillsPage } from '@/pages/onboarding/SkillsPage';
import { PlacementTestPage } from '@/pages/onboarding/PlacementTestPage';
import { PlacementResultPage } from '@/pages/onboarding/PlacementResultPage';
import { AuthGuard } from '../guards/AuthGuard';

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: <AuthGuard />,
    children: [
      { path: 'goal', element: <GoalPage /> },
      { path: 'target', element: <TargetPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'placement-test', element: <PlacementTestPage /> },
      { path: 'placement-result', element: <PlacementResultPage /> },
    ],
  },
];
`);

writeFileIfNotExist('frontend/src/app/router/student.routes.tsx', `import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';

export const studentRoutes: RouteObject[] = [
  {
    path: '/student',
    element: <AuthGuard />,
    children: [
      { path: 'dashboard', element: <div>Student Dashboard</div> },
    ],
  },
];
`);

writeFileIfNotExist('frontend/src/app/router/teacher.routes.tsx', `import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../guards/RoleGuard';

export const teacherRoutes: RouteObject[] = [
  {
    path: '/teacher',
    element: <RoleGuard allowedRoles={['TEACHER', 'ADMIN']} />,
    children: [
      { path: 'dashboard', element: <div>Teacher Dashboard</div> },
    ],
  },
];
`);

writeFileIfNotExist('frontend/src/app/router/admin.routes.tsx', `import { RouteObject } from 'react-router-dom';
import { RoleGuard } from '../guards/RoleGuard';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <RoleGuard allowedRoles={['ADMIN']} />,
    children: [
      { path: 'dashboard', element: <div>Admin Dashboard</div> },
    ],
  },
];
`);

writeFileIfNotExist('frontend/src/app/router/index.tsx', `import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { onboardingRoutes } from './onboarding.routes';
import { studentRoutes } from './student.routes';
import { teacherRoutes } from './teacher.routes';
import { adminRoutes } from './admin.routes';

export const router = createBrowserRouter([
  ...publicRoutes,
  ...authRoutes,
  ...onboardingRoutes,
  ...studentRoutes,
  ...teacherRoutes,
  ...adminRoutes,
]);
`);

// layouts focus
writeFileIfNotExist('frontend/src/layouts/focus/FocusLayout.tsx', `import React from 'react';
import { Outlet } from 'react-router-dom';

export const FocusLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
`);

writeFileIfNotExist('frontend/src/layouts/focus/ExamFocusLayout.tsx', `import React from 'react';
import { Outlet } from 'react-router-dom';

export const ExamFocusLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col select-none">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
`);

writeFileIfNotExist('frontend/src/layouts/focus/PracticeFocusLayout.tsx', `import React from 'react';
import { Outlet } from 'react-router-dom';

export const PracticeFocusLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
`);

// pages marketing
const marketingPages = [
  'HomePage', 'ToeicPage', 'VstepPage', 'CoursesPage', 'CourseDetailPage',
  'PracticePage', 'MockTestsPage', 'QuestionBankPage', 'LeaderboardPage',
  'PricingPage', 'BlogPage', 'BlogDetailPage', 'BlogCategoryPage',
  'FAQPage', 'AboutPage', 'ContactPage', 'HelpPage'
];

for (const page of marketingPages) {
  writeFileIfNotExist(`frontend/src/pages/marketing/${page}.tsx`, `import React from 'react';

export const ${page}: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">${page}</h1>
    </div>
  );
};
`);
}

// pages auth
const authPages = ['LoginPage', 'RegisterPage', 'VerifyPage', 'ForgotPasswordPage', 'ResetPasswordPage'];
for (const page of authPages) {
  writeFileIfNotExist(`frontend/src/pages/auth/${page}.tsx`, `import React from 'react';

export const ${page}: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-12 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">${page}</h1>
    </div>
  );
};
`);
}

// pages onboarding
const onboardingPages = [
  'GoalPage', 'TargetPage', 'SchedulePage', 'SkillsPage', 'PlacementTestPage', 'PlacementResultPage'
];
for (const page of onboardingPages) {
  writeFileIfNotExist(`frontend/src/pages/onboarding/${page}.tsx`, `import React from 'react';

export const ${page}: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto my-12 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">${page}</h1>
    </div>
  );
};
`);
}

// frontend onboarding features
writeFileIfNotExist('frontend/src/features/onboarding/api/onboardingApi.ts', `import { env } from '@/app/config/env';

export const onboardingApi = {
  saveGoal: async (goalData: unknown) => {
    // API call placeholder
    return { success: true, data: goalData };
  },
  saveSchedule: async (scheduleData: unknown) => {
    return { success: true, data: scheduleData };
  },
};
`);

writeFileIfNotExist('frontend/src/features/onboarding/api/placementApi.ts', `export const placementApi = {
  getPlacementTest: async (examType: 'TOEIC' | 'VSTEP') => {
    return { examType, questions: [] };
  },
  submitPlacementTest: async (answers: unknown) => {
    return { estimatedScore: 650, recommendedPathId: 'path-foundation' };
  },
};
`);

writeFileIfNotExist('frontend/src/features/onboarding/components/GoalSelector.tsx', `import React from 'react';

export const GoalSelector: React.FC = () => {
  return <div>Goal Selector Component</div>;
};
`);

writeFileIfNotExist('frontend/src/features/onboarding/components/TargetSelector.tsx', `import React from 'react';

export const TargetSelector: React.FC = () => {
  return <div>Target Selector Component</div>;
};
`);

writeFileIfNotExist('frontend/src/features/onboarding/components/ScheduleSelector.tsx', `import React from 'react';

export const ScheduleSelector: React.FC = () => {
  return <div>Schedule Selector Component</div>;
};
`);

writeFileIfNotExist('frontend/src/features/onboarding/components/PlacementFlow.tsx', `import React from 'react';

export const PlacementFlow: React.FC = () => {
  return <div>Placement Flow Component</div>;
};
`);

writeFileIfNotExist('frontend/src/features/onboarding/hooks/useOnboardingWizard.ts', `import { useState } from 'react';

export function useOnboardingWizard() {
  const [step, setStep] = useState(1);
  return { step, nextStep: () => setStep((s) => s + 1), prevStep: () => setStep((s) => s - 1) };
}
`);

// Keep leaf dirs in frontend
const frontendKeepDirs = [
  'frontend/layouts/guest',
  'frontend/layouts/auth',
  'frontend/layouts/onboarding',
  'frontend/layouts/student',
  'frontend/layouts/teacher',
  'frontend/layouts/admin',
  'frontend/src/features/marketing/api',
  'frontend/src/features/marketing/components',
  'frontend/src/features/marketing/hooks',
  'frontend/src/features/marketing/types',
  'frontend/src/features/marketing/utils',
  'frontend/src/features/auth/api',
  'frontend/src/features/auth/components',
  'frontend/src/features/auth/hooks',
  'frontend/src/features/auth/types',
  'frontend/src/features/auth/utils',
  'frontend/src/features/onboarding/types',
  'frontend/src/features/onboarding/utils',
  'frontend/src/roles/student/pages',
  'frontend/src/roles/student/features/dashboard',
  'frontend/src/roles/student/features/learning-path',
  'frontend/src/roles/student/features/courses',
  'frontend/src/roles/student/features/vocabulary',
  'frontend/src/roles/student/features/grammar',
  'frontend/src/roles/student/features/listening',
  'frontend/src/roles/student/features/reading',
  'frontend/src/roles/student/features/speaking',
  'frontend/src/roles/student/features/writing',
  'frontend/src/roles/student/features/practice',
  'frontend/src/roles/student/features/mock-tests',
  'frontend/src/roles/student/features/mistakes',
  'frontend/src/roles/student/features/bookmarks',
  'frontend/src/roles/student/features/review',
  'frontend/src/roles/student/features/progress',
  'frontend/src/roles/student/features/achievements',
  'frontend/src/roles/student/features/leaderboard',
  'frontend/src/roles/student/api',
  'frontend/src/roles/student/hooks',
  'frontend/src/roles/student/components',
  'frontend/src/roles/student/types',
  'frontend/src/roles/teacher/pages',
  'frontend/src/roles/teacher/features/courses',
  'frontend/src/roles/teacher/features/lessons',
  'frontend/src/roles/teacher/features/grading',
  'frontend/src/roles/teacher/features/students',
  'frontend/src/roles/teacher/features/analytics',
  'frontend/src/roles/teacher/api',
  'frontend/src/roles/teacher/hooks',
  'frontend/src/roles/teacher/components',
  'frontend/src/roles/teacher/types',
  'frontend/src/roles/admin/pages',
  'frontend/src/roles/admin/features/users',
  'frontend/src/roles/admin/features/roles',
  'frontend/src/roles/admin/features/content',
  'frontend/src/roles/admin/features/questions',
  'frontend/src/roles/admin/features/tests',
  'frontend/src/roles/admin/features/analytics',
  'frontend/src/roles/admin/features/system',
  'frontend/src/roles/admin/api',
  'frontend/src/roles/admin/hooks',
  'frontend/src/roles/admin/components',
  'frontend/src/roles/admin/types',
  'frontend/src/engines/practice',
  'frontend/src/engines/exam',
  'frontend/src/engines/lesson',
  'frontend/src/engines/vocab-flashcard',
  'frontend/src/engines/crud-editor',
  'frontend/src/shared/components/ui',
  'frontend/src/shared/components/forms',
  'frontend/src/shared/components/charts',
  'frontend/src/shared/components/feedback',
  'frontend/src/shared/components/media',
  'frontend/src/shared/hooks',
  'frontend/src/shared/services',
  'frontend/src/shared/stores',
  'frontend/src/shared/utils',
  'frontend/src/shared/constants',
  'frontend/src/shared/types',
  'frontend/src/shared/assets',
  'frontend/src/tests/unit',
  'frontend/src/tests/integration',
  'frontend/src/tests/e2e',
];
for (const dir of frontendKeepDirs) {
  writeKeep(dir);
}

// 6. Backend
writeFileIfNotExist('backend/package.json', JSON.stringify({
  name: "@toeic-vstep/backend",
  version: "1.0.0",
  private: true,
  main: "dist/app/server.js",
  scripts: {
    "dev": "tsx watch src/app/server.ts",
    "build": "tsc",
    "start": "node dist/app/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed/index.ts",
    "lint": "eslint .",
    "test": "vitest"
  },
  dependencies: {
    "@prisma/client": "^6.0.1",
    "@toeic-vstep/shared": "workspace:*",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "pino": "^9.5.0",
    "zod": "^3.24.1"
  },
  devDependencies: {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.10.2",
    "prisma": "^6.0.1",
    "tsx": "^4.19.2",
    "typescript": "^5.7.0"
  }
}, null, 2));

writeFileIfNotExist('backend/tsconfig.json', JSON.stringify({
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "prisma/**/*"]
}, null, 2));

// backend prisma
writeFileIfNotExist('backend/prisma/schema.prisma', `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum ExamType {
  TOEIC
  VSTEP
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  role         Role          @default(STUDENT)
  currentLevel String?
  targetLevel  String?
  targetExam   ExamType?
  streakCount  Int           @default(0)
  lastStudyAt  DateTime?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  examAttempts ExamAttempt[]
  mistakes     MistakeNotebook[]
  learningPath LearningPath?
}

model Question {
  id           String             @id @default(uuid())
  examType     ExamType
  type         String
  partOrSkill  String
  level        String
  passageText  String?
  audioUrl     String?
  imageUrl     String?
  stem         String
  options      Json
  correctAnswer Json
  explanation  String?
  difficulty   Int                @default(1)
  tags         String[]
  parentId     String?
  orderInGroup Int?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  mockTestQuestions MockTestQuestion[]
  mistakes          MistakeNotebook[]
}

model MockTest {
  id              String             @id @default(uuid())
  title           String
  examType        ExamType
  durationMinutes Int
  totalQuestions  Int
  status          String             @default("DRAFT")
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  questions       MockTestQuestion[]
  attempts        ExamAttempt[]
}

model MockTestQuestion {
  testId     String
  questionId String
  orderIndex Int
  section    String
  points     Float     @default(1.0)

  test       MockTest  @relation(fields: [testId], references: [id], onDelete: Cascade)
  question   Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@id([testId, questionId])
}

model ExamAttempt {
  id           String    @id @default(uuid())
  userId       String
  testId       String
  status       String    @default("IN_PROGRESS")
  answers      Json
  flagged      String[]
  score        Float?
  correctCount Int?
  timeSpentSec Int       @default(0)
  remainingSec Int?
  weakSkills   Json?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  test         MockTest  @relation(fields: [testId], references: [id], onDelete: Cascade)
}

model MistakeNotebook {
  id               String    @id @default(uuid())
  userId           String
  questionId       String
  userWrongAnswer  Json
  mistakeCount     Int       @default(1)
  source           String
  nextReviewAt     DateTime  @default(now())
  isResolved       Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question         Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

model LearningPath {
  id           String    @id @default(uuid())
  userId       String    @unique
  currentStage String
  stages       Json
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
`);

writeKeep('backend/prisma/migrations');

writeFileIfNotExist('backend/prisma/seed/index.ts', `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`);

// backend src app, config, middleware, lib
writeFileIfNotExist('backend/src/config/env.ts', `import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
`);

writeFileIfNotExist('backend/src/config/database.ts', `import { prisma } from '../lib/prisma';

export async function connectDatabase() {
  await prisma.$connect();
  console.log('Connected to PostgreSQL database.');
}
`);

writeFileIfNotExist('backend/src/config/cors.ts', `import cors from 'cors';

export const corsMiddleware = cors({
  origin: '*',
  credentials: true,
});
`);

writeFileIfNotExist('backend/src/config/security.ts', `import helmet from 'helmet';

export const securityMiddleware = helmet();
`);

writeFileIfNotExist('backend/src/lib/prisma.ts', `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
`);

writeFileIfNotExist('backend/src/lib/jwt.ts', `import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signToken(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}
`);

writeFileIfNotExist('backend/src/lib/password.ts', `import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
`);

writeFileIfNotExist('backend/src/lib/storage.ts', `export const storageService = {
  uploadFile: async (file: unknown) => {
    return { url: 'https://cdn.toeicvstep.local/file' };
  },
};
`);

writeFileIfNotExist('backend/src/lib/logger.ts', `import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});
`);

writeFileIfNotExist('backend/src/middleware/auth.ts', `import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
`);

writeFileIfNotExist('backend/src/middleware/rbac.ts', `import { Request, Response, NextFunction } from 'express';

export function rbacMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}
`);

writeFileIfNotExist('backend/src/middleware/validation.ts', `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      return res.status(400).json({ errors: err.errors });
    }
  };
}
`);

writeFileIfNotExist('backend/src/middleware/rate-limit.ts', `import { Request, Response, NextFunction } from 'express';

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // Rate-limiting placeholder
  next();
}
`);

writeFileIfNotExist('backend/src/middleware/error-handler.ts', `import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
}
`);

writeFileIfNotExist('backend/src/middleware/not-found.ts', `import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: 'Route not found' });
}
`);

writeFileIfNotExist('backend/src/app/routes.ts', `import { Router } from 'express';

export const appRouter = Router();

appRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
`);

writeFileIfNotExist('backend/src/app/app.ts', `import express from 'express';
import { corsMiddleware } from '../config/cors';
import { securityMiddleware } from '../config/security';
import { appRouter } from './routes';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found';

export const app = express();

app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(express.json());

app.use('/api', appRouter);

app.use(notFoundHandler);
app.use(errorHandler);
`);

writeFileIfNotExist('backend/src/app/server.ts', `import { app } from './app';
import { env } from '../config/env';
import { logger } from '../lib/logger';

app.listen(env.PORT, () => {
  logger.info(\`Server is running on http://localhost:\${env.PORT}\`);
});
`);

// Keep backend modules, realtime, jobs, etc.
const backendKeepDirs = [
  'backend/src/modules/auth',
  'backend/src/modules/users',
  'backend/src/modules/onboarding',
  'backend/src/modules/placement',
  'backend/src/modules/learning-path',
  'backend/src/modules/courses',
  'backend/src/modules/lessons',
  'backend/src/modules/vocabulary',
  'backend/src/modules/grammar',
  'backend/src/modules/questions',
  'backend/src/modules/practice',
  'backend/src/modules/tests',
  'backend/src/modules/exams',
  'backend/src/modules/analytics',
  'backend/src/modules/mistakes',
  'backend/src/modules/bookmarks',
  'backend/src/modules/achievements',
  'backend/src/modules/leaderboard',
  'backend/src/modules/adaptive-testing',
  'backend/src/modules/proctoring',
  'backend/src/modules/ai-tutor',
  'backend/src/modules/dictionary',
  'backend/src/modules/speaking-room',
  'backend/src/modules/grading',
  'backend/src/modules/notifications',
  'backend/src/modules/subscriptions',
  'backend/src/modules/payments',
  'backend/src/modules/blog',
  'backend/src/modules/media',
  'backend/src/modules/faq',
  'backend/src/realtime/websocket',
  'backend/src/realtime/signaling',
  'backend/src/jobs/review',
  'backend/src/jobs/notifications',
  'backend/src/jobs/analytics',
  'backend/src/jobs/subscriptions',
  'backend/src/types',
  'backend/src/constants',
  'backend/src/utils',
  'backend/src/tests/unit',
  'backend/src/tests/integration',
  'backend/src/tests/e2e',
];
for (const dir of backendKeepDirs) {
  writeKeep(dir);
}

console.log('--- Monorepo Structure Scaffolding Complete ---');
