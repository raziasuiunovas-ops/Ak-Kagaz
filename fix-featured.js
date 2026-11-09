const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFeatured() {
  console.log('🔧 Устанавливаю флаг isFeatured для объединенных товаров...\n');

  // Устанавливаем флаг для объединенных товаров
  const result = await prisma.product.updateMany({
    where: {
      sku: {
        in: ['AK-PENCIL-MVP', 'AK-GLOBE', 'AK-BADGE']
      }
    },
    data: {
      isFeatured: true
    }
  });

  console.log(`✓ Обновлено товаров: ${result.count}`);

  // Показываем все товары с isFeatured
  const featured = await prisma.product.findMany({
    where: { isFeatured: true, status: 'ACTIVE' },
    select: {
      sku: true,
      isFeatured: true,
      translations: {
        where: { locale: 'ru' },
        select: { name: true }
      }
    }
  });

  console.log('\n📊 Товары с флагом isFeatured:');
  featured.forEach(p => {
    const name = p.translations[0]?.name || 'Без названия';
    console.log(`  - ${p.sku}: ${name}`);
  });

  console.log(`\n✅ Всего популярных товаров: ${featured.length}`);
}

fixFeatured()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
