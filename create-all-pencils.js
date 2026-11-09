const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Читаем .env файл вручную
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function createAllPencils() {
  console.log('📦 Создаю все пеналы как отдельные карточки...\n');

  // Все пеналы которые нужно создать
  const pencils = [
    {
      sku: 'AK-PENCIL-BSQ',
      slug: 'ak-pencil-bsq',
      nameRu: 'Пенал школьный BSQ',
      nameKy: 'Мектеп пеналы BSQ',
      nameEn: 'School Pencil Case BSQ',
      descRu: 'Вместительный пенал для школьных принадлежностей',
      descKy: 'Мектеп буюмдары үчүн сыймыктуу пенал',
      descEn: 'Spacious pencil case for school supplies'
    },
    {
      sku: 'AK-PENCIL-TIGER',
      slug: 'ak-pencil-tiger',
      nameRu: 'Пенал Тигр',
      nameKy: 'Жолборс пеналы',
      nameEn: 'Tiger Pencil Case',
      descRu: 'Яркий пенал с принтом тигра',
      descKy: 'Жолборс сүрөтү менен жаркыраган пенал',
      descEn: 'Bright pencil case with tiger print'
    },
    {
      sku: 'AK-PENCIL-LUCK',
      slug: 'ak-pencil-luck',
      nameRu: 'Пенал Lucky',
      nameKy: 'Lucky пеналы',
      nameEn: 'Lucky Pencil Case',
      descRu: 'Стильный пенал для удачи',
      descKy: 'Ийгилик үчүн стилдүү пенал',
      descEn: 'Stylish pencil case for good luck'
    },
    {
      sku: 'AK-PENCIL-POPIT',
      slug: 'ak-pencil-popit',
      nameRu: 'Пенал Поп-ит',
      nameKy: 'Поп-ит пеналы',
      nameEn: 'Pop-it Pencil Case',
      descRu: 'Антистресс пенал с пупырышками',
      descKy: 'Стресс каршы пупырышкалуу пенал',
      descEn: 'Anti-stress pencil case with bubbles'
    },
    {
      sku: 'AK-PENCIL-SCHOOL',
      slug: 'ak-pencil-school',
      nameRu: 'Пенал школьный классический',
      nameKy: 'Классикалык мектеп пеналы',
      nameEn: 'Classic School Pencil Case',
      descRu: 'Классический школьный пенал',
      descKy: 'Классикалык мектеп пеналы',
      descEn: 'Classic school pencil case'
    }
  ];

  try {
    // Получаем категорию для пеналов (предположим это категория канцтоваров)
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: { contains: 'kants' } },
          { slug: { contains: 'school' } },
          { slug: { contains: 'office' } }
        ]
      }
    });

    if (!category) {
      console.log('❌ Категория не найдена! Создаю категорию Канцтовары...');
      
      const newCategory = await prisma.category.create({
        data: {
          slug: 'school-supplies',
          parentId: null,
          isActive: true,
          sortOrder: 1
        }
      });

      await prisma.categoryTranslation.createMany({
        data: [
          {
            categoryId: newCategory.id,
            locale: 'ru',
            name: 'Школьные принадлежности',
            description: 'Товары для школы'
          },
          {
            categoryId: newCategory.id,
            locale: 'ky',
            name: 'Мектеп буюмдары',
            description: 'Мектеп үчүн товарлар'
          },
          {
            categoryId: newCategory.id,
            locale: 'en',
            name: 'School Supplies',
            description: 'School supplies'
          }
        ]
      });

      categoryId = newCategory.id;
      console.log('✓ Категория создана\n');
    } else {
      categoryId = category.id;
      console.log(`✓ Категория найдена: ${category.slug}\n`);
    }

    // Получаем ценовой tier
    let tier = await prisma.priceTier.findFirst();

    if (!tier) {
      console.log('⚠️  Ценовой tier не найден, создаю...');
      tier = await prisma.priceTier.create({
        data: {
          name: 'Розничная',
          description: 'Розничная цена для всех покупателей',
          isDefault: true,
          sortOrder: 1
        }
      });
      console.log('✓ Tier создан\n');
    }

    // Создаем каждый пенал
    for (const pencil of pencils) {
      // Проверяем существует ли уже
      const existing = await prisma.product.findFirst({
        where: { sku: pencil.sku }
      });

      if (existing) {
        console.log(`⚠️  ${pencil.sku} уже существует, пропускаю`);
        continue;
      }

      // Создаем товар
      const product = await prisma.product.create({
        data: {
          sku: pencil.sku,
          slug: pencil.slug,
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
            name: pencil.nameRu,
            description: pencil.descRu
          },
          {
            productId: product.id,
            locale: 'ky',
            name: pencil.nameKy,
            description: pencil.descKy
          },
          {
            productId: product.id,
            locale: 'en',
            name: pencil.nameEn,
            description: pencil.descEn
          }
        ]
      });

      // Добавляем цену (150 сом)
      await prisma.productPrice.create({
        data: {
          productId: product.id,
          tierId: tier.id,
          sellingPrice: 150,
          currency: 'KGS',
          isActive: true
        }
      });

      console.log(`✓ Создан ${pencil.sku}: ${pencil.nameRu}`);
    }

    console.log('\n✅ Все пеналы созданы!');
    console.log('\nТеперь в базе есть:');
    
    const allPencils = await prisma.product.findMany({
      where: {
        sku: { contains: 'PENCIL' }
      },
      include: {
        translations: { where: { locale: 'ru' } }
      },
      orderBy: { sku: 'asc' }
    });

    allPencils.forEach(p => {
      const name = p.translations[0]?.name || 'Без названия';
      console.log(`  📦 ${p.sku}: ${name}`);
    });

    console.log(`\nВсего: ${allPencils.length} пеналов`);

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAllPencils();
