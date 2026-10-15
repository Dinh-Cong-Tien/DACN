import { prisma } from '../lib/prisma';

export async function connectDatabase() {
  await prisma.$connect();
  console.log('Connected to PostgreSQL database.');
}
