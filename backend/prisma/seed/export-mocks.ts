/**
 * Chụp nội dung biên tập đang nằm trong frontend/src/shared/mocks ra data/mocks.json
 * (FAQ, blog, bảng giá, lớp, giáo viên…). Seed đọc file JSON này nên không phụ thuộc frontend.
 * Chạy lại khi cần cập nhật: npx tsx --tsconfig prisma/seed/tsconfig.mocks.json prisma/seed/export-mocks.ts
 */
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  // import động (đường dẫn biến) để tsc của backend không biên dịch frontend
  const target = '../../../frontend/src/shared/mocks';
  const M: Record<string, unknown> = await import(target);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(M)) if (typeof v !== 'function') out[k] = v;
// Các hàm sinh dữ liệu cần thiết
  out.__sessions = M.MOCK_SESSIONS;
  fs.writeFileSync(path.join(__dirname, 'data', 'mocks.json'), JSON.stringify(out, null, 1));
  console.log('exported', Object.keys(out).length, 'keys');
}

main();
