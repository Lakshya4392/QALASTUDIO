import request from 'supertest';
import app from '../index';
import prisma from '../config/db';
import { fixtures, cleanup } from './test-utils';

describe('Admin Bookings Routes', () => {
  let adminToken: string;
  let testBooking: any;
  let testStudio: any;

  beforeAll(async () => {
    // Create admin user and get token
    await fixtures.createAdminUser('testadmin', 'ADMIN');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testadmin',
        password: 'TestPass123!'
      });
    adminToken = loginRes.body.token;

    // Create test data
    testStudio = await fixtures.createStudio();
    const userDetails = await fixtures.createUserDetails();
    testBooking = await fixtures.createBooking({
      studio_id: testStudio.id,
      user_details_id: userDetails.id,
      status: 'CONFIRMED'
    });
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('GET /api/admin/bookings', () => {
    it('should fetch all bookings (requires auth)', async () => {
      const response = await request(app)
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('bookings');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/admin/bookings?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/admin/bookings?status=confirmed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.bookings.forEach((booking: any) => {
        expect(booking.status).toBe('confirmed');
      });
    });

    it('should filter by studio_id', async () => {
      const response = await request(app)
        .get(`/api/admin/bookings?studio_id=${testStudio.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.bookings.forEach((booking: any) => {
        expect(booking.studioId).toBe(testStudio.id);
      });
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/admin/bookings')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/admin/bookings/stats/overview', () => {
    it('should return booking statistics (requires auth)', async () => {
      const response = await request(app)
        .get('/api/admin/bookings/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('confirmed');
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('cancelled');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(typeof response.body.total).toBe('number');
      expect(typeof response.body.totalRevenue).toBe('number');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/admin/bookings/stats/overview')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/admin/bookings/:id/status', () => {
    it('should update booking status (requires auth)', async () => {
      const response = await request(app)
        .put(`/api/admin/bookings/${testBooking.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking.status).toBe('CANCELLED');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/admin/bookings/${testBooking.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid status');
    });

    it('should require status field', async () => {
      const response = await request(app)
        .put(`/api/admin/bookings/${testBooking.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid status');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put(`/api/admin/bookings/${testBooking.id}/status`)
        .send({ status: 'cancelled' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/admin/bookings/:id', () => {
    it('should delete booking (requires auth)', async () => {
      const newBooking = await fixtures.createBooking({
        studio_id: testStudio.id,
        status: 'CANCELLED'
      });

      const response = await request(app)
        .delete(`/api/admin/bookings/${newBooking.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await expect(
        prisma.booking.findUnique({ where: { id: newBooking.id } })
      ).resolves.toBeNull();
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/admin/bookings/${testBooking.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
