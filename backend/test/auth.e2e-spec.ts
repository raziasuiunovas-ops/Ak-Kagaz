import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Cleanup: delete test user
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(testEmail);

      userId = response.body.data.user.id;
      accessToken = response.body.data.accessToken;
    });

    it('should fail to register with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `weak-${Date.now()}@example.com`,
          password: '123', // Too short
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');

      accessToken = response.body.data.accessToken;
    });

    it('should fail with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data).toHaveProperty('profile');
      expect(response.body.data).toHaveProperty('roles');
    });

    it('should fail without authorization token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });
  });
});
