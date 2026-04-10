import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAvailability() {
    console.log('🔄 Starting Availability Rule synchronization...');
    
    try {
        // Update all studios availability rules to 6 AM - 00:00
        const result = await prisma.availabilityRule.updateMany({
            where: {
                is_active: true
            },
            data: {
                start_time: '06:00',
                end_time: '00:00'
            }
        });
        
        console.log(`✅ Successfully updated ${result.count} availability rules to 06:00 - 00:00.`);
        
        // Also update studio buffer time and min duration if not set
        const studios = await prisma.studio.updateMany({
            data: {
                min_booking_duration_minutes: 60,
                buffer_time_minutes: 15
            }
        });
        
        console.log(`✅ Successfully optimized ${studios.count} studios for high-latency production environments.`);
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixAvailability();
