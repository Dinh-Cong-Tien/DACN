-- Ràng buộc, chỉ mục và view mà Prisma không biểu diễn được.
-- Đặc tả: KE_HOACH_TRIEN_KHAI_DU_AN.md mục 10.1 (xoá mềm), 10.8 (chỉ mục), 10.9 (toàn vẹn), view v_review_queue.

-- ============ 1. Partial unique (xoá mềm / bản ghi đang hiệu lực) ============
CREATE UNIQUE INDEX users_email_active_uq      ON users (email)  WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX courses_slug_active_uq     ON courses (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX learning_goals_active_uq   ON learning_goals (user_id) WHERE is_active;
CREATE UNIQUE INDEX learning_paths_active_uq   ON learning_paths (user_id) WHERE is_active;
CREATE UNIQUE INDEX exam_attempts_inprogress_uq ON exam_attempts (user_id, test_id) WHERE status = 'IN_PROGRESS' AND test_id IS NOT NULL;
CREATE UNIQUE INDEX payments_coupon_once_uq    ON payment_transactions (coupon_id, user_id) WHERE status = 'PAID' AND coupon_id IS NOT NULL;
CREATE UNIQUE INDEX posts_exam_guide_order_uq  ON posts (exam_type, series_order) WHERE kind = 'EXAM_GUIDE';

-- UNIQUE … NULLS NOT DISTINCT (PG ≥ 15)
CREATE UNIQUE INDEX user_abilities_scope_uq ON user_abilities (user_id, exam_type, skill, tag_id) NULLS NOT DISTINCT;
CREATE UNIQUE INDEX words_topic_head_pos_uq ON words (topic_id, headword, pos) NULLS NOT DISTINCT;

-- ============ 2. CHECK ============
ALTER TABLE users            ADD CONSTRAINT users_xp_ck CHECK (xp_total >= 0);
ALTER TABLE learning_goals   ADD CONSTRAINT goals_score_ck CHECK (target_score IS NULL OR target_score BETWEEN 10 AND 990),
                             ADD CONSTRAINT goals_minutes_ck CHECK (minutes_per_day BETWEEN 10 AND 480),
                             ADD CONSTRAINT goals_target_ck CHECK (target_score IS NOT NULL OR target_level IS NOT NULL);
ALTER TABLE user_abilities   ADD CONSTRAINT abil_theta_ck CHECK (theta IS NULL OR theta BETWEEN -4 AND 4),
                             ADD CONSTRAINT abil_mastery_ck CHECK (mastery BETWEEN 0 AND 1);
ALTER TABLE learning_path_items ADD CONSTRAINT lpi_phase_ck CHECK (phase BETWEEN 1 AND 3);
ALTER TABLE lessons          ADD CONSTRAINT lessons_pass_ck CHECK (pass_score_pct IS NULL OR pass_score_pct BETWEEN 0 AND 100),
                             ADD CONSTRAINT lessons_quiz_ck CHECK (type NOT IN ('QUIZ','CHECKPOINT') OR pass_score_pct IS NOT NULL);
ALTER TABLE course_enrollments ADD CONSTRAINT enroll_rating_ck CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
ALTER TABLE passages         ADD CONSTRAINT passages_part_ck CHECK (purpose <> 'EXAM' OR part IS NOT NULL);
ALTER TABLE questions        ADD CONSTRAINT q_irt_a_ck CHECK (irt_a BETWEEN 0.2 AND 3),
                             ADD CONSTRAINT q_irt_b_ck CHECK (irt_b BETWEEN -4 AND 4);
ALTER TABLE rubrics          ADD CONSTRAINT rubrics_skill_ck CHECK (skill IN ('WRITING','SPEAKING'));
ALTER TABLE gradings         ADD CONSTRAINT gradings_source_ck CHECK (num_nonnulls(answer_id, submission_id) = 1);
ALTER TABLE srs_cards        ADD CONSTRAINT srs_target_ck CHECK (num_nonnulls(word_id, mistake_id) = 1),
                             ADD CONSTRAINT srs_ease_ck CHECK (ease_factor >= 1.3);
ALTER TABLE srs_review_logs  ADD CONSTRAINT srs_quality_ck CHECK (quality BETWEEN 0 AND 5);
ALTER TABLE speaking_recordings ADD CONSTRAINT rec_score_ck CHECK (score_overall IS NULL OR score_overall BETWEEN 0 AND 100);
ALTER TABLE classes          ADD CONSTRAINT classes_dates_ck CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);
ALTER TABLE class_sessions   ADD CONSTRAINT sessions_time_ck CHECK (end_time > start_time);
ALTER TABLE subscription_plans ADD CONSTRAINT plans_price_ck CHECK (price >= 0);
ALTER TABLE coupons          ADD CONSTRAINT coupons_value_ck CHECK (discount_value > 0);
ALTER TABLE payment_transactions ADD CONSTRAINT pay_amount_ck CHECK (amount > 0);
ALTER TABLE tickets          ADD CONSTRAINT tickets_owner_ck CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL);

-- Tập giá trị nhỏ dùng VARCHAR + CHECK (mục 10.4)
ALTER TABLE audit_logs       ADD CONSTRAINT audit_sev_ck CHECK (severity IN ('INFO','WARN','CRITICAL'));
ALTER TABLE class_members    ADD CONSTRAINT cm_status_ck CHECK (status IN ('ACTIVE','LEFT','REMOVED')),
                             ADD CONSTRAINT cm_risk_ck CHECK (risk_level IN ('GOOD','WARNING','RISK'));
ALTER TABLE class_sessions   ADD CONSTRAINT cs_status_ck CHECK (status IN ('UPCOMING','DONE','CANCELLED'));
ALTER TABLE materials        ADD CONSTRAINT mat_type_ck CHECK (type IN ('VIDEO','PDF','DOC','AUDIO','LINK'));
ALTER TABLE assignments      ADD CONSTRAINT asg_status_ck CHECK (status IN ('DRAFT','OPEN','CLOSED'));
ALTER TABLE student_notes    ADD CONSTRAINT sn_kind_ck CHECK (kind IN ('NOTE','REMINDER','CONTACT'));
ALTER TABLE broadcasts       ADD CONSTRAINT bc_audience_ck CHECK (audience IN ('ALL','STUDENT','VIP','TEACHER','HEAD_TEACHER')),
                             ADD CONSTRAINT bc_status_ck CHECK (status IN ('DRAFT','SCHEDULED','SENT'));
ALTER TABLE tickets          ADD CONSTRAINT tk_channel_ck CHECK (channel IN ('CHAT','EMAIL','PHONE','IN_APP')),
                             ADD CONSTRAINT tk_priority_ck CHECK (priority IN ('LOW','NORMAL','HIGH'));
ALTER TABLE posts            ADD CONSTRAINT posts_kind_ck CHECK (kind IN ('BLOG','EXAM_GUIDE','NEWS'));
ALTER TABLE speaking_materials ADD CONSTRAINT sm_kind_ck CHECK (kind IN ('MINIMAL_PAIR','ROLEPLAY'));
ALTER TABLE passages         ADD CONSTRAINT passages_purpose_ck CHECK (purpose IN ('EXAM','DICTATION'));
ALTER TABLE system_settings  ADD CONSTRAINT ss_type_ck CHECK (value_type IN ('TOGGLE','NUMBER','TEXT','SELECT','JSON'));

-- ============ 3. Không có 2 gói ACTIVE chồng thời gian ============
ALTER TABLE user_subscriptions ADD CONSTRAINT subs_no_overlap EXCLUDE USING gist (
  user_id WITH =, tstzrange(starts_at, ends_at) WITH &&
) WHERE (status = 'ACTIVE');

-- ============ 4. Chỉ mục truy vấn nóng (10.8) ============
CREATE INDEX srs_due_idx           ON srs_cards (user_id, next_review_at) WHERE status <> 'SUSPENDED';
CREATE INDEX notif_unread_idx      ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX questions_tags_gin    ON questions USING gin (tag_ids);
CREATE INDEX questions_stem_trgm   ON questions USING gin (stem gin_trgm_ops);
CREATE INDEX words_headword_trgm   ON words USING gin (headword gin_trgm_ops);
CREATE INDEX users_fullname_trgm   ON users USING gin (full_name gin_trgm_ops);
CREATE INDEX posts_title_trgm      ON posts USING gin (title gin_trgm_ops);
CREATE INDEX posts_tags_gin        ON posts USING gin (tags);
CREATE INDEX faqs_keywords_gin     ON faqs USING gin (keywords);
CREATE INDEX sessions_attend_gin   ON class_sessions USING gin (attendance jsonb_path_ops);

-- FK chưa có index ở cột con (DB-02)
CREATE INDEX ON role_permissions (granted_by_id);
CREATE INDEX ON departments (head_id);
CREATE INDEX ON user_abilities (tag_id);
CREATE INDEX ON learning_paths (goal_id);
CREATE INDEX ON courses (author_id);
CREATE INDEX ON courses (department_id);
CREATE INDEX ON courses (reviewed_by_id);
CREATE INDEX ON lessons (quiz_test_id);
CREATE INDEX ON lessons (reviewed_by_id);
CREATE INDEX ON course_enrollments (course_id);
CREATE INDEX ON course_enrollments (current_lesson_id);
CREATE INDEX ON lesson_progress (lesson_id);
CREATE INDEX ON grammar_topics (tag_id);
CREATE INDEX ON passages (source_lesson_id);
CREATE INDEX ON passages (author_id);
CREATE INDEX ON passages (reviewed_by_id);
CREATE INDEX ON questions (passage_id);
CREATE INDEX ON questions (rubric_id);
CREATE INDEX ON questions (author_id);
CREATE INDEX ON questions (reviewed_by_id);
CREATE INDEX ON question_versions (changed_by_id);
CREATE INDEX ON mock_tests (author_id);
CREATE INDEX ON mock_tests (reviewed_by_id);
CREATE INDEX ON exam_attempts (test_id);
CREATE INDEX ON exam_attempts (passage_id);
CREATE INDEX ON exam_attempts (lesson_id);
CREATE INDEX ON exam_attempts (assignment_id);
CREATE INDEX ON gradings (answer_id);
CREATE INDEX ON gradings (submission_id);
CREATE INDEX ON gradings (grader_id);
CREATE INDEX ON gradings (rubric_id);
CREATE INDEX ON gradings (reviewer_id);
CREATE INDEX ON mistake_entries (question_id);
CREATE INDEX ON mistake_entries (last_attempt_id);
CREATE INDEX ON mistake_entries (tag_id);
CREATE INDEX ON srs_cards (word_id);
CREATE INDEX ON srs_cards (mistake_id);
CREATE INDEX ON ai_conversations (material_id);
CREATE INDEX ON class_sessions (teacher_id);
CREATE INDEX ON class_announcements (author_id);
CREATE INDEX ON materials (uploaded_by_id);
CREATE INDEX ON assignments (created_by_id);
CREATE INDEX ON assignment_submissions (attempt_id);
CREATE INDEX ON student_notes (teacher_id);
CREATE INDEX ON student_notes (class_id);
CREATE INDEX ON certificates (course_id);
CREATE INDEX ON certificates (attempt_id);
CREATE INDEX ON broadcasts (created_by_id);
CREATE INDEX ON user_subscriptions (plan_id);
CREATE INDEX ON user_subscriptions (payment_id);
CREATE INDEX ON user_subscriptions (granted_by_id);
CREATE INDEX ON payment_transactions (plan_id);
CREATE INDEX ON payment_transactions (coupon_id);
CREATE INDEX ON tickets (user_id);
CREATE INDEX ON tickets (question_id);
CREATE INDEX ON tickets (attempt_id);
CREATE INDEX ON tickets (submission_id);
CREATE INDEX ON tickets (assignee_id);
CREATE INDEX ON ticket_messages (sender_id);
CREATE INDEX ON posts (author_id);
CREATE INDEX ON testimonials (user_id);
CREATE INDEX ON system_settings (updated_by_id);

-- ============ 5. Chỉ GV/TBM làm chủ lớp, duyệt nội dung (10.9) ============
CREATE OR REPLACE FUNCTION check_user_role() RETURNS trigger AS $$
DECLARE
  col text := TG_ARGV[0];
  allowed text[] := string_to_array(TG_ARGV[1], ',');
  uid uuid;
  r text;
BEGIN
  EXECUTE format('SELECT ($1).%I', col) INTO uid USING NEW;
  IF uid IS NULL THEN RETURN NEW; END IF;
  SELECT role::text INTO r FROM users WHERE id = uid;
  IF r IS NULL OR NOT (r = ANY (allowed)) THEN
    RAISE EXCEPTION '% phải là người dùng có vai trò % (đang là %)', col, TG_ARGV[1], coalesce(r, 'không tồn tại')
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER classes_teacher_role BEFORE INSERT OR UPDATE OF teacher_id ON classes
  FOR EACH ROW EXECUTE FUNCTION check_user_role('teacher_id', 'TEACHER,HEAD_TEACHER');
CREATE TRIGGER departments_head_role BEFORE INSERT OR UPDATE OF head_id ON departments
  FOR EACH ROW EXECUTE FUNCTION check_user_role('head_id', 'HEAD_TEACHER,ADMIN');
CREATE TRIGGER questions_reviewer_role BEFORE INSERT OR UPDATE OF reviewed_by_id ON questions
  FOR EACH ROW EXECUTE FUNCTION check_user_role('reviewed_by_id', 'HEAD_TEACHER,ADMIN');
CREATE TRIGGER mock_tests_reviewer_role BEFORE INSERT OR UPDATE OF reviewed_by_id ON mock_tests
  FOR EACH ROW EXECUTE FUNCTION check_user_role('reviewed_by_id', 'HEAD_TEACHER,ADMIN');
CREATE TRIGGER courses_reviewer_role BEFORE INSERT OR UPDATE OF reviewed_by_id ON courses
  FOR EACH ROW EXECUTE FUNCTION check_user_role('reviewed_by_id', 'HEAD_TEACHER,ADMIN');
CREATE TRIGGER lessons_reviewer_role BEFORE INSERT OR UPDATE OF reviewed_by_id ON lessons
  FOR EACH ROW EXECUTE FUNCTION check_user_role('reviewed_by_id', 'HEAD_TEACHER,ADMIN');
CREATE TRIGGER passages_reviewer_role BEFORE INSERT OR UPDATE OF reviewed_by_id ON passages
  FOR EACH ROW EXECUTE FUNCTION check_user_role('reviewed_by_id', 'HEAD_TEACHER,ADMIN');

-- Câu hỏi đã nằm trong đề PUBLISHED: sửa nội dung → lưu phiên bản cũ + tăng version, gửi duyệt lại
CREATE OR REPLACE FUNCTION questions_versioning() RETURNS trigger AS $$
BEGIN
  IF (NEW.stem, NEW.options, NEW.correct_answer, NEW.explanation_md)
     IS DISTINCT FROM (OLD.stem, OLD.options, OLD.correct_answer, OLD.explanation_md)
     AND EXISTS (SELECT 1 FROM mock_test_questions mq JOIN mock_tests t ON t.id = mq.test_id
                 WHERE mq.question_id = OLD.id AND t.status = 'PUBLISHED' AND t.deleted_at IS NULL) THEN
    INSERT INTO question_versions (question_id, version, snapshot, changed_by_id)
    VALUES (OLD.id, OLD.version, jsonb_build_object('stem', OLD.stem, 'options', OLD.options,
            'correctAnswer', OLD.correct_answer, 'explanationMd', OLD.explanation_md), NEW.author_id)
    ON CONFLICT (question_id, version) DO NOTHING;
    NEW.version := OLD.version + 1;
    NEW.status := 'PENDING_REVIEW';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER questions_versioning BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION questions_versioning();

-- ============ 6. View hàng đợi phê duyệt của Trưởng bộ môn ============
CREATE VIEW v_review_queue AS
  SELECT 'COURSE'::text   AS resource_type, id, title,                       author_id, updated_at FROM courses   WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL
  UNION ALL SELECT 'LESSON',   l.id, l.title,                              c.author_id, l.updated_at FROM lessons l JOIN course_sections s ON s.id = l.section_id JOIN courses c ON c.id = s.course_id WHERE l.status = 'PENDING_REVIEW' AND l.deleted_at IS NULL
  UNION ALL SELECT 'PASSAGE',  id, coalesce(title, left(content_md, 80)),   author_id, updated_at FROM passages  WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL
  UNION ALL SELECT 'QUESTION', id, left(stem, 120),                         author_id, updated_at FROM questions WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL
  UNION ALL SELECT 'TEST',     id, title,                                   author_id, updated_at FROM mock_tests WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL
  UNION ALL SELECT 'GRAMMAR',  id, title,                                   NULL,      updated_at FROM grammar_topics WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL
  UNION ALL SELECT 'SPEAKING', id, title,                                   NULL,      updated_at FROM speaking_materials WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL
  UNION ALL SELECT 'POST',     id, title,                                   author_id, updated_at FROM posts     WHERE status = 'PENDING_REVIEW' AND deleted_at IS NULL;

-- ============ 7. Materialized view thống kê (refresh định kỳ bằng job) ============
CREATE MATERIALIZED VIEW mv_question_stats AS
  SELECT a.question_id,
         count(*)                                         AS answered,
         avg(CASE WHEN a.is_correct THEN 1.0 ELSE 0 END)  AS correct_rate,
         avg(a.time_spent_ms)::int                        AS avg_time_ms
  FROM attempt_answers a WHERE a.is_correct IS NOT NULL GROUP BY a.question_id;
CREATE UNIQUE INDEX ON mv_question_stats (question_id);

CREATE MATERIALIZED VIEW mv_class_stats AS
  SELECT c.id AS class_id,
         count(DISTINCT m.student_id) FILTER (WHERE m.status = 'ACTIVE')                       AS students,
         avg(s.score) FILTER (WHERE s.status = 'GRADED')                                     AS avg_score,
         avg(CASE WHEN s.status IN ('SUBMITTED','LATE','GRADED') THEN 1.0 ELSE 0 END)        AS completion_rate
  FROM classes c
  LEFT JOIN class_members m ON m.class_id = c.id
  LEFT JOIN assignments a ON a.class_id = c.id AND a.deleted_at IS NULL
  LEFT JOIN assignment_submissions s ON s.assignment_id = a.id
  WHERE c.deleted_at IS NULL GROUP BY c.id;
CREATE UNIQUE INDEX ON mv_class_stats (class_id);
