const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

const prisma = new PrismaClient();

async function deleteDuplicates() {
  console.log('🔍 Ищу дублирующиеся MVP пеналы...\n');

  try {
    // Находим все товары с PENCIL в SKU
    const allPencils = await prisma.product.findMany({
      where: {
        sku: { contains: 'PENCIL' }
      },
      include: {
        translations: { where: { locale: 'ru' } },
        variants: true,
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📦 Все пеналы в базе:');
    allPencils.forEach((p, i) => {
      const name = p.translations[0]?.name || 'Без названия';
      console.log(`${i + 1}. ${p.sku}: ${name}`);
      console.log(`   Вариантов: ${p.variants.length}, Фото: ${p.images.length}`);
    });

    // Ищем товары которые нужно удалить (без вариантов и без правильного названия)
    const toDelete = allPencils.filter(p => {
      const name = p.translations[0]?.name || '';
      return (
        (p.sku.includes('MVP') && p.variants.length === 0) ||
        (name.includes('MVP') && name.match(/(зеленый|красный|синий)/i) && p.variants.length === 0)
      );
    });

    if (toDelete.length === 0) {
      console.log('\n✅ Дубликатов не найдено!');
      return;
    }

    console.log(`\n🗑️  Найдено дубликатов для удаления: ${toDelete.length}`);
    toDelete.forEach(p => {
      const name = p.translations[0]?.name || 'Без названия';
      console.log(`   - ${p.sku}: ${name}`);
    });

    console.log('\n⚠️  Удаляю дубликаты...');

    for (const product of toDelete) {
      const name = product.translations[0]?.name || 'Без названия';
      
      // Удаляем связанные данные
      await prisma.cartItem.deleteMany({
        where: { productId: product.id }
      });

      await prisma.productImage.deleteMany({
        where: { productId: product.id }
      });

      await prisma.productTranslation.deleteMany({
        where: { productId: product.id }
      });

      await prisma.productPrice.deleteMany({
        where: { productId: product.id }
      });

      await prisma.productAttributeValue.deleteMany({
        where: { productId: product.id }
      });

      // Удаляем сам товар
      await prisma.product.delete({
        where: { id: product.id }
      });

      console.log(`  ✓ Удалён: ${p.sku} - ${name}`);
    }

    // Проверяем что осталось
    console.log('\n📊 Итоговый список пеналов:');
    const finalPencils = await prisma.product.findMany({
      where: {
        sku: { contains: 'PENCIL' }
      },
      include: {
        translations: { where: { locale: 'ru' } },
        variants: true
      },
      orderBy: { sku: 'asc' }
    });

    finalPencils.forEach(p => {
      const name = p.translations[0]?.name || 'Без названия';
      console.log(`  📦 ${p.sku}: ${name}`);
      if (p.variants.length > 0) {
        console.log(`     Варианты: ${p.variants.map(v => v.nameRu).join(', ')}`);
      }
    });

    console.log(`\n✅ Готово! Всего пеналов: ${finalPencils.length}`);

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDuplicates();
