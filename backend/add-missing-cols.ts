import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    // Add order to Studio
    await prisma.$executeRaw`
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;
    `;
    console.log('✅ Added order column to Studio');

    // Add more columns that seed expects
    await prisma.$executeRaw`
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "tagline" TEXT;
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "description" TEXT;
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2);
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "price_note" TEXT;
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "features" TEXT[] DEFAULT '{}';
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "max_booking_duration_hours" INTEGER;
      ALTER TABLE "Studio" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
    `;
    console.log('✅ Added all missing Studio columns');

    // Add check constraints that might be missing
    await prisma.$executeRaw`
      ALTER TABLE "Booking" ADD CONSTRAINT IF NOT EXISTS "booking_valid_times" CHECK ("end_datetime" > "start_datetime");
      ALTER TABLE "Booking" ADD CONSTRAINT IF NOT EXISTS "booking_positive_price" CHECK ("total_price" >= 0);
    `;
    console.log('✅ Added check constraints');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
