const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Проверяю значки и бейджи:\n');
  
  const badges = await prisma.product.findMany({
    where: { 
      sku: { contains: 'BADGE' }
    },
    include: {
      translations: { where: { locale: 'ru' } },
      variants: true,
      images: true
    }
  });
  
  badges.forEach(b => {
    const name = b.translations[0]?.name || 'Без названия';
    console.log(`📦 SKU: ${b.sku}`);
    console.log(`   Название: ${name}`);
    console.log(`   Фотографий: ${b.images.length}`);
    if (b.variants.length > 0) {
      console.log(`   Варианты:`);
      b.variants.forEach(v => {
        console.log(`      - ${v.nameRu || v.name} (${v.sku})`);
      });
    }
    console.log('');
  });
  
  console.log(`Всего: ${badges.length} товаров`);
  
  await prisma.$disconnect();
}

check();
