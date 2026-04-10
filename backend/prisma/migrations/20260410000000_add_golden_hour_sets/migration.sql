-- Add GOLDEN_HOUR to ContentType enum (safe if already exists)
ALTER TYPE "ContentType" ADD VALUE IF NOT EXISTS 'GOLDEN_HOUR';

-- CreateTable GoldenHourSet
CREATE TABLE IF NOT EXISTS "GoldenHourSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "price_note" TEXT DEFAULT 'per hour',
    "image_url" TEXT,
    "bts_video" TEXT,
    "dimensions" TEXT,
    "props" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coords_x" INTEGER NOT NULL DEFAULT 0,
    "coords_y" INTEGER NOT NULL DEFAULT 0,
    "coords_w" INTEGER NOT NULL DEFAULT 100,
    "coords_h" INTEGER NOT NULL DEFAULT 100,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldenHourSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GoldenHourSet_is_active_idx" ON "GoldenHourSet"("is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GoldenHourSet_order_idx" ON "GoldenHourSet"("order");
