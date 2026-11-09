const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log('🔧 Исправляю SKU и флаг isFeatured...\n');

  // Обновляем глобус
  const globe = await prisma.product.findFirst({
    where: { sku: { contains: 'GLOBE' } }
  });

  if (globe) {
    await prisma.product.update({
      where: { id: globe.id },
      data: {
        sku: 'AK-GLOBE',
        isFeatured: true
      }
    });
    console.log('✓ Обновлен глобус:', globe.sku, '→ AK-GLOBE');
  }

  // Проверяем результат
  const allFeatured = await prisma.product.findMany({
    where: { isFeatured: true, status: 'ACTIVE' },
    include: {
      translations: {
        where: { locale: 'ru' },
        select: { name: true }
      }
    },
    orderBy: { sku: 'asc' }
  });

  console.log('\n📊 Все популярные товары:');
  allFeatured.forEach(p => {
    const name = p.translations[0]?.name || 'Без названия';
    console.log(`  - ${p.sku}: ${name}`);
  });

  console.log(`\n✅ Всего: ${allFeatured.length}`);
  await prisma.$disconnect();
}

fix();
