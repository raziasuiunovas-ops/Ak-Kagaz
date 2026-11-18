import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCartItems() {
  try {
    console.log('🛒 Проверка товаров в корзинах...\n');
    
    const now = new Date();
    
    // Получаем все активные корзины
    const carts = await prisma.cart.findMany({
      where: { status: 'ACTIVE' },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: {
                  select: { locale: true, name: true },
                  take: 1,
                },
                prices: {
                  where: {
                    AND: [
                      { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
                      { effectiveFrom: { lte: now } },
                      { OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }] },
                    ],
                  },
                  select: { 
                    sellingPrice: true, 
                    currency: true, 
                    isActive: true, 
                    isEstimate: true, 
                    effectiveFrom: true, 
                    effectiveUntil: true 
                  },
                },
              },
            },
          },
        },
      },
    });
    
    console.log(`📊 Всего активных корзин: ${carts.length}\n`);
    
    for (const cart of carts) {
      const identifier = cart.userId || cart.sessionId || cart.id;
      console.log(`\n🛒 Корзина: ${identifier}`);
      console.log(`   Товаров: ${cart.items.length}`);
      
      if (cart.items.length === 0) continue;
      
      for (const item of cart.items) {
        const name = item.product.translations[0]?.name || item.product.sku;
        const storedPrice = Number(item.price);
        
        // Проверяем, является ли цена в корзине оценочной
        const confirmedAtStoredPrice = item.product.prices.some((price: any) =>
          price.isActive && !price.isEstimate && Number(price.sellingPrice) === storedPrice
          && new Date(price.effectiveFrom).getTime() <= now.getTime()
          && (!price.effectiveUntil || new Date(price.effectiveUntil).getTime() >= now.getTime())
        );
        
        const priceIsEstimate = !confirmedAtStoredPrice;
        
        console.log(`   - ${name}`);
        console.log(`     Цена в корзине: ${storedPrice}`);
        console.log(`     priceIsEstimate: ${priceIsEstimate}`);
        console.log(`     Доступные цены товара:`);
        for (const price of item.product.prices) {
          console.log(`       * ${price.sellingPrice} (isActive=${price.isActive}, isEstimate=${price.isEstimate})`);
        }
        
        if (priceIsEstimate) {
          console.log(`     ⚠️  ПРОБЛЕМА: Этот товар блокирует checkout!`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkCartItems();
