import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/common/services/prisma.service';

describe('E-commerce Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let adminAccessToken: string;
  let userId: string;
  let adminUserId: string;
  let cartId: string;
  let orderId: string;

  const testEmail = `ecommerce-${Date.now()}@example.com`;
  const adminEmail = `admin-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup: Register regular user
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        firstName: 'ECommerce',
        lastName: 'Tester',
      });

    userId = registerResponse.body.data.user.id;
    accessToken = registerResponse.body.data.accessToken;

    // Setup: Register admin user
    const adminRegisterResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: adminEmail,
        password: testPassword,
        firstName: 'Admin',
        lastName: 'User',
      });

    adminUserId = adminRegisterResponse.body.data.user.id;
    adminAccessToken = adminRegisterResponse.body.data.accessToken;

    // Assign ADMIN role to admin user
    const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

    if (customerRole) {
      await prisma.userRole.deleteMany({ where: { userId: adminUserId, roleId: customerRole.id } });
    }

    if (adminRole) {
      await prisma.userRole.create({
        data: { userId: adminUserId, roleId: adminRole.id },
      });
    }
  });

  afterAll(async () => {
    // Cleanup users and related data
    if (userId) {
      await prisma.cartItem.deleteMany({ where: { cart: { userId } } }).catch(() => {});
      await prisma.cart.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.userProfile.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.userRole.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }

    if (adminUserId) {
      await prisma.userProfile.deleteMany({ where: { userId: adminUserId } }).catch(() => {});
      await prisma.userRole.deleteMany({ where: { userId: adminUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
    }

    await app.close();
  });

  describe('Auth & RBAC Verification', () => {
    it('should authenticate user successfully', () => {
      expect(accessToken).toBeDefined();
      expect(userId).toBeDefined();
    });

    it('should authenticate admin successfully', () => {
      expect(adminAccessToken).toBeDefined();
      expect(adminUserId).toBeDefined();
    });

    it('should deny access without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/cart')
        .expect(401);
    });
  });

  describe('Cart Operations', () => {
    let testProductId: string;

    beforeAll(async () => {
      // Get any existing active product with price
      const product = await prisma.product.findFirst({
        where: { status: 'ACTIVE' },
        include: {
          prices: {
            where: {
              isActive: true,
              effectiveFrom: { lte: new Date() },
              OR: [
                { effectiveUntil: null },
                { effectiveUntil: { gte: new Date() } },
              ],
            },
            take: 1,
          },
        },
      });

      if (product && product.prices.length > 0) {
        testProductId = product.id;
      }
    });

    it('should add product to cart', async () => {
      if (!testProductId) {
        console.warn('No test product available, skipping cart test');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          productId: testProductId,
          quantity: 1,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.items).toBeDefined();

      cartId = response.body.data.id;
    });

    it('should get current cart', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cart')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('Data Isolation', () => {
    it('admin should not access customer cart', async () => {
      if (!cartId) return;

      // Admin trying to get customer's cart should get their own empty cart, not customer's
      const response = await request(app.getHttpServer())
        .get('/api/cart')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Admin should have their own cart, not the customer's cart
      expect(response.body.data.id).not.toBe(cartId);
    });
  });
});

