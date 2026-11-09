const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function split() {
  console.log('🔧 Разделяю бейджи и значки...\n');

  try {
    // Получаем текущий товар
    const currentBadge = await prisma.product.findFirst({
      where: { sku: 'AK-BADGE' },
      include: {
        images: true,
        variants: true,
        translations: true,
        prices: true,
        category: true
      }
    });

    if (!currentBadge) {
      console.log('❌ Товар AK-BADGE не найден!');
      return;
    }

    console.log(`📦 Найден товар: ${currentBadge.sku}`);
    console.log(`   Фотографий: ${currentBadge.images.length}`);
    console.log(`   Вариантов: ${currentBadge.variants.length}\n`);

    // 1. Создаём товар "Школьные значки" с вариантами детсад/1 класс
    console.log('📝 Создаю товар "Школьные значки"...');
    
    const schoolBadge = await prisma.product.create({
      data: {
        sku: 'AK-BADGE-SCHOOL',
        slug: 'ak-badge-school',
        categoryId: currentBadge.categoryId,
        status: 'ACTIVE',
        isFeatured: false,
        hasVariants: true
      }
    });

    // Переводы для школьных значков
    await prisma.productTranslation.createMany({
      data: [
        {
          productId: schoolBadge.id,
          locale: 'ru',
          name: 'Школьные значки',
          description: 'Значки для обозначения класса школьника'
        },
        {
          productId: schoolBadge.id,
          locale: 'ky',
          name: 'Мектеп значоктору',
          description: 'Окуучунун класын белгилөө үчүн значоктор'
        },
        {
          productId: schoolBadge.id,
          locale: 'en',
          name: 'School Badges',
          description: 'Badges for marking student grade'
        }
      ]
    });

    // Копируем цену
    if (currentBadge.prices.length > 0) {
      await prisma.productPrice.create({
        data: {
          productId: schoolBadge.id,
          tierId: currentBadge.prices[0].tierId,
          sellingPrice: currentBadge.prices[0].sellingPrice,
          currency: 'KGS',
          isActive: true
        }
      });
    }

    console.log('✓ Товар создан\n');

    // 2. Переносим варианты "Детский сад" и "1 класс" в новый товар
    console.log('🔄 Переношу варианты школьных значков...');
    
    const schoolVariants = currentBadge.variants.filter(v => 
      v.sku === 'AK-BADGE-KINDER' || v.sku === 'AK-BADGE-FIRST'
    );

    for (const variant of schoolVariants) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { productId: schoolBadge.id }
      });
      console.log(`  ✓ Перенесён вариант: ${variant.nameRu}`);
    }

    // 3. Удаляем варианты школьных значков из старого товара
    // (они уже перенесены, не нужно удалять)

    // 4. Обновляем название старого товара на "Бейджи пластиковые"
    console.log('\n📝 Обновляю товар "Бейджи"...');
    
    await prisma.product.update({
      where: { id: currentBadge.id },
      data: {
        sku: 'AK-BADGE-PLASTIC',
        slug: 'ak-badge-plastic'
      }
    });

    // Обновляем переводы
    await prisma.productTranslation.deleteMany({
      where: { productId: currentBadge.id }
    });

    await prisma.productTranslation.createMany({
      data: [
        {
          productId: currentBadge.id,
          locale: 'ru',
          name: 'Бейджи пластиковые на ленте',
          description: 'Пластиковые бейджи для пропусков и идентификации, в комплекте с лентой'
        },
        {
          productId: currentBadge.id,
          locale: 'ky',
          name: 'Лентадагы пластикалык бейджилер',
          description: 'Өтүү үчүн жана идентификация үчүн пластикалык бейджилер, лента менен'
        },
        {
          productId: currentBadge.id,
          locale: 'en',
          name: 'Plastic Badge Holders with Lanyard',
          description: 'Plastic badge holders for passes and identification, with lanyard included'
        }
      ]
    });

    console.log('✓ Обновлено\n');

    // Итоговый отчёт
    console.log('✅ Готово!\n');
    console.log('📊 Результат:');
    
    const allBadges = await prisma.product.findMany({
      where: {
        OR: [
          { sku: 'AK-BADGE-PLASTIC' },
          { sku: 'AK-BADGE-SCHOOL' }
        ]
      },
      include: {
        translations: { where: { locale: 'ru' } },
        variants: true
      }
    });

    allBadges.forEach(b => {
      const name = b.translations[0]?.name || 'Без названия';
      console.log(`\n📦 ${b.sku}: ${name}`);
      console.log(`   Вариантов: ${b.variants.length}`);
      b.variants.forEach(v => {
        console.log(`      - ${v.nameRu || v.name}`);
      });
    });

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

split();
