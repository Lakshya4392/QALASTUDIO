import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addPasswordHashColumn() {
  try {
    console.log('Adding password_hash column to User table...');
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;
    `;
    console.log('✅ Column added (or already exists)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordHashColumn();
