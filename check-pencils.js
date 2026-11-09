const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Читаем .env файл вручную
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Текущие пеналы в базе:\n');
  
  const pencils = await prisma.product.findMany({
    where: { 
      OR: [
        { sku: { contains: 'PENCIL' } },
        { sku: { contains: 'MVP' } }
      ]
    },
    include: {
      translations: { where: { locale: 'ru' } },
      variants: true
    },
    orderBy: { sku: 'asc' }
  });
  
  pencils.forEach(p => {
    const name = p.translations[0]?.name || 'Без названия';
    console.log(`📦 SKU: ${p.sku}`);
    console.log(`   Название: ${name}`);
    if (p.variants.length > 0) {
      console.log(`   Варианты: ${p.variants.map(v => `${v.name} (${v.sku})`).join(', ')}`);
    }
    console.log('');
  });
  
  console.log(`Всего пеналов: ${pencils.length}`);
  
  await prisma.$disconnect();
}

check().catch(console.error);
