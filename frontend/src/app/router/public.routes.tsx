import { RouteObject } from 'react-router-dom';
import { GuestLayout } from '../../layouts/guest/GuestLayout';
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
  {
    path: '/',
    element: <GuestLayout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'toeic', element: <ToeicPage /> },
      { path: 'vstep', element: <VstepPage /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'courses/:id', element: <CourseDetailPage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'mock-tests', element: <MockTestsPage /> },
      { path: 'question-bank', element: <QuestionBankPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'pricing', element: <PricingPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/category/:slug', element: <BlogCategoryPage /> },
      { path: 'blog/:slug', element: <BlogDetailPage /> },
      { path: 'faq', element: <FAQPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'help', element: <HelpPage /> },
    ],
  },
];
