import dotenv from 'dotenv';
dotenv.config();

const required = (name: string, fallback?: string) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') throw new Error(`Thiếu biến môi trường ${name}`);
  return v;
};

export const env = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
  REFRESH_TOKEN_DAYS: Number(process.env.REFRESH_TOKEN_DAYS ?? 30),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  // Đăng nhập một chạm (OAuth2) — để trống thì nút tương ứng báo chưa cấu hình
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID ?? '',
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET ?? '',
};
