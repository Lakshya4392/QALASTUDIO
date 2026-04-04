import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Warm up connection on startup — Neon free tier sleeps after inactivity
prisma.$connect().catch((err) => {
  console.warn('⚠️  DB connect on startup failed (may be sleeping):', err.message);
});

export default prisma;
