import { PrismaClient, Role, ExamType, SkillType, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- BẮT ĐẦU SEED DỮ LIỆU ORBILINGO ---');

  // 1. DỌN DẸP DỮ LIỆU CŨ (NẾU CÓ)
  await prisma.auditLog.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.classMember.deleteMany();
  await prisma.class.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.mistakeNotebook.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.mockTestQuestion.deleteMany();
  await prisma.mockTestSection.deleteMany();
  await prisma.mockTest.deleteMany();
  await prisma.question.deleteMany();
  await prisma.passage.deleteMany();
  await prisma.userVocabulary.deleteMany();
  await prisma.vocabularyReviewLog.deleteMany();
  await prisma.vocabularyEntry.deleteMany();
  await prisma.vocabularyTopic.deleteMany();
  await prisma.grammarLesson.deleteMany();
  await prisma.grammarTopic.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseSection.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.learningPathItem.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.learningSchedule.deleteMany();
  await prisma.learningGoal.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. SEED USERS (ADMIN, TEACHER, STUDENT)
  const defaultPasswordHash = await bcrypt.hash('OrbiLingo@2026', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@orbi.edu.vn',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: 'Hệ thống Quản trị Viên',
        },
      },
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@orbi.edu.vn',
      passwordHash: defaultPasswordHash,
      role: Role.TEACHER,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: 'ThS. Nguyễn Hoàng Nam',
        },
      },
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@orbi.edu.vn',
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      isEmailVerified: true,
      streakCount: 5,
      lastStudyAt: new Date(),
      profile: {
        create: {
          fullName: 'Lê Minh Anh',
        },
      },
      learningGoal: {
        create: {
          targetExam: ExamType.TOEIC,
          currentLevel: '450',
          targetScore: 750,
          purpose: 'Tốt nghiệp Đại học & Tuyển dụng',
        },
      },
      learningSchedule: {
        create: {
          studyDaysPerWeek: 5,
          minutesPerDay: 60,
          preferredTimeSlot: 'EVENING',
        },
      },
    },
  });

  console.log('✓ Đã tạo 3 tài khoản mặc định (mật khẩu: OrbiLingo@2026):');
  console.log('  - Admin: admin@orbi.edu.vn');
  console.log('  - Teacher: teacher@orbi.edu.vn');
  console.log('  - Student: student@orbi.edu.vn');

  // 3. SEED TỪ VỰNG & NGỮ PHÁP
  const businessTopic = await prisma.vocabularyTopic.create({
    data: {
      title: 'Business & Office Operations',
      examType: ExamType.TOEIC,
      level: '550+',
      description: 'Các từ vựng thường xuất hiện trong hợp đồng và trao đổi văn phòng',
      entries: {
        create: [
          {
            word: 'Negotiate',
            phonetic: '/nɪˈɡoʊ.ʃi.eɪt/',
            partOfSpeech: 'verb',
            definitionVi: 'Đàm phán, thương lượng hợp đồng',
            exampleEn: 'The manager is negotiating a long-term supply agreement.',
            exampleVi: 'Người quản lý đang đàm phán một thỏa thuận cung ứng dài hạn.',
          },
          {
            word: 'Accommodate',
            phonetic: '/əˈkɑː.mə.deɪt/',
            partOfSpeech: 'verb',
            definitionVi: 'Đáp ứng nhu cầu; cung cấp chỗ ở',
            exampleEn: 'The conference room can accommodate up to 80 attendees.',
            exampleVi: 'Phòng hội nghị có thể đáp ứng chỗ ngồi cho tối đa 80 người tham dự.',
          },
        ],
      },
    },
  });

  // Gán từ vựng cho student với lịch SRS
  const firstWord = await prisma.vocabularyEntry.findFirst({ where: { topicId: businessTopic.id } });
  if (firstWord) {
    await prisma.userVocabulary.create({
      data: {
        userId: student.id,
        vocabId: firstWord.id,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewAt: new Date(),
      },
    });
  }

  const grammarTopic = await prisma.grammarTopic.create({
    data: {
      title: 'Tenses in Business Context',
      category: 'Verb Tenses',
      level: 'A2-B1',
      description: 'Phân biệt Hiện tại hoàn thành, Quá khứ đơn và Tương lai đơn',
      lessons: {
        create: [
          {
            title: 'Present Perfect vs Past Simple',
            ruleContent: 'Dùng Quá khứ đơn khi có mốc thời gian xác định (yesterday, last year, in 2020). Dùng Hiện tại hoàn thành khi hành động bắt đầu ở quá khứ kéo dài đến hiện tại (since, for).',
            commonErrors: ['Nhầm lẫn giữa since (mốc thời gian) và for (khoảng thời gian)'],
            examples: [
              'Correct: We have expanded our market since 2022.',
              'Incorrect: We expanded our market since 2022.',
            ],
            orderIndex: 1,
          },
        ],
      },
    },
  });

  // 4. SEED NGÂN HÀNG CÂU HỎI & ĐỀ THI
  const passage = await prisma.passage.create({
    data: {
      examType: ExamType.TOEIC,
      partOrSkill: 'PART_7',
      title: 'Memo: Office Relocation Notice',
      content: 'To all staff:\nPlease be advised that our regional headquarters will relocate to the Greenfield Business Park effective November 1st. All computer hardware should be packed by Friday afternoon.',
    },
  });

  const q1 = await prisma.question.create({
    data: {
      examType: ExamType.TOEIC,
      type: QuestionType.SINGLE_CHOICE,
      skillType: SkillType.READING,
      partOrSkill: 'PART_5',
      level: '550+',
      stem: 'Ms. Jenkins was promoted because she has ______ completed all projects ahead of schedule.',
      options: [
        { key: 'A', text: 'consistently' },
        { key: 'B', text: 'consistent' },
        { key: 'C', text: 'consistency' },
        { key: 'D', text: 'consisting' },
      ],
      correctAnswer: { key: 'A' },
      explanation: 'Chỗ trống đứng giữa trợ động từ has và quá khứ phân từ completed, cần một trạng từ (Adverb) có đuôi -ly bổ nghĩa cho hành động hoàn thành.',
      difficulty: 2,
      tags: ['adverb', 'part_of_speech', 'verb_tense'],
    },
  });

  const q2 = await prisma.question.create({
    data: {
      examType: ExamType.TOEIC,
      type: QuestionType.SINGLE_CHOICE,
      skillType: SkillType.READING,
      partOrSkill: 'PART_7',
      level: '650+',
      passageId: passage.id,
      stem: 'What are employees requested to do by Friday afternoon?',
      options: [
        { key: 'A', text: 'Pack their computer hardware' },
        { key: 'B', text: 'Visit the new headquarters' },
        { key: 'C', text: 'Submit budget reports' },
        { key: 'D', text: 'Attend a relocation seminar' },
      ],
      correctAnswer: { key: 'A' },
      explanation: 'Dựa vào câu cuối của thông báo: "All computer hardware should be packed by Friday afternoon."',
      difficulty: 2,
      tags: ['part_7', 'memo_detail'],
    },
  });

  // Tạo Mock Test
  const mockTest = await prisma.mockTest.create({
    data: {
      title: 'ETS TOEIC Practice Test 01 (Mini Demo)',
      slug: 'ets-toeic-practice-test-01',
      examType: ExamType.TOEIC,
      targetLevel: '650+',
      durationMinutes: 30,
      totalQuestions: 2,
      isPublished: true,
      sections: {
        create: [
          {
            name: 'Reading Section (Part 5 & Part 7)',
            skillType: SkillType.READING,
            orderIndex: 1,
            questions: {
              create: [
                { questionId: q1.id, orderIndex: 1, points: 5.0 },
                { questionId: q2.id, orderIndex: 2, points: 5.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. SEED MISTAKE NOTEBOOK (DEMO VÒNG LẶP HỌC TẬP KHÉP KÍN)
  const mistake = await prisma.mistakeNotebook.create({
    data: {
      userId: student.id,
      questionId: q1.id,
      userWrongAnswer: 'B',
      mistakeCount: 1,
      sourceContext: 'MOCK_TEST',
      primaryCause: 'GRAMMAR_MISUNDERSTANDING',
      isResolved: false,
      reviewSchedule: {
        create: {
          userId: student.id,
          intervalDays: 1,
          nextReviewAt: new Date(),
        },
      },
    },
  });

  // 6. SEED KHÓA HỌC & BÀI HỌC
  await prisma.course.create({
    data: {
      title: 'Chinh phục TOEIC 650+ Toàn diện',
      slug: 'chinh-phuc-toeic-650-toan-dien',
      examType: ExamType.TOEIC,
      targetLevel: '650+',
      description: 'Lộ trình tối ưu ngữ pháp, từ vựng và chiến thuật giải đề TOEIC 7 phần',
      isPublished: true,
      sections: {
        create: [
          {
            title: 'Chương 1: Chiến thuật Part 5 & Ngữ pháp trọng tâm',
            orderIndex: 1,
            lessons: {
              create: [
                {
                  title: 'Bài 1: Phân biệt các thì quá khứ và hoàn thành',
                  skillType: SkillType.READING,
                  contentMd: '# Ngữ pháp trọng tâm Part 5\n\nNắm vững quy tắc phối hợp thì trong câu ghép.',
                  durationMins: 20,
                  orderIndex: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✓ Đã tạo Khóa học, Ngân hàng câu hỏi, Đề thi mẫu và Lỗi sai mẫu.');
  console.log('--- SEED DỮ LIỆU THÀNH CÔNG 100% ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
