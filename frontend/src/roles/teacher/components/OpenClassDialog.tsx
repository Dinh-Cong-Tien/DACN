import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { teacherApi, useLibCourses, useTeacherMutation } from '@/shared/api/teacher';
import { errorMessage } from '@/shared/api/client';
import { toast } from '@/shared/stores/uiStore';
import { Input, Modal, Select } from '@/shared/components/ui';
import { courseOptions } from '@/shared/constants/staff';
import { TBtn } from './TeacherKit';

const EMPTY = { name: '', course: '', schedule: '', room: '' };

/** Mở lớp mới trong một khoá học (lớp nằm trong khoá; học viên vào lớp được ghi danh khoá). `course` = slug chọn sẵn. */
export const OpenClassDialog: React.FC<{ open: boolean; course?: string; onClose: () => void }> = ({ open, course, onClose }) => {
  const courses = useLibCourses().data ?? [];
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const createClass = useTeacherMutation(teacherApi.createClass);

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, course: course ?? '' });
    setError('');
  }, [open, course]);

  const save = () => {
    if (!form.course) return setError('Chọn khoá học của lớp');
    if (form.name.trim().length < 2) return setError('Vui lòng nhập tên lớp');
    createClass.mutate(
      { name: form.name.trim(), courseId: form.course, schedule: form.schedule.trim() || null, room: form.room.trim() || null },
      {
        onSuccess: (c) => {
          onClose();
          toast.success('Đã mở lớp mới', `${c.course?.title ?? ''} · mã mời ${c.code}`);
        },
        onError: (e) => setError(errorMessage(e)),
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mở lớp học"
      description="Lớp thuộc một khoá học; mã mời được tạo tự động sau khi lưu."
      icon={<Users />}
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn variant="primary" onClick={save} disabled={createClass.isPending}>
            {createClass.isPending ? 'Đang mở…' : 'Mở lớp'}
          </TBtn>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Khoá học"
          required
          placeholder="Chọn khoá học của lớp"
          options={courseOptions(courses)}
          value={form.course}
          onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
          hint="Học viên vào lớp được ghi danh khoá này; giáo viên theo dõi tiến độ khoá trong lớp"
        />
        <Input label="Tên lớp" required placeholder="VD: TOEIC 650+ K13" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={error} />
        <Input label="Lịch học" placeholder="VD: T2 – T4 – T6 · 19:00" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} />
        <Input label="Phòng học" placeholder="VD: Phòng 302 hoặc Online" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
      </div>
    </Modal>
  );
};
