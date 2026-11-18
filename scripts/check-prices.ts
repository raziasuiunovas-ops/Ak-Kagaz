import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPrices() {
  try {
    console.log('🔍 Проверка цен в базе данных...\n');
    
    const now = new Date();
    
    // Получаем все цены
    const allPrices = await prisma.productPrice.findMany({
      include: {
        product: {
          select: {
            sku: true,
            status: true,
            translations: {
              select: { locale: true, name: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    
    console.log(`📊 Всего цен: ${allPrices.length}\n`);
    
    // Группируем цены
    const activePrices = allPrices.filter(p => p.isActive && !p.isEstimate);
    const estimatePrices = allPrices.filter(p => p.isEstimate);
    const inactivePrices = allPrices.filter(p => !p.isActive && !p.isEstimate);
    
    console.log(`✅ Активные цены (isActive=true, isEstimate=false): ${activePrices.length}`);
    console.log(`⚠️  Цены-оценки (isEstimate=true): ${estimatePrices.length}`);
    console.log(`❌ Неактивные цены: ${inactivePrices.length}\n`);
    
    // Проверяем товары без активных цен
    const productsWithoutActivePrices = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        prices: {
          none: {
            isActive: true,
            isEstimate: false,
            effectiveFrom: { lte: now },
            OR: [
              { effectiveUntil: null },
              { effectiveUntil: { gte: now } },
            ],
          },
        },
      },
      include: {
        translations: {
          select: { locale: true, name: true },
          take: 1,
        },
        prices: true,
      },
    });
    
    if (productsWithoutActivePrices.length > 0) {
      console.log(`\n⚠️  Товары без активных цен (${productsWithoutActivePrices.length}):`);
      for (const product of productsWithoutActivePrices) {
        const name = product.translations[0]?.name || product.sku;
        console.log(`   - ${name} (SKU: ${product.sku})`);
        console.log(`     Prices: ${product.prices.map(p => `${p.isActive ? 'active' : 'inactive'}, ${p.isEstimate ? 'estimate' : 'confirmed'}`).join('; ')}`);
      }
    } else {
      console.log('\n✅ Все активные товары имеют активные цены!');
    }
    
    // Показываем примеры цен-оценок
    if (estimatePrices.length > 0) {
      console.log(`\n⚠️  Примеры товаров с ценами-оценками:`);
      const examples = estimatePrices.slice(0, 5);
      for (const price of examples) {
        const name = price.product.translations[0]?.name || price.product.sku;
        console.log(`   - ${name}: ${price.sellingPrice} ${price.currency} (isActive=${price.isActive}, isEstimate=${price.isEstimate})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrices();
