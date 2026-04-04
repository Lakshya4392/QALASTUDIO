import request from 'supertest';
import app from '../index';
import prisma from '../config/db';
import { fixtures, cleanup } from './test-utils';

describe('Studios Routes', () => {
  let adminToken: string;
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

    // Create a test studio
    testStudio = await fixtures.createStudio();
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    // Clean additional data
  });

  afterEach(async () => {
    // Clean up created studios except the fixture
    await prisma.studio.deleteMany({
      where: { id: { not: testStudio.id } }
    });
  });

  describe('GET /api/studios', () => {
    it('should fetch all studios (public endpoint)', async () => {
      const response = await request(app)
        .get('/api/studios')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter active studios', async () => {
      const response = await request(app)
        .get('/api/studios?active=true')
        .expect(200);

      response.body.forEach((studio: any) => {
        expect(studio.is_active).toBe(true);
      });
    });

    it('should order studios by order field', async () => {
      const response = await request(app)
        .get('/api/studios')
        .expect(200);

      for (let i = 1; i < response.body.length; i++) {
        expect(response.body[i].order).toBeGreaterThanOrEqual(response.body[i-1].order);
      }
    });
  });

  describe('GET /api/studios/:id', () => {
    it('should fetch single studio with relations', async () => {
      const response = await request(app)
        .get(`/api/studios/${testStudio.id}`)
        .expect(200);

      expect(response.body.id).toBe(testStudio.id);
      expect(response.body).toHaveProperty('availability_rules');
      expect(response.body).toHaveProperty('pricing_rules');
    });

    it('should resolve studio by slug', async () => {
      const response = await request(app)
        .get(`/api/studios/${testStudio.slug}`)
        .expect(200);

      expect(response.body.id).toBe(testStudio.id);
    });

    it('should return 404 for non-existent studio', async () => {
      const response = await request(app)
        .get('/api/studios/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Studio not found');
    });
  });

  describe('POST /api/studios', () => {
    it('should create studio (requires auth)', async () => {
      const newStudio = {
        name: 'New Test Studio',
        slug: 'new-test-studio',
        tagline: 'Amazing new studio',
        description: 'A brand new studio for testing',
        price: 200,
        is_active: true,
        order: 999,
        features: ['WiFi', 'Sound System', 'Lighting'],
        availability_rules: [
          { day_of_week: 1, is_available: true, open_time: '08:00', close_time: '18:00' }
        ]
      };

      const response = await request(app)
        .post('/api/studios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newStudio)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.studio.name).toBe(newStudio.name);
      expect(response.body.studio.slug).toBe(newStudio.slug);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/studios')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/studios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(500);

      // Prisma will throw validation error
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/studios/:id', () => {
    it('should update studio (requires auth)', async () => {
      const updateData = {
        name: 'Updated Studio Name',
        tagline: 'Updated tagline',
        price: 250
      };

      const response = await request(app)
        .put(`/api/studios/${testStudio.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.studio.name).toBe(updateData.name);
      expect(response.body.studio.price).toBe(updateData.price);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put(`/api/studios/${testStudio.id}`)
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/studios/:id', () => {
    it('should delete studio (requires auth)', async () => {
      const newStudio = await fixtures.createStudio({ name: 'To Delete' });

      const response = await request(app)
        .delete(`/api/studios/${newStudio.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const check = await request(app)
        .get(`/api/studios/${newStudio.id}`)
        .expect(404);
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/studios/${testStudio.id}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/studios/:id/toggle', () => {
    it('should toggle studio active status (requires auth)', async () => {
      const response = await request(app)
        .post(`/api/studios/${testStudio.id}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.studio.is_active).toBe(!testStudio.is_active);
    });
  });

  describe('GET /api/studios/:id/price', () => {
    it('should calculate price for given datetime range', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(Date.now() + 25 * 60 * 60 * 1000);

      const response = await request(app)
        .get(`/api/studios/${testStudio.id}/price`)
        .query({
          start_datetime: tomorrow.toISOString(),
          end_datetime: dayAfter.toISOString()
        })
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('currency', 'USD');
      expect(Number(response.body.total)).toBeGreaterThan(0);
    });

    it('should require start_datetime and end_datetime', async () => {
      const response = await request(app)
        .get(`/api/studios/${testStudio.id}/price`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'start_datetime and end_datetime are required');
    });

    it('should validate date format', async () => {
      const response = await request(app)
        .get(`/api/studios/${testStudio.id}/price`)
        .query({
          start_datetime: 'invalid-date',
          end_datetime: 'also-invalid'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid date format');
    });

    it('should handle non-existent studio', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(Date.now() + 25 * 60 * 60 * 1000);

      const response = await request(app)
        .get('/api/studios/non-existent/price')
        .query({
          start_datetime: tomorrow.toISOString(),
          end_datetime: dayAfter.toISOString()
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Studio not found');
    });
  });
});
