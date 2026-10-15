import { z } from 'zod';

// ==========================================
// AUTH SCHEMAS
// ==========================================
export const RegisterSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

// ==========================================
// ONBOARDING SCHEMAS
// ==========================================
export const OnboardingGoalSchema = z.object({
  targetExam: z.enum(['TOEIC', 'VSTEP']),
  currentLevel: z.string().min(1, 'Vui lòng chọn trình độ hiện tại'),
  targetScore: z.number().optional(),
  targetLevel: z.string().optional(),
  targetDate: z.string().datetime().optional(),
  purpose: z.string().optional(),
});

export const OnboardingScheduleSchema = z.object({
  studyDaysPerWeek: z.number().int().min(1).max(7),
  minutesPerDay: z.number().int().min(15).max(300),
  preferredTimeSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING']).optional(),
});

// ==========================================
// EXAM SCHEMAS
// ==========================================
export const SaveExamAnswerSchema = z.object({
  questionId: z.string().uuid(),
  selectedKey: z.string().optional(),
  textAnswer: z.string().optional(),
  answeredAt: z.string().datetime(),
  isFlagged: z.boolean().optional(),
});

export const SubmitExamSchema = z.object({
  timeSpentSec: z.number().int().min(0),
  answers: z.record(
    z.string(),
    z.object({
      selectedKey: z.string().optional(),
      textAnswer: z.string().optional(),
      answeredAt: z.string().datetime().optional(),
      isFlagged: z.boolean().optional(),
    })
  ),
});

// ==========================================
// SRS REVIEW SCHEMAS
// ==========================================
export const SubmitSrsReviewSchema = z.object({
  quality: z.number().int().min(0).max(5), // 0: Forget completely, 5: Perfect recall
  timeSpentMs: z.number().int().min(0).optional(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type OnboardingGoalInput = z.infer<typeof OnboardingGoalSchema>;
export type OnboardingScheduleInput = z.infer<typeof OnboardingScheduleSchema>;
export type SaveExamAnswerInput = z.infer<typeof SaveExamAnswerSchema>;
export type SubmitExamInput = z.infer<typeof SubmitExamSchema>;
export type SubmitSrsReviewInput = z.infer<typeof SubmitSrsReviewSchema>;
