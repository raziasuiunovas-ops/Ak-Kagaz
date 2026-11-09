require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Проверяю подключение к базе данных...\n');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    // Пробуем простой запрос
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ База данных доступна!');
    console.log('Результат:', result);

    // Проверим количество товаров
    const productCount = await prisma.product.count();
    console.log(`\n📦 Товаров в базе: ${productCount}`);

    // Проверим популярные товары
    const featured = await prisma.product.count({
      where: { isFeatured: true, status: 'ACTIVE' }
    });
    console.log(`⭐ Популярных товаров: ${featured}`);

  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:');
    console.error(error.message);
    
    if (error.message.includes('reach database server')) {
      console.log('\n💡 Возможные причины:');
      console.log('   1. Neon база в режиме "scale to zero" - нужно подождать пока она запустится');
      console.log('   2. Проблемы с сетью');
      console.log('   3. База данных была удалена или остановлена');
      console.log('\n🔧 Решение: Зайди на https://console.neon.tech и проверь статус базы');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
