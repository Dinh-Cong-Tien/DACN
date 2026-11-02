"""Sinh backend/prisma/schema.prisma từ đặc tả rút gọn (mục X kế hoạch – 59 bảng).

Cú pháp mỗi dòng cột:
  tên Kiểu [modifier…]                 → cột thường, tự thêm @map("snake_case")
  tên -> Model Hành_động [?] [uq]      → khoá ngoại UUID + field quan hệ + quan hệ ngược ở Model đích
       (tên kết thúc bằng Id; '?' = cho phép NULL; 'uq' = quan hệ 1-1)
  @@...                                → thuộc tính cấp model (giữ nguyên)
Bảng có cờ:  soft  → deleted_at;  log → chỉ created_at;  join → không id/created/updated.
Chạy:  python -I gen_schema.py
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'schema.prisma')

def snake(s: str) -> str:
    return re.sub(r'(?<!^)(?=[A-Z])', '_', s).lower()

HEADER = '''// ⚠️ File sinh tự động từ prisma/schema-src/gen_schema.py — sửa ở đó rồi chạy lại.
// Đặc tả: KE_HOACH_TRIEN_KHAI_DU_AN.md mục X (18 phân hệ · 59 bảng).
// Ràng buộc Prisma không biểu diễn được (partial unique, CHECK, GIN trgm, EXCLUDE, view)
// nằm trong migration SQL thủ công: prisma/migrations/*_constraints_indexes_views.

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, pg_trgm, citext, unaccent, btree_gist]
}
'''

ENUMS = {
    'UserRole': 'STUDENT TEACHER HEAD_TEACHER ADMIN',
    'UserStatus': 'PENDING ACTIVE LOCKED',
    'TokenType': 'REFRESH EMAIL_VERIFY PASSWORD_RESET EMAIL_CHANGE',
    'ExamType': 'TOEIC VSTEP',
    'SkillType': 'LISTENING READING WRITING SPEAKING VOCABULARY GRAMMAR',
    'ExamPart': 'TOEIC_P1 TOEIC_P2 TOEIC_P3 TOEIC_P4 TOEIC_P5 TOEIC_P6 TOEIC_P7 VSTEP_L1 VSTEP_L2 VSTEP_L3 VSTEP_R1 VSTEP_R2 VSTEP_R3 VSTEP_R4 VSTEP_W1 VSTEP_W2 VSTEP_S1 VSTEP_S2 VSTEP_S3',
    'CefrLevel': 'A1 A2 B1 B2 C1 C2',
    'ContentStatus': 'DRAFT PENDING_REVIEW PUBLISHED REJECTED ARCHIVED',
    'QuestionType': 'SINGLE_CHOICE MULTIPLE_CHOICE TRUE_FALSE_NOT_GIVEN FILL_IN_BLANK MATCHING ESSAY SPEAKING_RESPONSE',
    'CourseCategory': 'FOUNDATION GRAMMAR VOCABULARY SKILL EXAM_PREP',
    'LessonType': 'VIDEO READING QUIZ CHECKPOINT',
    'ProgressStatus': 'LOCKED AVAILABLE IN_PROGRESS COMPLETED',
    'TestKind': 'FULL MINI PLACEMENT DIAGNOSTIC QUIZ CHECKPOINT',
    'AttemptMode': 'FULL PRACTICE ADAPTIVE DRILL PART_SESSION LESSON_QUIZ DICTATION',
    'AttemptStatus': 'IN_PROGRESS SUBMITTED GRADING COMPLETED ABANDONED EXPIRED',
    'MistakeCause': 'GRAMMAR VOCABULARY LISTENING READING TIME_PRESSURE CARELESS UNCLASSIFIED',
    'SrsStatus': 'NEW LEARNING REVIEWING MASTERED SUSPENDED',
    'PathItemType': 'LESSON PRACTICE MOCK_TEST REVIEW VOCAB GRAMMAR',
    'AssignmentType': 'MOCK_TEST PRACTICE LESSON GRAMMAR VOCAB ESSAY SPEAKING',
    'SubmissionStatus': 'TODO SUBMITTED LATE GRADED MISSED',
    'GraderType': 'AI TEACHER',
    'ReviewResult': 'PENDING AGREED ADJUSTED',
    'NotificationType': 'REVIEW ASSIGNMENT ACHIEVEMENT SYSTEM CLASS PAYMENT',
    'SubscriptionStatus': 'PENDING ACTIVE EXPIRED CANCELLED',
    'PaymentMethod': 'MOMO VNPAY CARD BANK',
    'PaymentStatus': 'PENDING PAID FAILED REFUNDED',
    'TicketCategory': 'ACCOUNT PAYMENT EXAM CONTENT ACADEMIC OTHER',
    'TicketStatus': 'OPEN IN_REVIEW PENDING RESOLVED REJECTED',
    'AiMode': 'COPILOT ROLEPLAY SPEAKING_PARTNER',
}
ENUM_DB = {k: snake(k) for k in ENUMS}  # tên type trong PG: user_role, exam_part…

# (Model, bảng, cờ, [cột])
T = []
def table(model, name, flags='', cols=''):
    T.append((model, name, flags.split(), [c.strip() for c in cols.strip().splitlines() if c.strip() and not c.strip().startswith('#')]))

# ---------- 1. Định danh & phân quyền ----------
table('User', 'users', 'soft', '''
email String @db.Citext
passwordHash String? @db.VarChar(255)
googleId String? @unique @db.VarChar(64)
facebookId String? @unique @db.VarChar(64)
role UserRole @default(STUDENT)
status UserStatus @default(PENDING)
emailVerifiedAt DateTime? @db.Timestamptz(6)
lockedReason String?
fullName String @db.VarChar(120)
avatarUrl String?
phone String? @db.VarChar(20)
dateOfBirth DateTime? @db.Date
gender String? @db.VarChar(10)
organization String? @db.VarChar(160)
city String? @db.VarChar(80)
bio String?
departmentId -> Department SetNull ?
xpTotal Int @default(0)
streakCurrent Int @default(0)
streakLongest Int @default(0)
streakFreezes Int @default(0) @db.SmallInt
lastStudyDate DateTime? @db.Date
lastActiveAt DateTime? @db.Timestamptz(6)
settings Json @default("{}")
@@index([role])
@@index([lastActiveAt])
''')
table('UserToken', 'user_tokens', 'log', '''
userId -> User Cascade
type TokenType
tokenHash String @unique @db.Char(64)
familyId String? @db.Uuid
userAgent String?
ipAddress String? @db.Inet
expiresAt DateTime @db.Timestamptz(6)
usedAt DateTime? @db.Timestamptz(6)
revokedAt DateTime? @db.Timestamptz(6)
@@index([userId])
@@index([familyId])
''')
table('RolePermission', 'role_permissions', 'join', '''
role UserRole
permissionCode String @db.VarChar(80)
grantedById -> User SetNull ?
createdAt DateTime @default(now()) @db.Timestamptz(6)
@@id([role, permissionCode])
''')
table('AuditLog', 'audit_logs', 'log', '''
actorId -> User SetNull ?
actorRole UserRole?
action String @db.VarChar(80)
resourceType String @db.VarChar(40)
resourceId String? @db.Uuid
severity String @default("INFO") @db.VarChar(8)
ipAddress String? @db.Inet
beforeData Json?
afterData Json?
@@index([actorId])
@@index([action, createdAt])
''')

# ---------- 2. Tổ chức bộ môn ----------
table('Department', 'departments', 'soft', '''
code String @unique @db.VarChar(20)
name String @db.VarChar(120)
examType ExamType
headId -> User SetNull ?
description String?
''')

# ---------- 3. Mục tiêu, năng lực & lộ trình ----------
table('LearningGoal', 'learning_goals', '', '''
userId -> User Cascade
examType ExamType
currentLevel String? @db.VarChar(20)
targetScore Int? @db.SmallInt
targetLevel CefrLevel?
targetDate DateTime? @db.Date
purpose String? @db.VarChar(20)
studyDays Int[] @db.SmallInt
minutesPerDay Int @default(60) @db.SmallInt
preferredSlot String? @db.VarChar(10)
isActive Boolean @default(true)
@@index([userId])
''')
table('UserAbility', 'user_abilities', '', '''
userId -> User Cascade
examType ExamType
skill SkillType
tagId -> SkillTag Cascade ?
theta Decimal? @db.Decimal(5, 3)
thetaSe Decimal? @db.Decimal(5, 3)
estimatedScore Int? @db.SmallInt
correctCount Int @default(0)
totalCount Int @default(0)
mastery Decimal @default(0) @db.Decimal(4, 3)
lastPracticedAt DateTime? @db.Timestamptz(6)
@@index([userId, mastery])
''')
table('LearningPath', 'learning_paths', '', '''
userId -> User Cascade
goalId -> LearningGoal SetNull ?
examType ExamType
generatedBy String @default("ALGORITHM") @db.VarChar(10)
version Int @default(1) @db.SmallInt
isActive Boolean @default(true)
progressPct Decimal @default(0) @db.Decimal(5, 2)
milestones Json
@@index([userId])
''')
table('LearningPathItem', 'learning_path_items', '', '''
pathId -> LearningPath Cascade
phase Int @db.SmallInt
title String @db.VarChar(160)
itemType PathItemType
refId String? @db.Uuid
refConfig Json?
skill SkillType?
durationMin Int @db.SmallInt
orderIndex Int @db.SmallInt
status ProgressStatus @default(LOCKED)
completedAt DateTime? @db.Timestamptz(6)
@@unique([pathId, phase, orderIndex])
''')

# ---------- 4. Media ----------
table('MediaFile', 'media_files', 'soft', '''
ownerId -> User SetNull ?
storageKey String @unique
url String
mimeType String @db.VarChar(100)
sizeBytes BigInt
durationSec Decimal? @db.Decimal(8, 2)
checksumSha256 String? @db.Char(64)
purpose String @db.VarChar(20)
isPrivate Boolean @default(false)
@@index([ownerId])
@@index([checksumSha256])
''')

# ---------- 5. Khoá học & bài học ----------
table('Course', 'courses', 'soft', '''
slug String @db.VarChar(140)
title String @db.VarChar(200)
category CourseCategory
examType ExamType?
level CefrLevel?
description String
coverUrl String?
themeGradient String? @db.VarChar(80)
isSequential Boolean @default(true)
isFree Boolean @default(false)
authorId -> User SetNull ?
departmentId -> Department SetNull ?
status ContentStatus @default(DRAFT)
reviewedById -> User SetNull ?
reviewNote String?
lessonsCount Int @default(0) @db.SmallInt
durationMin Int @default(0)
studentsCount Int @default(0)
ratingAvg Decimal @default(0) @db.Decimal(3, 2)
ratingCount Int @default(0)
publishedAt DateTime? @db.Timestamptz(6)
@@index([category])
@@index([status])
''')
table('CourseSection', 'course_sections', '', '''
courseId -> Course Cascade
partNo Int @default(1) @db.SmallInt
partTitle String? @db.VarChar(120)
title String @db.VarChar(200)
orderIndex Int @db.SmallInt
@@unique([courseId, orderIndex])
''')
table('Lesson', 'lessons', 'soft', '''
sectionId -> CourseSection Cascade
title String @db.VarChar(200)
type LessonType
summary String? @db.VarChar(300)
contentMd String?
skill SkillType?
videoUrl String?
audioUrl String?
transcript Json?
quizTestId -> MockTest Restrict ?
passScorePct Int? @db.SmallInt
durationMin Int @default(10) @db.SmallInt
isFreePreview Boolean @default(false)
orderIndex Int @db.SmallInt
status ContentStatus @default(DRAFT)
reviewedById -> User SetNull ?
reviewNote String?
@@unique([sectionId, orderIndex])
''')
table('CourseEnrollment', 'course_enrollments', '', '''
userId -> User Cascade
courseId -> Course Cascade
source String @default("SELF") @db.VarChar(10)
progressPct Decimal @default(0) @db.Decimal(5, 2)
currentLessonId -> Lesson SetNull ?
completedAt DateTime? @db.Timestamptz(6)
rating Int? @db.SmallInt
review String?
@@unique([userId, courseId])
''')
table('LessonProgress', 'lesson_progress', '', '''
userId -> User Cascade
lessonId -> Lesson Cascade
status ProgressStatus @default(AVAILABLE)
lastPositionSec Int @default(0)
timeSpentSec Int @default(0)
bestScorePct Int? @db.SmallInt
completedAt DateTime? @db.Timestamptz(6)
@@unique([userId, lessonId])
@@index([userId, status])
''')
table('Bookmark', 'bookmarks', '', '''
userId -> User Cascade
targetType String @db.VarChar(16)
targetId String @db.Uuid
note String?
@@unique([userId, targetType, targetId])
''')

# ---------- 6. Từ vựng & ngữ pháp ----------
table('VocabTopic', 'vocab_topics', 'soft', '''
slug String @unique @db.VarChar(120)
name String @db.VarChar(120)
icon String? @db.VarChar(40)
themeGradient String? @db.VarChar(80)
examType ExamType?
level CefrLevel?
isFree Boolean @default(true)
wordsCount Int @default(0) @db.SmallInt
orderIndex Int @default(0) @db.SmallInt
''')
table('Word', 'words', '', '''
topicId -> VocabTopic SetNull ?
headword String @db.VarChar(80)
pos String @db.VarChar(12)
ipaUk String? @db.VarChar(80)
ipaUs String? @db.VarChar(80)
meaningVi String
meaningEn String?
exampleEn String?
exampleVi String?
audioUrl String?
imageUrl String?
level CefrLevel?
orderInTopic Int? @db.SmallInt
@@index([topicId])
''')
table('GrammarTopic', 'grammar_topics', 'soft', '''
slug String @unique @db.VarChar(120)
title String @db.VarChar(160)
category String @db.VarChar(40)
level CefrLevel?
summary String
rules Json
tagId -> SkillTag SetNull ?
orderIndex Int @default(0) @db.SmallInt
status ContentStatus @default(DRAFT)
''')

# ---------- 7. Ngân hàng câu hỏi & IRT ----------
table('SkillTag', 'skill_tags', '', '''
parentId -> SkillTag SetNull ?
slug String @unique @db.VarChar(120)
name String @db.VarChar(160)
skill SkillType
examType ExamType?
questionsCount Int @default(0)
@@index([parentId])
''')
table('Passage', 'passages', 'soft', '''
purpose String @default("EXAM") @db.VarChar(10)
examType ExamType?
part ExamPart?
title String? @db.VarChar(200)
contentMd String?
transcript String?
segments Json?
audioUrl String?
imageUrl String?
level CefrLevel?
sourceLessonId -> Lesson SetNull ?
isFree Boolean @default(true)
status ContentStatus @default(DRAFT)
authorId -> User SetNull ?
reviewedById -> User SetNull ?
reviewNote String?
@@index([part])
''')
table('Question', 'questions', 'soft', '''
passageId -> Passage SetNull ?
orderInPassage Int? @db.SmallInt
examType ExamType
part ExamPart
skill SkillType
type QuestionType @default(SINGLE_CHOICE)
level CefrLevel?
tagIds String[] @default([]) @db.Uuid
stem String
options Json?
correctAnswer Json?
explanationMd String?
translationVi String?
audioUrl String?
imageUrl String?
taskConfig Json?
rubricId -> Rubric SetNull ?
irtA Decimal @default(1) @db.Decimal(5, 3)
irtB Decimal @default(0) @db.Decimal(5, 3)
calibratedN Int @default(0)
exposureCount Int @default(0)
correctRate Decimal? @db.Decimal(4, 3)
version Int @default(1) @db.SmallInt
source String @default("ORIGINAL") @db.VarChar(10)
status ContentStatus @default(DRAFT)
authorId -> User SetNull ?
reviewedById -> User SetNull ?
reviewNote String?
@@index([examType, part, status])
@@index([irtB])
''')
table('QuestionVersion', 'question_versions', 'log', '''
questionId -> Question Cascade
version Int @db.SmallInt
snapshot Json
changedById -> User SetNull ?
@@unique([questionId, version])
''')
table('Rubric', 'rubrics', '', '''
code String @unique @db.VarChar(40)
name String @db.VarChar(160)
examType ExamType
skill SkillType
scaleMax Decimal @default(10) @db.Decimal(4, 1)
criteria Json
''')

# ---------- 8. Đề thi & phòng thi ----------
table('MockTest', 'mock_tests', 'soft', '''
slug String @unique @db.VarChar(140)
title String @db.VarChar(200)
examType ExamType
kind TestKind @default(FULL)
level String? @db.VarChar(20)
year Int? @db.SmallInt
durationMin Int @db.SmallInt
totalQuestions Int @db.SmallInt
sections Json
scoreTable Json?
isFree Boolean @default(true)
isAdaptive Boolean @default(false)
tags String[] @default([])
coverUrl String?
version Int @default(1) @db.SmallInt
status ContentStatus @default(DRAFT)
authorId -> User SetNull ?
reviewedById -> User SetNull ?
reviewNote String?
attemptsCount Int @default(0)
''')
table('MockTestQuestion', 'mock_test_questions', 'join', '''
testId -> MockTest Cascade
questionId -> Question Restrict
part ExamPart
questionNo Int @db.SmallInt
points Decimal @default(1) @db.Decimal(4, 2)
@@id([testId, questionId])
@@unique([testId, questionNo])
@@index([questionId])
''')
table('ExamAttempt', 'exam_attempts', '', '''
userId -> User Cascade
testId -> MockTest Restrict ?
testVersion Int? @db.SmallInt
passageId -> Passage Restrict ?
lessonId -> Lesson SetNull ?
assignmentId -> Assignment SetNull ?
mode AttemptMode
purpose String @default("SELF") @db.VarChar(12)
selectedParts ExamPart[] @default([])
timeLimitSec Int?
status AttemptStatus @default(IN_PROGRESS)
questionOrder Json @default("[]")
catState Json?
startedAt DateTime @default(now()) @db.Timestamptz(6)
lastSavedAt DateTime? @db.Timestamptz(6)
submittedAt DateTime? @db.Timestamptz(6)
timeSpentSec Int @default(0)
correctCount Int? @db.SmallInt
totalCount Int @default(0) @db.SmallInt
scoreTotal Decimal? @db.Decimal(6, 1)
scoreListening Decimal? @db.Decimal(5, 1)
scoreReading Decimal? @db.Decimal(5, 1)
scoreWriting Decimal? @db.Decimal(4, 1)
scoreSpeaking Decimal? @db.Decimal(4, 1)
cefrResult CefrLevel?
theta Decimal? @db.Decimal(5, 3)
partResults Json?
resultDetail Json?
clientInfo Json?
@@index([userId, createdAt(sort: Desc)])
@@index([status])
''')
table('AttemptAnswer', 'attempt_answers', 'log', '''
attemptId -> ExamAttempt Cascade
questionId -> Question Restrict
questionVersion Int @db.SmallInt
orderIndex Int @db.SmallInt
selected Json?
textAnswer String?
audioUrl String?
isCorrect Boolean?
score Decimal? @db.Decimal(5, 2)
timeSpentMs Int @default(0)
isFlagged Boolean @default(false)
answeredAt DateTime? @db.Timestamptz(6)
@@unique([attemptId, questionId])
@@index([questionId])
''')

# ---------- 9. Chấm tự luận & kiểm định ----------
table('Grading', 'gradings', '', '''
answerId -> AttemptAnswer Cascade ?
submissionId -> AssignmentSubmission Cascade ?
graderType GraderType
graderId -> User SetNull ?
rubricId -> Rubric Restrict
criteriaScores Json
totalScore Decimal @db.Decimal(4, 1)
feedback String?
inlineComments Json?
voiceNoteUrl String?
isFinal Boolean @default(false)
gradedAt DateTime @default(now()) @db.Timestamptz(6)
reviewStatus ReviewResult?
reviewerId -> User SetNull ?
reviewScores Json?
reviewTotal Decimal? @db.Decimal(4, 1)
reviewNote String?
reviewedAt DateTime? @db.Timestamptz(6)
@@index([reviewStatus])
''')

# ---------- 10. Lỗi sai & SRS ----------
table('MistakeEntry', 'mistake_entries', '', '''
userId -> User Cascade
questionId -> Question Restrict
lastWrongAnswer Json
wrongCount Int @default(1) @db.SmallInt
source String @db.VarChar(12)
lastAttemptId -> ExamAttempt SetNull ?
cause MistakeCause @default(UNCLASSIFIED)
causeSource String @default("RULE") @db.VarChar(5)
tagId -> SkillTag SetNull ?
note String?
isResolved Boolean @default(false)
firstWrongAt DateTime @db.Timestamptz(6)
lastWrongAt DateTime @db.Timestamptz(6)
resolvedAt DateTime? @db.Timestamptz(6)
@@unique([userId, questionId])
@@index([userId, isResolved, cause])
''')
table('SrsCard', 'srs_cards', '', '''
userId -> User Cascade
wordId -> Word Cascade ?
mistakeId -> MistakeEntry Cascade ?
status SrsStatus @default(NEW)
easeFactor Decimal @default(2.5) @db.Decimal(4, 2)
intervalDays Int @default(0)
repetitions Int @default(0) @db.SmallInt
lapses Int @default(0) @db.SmallInt
nextReviewAt DateTime @default(now()) @db.Timestamptz(6)
lastReviewedAt DateTime? @db.Timestamptz(6)
@@unique([userId, wordId])
@@unique([userId, mistakeId])
''')
table('SrsReviewLog', 'srs_review_logs', 'log', '''
cardId -> SrsCard Cascade
userId -> User Cascade
quality Int @db.SmallInt
prevInterval Int
newInterval Int
newEase Decimal @db.Decimal(4, 2)
responseMs Int?
@@index([cardId])
@@index([userId, createdAt])
''')

# ---------- 11. Phát âm & AI ----------
table('SpeakingMaterial', 'speaking_materials', 'soft', '''
kind String @db.VarChar(14)
title String @db.VarChar(160)
examType ExamType?
level CefrLevel?
data Json
isVip Boolean @default(false)
status ContentStatus @default(DRAFT)
@@index([kind])
''')
table('SpeakingRecording', 'speaking_recordings', '', '''
userId -> User Cascade
sourceType String @db.VarChar(14)
sourceId String? @db.Uuid
referenceText String?
audioUrl String
asrText String?
scoreOverall Int? @db.SmallInt
scoreAccuracy Int? @db.SmallInt
scoreFluency Int? @db.SmallInt
scoreProsody Int? @db.SmallInt
phonemeResult Json?
pitchContour Json?
@@index([userId])
''')
table('AiConversation', 'ai_conversations', '', '''
userId -> User Cascade
mode AiMode
materialId -> SpeakingMaterial SetNull ?
contextType String? @db.VarChar(10)
contextId String? @db.Uuid
title String? @db.VarChar(200)
tokensIn Int @default(0)
tokensOut Int @default(0)
report Json?
endedAt DateTime? @db.Timestamptz(6)
@@index([userId, createdAt])
''')
table('AiMessage', 'ai_messages', 'log', '''
conversationId -> AiConversation Cascade
role String @db.VarChar(10)
content String
audioUrl String?
model String? @db.VarChar(60)
tokensIn Int?
tokensOut Int?
latencyMs Int?
@@index([conversationId])
''')

# ---------- 12. Lớp học & giảng dạy ----------
table('Class', 'classes', 'soft', '''
departmentId -> Department SetNull ?
teacherId -> User Restrict
name String @db.VarChar(160)
code String @unique @db.VarChar(16)
examType ExamType
level String? @db.VarChar(20)
description String?
room String? @db.VarChar(80)
scheduleText String? @db.VarChar(120)
coverUrl String?
startDate DateTime? @db.Date
endDate DateTime? @db.Date
maxStudents Int? @db.SmallInt
isArchived Boolean @default(false)
@@index([departmentId])
@@index([teacherId])
''')
table('ClassMember', 'class_members', '', '''
classId -> Class Cascade
studentId -> User Cascade
status String @default("ACTIVE") @db.VarChar(8)
riskLevel String @default("GOOD") @db.VarChar(8)
joinedAt DateTime @default(now()) @db.Timestamptz(6)
@@unique([classId, studentId])
@@index([studentId])
''')
table('ClassSession', 'class_sessions', '', '''
classId -> Class Cascade
teacherId -> User SetNull ?
sessionDate DateTime @db.Date
startTime DateTime @db.Time(6)
endTime DateTime @db.Time(6)
room String? @db.VarChar(80)
topic String? @db.VarChar(200)
status String @default("UPCOMING") @db.VarChar(10)
note String?
attendance Json?
observerId -> User SetNull ?
observation Json?
@@index([classId, sessionDate])
@@index([observerId])
''')
table('ClassAnnouncement', 'class_announcements', 'soft', '''
classId -> Class Cascade
authorId -> User SetNull ?
title String @db.VarChar(200)
body String
isPinned Boolean @default(false)
readCount Int @default(0)
@@index([classId])
''')
table('Material', 'materials', 'soft', '''
classId -> Class Cascade ?
uploadedById -> User SetNull ?
title String @db.VarChar(200)
description String?
type String @db.VarChar(6)
category String? @db.VarChar(60)
fileUrl String?
sizeBytes BigInt?
pages Int? @db.SmallInt
downloadsCount Int @default(0)
isVip Boolean @default(false)
@@index([classId])
''')
table('Assignment', 'assignments', 'soft', '''
classId -> Class Cascade
createdById -> User SetNull ?
title String @db.VarChar(200)
type AssignmentType
targetId String? @db.Uuid
targetConfig Json
note String?
openAt DateTime? @db.Timestamptz(6)
dueAt DateTime? @db.Timestamptz(6)
allowLate Boolean @default(true)
maxScore Decimal @default(10) @db.Decimal(5, 1)
status String @default("DRAFT") @db.VarChar(6)
@@index([classId])
@@index([dueAt])
''')
table('AssignmentSubmission', 'assignment_submissions', '', '''
assignmentId -> Assignment Cascade
studentId -> User Cascade
status SubmissionStatus @default(TODO)
attemptId -> ExamAttempt SetNull ?
content String?
audioUrl String?
submittedAt DateTime? @db.Timestamptz(6)
score Decimal? @db.Decimal(5, 1)
feedback String?
gradedAt DateTime? @db.Timestamptz(6)
@@unique([assignmentId, studentId])
@@index([studentId, status])
''')
table('StudentNote', 'student_notes', 'soft', '''
teacherId -> User Cascade
studentId -> User Cascade
classId -> Class SetNull ?
kind String @db.VarChar(8)
content String
noteDate DateTime @db.Date
@@index([studentId])
''')

# ---------- 13. Động lực & chứng chỉ ----------
table('DailyActivity', 'daily_activities', 'join', '''
userId -> User Cascade
activityDate DateTime @db.Date
minutes Int @default(0) @db.SmallInt
questionsAnswered Int @default(0) @db.SmallInt
lessonsCompleted Int @default(0) @db.SmallInt
cardsReviewed Int @default(0) @db.SmallInt
xp Int @default(0)
goalMet Boolean @default(false)
aiUsage Json @default("{}")
createdAt DateTime @default(now()) @db.Timestamptz(6)
updatedAt DateTime @updatedAt @db.Timestamptz(6)
@@id([userId, activityDate])
@@index([activityDate])
''')
table('UserAchievement', 'user_achievements', 'join', '''
userId -> User Cascade
achievementCode String @db.VarChar(40)
progress Int @default(0)
earnedAt DateTime? @db.Timestamptz(6)
createdAt DateTime @default(now()) @db.Timestamptz(6)
updatedAt DateTime @updatedAt @db.Timestamptz(6)
@@id([userId, achievementCode])
''')
table('Certificate', 'certificates', '', '''
userId -> User Cascade
type String @db.VarChar(20)
courseId -> Course SetNull ?
attemptId -> ExamAttempt SetNull ?
serialNo String @unique @db.VarChar(30)
verifyToken String @unique @db.Char(32)
scoreText String? @db.VarChar(40)
pdfUrl String?
issuedAt DateTime @default(now()) @db.Timestamptz(6)
revokedAt DateTime? @db.Timestamptz(6)
@@index([userId])
''')

# ---------- 14. Thông báo ----------
table('Notification', 'notifications', '', '''
userId -> User Cascade
type NotificationType
title String @db.VarChar(200)
message String
link String?
refType String? @db.VarChar(20)
refId String? @db.Uuid
readAt DateTime? @db.Timestamptz(6)
@@index([userId, createdAt(sort: Desc)])
''')
table('Broadcast', 'broadcasts', '', '''
title String @db.VarChar(200)
body String
audience String @db.VarChar(12)
channels String[]
status String @default("DRAFT") @db.VarChar(10)
scheduledAt DateTime? @db.Timestamptz(6)
sentAt DateTime? @db.Timestamptz(6)
createdById -> User SetNull ?
reachCount Int @default(0)
openCount Int @default(0)
''')

# ---------- 15. Gói & thanh toán ----------
table('SubscriptionPlan', 'subscription_plans', '', '''
code String @unique @db.VarChar(30)
name String @db.VarChar(80)
description String?
price BigInt
compareAtPrice BigInt?
durationDays Int? @db.SmallInt
examScope ExamType?
entitlements Json
featuresDisplay Json
badge String? @db.VarChar(30)
isHighlighted Boolean @default(false)
isActive Boolean @default(true)
orderIndex Int @default(0) @db.SmallInt
''')
table('UserSubscription', 'user_subscriptions', '', '''
userId -> User Cascade
planId -> SubscriptionPlan Restrict
status SubscriptionStatus @default(PENDING)
startsAt DateTime? @db.Timestamptz(6)
endsAt DateTime? @db.Timestamptz(6)
paymentId -> PaymentTransaction SetNull ?
grantedById -> User SetNull ?
cancelledAt DateTime? @db.Timestamptz(6)
@@index([userId])
@@index([endsAt])
''')
table('Coupon', 'coupons', '', '''
code String @unique @db.VarChar(30)
discountType String @db.VarChar(7)
discountValue BigInt
planIds String[] @db.Uuid
maxRedemptions Int?
redeemedCount Int @default(0)
validFrom DateTime? @db.Timestamptz(6)
validTo DateTime? @db.Timestamptz(6)
isActive Boolean @default(true)
''')
table('PaymentTransaction', 'payment_transactions', '', '''
userId -> User Restrict
planId -> SubscriptionPlan Restrict
couponId -> Coupon SetNull ?
orderCode String @unique @db.VarChar(40)
method PaymentMethod
amount BigInt
discountAmount BigInt @default(0)
status PaymentStatus @default(PENDING)
providerTxnId String? @unique @db.VarChar(100)
ipnLogs Json @default("[]")
ipAddress String? @db.Inet
paidAt DateTime? @db.Timestamptz(6)
refundedAt DateTime? @db.Timestamptz(6)
refundReason String?
@@index([userId])
@@index([status, createdAt])
''')

# ---------- 16. Hỗ trợ & khiếu nại ----------
table('Ticket', 'tickets', '', '''
userId -> User SetNull ?
guestName String? @db.VarChar(120)
guestEmail String? @db.Citext
channel String @db.VarChar(6)
category TicketCategory @default(OTHER)
academicIssue String? @db.VarChar(12)
questionId -> Question SetNull ?
attemptId -> ExamAttempt SetNull ?
submissionId -> AssignmentSubmission SetNull ?
subject String @db.VarChar(200)
status TicketStatus @default(OPEN)
priority String @default("NORMAL") @db.VarChar(6)
assigneeId -> User SetNull ?
resolution String?
resolvedAt DateTime? @db.Timestamptz(6)
@@index([status])
''')
table('TicketMessage', 'ticket_messages', 'log', '''
ticketId -> Ticket Cascade
senderType String @db.VarChar(6)
senderId -> User SetNull ?
text String
links Json?
@@index([ticketId])
''')
table('Faq', 'faqs', '', '''
category String @db.VarChar(40)
question String
answer String
keywords String[] @default([])
chatTexts String[]
links Json?
showInFaq Boolean @default(true)
showInChat Boolean @default(false)
orderIndex Int @default(0) @db.SmallInt
''')

# ---------- 17. CMS ----------
table('Post', 'posts', 'soft', '''
kind String @default("BLOG") @db.VarChar(10)
slug String @unique @db.VarChar(160)
title String @db.VarChar(220)
excerpt String @db.VarChar(400)
contentBlocks Json
category String? @db.VarChar(60)
categorySlug String? @db.VarChar(60)
tags String[] @default([])
examType ExamType?
seriesOrder Int? @db.SmallInt
authorId -> User SetNull ?
coverUrl String?
readMinutes Int @db.SmallInt
viewsCount Int @default(0)
status ContentStatus @default(DRAFT)
publishedAt DateTime? @db.Timestamptz(6)
@@index([categorySlug])
@@index([publishedAt])
''')
table('Testimonial', 'testimonials', '', '''
userId -> User SetNull ?
name String @db.VarChar(120)
roleText String? @db.VarChar(120)
avatarUrl String?
examType ExamType
testName String @db.VarChar(120)
scoreBefore String @db.VarChar(20)
scoreAfter String @db.VarChar(20)
weeks Int @db.SmallInt
examDate DateTime? @db.Date
venue String? @db.VarChar(160)
certificateMasked String? @db.VarChar(30)
quote String
consentAt DateTime? @db.Timestamptz(6)
isPublished Boolean @default(false)
''')

# ---------- 18. Cấu hình ----------
table('SystemSetting', 'system_settings', 'join', '''
key String @id @db.VarChar(80)
groupName String @db.VarChar(40)
label String @db.VarChar(160)
description String?
valueType String @db.VarChar(10)
value Json
options Json?
updatedById -> User SetNull ?
createdAt DateTime @default(now()) @db.Timestamptz(6)
updatedAt DateTime @updatedAt @db.Timestamptz(6)
''')

# ======================= sinh =======================
models = {m for m, *_ in T}
assert len(T) == 59, f'Cần 59 bảng, hiện có {len(T)}'

body = {m: [] for m in models}
back = {m: [] for m in models}
FK_RE = re.compile(r'^(\w+)Id\s*->\s*(\w+)\s+(Cascade|SetNull|Restrict)\s*(\?)?\s*(uq)?$')

for model, name, flags, cols in T:
    lines = body[model]
    if 'join' not in flags:
        lines.append('id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid')
    for c in cols:
        m = FK_RE.match(c)
        if m:
            base, target, action, opt, uq = m.groups()
            opt = '?' if opt else ''
            fk = f'{base}Id'
            rel = f'{model}_{base}'
            # Field quan hệ: bỏ hậu tố "By" để tên gọn (reviewedBy → reviewedBy giữ nguyên)
            lines.append(f'{fk} String{opt}{" @unique" if uq else ""} @db.Uuid @map("{snake(fk)}")')
            lines.append(f'{base} {target}{opt} @relation("{rel}", fields: [{fk}], references: [id], onDelete: {action})')
            back_name = f'{model[0].lower()}{model[1:]}{base[0].upper()}{base[1:]}s' if not uq else f'{model[0].lower()}{model[1:]}{base[0].upper()}{base[1:]}'
            back[target].append(f'{back_name} {model}{"?" if uq else "[]"} @relation("{rel}")')
            continue
        if c.startswith('@@'):
            lines.append(c)
            continue
        fname, rest = c.split(' ', 1)
        if fname != snake(fname) and '@map(' not in rest:
            rest += f' @map("{snake(fname)}")'
        lines.append(f'{fname} {rest}')
    if 'join' not in flags:
        lines.append('createdAt DateTime @default(now()) @db.Timestamptz(6) @map("created_at")')
        if 'log' not in flags:
            lines.append('updatedAt DateTime @updatedAt @db.Timestamptz(6) @map("updated_at")')
    if 'soft' in flags:
        lines.append('deletedAt DateTime? @db.Timestamptz(6) @map("deleted_at")')

out = [HEADER]
for e, vals in ENUMS.items():
    out.append(f'enum {e} {{\n' + '\n'.join(f'  {v}' for v in vals.split()) + f'\n\n  @@map("{ENUM_DB[e]}")\n}}\n')
for model, name, flags, cols in T:
    fields = [l for l in body[model] if not l.startswith('@@')] + back[model]
    attrs = [l for l in body[model] if l.startswith('@@')]
    out.append(f'model {model} {{\n' + '\n'.join('  ' + l for l in fields) + '\n\n' + '\n'.join('  ' + a for a in attrs + [f'@@map("{name}")']) + '\n}\n')

open(OUT, 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
print(f'OK: {len(T)} models, {len(ENUMS)} enums')
