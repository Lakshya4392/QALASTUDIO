import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function generateSecurePassword(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

async function upsertContent(type: string, data: object) {
  const existing = await prisma.content.findFirst({ where: { type: type as any, is_active: true } });
  if (existing) {
    await prisma.content.update({ where: { id: existing.id }, data: { data: data as any } });
    console.log(`✅ Content updated: ${type}`);
  } else {
    await prisma.content.create({ data: { type: type as any, data: data as any, is_active: true, version: 1 } });
    console.log(`✅ Content created: ${type}`);
  }
}

async function main() {
  console.log('🌱 Starting database seed...');

  // ── 1. Admin User ──────────────────────────────────────────────────────────
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || generateSecurePassword();
  const adminPassword = await bcrypt.hash(seedAdminPassword, 12);

  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@qalastudios.com',
      password_hash: adminPassword,
      role: 'SUPER_ADMIN',
      is_active: true,
    },
  });
  console.log('✅ Admin user ready');
  if (!process.env.SEED_ADMIN_PASSWORD && process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Admin password:', seedAdminPassword, '— save this!');
  }

  // ── 2. Studios ─────────────────────────────────────────────────────────────
  const studioData = [
    {
      name: 'Simple Studio Sets',
      slug: 'qala-studio',
      tagline: 'Professional Production Space',
      description: 'A versatile 3,000 sq ft studio with modular sets, professional lighting rigs, and complete production support.',
      price: 5000,
      price_note: 'per hour',
      image_url: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=1200',
      order: 1,
    },
    {
      name: 'Golden Hour Studio',
      slug: 'golden-hour',
      tagline: 'Curated Lighting Environments',
      description: 'Experience the magic of golden hour, any hour. Our signature studio features programmable LED walls.',
      price: 8000,
      price_note: 'per hour',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
      order: 2,
    },
  ];

  for (const s of studioData) {
    const existing = await prisma.studio.findFirst({ where: { slug: s.slug } });
    if (existing) {
      console.log(`ℹ️  Studio exists: ${s.name}`);
      // Ensure pricing rule exists
      const hasPricing = await prisma.pricingRule.findFirst({ where: { studio_id: existing.id } });
      if (!hasPricing) {
        await prisma.pricingRule.create({
          data: { studio_id: existing.id, rule_type: 'HOURLY', price: s.price, currency: 'INR', priority: 0 },
        });
        console.log(`  ✅ Pricing rule added for ${s.name}`);
      }
      // Ensure availability rules exist
      const hasRules = await prisma.availabilityRule.findFirst({ where: { studio_id: existing.id } });
      if (!hasRules) {
        await prisma.availabilityRule.createMany({
          data: [0, 1, 2, 3, 4, 5, 6].map(day => ({
            studio_id: existing.id, day_of_week: day, start_time: '06:00', end_time: '00:00', is_active: true,
          })),
        });
        console.log(`  ✅ Availability rules added for ${s.name}`);
      }
      continue;
    }

    const studio = await prisma.studio.create({
      data: {
        name: s.name, slug: s.slug, tagline: s.tagline, description: s.description,
        price: s.price, price_note: s.price_note, image_url: s.image_url,
        status: 'ACTIVE', order: s.order, is_active: true,
        min_booking_duration_minutes: 60, max_booking_duration_hours: 8,
        availability_rules: {
          create: [0, 1, 2, 3, 4, 5, 6].map(day => ({
            day_of_week: day, start_time: '06:00', end_time: '00:00', is_active: true,
          })),
        },
      },
    });

    await prisma.pricingRule.create({
      data: { studio_id: studio.id, rule_type: 'HOURLY', price: s.price, currency: 'INR', priority: 0 },
    });

    console.log(`✅ Studio created: ${s.name}`);
  }

  // ── 3. Core Content ────────────────────────────────────────────────────────
  await upsertContent('HERO', {
    tagline: 'Production House',
    headline: 'QALA STUDIOS',
    subtitle: 'Production House',
    tagline2: "Punjab's Premier Production Infrastructure",
    ctaPrimary: 'EXPLORE STUDIOS',
    ctaSecondary: 'OUR SERVICES',
    location: 'Mohali, Punjab',
  });

  await upsertContent('ABOUT', {
    philosophyTitle: 'Our Philosophy',
    philosophyText: 'Qala Studios is the crown jewel of visual production in Punjab.',
    description: "Located in the heart of Mohali's industrial belt, our facility serves the booming Punjabi cinematic and fashion industry.",
    quote: "We don't just provide space; we provide the canvas for your vision to come alive.",
    quoteAuthor: '— The Qala Team',
    image: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=2000',
  });

  await upsertContent('CONTACT', {
    email: 'info@qalastudios.com',
    phone: '+91 98765 43210',
    address: 'Phase 8, Industrial Area, Sector 72, Mohali, Punjab - 160071',
    mapUrl: 'https://maps.google.com',
    socialLinks: { instagram: '', twitter: '', linkedin: '' },
  });

  await upsertContent('SERVICES', {
    services: [
      { id: '1', name: 'Equipment', category: 'Gear & Tech', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200', is_active: true },
      { id: '2', name: 'Digital', category: 'Workflow', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', is_active: true },
      { id: '3', name: 'Locations', category: 'Scouting', img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200', is_active: true },
      { id: '4', name: 'Crew', category: 'Talent', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200', is_active: true },
      { id: '5', name: 'Creative', category: 'Direction', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', is_active: true },
      { id: '6', name: 'Talent', category: 'Artists', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', is_active: true },
    ],
  });

  // ── 4. Golden Hour Content (sets for admin to manage) ──────────────────────
  await upsertContent('GOLDEN_HOUR', {
    sectionTag: 'GOLDEN HOUR COLLECTIONS',
    sectionTitle: 'GOLDEN HOUR',
    sectionDescription: '12 WORLD-CLASS SETS DESIGNED FOR CINEMATIC STORYTELLING. EXPLORE OUR CURATED COLLECTION.',
    mapTitle: 'BLUEPRINT MAP',
    mapDescription: 'CLICK ANY ROOM TO VIEW DETAILS. HOVER FOR PREVIEW.',
    btsLabel: 'BTS PREVIEW',
    dimensionsLabel: 'DIMENSIONS',
    propsLabel: 'INCLUDED PROPS',
    availabilityLabel: 'AVAILABILITY STATUS',
    availabilityText: 'READY FOR BOOKING',
    primaryCtaLabel: 'BOOK THIS SET',
    secondaryCtaLabel: 'ADD TO PRODUCTION CART',
  });

  console.log('Seeding Golden Hour Sets...');
  const ghSets = [
    { name: 'Golden Hour Lounge', category: 'Indoor', theme: 'Modern', props: ['Vintage Sofa', 'Marble Tables'], dimensions: '40 x 60 ft', image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-photo-studio-41481-large.mp4', description: "Our flagship space capturing Mohali's iconic sunset vibes.", coords_x: 50, coords_y: 50, coords_w: 100, coords_h: 100, price: 5000, order: 1 },
    { name: 'Conversion Room', category: 'Indoor', theme: 'Minimalist', props: ['Rolling Walls', 'Softbox Grid'], dimensions: '35 x 50 ft', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-professional-photographer-working-in-a-studio-41477-large.mp4', description: 'A versatile blank canvas for high-concept editorial builds.', coords_x: 160, coords_y: 50, coords_w: 100, coords_h: 100, price: 4500, order: 2 },
    { name: 'Dreamcatcher Den', category: 'Indoor', theme: 'Rustic', props: ['Bamboo Hangings', 'Macramé'], dimensions: '25 x 30 ft', image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-taking-pictures-of-a-model-41479-large.mp4', description: 'Intimate texture-rich environment for lifestyle brand stories.', coords_x: 270, coords_y: 50, coords_w: 80, coords_h: 100, price: 3000, order: 3 },
    { name: 'The Red Arch', category: 'Indoor', theme: 'Royal', props: ['Velvet Curtains', 'Gold Pedestals'], dimensions: '30 x 45 ft', image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-girl-with-red-dress-dancing-under-the-sun-41490-large.mp4', description: 'Striking architectural curves with high-contrast lighting.', coords_x: 50, coords_y: 160, coords_w: 100, coords_h: 80, price: 6000, order: 4 },
    { name: 'Backdrop Boulevard', category: 'Indoor', theme: 'Industrial', props: ['Motorized Tracks', 'Steel Beams'], dimensions: '20 x 120 ft', image_url: 'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-front-of-a-white-background-41480-large.mp4', description: 'Massive corridor for automotive and large-scale fashion walk-throughs.', coords_x: 160, coords_y: 160, coords_w: 190, coords_h: 80, price: 8000, order: 5 },
    { name: 'The Prism Panel', category: 'Indoor', theme: 'Modern', props: ['Glass Mirrors', 'Neon Bars'], dimensions: '28 x 35 ft', image_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-a-studio-with-lights-41484-large.mp4', description: 'High-key beauty zone with complex reflective surfaces.', coords_x: 50, coords_y: 250, coords_w: 120, coords_h: 100, price: 5500, order: 6 },
    { name: 'Heritage Wall', category: 'Indoor', theme: 'Vintage', props: ['Antique Frames', 'Old Books'], dimensions: '30 x 40 ft', image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-man-and-woman-dancing-the-tango-in-a-studio-41485-large.mp4', description: 'Hand-crafted stone and aged textures for cinematic portraits.', coords_x: 180, coords_y: 250, coords_w: 170, coords_h: 100, price: 4000, order: 7 },
    { name: 'Nature Niche', category: 'Outdoor', theme: 'Rustic', props: ['Raw Stone Walls', 'Plants'], dimensions: '40 x 80 ft', image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-beautiful-resort-area-41482-large.mp4', description: "Botanical sanctuary where Punjab's wild flora meets stone.", coords_x: 360, coords_y: 50, coords_w: 100, coords_h: 150, price: 7000, order: 8 },
    { name: 'Echoes of Rome', category: 'Outdoor', theme: 'Royal', props: ['White Columns', 'Marble Steps'], dimensions: '50 x 100 ft', image_url: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-model-walking-in-a-white-dress-41486-large.mp4', description: 'Grand white colonnades for epic-scale cinematic storytelling.', coords_x: 470, coords_y: 50, coords_w: 120, coords_h: 150, price: 9000, order: 9 },
    { name: 'Golden Steps', category: 'Outdoor', theme: 'Modern', props: ['Tiered Concrete', 'LED strips'], dimensions: '30 x 60 ft', image_url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-on-the-steps-of-a-museum-41487-large.mp4', description: 'Tiered platforms oriented for surgical sunset lighting.', coords_x: 360, coords_y: 210, coords_w: 100, coords_h: 140, price: 4500, order: 10 },
    { name: 'White Echo', category: 'Outdoor', theme: 'Minimalist', props: ['White Bounce Walls'], dimensions: '40 x 50 ft', image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-minimalist-setting-41488-large.mp4', description: 'Stark white surfaces where shadows become the main character.', coords_x: 470, coords_y: 210, coords_w: 120, coords_h: 140, price: 4000, order: 11 },
    { name: 'The Arch Vault', category: 'Outdoor', theme: 'Industrial', props: ['Iron Arches', 'Brick Floors'], dimensions: '60 x 90 ft', image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200', bts_video: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-hip-hop-in-an-industrial-area-41489-large.mp4', description: 'Dramatic open-air ironwork under the vast Mohali sky.', coords_x: 360, coords_y: 360, coords_w: 230, coords_h: 80, price: 7500, order: 12 },
  ];

  for (const set of ghSets) {
    await prisma.goldenHourSet.upsert({
      where: { id: `seed_${set.name.replace(/\s+/g, '_')}` },
      update: set,
      create: { ...set, id: `seed_${set.name.replace(/\s+/g, '_')}` }
    });
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
