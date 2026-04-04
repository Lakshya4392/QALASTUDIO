import request from 'supertest';
import app from '../index';
import prisma from '../config/db';
import { fixtures, cleanup } from './test-utils';

describe('Auth Routes', () => {
  let adminUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create an admin user for testing
    adminUser = await fixtures.createAdminUser('testadmin', 'ADMIN');
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    // Clean relevant tables before each test
    await prisma.adminUser.deleteMany({ where: { username: { not: 'testadmin' } } });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'TestPass123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testadmin');
      expect(response.body.user).toHaveProperty('role', 'ADMIN');

      authToken = response.body.token;
    });

    it('should reject invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'TestPass123!'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should validate request body with Zod', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: '',
          password: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid request data');
    });

    it('should rate limit login attempts', async () => {
      // Make 6 requests (limit is 5 per hour)
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              username: 'testadmin',
              password: 'wrong' + i
            })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/verify', () => {
    it('should verify valid token', async () => {
      // First get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testadmin',
          password: 'TestPass123!'
        });

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${loginRes.body.token}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body.user).toHaveProperty('username', 'testadmin');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body).toHaveProperty('valid', false);
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('valid', false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toBe('Logged out');
    });
  });
});
