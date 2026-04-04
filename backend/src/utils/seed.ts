import bcrypt from 'bcryptjs';
import prisma from '../config/db';

/**
 * Seed the database with initial studios, pricing rules, and admin user.
 * Run with: npx tsx src/utils/seed.ts
 */
async function seed() {
    console.log('🌱 Seeding database...');

    // Create Admin User (if not exists)
    const adminPassword = await bcrypt.hash('qalaadmin2024', 10);
    const adminUser = await prisma.adminUser.upsert({
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
    console.log('✅ Created/Updated: Admin User (admin@qalastudios.com)');

    // Create studios matching the frontend hardcoded IDs
    const studios = [
        {
            id: 'fc85f7ca-7749-4cf2-8957-c3e5a53863f8',
            name: 'Studio 1',
            slug: 'studio-1',
            timezone: 'Asia/Kolkata',
            min_booking_duration_minutes: 60,
            buffer_time_minutes: 15,
            order: 1,
        },
        {
            id: '2',
            name: 'Stage C',
            slug: 'stage-c',
            timezone: 'Asia/Kolkata',
            min_booking_duration_minutes: 120,
            buffer_time_minutes: 30,
            order: 2,
        },
        {
            id: '3',
            name: 'Studio 4',
            slug: 'studio-4',
            timezone: 'Asia/Kolkata',
            min_booking_duration_minutes: 60,
            buffer_time_minutes: 15,
            order: 3,
        },
        {
            id: '4',
            name: 'Studio 5',
            slug: 'studio-5',
            timezone: 'Asia/Kolkata',
            min_booking_duration_minutes: 60,
            buffer_time_minutes: 15,
            order: 4,
        },
    ];

    for (const studio of studios) {
        await prisma.studio.upsert({
            where: { id: studio.id },
            update: studio,
            create: studio,
        });
        console.log(`✅ Created/Updated: ${studio.name}`);
    }

    // Create pricing rules for each studio
    for (const studio of studios) {
        await prisma.pricingRule.upsert({
            where: { id: `${studio.id}-hourly` },
            update: {
                price: 150,
                currency: 'USD',
            },
            create: {
                id: `${studio.id}-hourly`,
                studio_id: studio.id,
                rule_type: 'HOURLY',
                price: 150,
                currency: 'USD',
                priority: 0,
            },
        });
    }
    console.log('✅ Created pricing rules');

    // Create availability rules (Mon-Sat, 9 AM - 9 PM)
    const days = [1, 2, 3, 4, 5, 6]; // Mon-Sat
    for (const studio of studios) {
        for (const day of days) {
            await prisma.availabilityRule.upsert({
                where: { id: `${studio.id}-day-${day}` },
                update: {},
                create: {
                    id: `${studio.id}-day-${day}`,
                    studio_id: studio.id,
                    day_of_week: day,
                    start_time: '09:00',
                    end_time: '21:00',
                    is_active: true,
                },
            });
        }
    }
    console.log('✅ Created availability rules');

    console.log('🎉 Seeding complete!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
