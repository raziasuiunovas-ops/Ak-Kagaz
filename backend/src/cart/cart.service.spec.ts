import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../common/services/prisma.service';

describe('CartService', () => {
  let service: CartService;
  let prisma: PrismaService;

  const mockPrismaService: any = {
    cart: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('validateSessionId', () => {
    it('should accept valid session ID format', () => {
      // Valid format: session_<10-64 alphanumeric/underscore/dash chars>
      const validSessionIds = [
        'session_1234567890',
        'session_1234567890_abc123def456',
        'session_abcdefghij',
        'session_ABC-DEF_123',
      ];

      validSessionIds.forEach((sessionId) => {
        expect(() => service['validateSessionId'](sessionId)).not.toThrow();
      });
    });

    it('should reject invalid session ID format', () => {
      const invalidSessionIds = [
        'invalid',
        'session_short', // less than 10 chars after prefix
        'session_1234567890_abc123def456_' + 'x'.repeat(100), // more than 64 chars
        'session_with spaces',
        'session_with@special',
      ];

      invalidSessionIds.forEach((sessionId) => {
        expect(() => service['validateSessionId'](sessionId)).toThrow(BadRequestException);
      });
    });
  });

  describe('addItem', () => {
    const mockProduct = {
      id: 'product-1',
      status: 'ACTIVE',
      prices: [
        {
          sellingPrice: 500,
          isActive: true,
          isEstimate: false,
          effectiveFrom: new Date('2024-01-01'),
          effectiveUntil: null,
        },
      ],
      variants: [],
    };

    const mockCart = {
      id: 'cart-1',
      userId: 'user-1',
      sessionId: null,
      status: 'ACTIVE',
      items: [],
    };

    beforeEach(() => {
      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(null);
    });

    it('should add product to cart successfully', async () => {
      const updatedCart = {
        ...mockCart,
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            quantity: 1,
            price: 500,
            subtotal: 500,
            product: { ...mockProduct, translations: [], variants: [] },
          },
        ],
      };
      mockPrismaService.cart.findUnique.mockResolvedValue(updatedCart);

      const result = await service.addItem(
        { productId: 'product-1', quantity: 1 },
        'user-1',
        undefined,
      );

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(mockPrismaService.cartItem.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addItem({ productId: 'non-existent', quantity: 1 }, 'user-1', undefined),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when product is not ACTIVE', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        status: 'OUT_OF_STOCK',
      });

      await expect(
        service.addItem({ productId: 'product-1', quantity: 1 }, 'user-1', undefined),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.cartItem.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when product has no price', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        prices: [],
      });

      await expect(
        service.addItem({ productId: 'product-1', quantity: 1 }, 'user-1', undefined),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.cartItem.create).not.toHaveBeenCalled();
    });

    it('should update quantity if item already exists in cart', async () => {
      const existingItem = {
        id: 'item-1',
        cartId: 'cart-1',
        productId: 'product-1',
        variantId: null,
        quantity: 2,
        price: 500,
        subtotal: 1000,
      };
      mockPrismaService.cartItem.findFirst.mockResolvedValue(existingItem);

      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...existingItem,
            quantity: 3,
            subtotal: 1500,
            product: { ...mockProduct, translations: [], variants: [] },
          },
        ],
      };
      mockPrismaService.cart.findUnique.mockResolvedValue(updatedCart);

      const result = await service.addItem(
        { productId: 'product-1', quantity: 1 },
        'user-1',
        undefined,
      );

      expect(mockPrismaService.cartItem.update).toHaveBeenCalled();
      expect(mockPrismaService.cartItem.create).not.toHaveBeenCalled();
      expect(result.items[0].quantity).toBe(3);
    });

    it('should use variant price when variant is specified', async () => {
      const mockVariant = {
        id: 'variant-1',
        isActive: true,
        price: 750,
      };
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        variants: [mockVariant],
      });

      const updatedCart = {
        ...mockCart,
        items: [
          {
            id: 'item-2',
            productId: 'product-1',
            variantId: 'variant-1',
            quantity: 1,
            price: 750,
            subtotal: 750,
            product: { ...mockProduct, translations: [], variants: [mockVariant] },
            variant: mockVariant,
          },
        ],
      };
      mockPrismaService.cart.findUnique.mockResolvedValue(updatedCart);

      const result = await service.addItem(
        { productId: 'product-1', variantId: 'variant-1', quantity: 1 },
        'user-1',
        undefined,
      );

      expect(result.items[0].price).toBe(750);
    });
  });

  describe('addSessionItem', () => {
    it('should validate session ID format', async () => {
      await expect(
        service.addSessionItem('invalid-format', { productId: 'product-1', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add item to guest cart with valid session ID', async () => {
      const validSessionId = 'session_1234567890_abc123';
      const mockCart = {
        id: 'cart-guest',
        sessionId: validSessionId,
        userId: null,
        status: 'ACTIVE',
        items: [],
      };
      const mockProduct = {
        id: 'product-1',
        status: 'ACTIVE',
        prices: [
          {
            sellingPrice: 300,
            isActive: true,
            isEstimate: false,
            effectiveFrom: new Date('2024-01-01'),
            effectiveUntil: null,
          },
        ],
        variants: [],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cartItem.findFirst.mockResolvedValue(null);
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [
          {
            id: 'item-guest',
            productId: 'product-1',
            quantity: 1,
            price: 300,
            subtotal: 300,
            product: { ...mockProduct, translations: [], variants: [] },
          },
        ],
      });

      const result = await service.addSessionItem(validSessionId, {
        productId: 'product-1',
        quantity: 1,
      });

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getOrCreateCart', () => {
    it('should create new cart if none exists for user', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(null);
      const newCart = {
        id: 'new-cart',
        userId: 'user-new',
        status: 'ACTIVE',
        items: [],
      };
      mockPrismaService.cart.create.mockResolvedValue(newCart);

      const result = await service.getOrCreateCart('user-new', undefined);

      expect(mockPrismaService.cart.create).toHaveBeenCalled();
      expect(result.id).toBe('new-cart');
    });

    it('should throw BadRequestException when neither userId nor sessionId provided', async () => {
      await expect(service.getOrCreateCart(undefined, undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
