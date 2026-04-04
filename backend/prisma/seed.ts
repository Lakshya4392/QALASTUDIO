import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin User
  // Use environment variable for admin password, or generate a secure random one
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || generateSecurePassword();
  const adminPassword = await bcrypt.hash(seedAdminPassword, 12); // Use 12 rounds for better security

  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@qalastudios.com',
      password_hash: adminPassword,
      role: 'SUPER_ADMIN',
      is_active: true
    }
  });
  console.log('✅ Admin user created/updated:', admin.username);

  // Log the generated password if it was auto-generated (only in non-production)
  if (!process.env.SEED_ADMIN_PASSWORD && process.env.NODE_ENV !== 'production') {
    console.log('⚠️  IMPORTANT: Generated admin password:', seedAdminPassword);
    console.log('⚠️  Save this password! You will need it to login to the admin panel.');
  }
}

/**
 * Generate a cryptographically secure random password
 */
function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }

  return password;
}

  // 2. Create Studios (matching frontend)
  const studios = [
    {
      name: 'Simple Studio Sets',
      slug: 'qala-studio',
      tagline: 'Professional Production Space',
      description: 'A versatile 3,000 sq ft studio with modular sets, professional lighting rigs, and complete production support.',
      price: '₹5,000',
      price_note: 'per hour',
      image_url: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&q=80&w=1200',
      status: 'ACTIVE',
      order: 1,
      min_booking_duration_minutes: 60,
      max_booking_duration_hours: 8,
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
      }
    },
    {
      name: 'Golden Hour Studio',
      slug: 'golden-hour',
      tagline: 'Curated Lighting Environments',
      description: 'Experience the magic of golden hour, any hour. Our signature studio features programmable LED walls.',
      price: '₹8,000',
      price_note: 'per hour',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200',
      status: 'ACTIVE',
      order: 2,
      min_booking_duration_minutes: 60,
      max_booking_duration_hours: 8,
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
      }
    }
  ];

  for (const data of studios) {
    const existing = await prisma.studio.findFirst({ where: { slug: data.slug } });
    if (existing) {
      console.log(`ℹ️  Studio already exists: ${data.name}`);
      continue;
    }

    const { availability_rules, ...studioData } = data;
    await prisma.studio.create({
      data: {
        ...studioData,
        status: 'ACTIVE' as any,
        availability_rules: {
          create: availability_rules.create
        }
      }
    });
    console.log(`✅ Studio created: ${data.name}`);
  }

  // 3. Create Content (Hero, About, Contact, Services)
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
        philosophyText: 'Qala Studios is the crown jewel of visual production in Punjab. We combine world-class technology with industrial aesthetics to provide an unparalleled creative hub.',
        description: 'Located in the heart of Mohali\'s industrial belt, our facility serves the booming Punjabi cinematic and fashion industry with international standards. Every corner, every light, every surface has been curated for the perfect shot.',
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
      console.log(`✅ Content created: ${content.type}`);
    } else {
      console.log(`ℹ️  Content already exists: ${content.type}`);
    }
  }

  // 4. Create Services Content
  const servicesContent = await prisma.content.findFirst({
    where: { type: 'SERVICES', is_active: true }
  });
  if (!servicesContent) {
    await prisma.content.create({
      data: {
        type: 'SERVICES',
        data: {
          services: [
            { id: '1', name: 'Equipment', category: 'Gear & Tech', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1200', is_active: true },
            { id: '2', name: 'Digital', category: 'Workflow', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200', is_active: true },
            { id: '3', name: 'Locations', category: 'Scouting', img: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?auto=format&fit=crop&q=80&w=1200', is_active: true },
            { id: '4', name: 'Crew', category: 'Talent', img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200', is_active: true },
            { id: '5', name: 'Creative', category: 'Direction', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200', is_active: true },
            { id: '6', name: 'Talent', category: 'Artists', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', is_active: true },
          ]
        }
      }
    });
    console.log('✅ Services content created');
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
