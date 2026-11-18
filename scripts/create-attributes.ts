import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Создание базовых атрибутов товаров...\n');

  const attributes = [
    { name: 'color', displayNameRu: 'Цвет', displayNameKy: 'Түсү', type: 'COLOR', sortOrder: 1 },
    { name: 'size', displayNameRu: 'Размер', displayNameKy: 'Өлчөмү', type: 'SIZE', sortOrder: 2 },
    { name: 'material', displayNameRu: 'Материал', displayNameKy: 'Материалы', type: 'TEXT', sortOrder: 3 },
    { name: 'brand', displayNameRu: 'Бренд', displayNameKy: 'Бренд', type: 'TEXT', sortOrder: 4 },
    { name: 'model', displayNameRu: 'Модель', displayNameKy: 'Үлгүсү', type: 'TEXT', sortOrder: 5 },
  ];

  try {
    for (const attr of attributes) {
      const existing = await prisma.productAttribute.findUnique({
        where: { name: attr.name },
      });

      if (!existing) {
        await prisma.productAttribute.create({
          data: attr,
        });
        console.log(`✅ Создан атрибут: ${attr.displayNameRu} (${attr.name})`);
      } else {
        console.log(`⏭️  Атрибут уже существует: ${attr.displayNameRu} (${attr.name})`);
      }
    }

    const totalCount = await prisma.productAttribute.count();
    console.log(`\n📊 Всего атрибутов в базе: ${totalCount}`);
    console.log('\n🎉 Готово!');
  } catch (error) {
    console.error('❌ Ошибка при создании атрибутов:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Критическая ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
