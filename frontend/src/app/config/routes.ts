export const ROUTES = {
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
