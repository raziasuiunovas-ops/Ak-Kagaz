const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Проверяю MVP пенал и его варианты:\n');

  const mvp = await prisma.product.findFirst({
    where: { sku: 'AK-PENCIL-MVP' },
    include: {
      variants: {
        orderBy: { sortOrder: 'asc' }
      },
      translations: { where: { locale: 'ru' } },
      images: true
    }
  });

  if (!mvp) {
    console.log('❌ MVP пенал не найден!');
    return;
  }

  const name = mvp.translations[0]?.name || 'Без названия';
  console.log(`📦 Товар: ${mvp.sku}`);
  console.log(`   Название: ${name}`);
  console.log(`   ID: ${mvp.id}`);
  console.log(`   Фотографий: ${mvp.images.length}`);
  console.log(`   Вариантов: ${mvp.variants.length}\n`);

  if (mvp.variants.length > 0) {
    console.log('🎨 Варианты:');
    mvp.variants.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.nameRu || v.name} (SKU: ${v.sku})`);
      console.log(`      ID: ${v.id}`);
      console.log(`      Активен: ${v.isActive}`);
    });
  }

  // Проверяем все товары с MVP в названии
  console.log('\n🔍 Все товары с "MVP" в переводах:');
  const allMvp = await prisma.productTranslation.findMany({
    where: {
      name: { contains: 'MVP' },
      locale: 'ru'
    },
    include: {
      product: {
        include: {
          variants: true
        }
      }
    }
  });

  allMvp.forEach(t => {
    console.log(`\n  📦 ${t.product.sku}: ${t.name}`);
    console.log(`     ID: ${t.product.id}`);
    console.log(`     Вариантов: ${t.product.variants.length}`);
  });

  await prisma.$disconnect();
}

check();
