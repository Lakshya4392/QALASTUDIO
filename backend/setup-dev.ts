import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setup() {
  console.log('🔧 Setting up development database...');

  // 1. Create Admin User - always update password to ensure known credentials
  const adminPassword = await bcrypt.hash('qalaadmin2024', 10);
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      password_hash: adminPassword,
      is_active: true,
    },
    create: {
      username: 'admin',
      email: 'admin@qalastudios.com',
      password_hash: adminPassword,
      role: 'SUPER_ADMIN',
      is_active: true,
    },
  });
  console.log('✅ Admin user:', admin.username, '| password: qalaadmin2024');

  // 2. Create Studios (if not exist)
  const studios = [
    {
      name: 'Simple Studio Sets',
      slug: 'qala-studio',
      tagline: 'Professional Production Space',
      description: 'A versatile 3,000 sq ft studio with modular sets, professional lighting rigs, and complete production support.',
      price: 5000,
      price_note: 'per hour',
      image_url: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=1200',
      status: 'ACTIVE',
      order: 1,
      min_booking_duration_minutes: 60,
      max_booking_duration_hours: 8,
    },
    {
      name: 'Golden Hour Studio',
      slug: 'golden-hour',
      tagline: 'Curated Lighting Environments',
      description: 'Experience the magic of golden hour, any hour. Our signature studio features programmable LED walls.',
      price: 8000,
      price_note: 'per hour',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
      status: 'ACTIVE',
      order: 2,
      min_booking_duration_minutes: 60,
      max_booking_duration_hours: 8,
    },
  ];

  for (const data of studios) {
    const existing = await prisma.studio.findFirst({ where: { slug: data.slug } });
    if (!existing) {
      await prisma.studio.create({
        data: {
          ...data,
          availability_rules: {
            create: [
              { day_of_week: 0, start_time: '08:00', end_time: '22:00', is_active: true },
              { day_of_week: 1, start_time: '08:00', end_time: '22:00', is_active: true },
              { day_of_week: 2, start_time: '08:00', end_time: '22:00', is_active: true },
              { day_of_week: 3, start_time: '08:00', end_time: '22:00', is_active: true },
              { day_of_week: 4, start_time: '08:00', end_time: '22:00', is_active: true },
              { day_of_week: 5, start_time: '08:00', end_time: '22:00', is_active: true },
              { day_of_week: 6, start_time: '08:00', end_time: '22:00', is_active: true },
            ]
          },
          pricing_rules: {
            create: [
              { rule_type: 'HOURLY', price: data.price, priority: 0 },
            ]
          }
        }
      });
      console.log('✅ Studio created:', data.name);
    } else {
      console.log('ℹ️  Studio exists:', data.name);
    }
  }

  // 3. Create Content (if not exist)
  const contents = [
    {
      type: 'HERO',
      data: {
        tagline: 'Production House',
        headline: 'QALA STUDIOS',
        subtitle: 'Production House',
        tagline2: "Punjab's Premier Production Infrastructure",
        ctaPrimary: 'EXPLORE STUDIOS',
        ctaSecondary: 'OUR SERVICES',
        location: 'Mohali, Punjab'
      }
    },
    {
      type: 'ABOUT',
      data: {
        philosophyTitle: 'Our Philosophy',
        philosophyText: 'Qala Studios is the crown jewel of visual production in Punjab.',
        description: 'Located in the heart of Mohali\'s industrial belt, our facility serves the booming Punjabi cinematic and fashion industry with international standards.',
        quote: "We don't just provide space; we provide the canvas for your vision to come alive.",
        quoteAuthor: '— The Qala Team',
        image: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=2000'
      }
    },
    {
      type: 'CONTACT',
      data: {
        email: 'info@qalastudios.com',
        phone: '+91 98765 43210',
        address: 'Phase 8, Industrial Area, Sector 72, Mohali, Punjab - 160071',
        mapUrl: 'https://maps.google.com',
        socialLinks: {
          instagram: 'https://instagram.com/qalastudios',
          twitter: 'https://twitter.com/qalastudios',
          linkedin: 'https://linkedin.com/company/qalastudios'
        }
      }
    },
    {
      type: 'SERVICES',
      data: {
        services: [
          { id: '1', name: 'Equipment', category: 'Gear & Tech', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200', is_active: true },
          { id: '2', name: 'Digital', category: 'Workflow', image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', is_active: true },
          { id: '3', name: 'Locations', category: 'Scouting', image_url: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200', is_active: true },
          { id: '4', name: 'Crew', category: 'Talent', image_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200', is_active: true },
          { id: '5', name: 'Creative', category: 'Direction', image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', is_active: true },
          { id: '6', name: 'Talent', category: 'Artists', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', is_active: true },
        ]
      }
    }
  ];

  for (const content of contents) {
    const existing = await prisma.content.findFirst({
      where: { type: content.type, is_active: true }
    });
    if (!existing) {
      await prisma.content.create({
        data: content
      });
      console.log('✅ Content created:', content.type);
    } else {
      console.log('ℹ️  Content exists:', content.type);
    }
  }

  console.log('🎉 Setup complete!');

  // Fix existing studios that have no pricing rules
  const studiosWithoutRules = await prisma.studio.findMany({
    where: { pricing_rules: { none: {} } }
  });
  for (const s of studiosWithoutRules) {
    const price = s.price ? Number(s.price) : 5000;
    await prisma.pricingRule.create({
      data: { studio_id: s.id, rule_type: 'HOURLY', price, currency: 'INR', priority: 0 }
    });
    // Also add availability rules if missing
    const hasRules = await prisma.availabilityRule.findFirst({ where: { studio_id: s.id } });
    if (!hasRules) {
      await prisma.availabilityRule.createMany({
        data: [0,1,2,3,4,5,6].map(day => ({
          studio_id: s.id, day_of_week: day, start_time: '08:00', end_time: '22:00', is_active: true
        }))
      });
    }
    console.log(`✅ Fixed pricing/availability for studio: ${s.name}`);
  }

  await prisma.$disconnect();
}

setup().catch(e => {
  console.error('❌ Setup failed:', e);
  process.exit(1);
});
