import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

const projects = [
  {
    type: 'video',
    category: ['BROADCAST TV'],
    brand: 'LUCID MODE',
    name: 'BROADCAST TV',
    year: '2021',
    media_url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-photo-studio-41481-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    order: 1
  },
  {
    type: 'image',
    category: ['FASHION'],
    brand: 'EDITORIAL',
    name: 'LIFESTYLE',
    year: '2023',
    media_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    order: 2
  },
  {
    type: 'image',
    category: ['FITNESS'],
    brand: 'ACTIVE WEAR',
    name: 'LIFESTYLE',
    year: '2022',
    media_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    order: 3
  },
  {
    type: 'image',
    category: ['FOOD'],
    brand: 'GOURMET',
    name: 'PRODUCTS',
    year: '2021',
    media_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    order: 4
  },
  {
    type: 'image',
    category: ['FASHION'],
    brand: 'PUNJAB FASHION WEEK',
    name: 'RUNWAY',
    year: '2023',
    media_url: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=1200',
    thumbnail: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    order: 5
  }
];

async function main() {
  console.log('🌱 Seeding projects...');
  for (const project of projects) {
    await prisma.project.create({
      data: project
    });
  }
  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
