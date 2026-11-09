const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function fixMVP() {
  console.log('🔧 ИСПРАВЛЯЮ MVP ПЕНАЛЫ - ОБЪЕДИНЯЮ В ОДИН ТОВАР С ВАРИАНТАМИ\n');

  try {
    // 1. Находим все 3 отдельных MVP пенала
    const mvpPencils = await prisma.product.findMany({
      where: {
        sku: {
          in: ['AK-PENCIL-MVP-BLUE', 'AK-PENCIL-MVP-RED', 'AK-PENCIL-MVP-GREEN']
        }
      },
      include: {
        translations: true,
        prices: true
      }
    });

    console.log(`📦 Найдено MVP пеналов: ${mvpPencils.length}`);

    if (mvpPencils.length === 0) {
      console.log('❌ MVP пеналы не найдены!');
      return;
    }

    // 2. Создаём ОДИН товар "Пенал MVP" с вариантами
    console.log('\n📝 Создаю товар "Пенал MVP" с вариантами...');

    const category = await prisma.category.findFirst();
    
    const mvpProduct = await prisma.product.create({
      data: {
        sku: 'AK-PENCIL-MVP',
        slug: 'ak-pencil-mvp',
        categoryId: category.id,
        status: 'ACTIVE',
        isFeatured: true,
        hasVariants: true
      }
    });

    // Переводы
    await prisma.productTranslation.createMany({
      data: [
        {
          productId: mvpProduct.id,
          locale: 'ru',
          name: 'Пенал для карандашей MVP с футбольным принтом',
          description: 'Яркий и вместительный пенал для школьных принадлежностей с футбольным дизайном. Прочный материал, удобная молния. Идеально подходит для карандашей, ручек, линейки и других канцелярских принадлежностей. Размер: 20x8x5 см.'
        },
        {
          productId: mvpProduct.id,
          locale: 'ky',
          name: 'Футбол принти менен MVP карандаш пеналы',
          description: 'Мектеп буюмдары үчүн футбол дизайны менен жарык жана сыймыктуу пенал. Бекем материал, ыңгайлуу замок. Карандаштар, калемдер, сызгыч жана башка канцтовары буюмдары үчүн идеалдуу. Өлчөмү: 20x8x5 см.'
        },
        {
          productId: mvpProduct.id,
          locale: 'en',
          name: 'MVP Pencil Case with Football Print',
          description: 'Bright and spacious pencil case for school supplies with football design. Durable material, convenient zipper. Perfect for pencils, pens, ruler and other stationery. Size: 20x8x5 cm.'
        }
      ]
    });

    // Цена
    const tier = await prisma.priceTier.findFirst();
    await prisma.productPrice.create({
      data: {
        productId: mvpProduct.id,
        tierId: tier.id,
        sellingPrice: 250,
        currency: 'KGS',
        isActive: true
      }
    });

    console.log('✓ Товар создан');

    // 3. Создаём варианты (синий, красный, зелёный)
    console.log('\n🎨 Создаю варианты цветов...');

    const variants = [
      { 
        name: 'Blue', 
        nameRu: 'Синий', 
        nameKy: 'Көк',
        sku: 'AK-PENCIL-MVP-BLUE',
        sortOrder: 1
      },
      { 
        name: 'Red', 
        nameRu: 'Красный', 
        nameKy: 'Кызыл',
        sku: 'AK-PENCIL-MVP-RED',
        sortOrder: 2
      },
      { 
        name: 'Green', 
        nameRu: 'Зелёный', 
        nameKy: 'Жашыл',
        sku: 'AK-PENCIL-MVP-GREEN',
        sortOrder: 3
      }
    ];

    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          productId: mvpProduct.id,
          name: variant.name,
          nameRu: variant.nameRu,
          nameKy: variant.nameKy,
          sku: variant.sku,
          sortOrder: variant.sortOrder,
          isActive: true
        }
      });
      console.log(`  ✓ ${variant.nameRu}`);
    }

    // 4. Удаляем старые отдельные товары
    console.log('\n🗑️  Удаляю старые отдельные карточки...');

    for (const oldProduct of mvpPencils) {
      // Удаляем переводы
      await prisma.productTranslation.deleteMany({
        where: { productId: oldProduct.id }
      });

      // Удаляем цены
      await prisma.productPrice.deleteMany({
        where: { productId: oldProduct.id }
      });

      // Удаляем товар
      await prisma.product.delete({
        where: { id: oldProduct.id }
      });

      console.log(`  ✓ Удалён ${oldProduct.sku}`);
    }

    // 5. ОБНОВЛЯЕМ ОПИСАНИЯ И ЦЕНЫ для остальных пеналов
    console.log('\n📝 Обновляю описания и цены для всех пеналов...');

    const allPencils = await prisma.product.findMany({
      where: {
        sku: { contains: 'PENCIL' }
      },
      include: {
        translations: true,
        prices: { include: { tier: true } }
      }
    });

    const pencilData = {
      'AK-PENCIL-BSQ': {
        nameRu: 'Пенал школьный BSQ многофункциональный',
        nameKy: 'Көп функциялуу мектеп пеналы BSQ',
        nameEn: 'BSQ Multifunctional School Pencil Case',
        descRu: 'Вместительный многофункциональный пенал с несколькими отделениями. Подходит для хранения ручек, карандашей, ластиков, точилок и других школьных принадлежностей. Прочный материал, надёжная молния.',
        descKy: 'Бир нече бөлүктөрү бар көп функциялуу сыймыктуу пенал. Калемдерди, карандаштарды, өчүргүчтөрдү, курч жана башка мектеп буюмдарын сактоого ылайыктуу.',
        descEn: 'Spacious multifunctional pencil case with multiple compartments. Suitable for storing pens, pencils, erasers, sharpeners and other school supplies.',
        price: 280
      },
      'AK-PENCIL-TIGER': {
        nameRu: 'Пенал "Тигр" с ярким принтом',
        nameKy: 'Жаркыраган принт менен "Жолборс" пеналы',
        nameEn: 'Tiger Pencil Case with Bright Print',
        descRu: 'Яркий и стильный пенал с изображением тигра. Привлекательный дизайн понравится детям и подросткам. Удобная форма, качественные материалы, надёжная застёжка-молния.',
        descKy: 'Жолборс сүрөтү менен жарык жана стилдүү пенал. Жагымдуу дизайн балдарга жана өспүрүмдөргө жакпайт. Ыңгайлуу форма, сапаттуу материалдар.',
        descEn: 'Bright and stylish pencil case with tiger image. Attractive design will appeal to children and teenagers. Convenient shape, quality materials.',
        price: 320
      },
      'AK-PENCIL-LUCK': {
        nameRu: 'Пенал Lucky стильный и компактный',
        nameKy: 'Стилдүү жана ыңгайлуу Lucky пеналы',
        nameEn: 'Lucky Stylish Compact Pencil Case',
        descRu: 'Компактный и стильный пенал для тех, кто ценит минимализм. Несмотря на небольшой размер, вмещает все необходимое для уроков. Качественный материал, удобная молния.',
        descKy: 'Минимализмди баалагандар үчүн ыңгайлуу жана стилдүү пенал. Кичине өлчөмүнө карабастан, сабактар үчүн керектүү нерселердин баарын сыйдырат.',
        descEn: 'Compact and stylish pencil case for those who appreciate minimalism. Despite its small size, it fits everything you need for lessons.',
        price: 200
      },
      'AK-PENCIL-POPIT': {
        nameRu: 'Пенал Поп-ит антистресс с пупырышками',
        nameKy: 'Стресске каршы пупырышкалуу Поп-ит пеналы',
        nameEn: 'Pop-it Anti-stress Pencil Case with Bubbles',
        descRu: 'Уникальный пенал с антистресс-эффектом! Пупырышки на поверхности можно нажимать для расслабления. Помогает сосредоточиться на уроках, снимает напряжение. Вместительный и практичный.',
        descKy: 'Стресске каршы эффекти менен уникалдуу пенал! Үстүндөгү пупырышкаларды эс алуу үчүн басса болот. Сабактарда көңүл топтоого жардам берет.',
        descEn: 'Unique pencil case with anti-stress effect! Surface bubbles can be pressed for relaxation. Helps focus in lessons, relieves tension.',
        price: 350
      },
      'AK-PENCIL-SCHOOL': {
        nameRu: 'Пенал школьный классический базовый',
        nameKy: 'Классикалык базалык мектеп пеналы',
        nameEn: 'Classic Basic School Pencil Case',
        descRu: 'Классический школьный пенал простого дизайна. Надёжный и практичный выбор для ежедневного использования. Подходит для учеников любого возраста. Качественные материалы, доступная цена.',
        descKy: 'Жөнөкөй дизайнда классикалык мектеп пеналы. Күнүмдүк колдонуу үчүн ишенимдүү жана практикалуу тандоо. Каалаган курактагы окуучуларга ылайыктуу.',
        descEn: 'Classic school pencil case with simple design. Reliable and practical choice for daily use. Suitable for students of any age.',
        price: 180
      }
    };

    for (const pencil of allPencils) {
      if (pencil.sku === 'AK-PENCIL-MVP') continue; // Уже обработан

      const data = pencilData[pencil.sku];
      if (!data) continue;

      // Обновляем переводы
      await prisma.productTranslation.deleteMany({
        where: { productId: pencil.id }
      });

      await prisma.productTranslation.createMany({
        data: [
          {
            productId: pencil.id,
            locale: 'ru',
            name: data.nameRu,
            description: data.descRu
          },
          {
            productId: pencil.id,
            locale: 'ky',
            name: data.nameKy,
            description: data.descKy
          },
          {
            productId: pencil.id,
            locale: 'en',
            name: data.nameEn,
            description: data.descEn
          }
        ]
      });

      // Обновляем цену
      if (pencil.prices.length > 0) {
        await prisma.productPrice.update({
          where: { id: pencil.prices[0].id },
          data: { sellingPrice: data.price }
        });
      } else {
        const tier = await prisma.priceTier.findFirst();
        await prisma.productPrice.create({
          data: {
            productId: pencil.id,
            tierId: tier.id,
            sellingPrice: data.price,
            currency: 'KGS',
            isActive: true
          }
        });
      }

      console.log(`  ✓ ${pencil.sku}: ${data.price} сом`);
    }

    console.log('\n✅ ВСЁ ГОТОВО!\n');
    console.log('📊 Итог:');
    console.log('   ✓ Создан товар "Пенал MVP" с 3 вариантами (синий, красный, зелёный)');
    console.log('   ✓ Обновлены описания и цены для всех пеналов');
    console.log('   ✓ Все пеналы имеют цены от 180 до 350 сом');
    console.log('\n⚠️  ОСТАЛОСЬ ДОБАВИТЬ ФОТОГРАФИИ через админку!');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMVP();
