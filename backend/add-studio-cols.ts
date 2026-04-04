import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addColumns() {
  for (const col of [
    { name: 'order', type: 'INTEGER', default: '0' },
    { name: 'tagline', type: 'TEXT' },
    { name: 'description', type: 'TEXT' },
    { name: 'price', type: 'DECIMAL(10,2)' },
    { name: 'price_note', type: 'TEXT' },
    { name: 'image_url', type: 'TEXT' },
    { name: 'features', type: 'TEXT[]', default: "'{}'" },
    { name: 'max_booking_duration_hours', type: 'INTEGER' },
    { name: 'is_active', type: 'BOOLEAN', default: 'true' },
  ]) {
    try {
      await prisma.$executeRaw`ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} ${col.default ? `DEFAULT ${col.default}` : ''};`;
      console.log(`✅ Added ${col.name}`);
    } catch (err) {
      console.log(`ℹ️  Column ${col.name} may already exist or error:`, err);
    }
  }
  await prisma.$disconnect();
}

addColumns();
