const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mergeProducts() {
  console.log('🔍 Ищу товары для объединения...\n');

  // Получаем все товары
  const allProducts = await prisma.product.findMany({
    include: {
      translations: true,
      images: true,
      variants: true,
      prices: true
    }
  });

  console.log(`Всего товаров в базе: ${allProducts.length}\n`);

  // 1. ПЕНАЛЫ
  console.log('📦 Объединяю пеналы...');
  const pencils = allProducts.filter(p => 
    p.sku && (p.sku.includes('PENCIL') || p.sku.includes('MVP'))
  );

  if (pencils.length > 1) {
    console.log(`  Найдено пеналов: ${pencils.length}`);
    pencils.forEach(p => console.log(`    - ${p.sku}`));

    // Ищем основной товар (без суффикса цвета или уже объединенный)
    let mainPencil = pencils.find(p => p.sku === 'AK-PENCIL-MVP');
    if (!mainPencil) {
      // Если нет объединенного, берем синий
      mainPencil = pencils.find(p => p.sku.includes('BLUE'));
    }
    if (!mainPencil) {
      // Или первый
      mainPencil = pencils[0];
    }

    console.log(`  Основной товар: ${mainPencil.sku}`);

    // Обновляем SKU основного товара если нужно
    if (mainPencil.sku !== 'AK-PENCIL-MVP') {
      await prisma.product.update({
        where: { id: mainPencil.id },
        data: { sku: 'AK-PENCIL-MVP' }
      });
      mainPencil.sku = 'AK-PENCIL-MVP'; // Обновляем локально
    }

    // Создаем варианты для всех пеналов
    const colorMap = {
      'BLUE': { name: 'Blue', nameRu: 'Синий', nameKy: 'Көк' },
      'RED': { name: 'Red', nameRu: 'Красный', nameKy: 'Кызыл' },
      'GREEN': { name: 'Green', nameRu: 'Зеленый', nameKy: 'Жашыл' }
    };

    for (const pencil of pencils) {
      let colorKey = 'BLUE';
      if (pencil.sku.includes('RED')) colorKey = 'RED';
      else if (pencil.sku.includes('GREEN')) colorKey = 'GREEN';

      const color = colorMap[colorKey];
      const variantSku = `AK-PENCIL-MVP-${colorKey}`;

      // Проверяем, нет ли уже такого варианта
      const existing = await prisma.productVariant.findUnique({
        where: { sku: variantSku }
      });

      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: mainPencil.id,
            name: color.name,
            nameRu: color.nameRu,
            nameKy: color.nameKy,
            sku: variantSku
          }
        });
        console.log(`  ✓ Создан вариант: ${color.nameRu}`);
      }

      // Переносим данные если это не основной товар
      if (pencil.id !== mainPencil.id) {
        // Переносим фотографии
        await prisma.productImage.updateMany({
          where: { productId: pencil.id },
          data: { productId: mainPencil.id }
        });

        // Обновляем корзины
        const variant = await prisma.productVariant.findUnique({
          where: { sku: variantSku }
        });

        if (variant) {
          await prisma.cartItem.updateMany({
            where: { productId: pencil.id },
            data: { 
              productId: mainPencil.id,
              variantId: variant.id
            }
          });
        }

        // Удаляем товар (каскадное удаление должно удалить связанные данные)
        await prisma.product.delete({ where: { id: pencil.id } });
        console.log(`  ✓ Удален дубликат: ${pencil.sku}`);
      }
    }
    console.log('  ✅ Пеналы объединены!\n');
  } else {
    console.log('  Пеналов для объединения не найдено\n');
  }

  // 2. ГЛОБУСЫ
  console.log('🌍 Объединяю глобусы...');
  const globes = allProducts.filter(p => 
    p.sku && (p.sku.includes('GLOBE') || p.sku.includes('GLB'))
  );

  if (globes.length >= 1) {
    console.log(`  Найдено глобусов: ${globes.length}`);
    globes.forEach(p => console.log(`    - ${p.sku}`));

    // Ищем основной товар
    let mainGlobe = globes.find(p => p.sku === 'AK-GLOBE');
    if (!mainGlobe) {
      mainGlobe = globes[0];
    }

    console.log(`  Основной товар: ${mainGlobe.sku}`);

    // Обновляем основной товар если нужно
    if (mainGlobe.sku !== 'AK-GLOBE') {
      await prisma.product.update({
        where: { id: mainGlobe.id },
        data: { sku: 'AK-GLOBE' }
      });
      mainGlobe.sku = 'AK-GLOBE';
    }

    // Обновляем цену основного товара на минимальную
    const mainPrice = await prisma.productPrice.findFirst({
      where: { productId: mainGlobe.id }
    });

    if (mainPrice) {
      await prisma.productPrice.update({
        where: { id: mainPrice.id },
        data: { sellingPrice: 400 }
      });
    }

    // Создаем варианты по размерам
    const sizes = [
      { name: 'Small', nameRu: 'Маленький', nameKy: 'Кичине', sku: 'AK-GLOBE-SMALL', price: 400 },
      { name: 'Large', nameRu: 'Большой', nameKy: 'Чоң', sku: 'AK-GLOBE-LARGE', price: 700 }
    ];

    for (const size of sizes) {
      const existing = await prisma.productVariant.findUnique({
        where: { sku: size.sku }
      });

      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: mainGlobe.id,
            name: size.name,
            nameRu: size.nameRu,
            nameKy: size.nameKy,
            sku: size.sku,
            price: size.price
          }
        });
        console.log(`  ✓ Создан вариант: ${size.nameRu} (${size.price} сом)`);
      }
    }

    // Переносим данные из остальных глобусов
    for (let i = 1; i < globes.length; i++) {
      const globe = globes[i];
      
      // Определяем размер по цене
      const globePrice = globe.prices && globe.prices.length > 0 
        ? parseFloat(globe.prices[0].sellingPrice) 
        : 400;
      const isLarge = globePrice >= 600;
      const variantSku = isLarge ? 'AK-GLOBE-LARGE' : 'AK-GLOBE-SMALL';

      // Переносим фотографии
      await prisma.productImage.updateMany({
        where: { productId: globe.id },
        data: { productId: mainGlobe.id }
      });

      // Обновляем корзины
      const variant = await prisma.productVariant.findUnique({
        where: { sku: variantSku }
      });

      if (variant) {
        await prisma.cartItem.updateMany({
          where: { productId: globe.id },
          data: { 
            productId: mainGlobe.id,
            variantId: variant.id
          }
        });
      }

      // Удаляем товар
      await prisma.product.delete({ where: { id: globe.id } });
      console.log(`  ✓ Удален дубликат: ${globe.sku}`);
    }
    console.log('  ✅ Глобусы объединены!\n');
  } else {
    console.log('  Глобусов для объединения не найдено\n');
  }

  // 3. ЗНАЧКИ
  console.log('🎖️  Объединяю значки...');
  const badges = allProducts.filter(p => 
    p.sku && (p.sku.includes('BADGE') || p.sku.includes('BDG'))
  );

  if (badges.length >= 1) {
    console.log(`  Найдено значков: ${badges.length}`);
    badges.forEach(p => console.log(`    - ${p.sku}`));

    // Ищем основной товар
    let mainBadge = badges.find(p => p.sku === 'AK-BADGE');
    if (!mainBadge) {
      mainBadge = badges[0];
    }

    console.log(`  Основной товар: ${mainBadge.sku}`);

    // Обновляем основной товар если нужно
    if (mainBadge.sku !== 'AK-BADGE') {
      await prisma.product.update({
        where: { id: mainBadge.id },
        data: { sku: 'AK-BADGE' }
      });
      mainBadge.sku = 'AK-BADGE';
    }

    // Создаем варианты
    const types = [
      { name: 'Kindergarten', nameRu: 'Детский сад', nameKy: 'Балдар бакчасы', sku: 'AK-BADGE-KINDER' },
      { name: '1st Grade', nameRu: '1 класс', nameKy: '1 класс', sku: 'AK-BADGE-FIRST' }
    ];

    for (const type of types) {
      const existing = await prisma.productVariant.findUnique({
        where: { sku: type.sku }
      });

      if (!existing) {
        await prisma.productVariant.create({
          data: {
            productId: mainBadge.id,
            name: type.name,
            nameRu: type.nameRu,
            nameKy: type.nameKy,
            sku: type.sku
          }
        });
        console.log(`  ✓ Создан вариант: ${type.nameRu}`);
      }
    }

    // Переносим данные из остальных значков
    for (let i = 1; i < badges.length; i++) {
      const badge = badges[i];
      
      // Определяем тип по SKU или переводам
      const badgeNameRu = badge.translations && badge.translations.length > 0
        ? badge.translations.find(t => t.locale === 'ru')?.name || ''
        : '';
      const isFirst = badge.sku.includes('FIRST') || badgeNameRu.includes('1') || badgeNameRu.includes('перв');
      const variantSku = isFirst ? 'AK-BADGE-FIRST' : 'AK-BADGE-KINDER';

      // Переносим фотографии
      await prisma.productImage.updateMany({
        where: { productId: badge.id },
        data: { productId: mainBadge.id }
      });

      // Обновляем корзины
      const variant = await prisma.productVariant.findUnique({
        where: { sku: variantSku }
      });

      if (variant) {
        await prisma.cartItem.updateMany({
          where: { productId: badge.id },
          data: { 
            productId: mainBadge.id,
            variantId: variant.id
          }
        });
      }

      // Удаляем товар
      await prisma.product.delete({ where: { id: badge.id } });
      console.log(`  ✓ Удален дубликат: ${badge.sku}`);
    }
    console.log('  ✅ Значки объединены!\n');
  } else {
    console.log('  Значков для объединения не найдено\n');
  }

  // Итоговый отчет
  const totalProducts = await prisma.product.count();
  const totalVariants = await prisma.productVariant.count();

  console.log('📊 Итоговый отчет:');
  console.log(`   Всего товаров: ${totalProducts}`);
  console.log(`   Всего вариантов: ${totalVariants}`);
  console.log('\n✅ Объединение завершено успешно!');
}

mergeProducts()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
