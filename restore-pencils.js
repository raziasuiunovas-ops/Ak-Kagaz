const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Читаем .env файл вручную
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function restore() {
  console.log('🔧 Восстановление пеналов...\n');

  try {
    // 1. Сначала найдем текущий MVP пенал
    const mvpPencil = await prisma.product.findFirst({
      where: { sku: 'AK-PENCIL-MVP' },
      include: {
        images: true,
        variants: true,
        translations: true,
        prices: true
      }
    });

    if (!mvpPencil) {
      console.log('❌ AK-PENCIL-MVP не найден!');
      return;
    }

    console.log(`📦 Найден MVP пенал: ${mvpPencil.sku}`);
    console.log(`   Фотографий: ${mvpPencil.images.length}`);
    console.log(`   Вариантов: ${mvpPencil.variants.length}`);

    // 2. Создадим отдельные товары для MVP синего, красного, зеленого
    const mvpVariants = [
      { 
        sku: 'AK-PENCIL-MVP-BLUE',
        slug: 'ak-pencil-mvp-blue',
        nameRu: 'Пенал MVP синий',
        nameKy: 'MVP пенал көк',
        nameEn: 'MVP Pencil Case Blue',
        descRu: 'Пенал для школьных принадлежностей с футбольным принтом, синий цвет',
        descKy: 'Футбол сүрөтү менен мектеп буюмдары үчүн пенал, көк түс',
        descEn: 'Pencil case for school supplies with football print, blue color'
      },
      { 
        sku: 'AK-PENCIL-MVP-RED',
        slug: 'ak-pencil-mvp-red',
        nameRu: 'Пенал MVP красный',
        nameKy: 'MVP пенал кызыл',
        nameEn: 'MVP Pencil Case Red',
        descRu: 'Пенал для школьных принадлежностей с футбольным принтом, красный цвет',
        descKy: 'Футбол сүрөтү менен мектеп буюмдары үчүн пенал, кызыл түс',
        descEn: 'Pencil case for school supplies with football print, red color'
      },
      { 
        sku: 'AK-PENCIL-MVP-GREEN',
        slug: 'ak-pencil-mvp-green',
        nameRu: 'Пенал MVP зеленый',
        nameKy: 'MVP пенал жашыл',
        nameEn: 'MVP Pencil Case Green',
        descRu: 'Пенал для школьных принадлежностей с футбольным принтом, зеленый цвет',
        descKy: 'Футбол сүрөтү менен мектеп буюмдары үчүн пенал, жашыл түс',
        descEn: 'Pencil case for school supplies with football print, green color'
      }
    ];

    // Получим категорию и цену
    const categoryId = mvpPencil.categoryId;
    const price = mvpPencil.prices[0]?.sellingPrice || 150;

    console.log('\n📝 Создаю отдельные карточки для MVP пеналов...');

    for (const variant of mvpVariants) {
      // Проверим, нет ли уже такого товара
      const existing = await prisma.product.findFirst({
        where: { sku: variant.sku }
      });

      if (existing) {
        console.log(`  ⚠️  ${variant.sku} уже существует, пропускаю`);
        continue;
      }

      // Создаем товар
      const product = await prisma.product.create({
        data: {
          sku: variant.sku,
          slug: variant.slug,
          categoryId: categoryId,
          status: 'ACTIVE',
          isFeatured: false,
          hasVariants: false
        }
      });

      // Добавляем переводы
      await prisma.productTranslation.createMany({
        data: [
          {
            productId: product.id,
            locale: 'ru',
            name: variant.nameRu,
            description: variant.descRu
          },
          {
            productId: product.id,
            locale: 'ky',
            name: variant.nameKy,
            description: variant.descKy
          },
          {
            productId: product.id,
            locale: 'en',
            name: variant.nameEn,
            description: variant.descEn
          }
        ]
      });

      // Добавляем цену
      const tier = await prisma.priceTier.findFirst({
        where: { name: 'Розничная' }
      });

      if (tier) {
        await prisma.productPrice.create({
          data: {
            productId: product.id,
            tierId: tier.id,
            sellingPrice: price,
            currency: 'KGS',
            isActive: true
          }
        });
      }

      console.log(`  ✓ Создан ${variant.sku}: ${variant.nameRu}`);
    }

    // 3. Удаляем старый MVP пенал с вариантами
    console.log('\n🗑️  Удаляю старую карточку AK-PENCIL-MVP...');
    
    // Удаляем из корзин
    await prisma.cartItem.deleteMany({
      where: { productId: mvpPencil.id }
    });

    // Удаляем варианты
    await prisma.productVariant.deleteMany({
      where: { productId: mvpPencil.id }
    });

    // Удаляем фотографии
    await prisma.productImage.deleteMany({
      where: { productId: mvpPencil.id }
    });

    // Удаляем переводы
    await prisma.productTranslation.deleteMany({
      where: { productId: mvpPencil.id }
    });

    // Удаляем цены
    await prisma.productPrice.deleteMany({
      where: { productId: mvpPencil.id }
    });

    // Удаляем сам товар
    await prisma.product.delete({
      where: { id: mvpPencil.id }
    });

    console.log('  ✓ Удалено');

    console.log('\n✅ Готово! Теперь:');
    console.log('   1. Зайди в админку: http://localhost:4000/admin');
    console.log('   2. Найди три новых пенала: AK-PENCIL-MVP-BLUE, RED, GREEN');
    console.log('   3. Добавь к каждому свои фотографии');
    console.log('   4. Если нужно - создай остальные пеналы (TIGER, LUCK, и т.д.)');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
