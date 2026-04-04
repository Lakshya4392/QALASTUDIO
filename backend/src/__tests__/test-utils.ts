import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export const fixtures = {
  // Studios
  async createStudio(data: Partial<any> = {}): Promise<any> {
    return await prisma.studio.create({
      data: {
        name: `Test Studio ${randomUUID().slice(0, 8)}`,
        slug: `test-studio-${Date.now()}`,
        tagline: 'Premium test studio',
        description: 'A beautiful studio for testing',
        price: 150,
        is_active: true,
        order: 1,
        availability_rules: {
          create: [
            { day_of_week: 1, start_time: '09:00', end_time: '17:00', is_active: true },
            { day_of_week: 2, start_time: '09:00', end_time: '17:00', is_active: true },
            { day_of_week: 3, start_time: '09:00', end_time: '17:00', is_active: true },
            { day_of_week: 4, start_time: '09:00', end_time: '17:00', is_active: true },
            { day_of_week: 5, start_time: '09:00', end_time: '17:00', is_active: true },
            { day_of_week: 6, is_active: false },
            { day_of_week: 0, is_active: false },
          ]
        },
        pricing_rules: {
          create: [
            {
              rule_type: 'HOURLY',
              priority: 1,
              price: 75,
              currency: 'USD',
            }
          ]
        }
      } as any
    });
  },

  async createMultipleStudios(count: number): Promise<any[]> {
    const studios = [];
    for (let i = 0; i < count; i++) {
      studios.push(await this.createStudio({ name: `Studio ${i + 1}`, order: i + 1 }));
    }
    return studios;
  },

  // User Details
  async createUserDetails(data: Partial<any> = {}): Promise<any> {
    return await prisma.userDetails.create({
      data: {
        full_name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        phone: `+1${Math.floor(Math.random() * 10000000000)}`,
        company: 'Test Company',
        special_requirements: null,
        ...data
      }
    });
  },

  // Bookings
  async createBooking(data: Partial<any> = {}): Promise<any> {
    const studio = data.studio_id
      ? await prisma.studio.findUnique({ where: { id: data.studio_id } })
      : await prisma.studio.findFirst();

    if (!studio) {
      throw new Error('No studio found for booking');
    }

    const userDetails = data.user_details_id
      ? await prisma.userDetails.findUnique({ where: { id: data.user_details_id } })
      : await fixtures.createUserDetails();

    return await prisma.booking.create({
      data: {
        studio_id: studio.id,
        user_details_id: userDetails.id,
        start_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        end_datetime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        total_price: 150,
        status: 'CONFIRMED',
        timezone: 'UTC',
        pricing_snapshot: { total: 150, currency: 'USD', breakdown: [] },
        ...data
      } as any,
      include: {
        studio: true,
        user_details: true,
      }
    });
  },

  // Admin User
  async createAdminUser(username: string = 'admin', email: string = 'admin@example.com', role: string = 'ADMIN'): Promise<any> {
    const passwordHash = await bcrypt.hash('TestPass123!', 12);

    return await prisma.adminUser.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        role: role as any, // Cast to any to satisfy Prisma enum type in tests
        is_active: true,
      }
    });
  },

  // Content
  async createContent(type: 'HERO' | 'ABOUT' | 'CONTACT' | 'SERVICES' | 'FOOTER' | 'SEO', data: any): Promise<any> {
    return await prisma.content.upsert({
      where: { type_is_active: { type, is_active: true } },
      update: { data, updated_at: new Date() },
      create: { type, data, is_active: true },
    });
  },

  // Enquiry
  async createEnquiry(data: Partial<any> = {}): Promise<any> {
    return await prisma.enquiry.create({
      data: {
        name: `Test Enquirer ${Date.now()}`,
        email: `enquiry${Date.now()}@example.com`,
        phone: `+1${Math.floor(Math.random() * 10000000000)}`,
        subject: 'Test Subject',
        message: 'This is a test enquiry',
        status: 'NEW',
        source: 'WEBSITE',
        ...data
      }
    });
  }
};

export const cleanup = async () => {
  await prisma.enquiry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.bookingLock.deleteMany();
  await prisma.userDetails.deleteMany();
  await prisma.content.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.studio.deleteMany();
};
