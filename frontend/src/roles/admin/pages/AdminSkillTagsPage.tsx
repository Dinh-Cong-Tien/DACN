import React, { useMemo } from 'react';
import { BookOpen, BookA, Hash, Headphones, Mic, PenLine, Puzzle, Tags, BarChart3 } from 'lucide-react';
import { adminApi, useAdminInvalidate, useAdminSkillTags } from '@/shared/api/admin';
import type { SkillTag, SkillType } from '@/shared/types';
import { useDocumentTitle } from '@/shared/hooks';
import { Column } from '@/shared/components/ui';
import { IconTile, Meter, Panel, TPageHead, type Tone } from '@/roles/teacher/components/TeacherKit';
import { BarChart } from '@/shared/components/charts/Charts';
import { CrudEditor, CrudField } from '@/engines';

const SKILL_META: Record<SkillType, { tone: Tone; label: string; vi: string; icon: React.ElementType }> = {
  LISTENING: { tone: 'sky', label: 'Listening', vi: 'Nghe', icon: Headphones },
  READING: { tone: 'indigo', label: 'Reading', vi: 'Đọc', icon: BookOpen },
  WRITING: { tone: 'violet', label: 'Writing', vi: 'Viết', icon: PenLine },
  SPEAKING: { tone: 'rose', label: 'Speaking', vi: 'Nói', icon: Mic },
  VOCABULARY: { tone: 'amber', label: 'Vocabulary', vi: 'Từ vựng', icon: BookA },
  GRAMMAR: { tone: 'emerald', label: 'Grammar', vi: 'Ngữ pháp', icon: Puzzle },
};
const CHIP: Record<Tone, string> = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-200/70',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200/70',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200/70',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200/70',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
};
const SKILLS = Object.keys(SKILL_META) as SkillType[];

const columns: Column<SkillTag>[] = [
  {
    key: 'name',
    header: 'Tên thẻ',
    render: (t) => (
      <span className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Hash className="h-4 w-4" />
        </span>
        <span className="font-semibold text-slate-900">{t.name}</span>
      </span>
    ),
  },
  { key: 'slug', header: 'Slug', render: (t) => <span className="font-mono text-xs text-slate-500">{t.slug}</span> },
  {
    key: 'skill',
    header: 'Kỹ năng',
    render: (t) => {
      const m = SKILL_META[t.skill];
      return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${CHIP[m.tone]}`}>
          <m.icon className="h-3.5 w-3.5" /> {m.vi}
        </span>
      );
    },
  },
  { key: 'questionsCount', header: 'Số câu hỏi', align: 'right', render: (t) => <span className="font-semibold tabular-nums text-slate-900">{t.questionsCount.toLocaleString('vi-VN')}</span> },
];

const fields: CrudField<SkillTag>[] = [
  { key: 'name', label: 'Tên thẻ', type: 'text', required: true, placeholder: 'Word Form' },
  { key: 'slug', label: 'Slug', type: 'text', placeholder: 'word-form', hint: 'Tự sinh nếu bỏ trống' },
  { key: 'skill', label: 'Kỹ năng', type: 'select', required: true, options: SKILLS.map((s) => ({ value: s, label: SKILL_META[s].label })) },
];

export const AdminSkillTagsPage: React.FC = () => {
  useDocumentTitle('Danh mục kỹ năng');
  const { data, isLoading } = useAdminSkillTags();
  const refresh = useAdminInvalidate();
  const tags = useMemo<SkillTag[]>(() => data ?? [], [data]);
  const bySkill = SKILLS.map((s) => ({ label: SKILL_META[s].vi, value: tags.filter((t) => t.skill === s).reduce((a, t) => a + t.questionsCount, 0), tone: SKILL_META[s].tone }));
  const total = bySkill.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Nội dung · Ngân hàng đề"
        title="Nhãn kỹ năng"
        sub="Thẻ kỹ năng dùng để phân loại câu hỏi, gợi ý luyện điểm yếu và gắn nguyên nhân trong Sổ tay lỗi sai của học viên."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
        {SKILLS.map((sk) => {
          const m = SKILL_META[sk];
          const tagCount = tags.filter((t) => t.skill === sk).length;
          const q = bySkill.find((b) => b.label === m.vi)?.value ?? 0;
          return (
            <div key={sk} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-center justify-between">
                <IconTile icon={m.icon} tone={m.tone} size="sm" />
                <span className="text-xs font-medium text-slate-500">{tagCount} thẻ</span>
              </div>
              <p className="mt-3 text-[13px] text-slate-500">{m.vi}</p>
              <p className="font-display text-[1.45rem] font-extrabold leading-tight tabular-nums text-slate-900">{q.toLocaleString('vi-VN')}</p>
              <Meter value={total ? (q / total) * 100 : 0} className="mt-2" />
            </div>
          );
        })}
      </div>

      <Panel title="Số câu hỏi theo kỹ năng" sub={`${tags.length} thẻ · ${total.toLocaleString('vi-VN')} câu được gắn thẻ`} icon={BarChart3} tone="indigo" action={<Tags className="h-4 w-4 text-slate-400" />}>
        <BarChart ariaLabel="Số câu hỏi theo kỹ năng" data={bySkill.map(({ label, value }) => ({ label, value }))} height={210} unit=" câu" />
      </Panel>

      <CrudEditor<SkillTag>
        rows={tags}
        loading={isLoading}
        onCreate={async (v) => {
          const t = await adminApi.createSkillTag({ name: v.name, slug: v.slug || undefined, skill: v.skill });
          void refresh();
          return t;
        }}
        onUpdate={async (row, v) => {
          const t = await adminApi.updateSkillTag(row.id, { name: v.name, slug: v.slug || undefined, skill: v.skill });
          void refresh();
          return t;
        }}
        onDelete={async (row) => {
          await adminApi.deleteSkillTag(row.id);
          void refresh();
        }}
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
