import React from 'react';
import { Briefcase, GraduationCap, School } from 'lucide-react';
import { TRACK_LABEL, type Course } from '@/shared/types';
import { cn } from '@/shared/utils';
import './course-cover.css';

const ICON = { TOEIC: Briefcase, VSTEP: GraduationCap, THPT: School } as const;

/** Bìa chữ cho khoá học chưa có ảnh bìa: mục chính, nhóm, tên khoá, số bài — đều lấy từ dữ liệu khoá */
export const CourseCover: React.FC<{ course: Pick<Course, 'title' | 'track' | 'trackGroup' | 'lessonsCount'>; className?: string }> = ({ course: c, className }) => {
  const Icon = ICON[c.track ?? 'TOEIC'];
  return (
    <div className={cn('course-cover', `course-cover--${(c.track ?? 'TOEIC').toLowerCase()}`, className)}>
      <Icon className="course-cover__icon" aria-hidden />
      <div className="relative">
        <p className="course-cover__eyebrow">{[c.track && TRACK_LABEL[c.track], c.trackGroup].filter(Boolean).join(' · ')}</p>
        <p className="course-cover__title">{c.title}</p>
        <p className="course-cover__meta">{c.lessonsCount} bài học</p>
      </div>
    </div>
  );
};
