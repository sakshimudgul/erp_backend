const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/config/database');
const { User } = require('../../src/models');

describe('User Integration Tests', () => {
  let adminToken;
  let userToken;
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create admin user
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
      isVerified: true
    });

    // Login as admin
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });

    adminToken = loginResponse.body.data.token;

    // Create regular user
    testUser = await User.create({
      email: 'user@example.com',
      password: 'user123',
      firstName: 'Regular',
      lastName: 'User',
      role: 'student',
      isVerified: true
    });

    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'user123'
      });

    userToken = userLoginResponse.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'user@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '9876543210'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toHaveProperty('firstName', 'Updated');
      expect(response.body.data.user).toHaveProperty('lastName', 'Name');
    });
  });

  describe('GET /api/users', () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should fail for non-admin user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID (admin only)', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toHaveProperty('id', testUser.id);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user (admin only)', async () => {
      const updates = {
        isVerified: true,
        role: 'faculty'
      };

      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.user).toHaveProperty('role', 'faculty');
    });
  });
});