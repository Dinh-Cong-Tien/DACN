import React from 'react';
import { GuestLayout } from '@/layouts/guest/GuestLayout';

/**
 * Học viên dùng chung layout với website công khai (một header duy nhất).
 * Chỉ khác: nội dung được bọc trong container.
 */
export const StudentLayout: React.FC = () => <GuestLayout contained />;
