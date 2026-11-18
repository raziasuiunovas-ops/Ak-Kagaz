import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Активация всех цен товаров...\n');

  try {
    // Обновляем все оценочные цены: делаем их подтверждёнными и активными
    const result = await prisma.productPrice.updateMany({
      where: {
        isEstimate: true,
        isActive: false,
      },
      data: {
        isEstimate: false,
        isActive: true,
      },
    });

    console.log(`✅ Активировано цен: ${result.count}`);

    // Проверим результат
    const activeCount = await prisma.productPrice.count({
      where: {
        isEstimate: false,
        isActive: true,
      },
    });

    const estimateCount = await prisma.productPrice.count({
      where: {
        isEstimate: true,
      },
    });

    console.log(`\n📊 Статистика:`);
    console.log(`   Активных подтверждённых цен: ${activeCount}`);
    console.log(`   Оценочных цен: ${estimateCount}`);

    // Также обновим статус товаров без активных вариантов на ACTIVE
    const productsResult = await prisma.product.updateMany({
      where: {
        status: 'INACTIVE',
        hasVariants: false,
      },
      data: {
        status: 'ACTIVE',
      },
    });

    console.log(`\n✅ Активировано товаров: ${productsResult.count}`);

    console.log('\n🎉 Готово! Теперь можно оформлять заказы.');
  } catch (error) {
    console.error('❌ Ошибка при активации цен:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Критическая ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
