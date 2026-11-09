const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Читаем .env файл вручную
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!dbUrlMatch) {
  console.error('❌ DATABASE_URL не найден в .env файле');
  process.exit(1);
}

const DATABASE_URL = dbUrlMatch[1];
console.log('🔗 DATABASE_URL найден:', DATABASE_URL.substring(0, 50) + '...\n');

// Устанавливаем в process.env
process.env.DATABASE_URL = DATABASE_URL;

async function testConnection() {
  console.log('🔍 Проверяю подключение к базе данных...\n');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('⏳ Подключаюсь... (это может занять 10-20 секунд если база "спит")');
    
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    const elapsed = Date.now() - start;
    
    console.log(`✅ База данных доступна! (${elapsed}ms)`);

    // Проверим количество товаров
    const productCount = await prisma.product.count();
    console.log(`\n📦 Товаров в базе: ${productCount}`);

    // Проверим популярные товары
    const featured = await prisma.product.count({
      where: { isFeatured: true, status: 'ACTIVE' }
    });
    console.log(`⭐ Популярных товаров (isFeatured=true): ${featured}`);

    // Проверим варианты
    const variants = await prisma.productVariant.count();
    console.log(`🎨 Вариантов товаров: ${variants}`);

  } catch (error) {
    console.error('\n❌ Ошибка подключения к базе данных:');
    console.error(error.message);
    
    if (error.message.includes('reach database server') || error.message.includes('timed out')) {
      console.log('\n💡 Возможные причины:');
      console.log('   1. Neon база в режиме "scale to zero" - подожди 30 секунд и попробуй снова');
      console.log('   2. База данных была остановлена или удалена');
      console.log('\n🔧 Решение:');
      console.log('   • Зайди на https://console.neon.tech');
      console.log('   • Проверь что проект "ak-kagaz" активен');
      console.log('   • Проверь что branch "production" запущен');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
