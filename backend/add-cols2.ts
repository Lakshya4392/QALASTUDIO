import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    const cols = [
      'order',
      'tagline',
      'description',
      'price',
      'price_note',
      'image_url',
      'features',
      'max_booking_duration_hours',
      'is_active'
    ];

    for (const col of cols) {
      const sql = `ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "${col}" ${col === 'order' ? 'INTEGER DEFAULT 0' : col === 'features' ? 'TEXT[] DEFAULT \'{}\'' : col === 'price' ? 'DECIMAL(10,2)' : col === 'is_active' ? 'BOOLEAN DEFAULT true' : 'TEXT'};`;
      await prisma.$executeRaw`${sql}`;
      console.log(`✅ Added column: ${col}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
