const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const items = [
  // frontend public
  { p: 'frontend/public/favicon.ico', type: 'file' },
  { p: 'frontend/public/images', type: 'dir' },
  { p: 'frontend/public/icons', type: 'dir' },
  { p: 'frontend/public/audio', type: 'dir' },

  // frontend src app
  { p: 'frontend/src/app/router/index.tsx', type: 'file' },
  { p: 'frontend/src/app/router/public.routes.tsx', type: 'file' },
  { p: 'frontend/src/app/router/auth.routes.tsx', type: 'file' },
  { p: 'frontend/src/app/router/onboarding.routes.tsx', type: 'file' },
  { p: 'frontend/src/app/router/student.routes.tsx', type: 'file' },
  { p: 'frontend/src/app/router/teacher.routes.tsx', type: 'file' },
  { p: 'frontend/src/app/router/admin.routes.tsx', type: 'file' },

  { p: 'frontend/src/app/providers/QueryProvider.tsx', type: 'file' },
  { p: 'frontend/src/app/providers/RouterProvider.tsx', type: 'file' },
  { p: 'frontend/src/app/providers/AppProviders.tsx', type: 'file' },

  { p: 'frontend/src/app/guards/AuthGuard.tsx', type: 'file' },
  { p: 'frontend/src/app/guards/GuestGuard.tsx', type: 'file' },
  { p: 'frontend/src/app/guards/RoleGuard.tsx', type: 'file' },

  { p: 'frontend/src/app/config/env.ts', type: 'file' },
  { p: 'frontend/src/app/config/routes.ts', type: 'file' },
  { p: 'frontend/src/app/config/app.config.ts', type: 'file' },

  // frontend src layouts
  { p: 'frontend/src/layouts/guest', type: 'dir' },
  { p: 'frontend/src/layouts/auth', type: 'dir' },
  { p: 'frontend/src/layouts/onboarding', type: 'dir' },
  { p: 'frontend/src/layouts/student', type: 'dir' },
  { p: 'frontend/src/layouts/teacher', type: 'dir' },
  { p: 'frontend/src/layouts/admin', type: 'dir' },
  { p: 'frontend/src/layouts/focus/FocusLayout.tsx', type: 'file' },
  { p: 'frontend/src/layouts/focus/ExamFocusLayout.tsx', type: 'file' },
  { p: 'frontend/src/layouts/focus/PracticeFocusLayout.tsx', type: 'file' },

  // frontend src pages
  { p: 'frontend/src/pages/marketing/HomePage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/ToeicPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/VstepPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/CoursesPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/CourseDetailPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/PracticePage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/MockTestsPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/QuestionBankPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/LeaderboardPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/PricingPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/BlogPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/BlogDetailPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/BlogCategoryPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/FAQPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/AboutPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/ContactPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/marketing/HelpPage.tsx', type: 'file' },

  { p: 'frontend/src/pages/auth/LoginPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/auth/RegisterPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/auth/VerifyPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/auth/ForgotPasswordPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/auth/ResetPasswordPage.tsx', type: 'file' },

  { p: 'frontend/src/pages/onboarding/GoalPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/onboarding/TargetPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/onboarding/SchedulePage.tsx', type: 'file' },
  { p: 'frontend/src/pages/onboarding/SkillsPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/onboarding/PlacementTestPage.tsx', type: 'file' },
  { p: 'frontend/src/pages/onboarding/PlacementResultPage.tsx', type: 'file' },

  // frontend src features
  { p: 'frontend/src/features/marketing/api', type: 'dir' },
  { p: 'frontend/src/features/marketing/components', type: 'dir' },
  { p: 'frontend/src/features/marketing/hooks', type: 'dir' },
  { p: 'frontend/src/features/marketing/types', type: 'dir' },
  { p: 'frontend/src/features/marketing/utils', type: 'dir' },

  { p: 'frontend/src/features/auth/api', type: 'dir' },
  { p: 'frontend/src/features/auth/components', type: 'dir' },
  { p: 'frontend/src/features/auth/hooks', type: 'dir' },
  { p: 'frontend/src/features/auth/types', type: 'dir' },
  { p: 'frontend/src/features/auth/utils', type: 'dir' },

  { p: 'frontend/src/features/onboarding/api/onboardingApi.ts', type: 'file' },
  { p: 'frontend/src/features/onboarding/api/placementApi.ts', type: 'file' },
  { p: 'frontend/src/features/onboarding/components/GoalSelector.tsx', type: 'file' },
  { p: 'frontend/src/features/onboarding/components/TargetSelector.tsx', type: 'file' },
  { p: 'frontend/src/features/onboarding/components/ScheduleSelector.tsx', type: 'file' },
  { p: 'frontend/src/features/onboarding/components/PlacementFlow.tsx', type: 'file' },
  { p: 'frontend/src/features/onboarding/hooks/useOnboardingWizard.ts', type: 'file' },
  { p: 'frontend/src/features/onboarding/types', type: 'dir' },
  { p: 'frontend/src/features/onboarding/utils', type: 'dir' },

  // frontend src roles student
  { p: 'frontend/src/roles/student/pages', type: 'dir' },
  { p: 'frontend/src/roles/student/features/dashboard', type: 'dir' },
  { p: 'frontend/src/roles/student/features/learning-path', type: 'dir' },
  { p: 'frontend/src/roles/student/features/courses', type: 'dir' },
  { p: 'frontend/src/roles/student/features/vocabulary', type: 'dir' },
  { p: 'frontend/src/roles/student/features/grammar', type: 'dir' },
  { p: 'frontend/src/roles/student/features/listening', type: 'dir' },
  { p: 'frontend/src/roles/student/features/reading', type: 'dir' },
  { p: 'frontend/src/roles/student/features/speaking', type: 'dir' },
  { p: 'frontend/src/roles/student/features/writing', type: 'dir' },
  { p: 'frontend/src/roles/student/features/practice', type: 'dir' },
  { p: 'frontend/src/roles/student/features/mock-tests', type: 'dir' },
  { p: 'frontend/src/roles/student/features/mistakes', type: 'dir' },
  { p: 'frontend/src/roles/student/features/bookmarks', type: 'dir' },
  { p: 'frontend/src/roles/student/features/review', type: 'dir' },
  { p: 'frontend/src/roles/student/features/progress', type: 'dir' },
  { p: 'frontend/src/roles/student/features/achievements', type: 'dir' },
  { p: 'frontend/src/roles/student/features/leaderboard', type: 'dir' },
  { p: 'frontend/src/roles/student/api', type: 'dir' },
  { p: 'frontend/src/roles/student/hooks', type: 'dir' },
  { p: 'frontend/src/roles/student/components', type: 'dir' },
  { p: 'frontend/src/roles/student/types', type: 'dir' },

  // frontend src roles teacher
  { p: 'frontend/src/roles/teacher/pages', type: 'dir' },
  { p: 'frontend/src/roles/teacher/features/courses', type: 'dir' },
  { p: 'frontend/src/roles/teacher/features/lessons', type: 'dir' },
  { p: 'frontend/src/roles/teacher/features/grading', type: 'dir' },
  { p: 'frontend/src/roles/teacher/features/students', type: 'dir' },
  { p: 'frontend/src/roles/teacher/features/analytics', type: 'dir' },
  { p: 'frontend/src/roles/teacher/api', type: 'dir' },
  { p: 'frontend/src/roles/teacher/hooks', type: 'dir' },
  { p: 'frontend/src/roles/teacher/components', type: 'dir' },
  { p: 'frontend/src/roles/teacher/types', type: 'dir' },

  // frontend src roles admin
  { p: 'frontend/src/roles/admin/pages', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/users', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/roles', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/content', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/questions', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/tests', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/analytics', type: 'dir' },
  { p: 'frontend/src/roles/admin/features/system', type: 'dir' },
  { p: 'frontend/src/roles/admin/api', type: 'dir' },
  { p: 'frontend/src/roles/admin/hooks', type: 'dir' },
  { p: 'frontend/src/roles/admin/components', type: 'dir' },
  { p: 'frontend/src/roles/admin/types', type: 'dir' },

  // frontend src engines
  { p: 'frontend/src/engines/practice', type: 'dir' },
  { p: 'frontend/src/engines/exam', type: 'dir' },
  { p: 'frontend/src/engines/lesson', type: 'dir' },
  { p: 'frontend/src/engines/vocab-flashcard', type: 'dir' },
  { p: 'frontend/src/engines/crud-editor', type: 'dir' },

  // frontend src shared
  { p: 'frontend/src/shared/components/ui', type: 'dir' },
  { p: 'frontend/src/shared/components/forms', type: 'dir' },
  { p: 'frontend/src/shared/components/charts', type: 'dir' },
  { p: 'frontend/src/shared/components/feedback', type: 'dir' },
  { p: 'frontend/src/shared/components/media', type: 'dir' },
  { p: 'frontend/src/shared/hooks', type: 'dir' },
  { p: 'frontend/src/shared/services', type: 'dir' },
  { p: 'frontend/src/shared/stores', type: 'dir' },
  { p: 'frontend/src/shared/utils', type: 'dir' },
  { p: 'frontend/src/shared/constants', type: 'dir' },
  { p: 'frontend/src/shared/types', type: 'dir' },
  { p: 'frontend/src/shared/assets', type: 'dir' },

  // frontend tests
  { p: 'frontend/src/tests/unit', type: 'dir' },
  { p: 'frontend/src/tests/integration', type: 'dir' },
  { p: 'frontend/src/tests/e2e', type: 'dir' },

  // frontend configs
  { p: 'frontend/vite.config.ts', type: 'file' },
  { p: 'frontend/tsconfig.json', type: 'file' },
  { p: 'frontend/package.json', type: 'file' },

  // backend prisma
  { p: 'backend/prisma/schema.prisma', type: 'file' },
  { p: 'backend/prisma/migrations', type: 'dir' },
  { p: 'backend/prisma/seed/index.ts', type: 'file' },

  // backend src app
  { p: 'backend/src/app/app.ts', type: 'file' },
  { p: 'backend/src/app/server.ts', type: 'file' },
  { p: 'backend/src/app/routes.ts', type: 'file' },

  // backend src config
  { p: 'backend/src/config/env.ts', type: 'file' },
  { p: 'backend/src/config/database.ts', type: 'file' },
  { p: 'backend/src/config/cors.ts', type: 'file' },
  { p: 'backend/src/config/security.ts', type: 'file' },

  // backend src middleware
  { p: 'backend/src/middleware/auth.ts', type: 'file' },
  { p: 'backend/src/middleware/rbac.ts', type: 'file' },
  { p: 'backend/src/middleware/validation.ts', type: 'file' },
  { p: 'backend/src/middleware/rate-limit.ts', type: 'file' },
  { p: 'backend/src/middleware/error-handler.ts', type: 'file' },
  { p: 'backend/src/middleware/not-found.ts', type: 'file' },

  // backend modules
  { p: 'backend/src/modules/auth', type: 'dir' },
  { p: 'backend/src/modules/users', type: 'dir' },
  { p: 'backend/src/modules/onboarding', type: 'dir' },
  { p: 'backend/src/modules/placement', type: 'dir' },
  { p: 'backend/src/modules/learning-path', type: 'dir' },
  { p: 'backend/src/modules/courses', type: 'dir' },
  { p: 'backend/src/modules/lessons', type: 'dir' },
  { p: 'backend/src/modules/vocabulary', type: 'dir' },
  { p: 'backend/src/modules/grammar', type: 'dir' },
  { p: 'backend/src/modules/questions', type: 'dir' },
  { p: 'backend/src/modules/practice', type: 'dir' },
  { p: 'backend/src/modules/tests', type: 'dir' },
  { p: 'backend/src/modules/exams', type: 'dir' },
  { p: 'backend/src/modules/analytics', type: 'dir' },
  { p: 'backend/src/modules/mistakes', type: 'dir' },
  { p: 'backend/src/modules/bookmarks', type: 'dir' },
  { p: 'backend/src/modules/achievements', type: 'dir' },
  { p: 'backend/src/modules/leaderboard', type: 'dir' },
  { p: 'backend/src/modules/adaptive-testing', type: 'dir' },
  { p: 'backend/src/modules/proctoring', type: 'dir' },
  { p: 'backend/src/modules/ai-tutor', type: 'dir' },
  { p: 'backend/src/modules/dictionary', type: 'dir' },
  { p: 'backend/src/modules/speaking-room', type: 'dir' },
  { p: 'backend/src/modules/grading', type: 'dir' },
  { p: 'backend/src/modules/notifications', type: 'dir' },
  { p: 'backend/src/modules/subscriptions', type: 'dir' },
  { p: 'backend/src/modules/payments', type: 'dir' },
  { p: 'backend/src/modules/blog', type: 'dir' },
  { p: 'backend/src/modules/media', type: 'dir' },
  { p: 'backend/src/modules/faq', type: 'dir' },

  // backend realtime & jobs
  { p: 'backend/src/realtime/websocket', type: 'dir' },
  { p: 'backend/src/realtime/signaling', type: 'dir' },
  { p: 'backend/src/jobs/review', type: 'dir' },
  { p: 'backend/src/jobs/notifications', type: 'dir' },
  { p: 'backend/src/jobs/analytics', type: 'dir' },
  { p: 'backend/src/jobs/subscriptions', type: 'dir' },

  // backend lib, types, constants, utils, tests
  { p: 'backend/src/lib/prisma.ts', type: 'file' },
  { p: 'backend/src/lib/jwt.ts', type: 'file' },
  { p: 'backend/src/lib/password.ts', type: 'file' },
  { p: 'backend/src/lib/storage.ts', type: 'file' },
  { p: 'backend/src/lib/logger.ts', type: 'file' },
  { p: 'backend/src/types', type: 'dir' },
  { p: 'backend/src/constants', type: 'dir' },
  { p: 'backend/src/utils', type: 'dir' },
  { p: 'backend/src/tests/unit', type: 'dir' },
  { p: 'backend/src/tests/integration', type: 'dir' },
  { p: 'backend/src/tests/e2e', type: 'dir' },

  // backend configs
  { p: 'backend/tsconfig.json', type: 'file' },
  { p: 'backend/package.json', type: 'file' },

  // packages
  { p: 'packages/shared/src/types', type: 'dir' },
  { p: 'packages/shared/src/schemas', type: 'dir' },
  { p: 'packages/shared/src/logic', type: 'dir' },
  { p: 'packages/shared/src/constants', type: 'dir' },
  { p: 'packages/shared/package.json', type: 'file' },
  { p: 'packages/eslint-config', type: 'dir' },
  { p: 'packages/tsconfig', type: 'dir' },

  // docs
  { p: 'docs/architecture/overview.md', type: 'file' },
  { p: 'docs/architecture/frontend-architecture.md', type: 'file' },
  { p: 'docs/architecture/backend-architecture.md', type: 'file' },
  { p: 'docs/architecture/engine-architecture.md', type: 'file' },
  { p: 'docs/architecture/feature-status.md', type: 'file' },
  { p: 'docs/database', type: 'dir' },
  { p: 'docs/api', type: 'dir' },
  { p: 'docs/frontend', type: 'dir' },
  { p: 'docs/backend', type: 'dir' },
  { p: 'docs/deployment', type: 'dir' },

  // root & others
  { p: 'scripts', type: 'dir' },
  { p: 'infra', type: 'dir' },
  { p: '.github/workflows', type: 'dir' },
  { p: 'CLAUDE.md', type: 'file' },
  { p: 'ARCHITECTURE.md', type: 'file' },
  { p: 'README.md', type: 'file' },
  { p: '.env.example', type: 'file' },
  { p: '.gitignore', type: 'file' },
  { p: 'docker-compose.yml', type: 'file' },
  { p: 'package.json', type: 'file' },
  { p: 'pnpm-workspace.yaml', type: 'file' },
  { p: 'turbo.json', type: 'file' },
  { p: 'tsconfig.base.json', type: 'file' },
  { p: 'tsconfig.json', type: 'file' },
];

let allOk = true;
let createdCount = 0;

for (const item of items) {
  const fullPath = path.join(rootDir, item.p);
  if (!fs.existsSync(fullPath)) {
    allOk = false;
    if (item.type === 'dir') {
      fs.mkdirSync(fullPath, { recursive: true });
      fs.writeFileSync(path.join(fullPath, '.gitkeep'), '', 'utf8');
      console.log(`Missing created dir: ${item.p}`);
      createdCount++;
    } else {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, '', 'utf8');
      console.log(`Missing created file: ${item.p}`);
      createdCount++;
    }
  } else {
    // If it's a directory, ensure it has at least one file or .gitkeep
    if (item.type === 'dir') {
      const files = fs.readdirSync(fullPath);
      if (files.length === 0) {
        fs.writeFileSync(path.join(fullPath, '.gitkeep'), '', 'utf8');
      }
    }
  }
}

console.log('Verification done. Items checked: ' + items.length + '. Missing fixed: ' + createdCount + '.');
