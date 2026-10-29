import React from 'react';
import { Tags, Hash } from 'lucide-react';
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
  {
    key: 'name',
    header: 'Tên thẻ',
    render: (t) => (
      <span className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center">
          <Hash className="w-3.5 h-3.5" />
        </span>
        <span className="font-bold text-slate-900">{t.name}</span>
      </span>
    ),
  },
  { key: 'slug', header: 'Slug', render: (t) => <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{t.slug}</span> },
  { key: 'skill', header: 'Kỹ năng', render: (t) => <Badge tone={SKILL_META[t.skill].tone}>{SKILL_META[t.skill].label}</Badge> },
  { key: 'questionsCount', header: 'Số câu hỏi', align: 'right', render: (t) => <span className="font-mono font-bold text-slate-800">{t.questionsCount.toLocaleString('vi-VN')}</span> },
];

const fields: CrudField<SkillTag>[] = [
  { key: 'name', label: 'Tên thẻ', type: 'text', required: true, placeholder: 'Word Form' },
  { key: 'slug', label: 'Slug', type: 'text', placeholder: 'word-form', hint: 'Tự sinh nếu bỏ trống' },
  { key: 'skill', label: 'Kỹ năng', type: 'select', required: true, options: SKILLS.map((s) => ({ value: s, label: SKILL_META[s].label })) },
];

export const AdminSkillTagsPage: React.FC = () => {
  useDocumentTitle('Danh mục kỹ năng');
  const bySkill = SKILLS.map((s) => ({ label: SKILL_META[s].label, value: MOCK_SKILL_TAGS.filter((t) => t.skill === s).reduce((a, t) => a + t.questionsCount, 0), tone: SKILL_META[s].tone }));
  const total = bySkill.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Danh mục <span className="mark">kỹ năng</span>
          </>
        }
        icon={<Tags />}
        description="Cây thẻ kỹ năng (Skill Tags) dùng để phân loại câu hỏi và gắn nguyên nhân trong Sổ tay lỗi sai của học viên."
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        <Card hard className="animate-fade-up">
          <CardHeader title="Số câu hỏi theo kỹ năng" subtitle={`${total.toLocaleString('vi-VN')} câu được gắn thẻ`} />
          <MiniBars data={bySkill} height={140} />
        </Card>
        <Card hard tone="yellow" className="animate-fade-up" style={{ animationDelay: '80ms' }}>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Tổng số thẻ</p>
          <p className="font-display text-5xl font-extrabold text-slate-900 mt-1">{MOCK_SKILL_TAGS.length}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {SKILLS.map((s) => (
              <Badge key={s} tone={SKILL_META[s].tone} size="xs">
                {SKILL_META[s].label} · {MOCK_SKILL_TAGS.filter((t) => t.skill === s).length}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-slate-700 mt-4">Thẻ được dùng ở Ngân hàng câu hỏi, Luyện điểm yếu và báo cáo Trưởng bộ môn.</p>
        </Card>
      </div>
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
