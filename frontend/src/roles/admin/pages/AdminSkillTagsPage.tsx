import React from 'react';
import { Tags } from 'lucide-react';
import { MOCK_SKILL_TAGS } from '@/shared/mocks';
import type { SkillTag, SkillType } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Card, CardHeader, Column, MiniBars, PageHeader, Tone } from '@/shared/components/ui';
import { CrudEditor, CrudField } from '@/engines';

const SKILL_META: Record<SkillType, { tone: Tone; label: string }> = {
  LISTENING: { tone: 'sky', label: 'Listening' },
  READING: { tone: 'indigo', label: 'Reading' },
  WRITING: { tone: 'violet', label: 'Writing' },
  SPEAKING: { tone: 'rose', label: 'Speaking' },
  VOCABULARY: { tone: 'amber', label: 'Vocabulary' },
  GRAMMAR: { tone: 'emerald', label: 'Grammar' },
};
const SKILLS = Object.keys(SKILL_META) as SkillType[];

const columns: Column<SkillTag>[] = [
  { key: 'name', header: 'Tên thẻ', render: (t) => <span className="font-semibold text-slate-900">{t.name}</span> },
  { key: 'slug', header: 'Slug', render: (t) => <span className="font-mono text-xs text-slate-500">{t.slug}</span> },
  { key: 'skill', header: 'Kỹ năng', render: (t) => <Badge tone={SKILL_META[t.skill].tone}>{SKILL_META[t.skill].label}</Badge> },
  { key: 'questionsCount', header: 'Số câu hỏi', align: 'right', render: (t) => <span className="font-bold text-slate-700">{t.questionsCount.toLocaleString('vi-VN')}</span> },
];

const fields: CrudField<SkillTag>[] = [
  { key: 'name', label: 'Tên thẻ', type: 'text', required: true, placeholder: 'Word Form' },
  { key: 'slug', label: 'Slug', type: 'text', placeholder: 'word-form', hint: 'Tự sinh nếu bỏ trống' },
  { key: 'skill', label: 'Kỹ năng', type: 'select', required: true, options: SKILLS.map((s) => ({ value: s, label: SKILL_META[s].label })) },
];

export const AdminSkillTagsPage: React.FC = () => {
  useDocumentTitle('Danh mục kỹ năng');
  const bySkill = SKILLS.map((s) => ({ label: SKILL_META[s].label, value: MOCK_SKILL_TAGS.filter((t) => t.skill === s).reduce((a, t) => a + t.questionsCount, 0), tone: SKILL_META[s].tone }));

  return (
    <div className="space-y-6">
      <PageHeader title="Danh mục kỹ năng (Skill Tags)" icon={<Tags />} description="Quản lý cây thẻ kỹ năng dùng để phân loại câu hỏi và phân tích lỗi sai của học viên." />
      <Card className="animate-fade-up">
        <CardHeader title="Số câu hỏi theo kỹ năng" subtitle="Tổng hợp từ các thẻ hiện có" />
        <MiniBars data={bySkill} height={140} />
      </Card>
      <CrudEditor<SkillTag>
        rows={MOCK_SKILL_TAGS}
        columns={columns}
        fields={fields}
        entityName="thẻ kỹ năng"
        createLabel="Thêm thẻ"
        idPrefix="tg"
        searchKeys={['name', 'slug']}
        filters={[{ key: 'skill', label: 'Kỹ năng', options: SKILLS.map((s) => ({ value: s, label: SKILL_META[s].label })) }]}
        defaultValues={{ skill: 'GRAMMAR', questionsCount: 0, slug: '' }}
      />
    </div>
  );
};
