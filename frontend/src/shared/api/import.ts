import { api, http } from './client';

/** Nhập đề TOEIC từ file Word — khớp backend `/api/v1/import` */
export type PartNo = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface ImportOption {
  key: string;
  text: string;
}
export interface ImportGroup {
  ref: string;
  from: number;
  to: number;
  part: PartNo;
  title: string;
  content: string;
  imageUrls: string[];
  /** Gắn ở bước xem trước (Part 3–4) */
  audioUrl?: string | null;
}
export interface ImportQuestion {
  ref: string;
  questionNo: number;
  part: PartNo;
  stem: string;
  options: ImportOption[];
  correctAnswer: string | null;
  answerSource: 'INLINE' | 'KEY_TABLE' | 'FORMAT' | null;
  explanation: string | null;
  imageUrls: string[];
  groupRef: string | null;
  partSource: 'HEADING' | 'NUMBER' | 'GUESS';
  warnings: string[];
  /** Gắn ở bước xem trước (Part 1–2) */
  audioUrl?: string | null;
}
export interface ImportPreview {
  questions: ImportQuestion[];
  groups: ImportGroup[];
  parts: { part: PartNo; count: number; expected: number }[];
  warnings: string[];
  partMode: 'HEADING' | 'NUMBER' | 'GUESS';
  answered: number;
  total: number;
}
export type ImportStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED';
export interface ImportConfirmInput {
  status: ImportStatus;
  groups: ImportGroup[];
  questions: ImportQuestion[];
  createTest?: { title: string; isFree: boolean } | null;
}
export interface ImportResult {
  created: number;
  passages: number;
  status: ImportStatus;
  test: { id: string; slug: string; title: string } | null;
}

const I = '/import';
export const importApi = {
  templateUrl: `/api/v1${I}/template.docx`,
  preview: (file: File) =>
    http
      .post<{ data: ImportPreview }>(`${I}/word/preview`, file, {
        headers: { 'Content-Type': file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'X-File-Name': encodeURIComponent(file.name) },
        timeout: 120_000,
      })
      .then((r) => r.data.data),
  uploadAudio: (file: File) =>
    http
      .post<{ data: { url: string; name: string; sizeBytes: number } }>(`${I}/audio`, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) },
        timeout: 120_000,
      })
      .then((r) => r.data.data),
  confirm: (b: ImportConfirmInput) => api.post<ImportResult>(`${I}/word/confirm`, b),
};
