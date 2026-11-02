import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({ log: ['warn', 'error'] });

/** Thư mục dữ liệu cào (đặt SEED_DATA_DIR nếu để chỗ khác). */
export const DATA_DIR = process.env.SEED_DATA_DIR ?? 'D:/Dữ liệu ổ C/Năm 3/Data';
export const dataPath = (...p: string[]) => path.join(DATA_DIR, ...p);
export const exists = (p: string) => fs.existsSync(p);
export const readJson = <T = any>(p: string): T => JSON.parse(fs.readFileSync(p, 'utf8'));
export const readText = (p: string) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

/** Nội dung biên tập lấy từ frontend mocks (snapshot JSON, xem export-mocks.ts). */
export const MOCKS: Record<string, any> = readJson(path.join(__dirname, 'data', 'mocks.json'));

export const uuid = () => crypto.randomUUID();

export const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

export const cut = (s: string | null | undefined, n: number) => (s == null ? s : s.length > n ? s.slice(0, n) : s);

export const stripHtml = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h\d)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** createMany theo lô để không vượt giới hạn tham số của PostgreSQL. */
export async function insertMany(model: { createMany: (a: { data: any[]; skipDuplicates?: boolean }) => Promise<{ count: number }> }, rows: any[], size = 1000) {
  let n = 0;
  for (let i = 0; i < rows.length; i += size) n += (await model.createMany({ data: rows.slice(i, i + size) })).count;
  return n;
}

export const DAY_MS = 86_400_000;
export const dateOnly = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
export const timeOf = (hhmm: string) => new Date(`1970-01-01T${hhmm.padStart(5, '0')}:00.000Z`);

export const log = (...a: unknown[]) => console.log('[seed]', ...a);
