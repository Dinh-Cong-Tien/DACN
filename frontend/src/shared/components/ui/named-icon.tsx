import React from 'react';
import {
  Award, BookMarked, BookOpen, Briefcase, Building2, Factory, Flame, Gem, GraduationCap, Headphones, HeartPulse, Landmark, Languages, Laptop, Library, Lightbulb, Medal, Megaphone, Mic, Moon, NotebookPen,
  PenTool, Plane, Presentation, Rocket, ShoppingBag, Star, Target, Trophy, Users, Utensils, Wrench, Zap, type LucideIcon,
} from 'lucide-react';

/**
 * Icon lưu dạng TÊN (chuỗi) trong CSDL/API → vẽ bằng thư viện lucide-react (không dùng emoji/ký tự unicode).
 * Dùng cho huy hiệu, chủ đề từ vựng… Thêm icon mới: thêm vào bảng dưới đây.
 */
export const ICONS: Record<string, LucideIcon> = {
  Award, BookMarked, BookOpen, Briefcase, Building2, Factory, Flame, Gem, GraduationCap, Headphones, HeartPulse, Landmark, Languages, Laptop, Library, Lightbulb, Medal, Megaphone, Mic, Moon, NotebookPen,
  PenTool, Plane, Presentation, Rocket, ShoppingBag, Star, Target, Trophy, Users, Utensils, Wrench, Zap,
};

/** Danh sách lựa chọn cho form quản trị (chọn icon chủ đề) */
export const ICON_OPTIONS = Object.keys(ICONS).map((k) => ({ value: k, label: k }));

/** Thang sao 0–5 (độ khó câu hỏi, điểm dự giờ…) bằng icon Star của lucide */
export const Stars: React.FC<{ value: number; label?: string; className?: string }> = ({ value, label, className }) => (
  <span className={['inline-flex items-center gap-0.5', className].filter(Boolean).join(' ')} aria-label={label ?? `${value}/5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={['h-3.5 w-3.5', i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'].join(' ')} aria-hidden />
    ))}
  </span>
);

export const NamedIcon: React.FC<{ name?: string | null; className?: string; fallback?: keyof typeof ICONS }> = ({ name, className, fallback = 'BookOpen' }) => {
  const Icon = (name && ICONS[name]) || ICONS[fallback];
  return <Icon className={className} aria-hidden />;
};
