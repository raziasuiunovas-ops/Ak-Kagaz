const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Загружаем env
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (dbUrlMatch) process.env.DATABASE_URL = dbUrlMatch[1];

// Загружаем AWS credentials из backend/.env
const backendEnv = fs.readFileSync('backend/.env', 'utf8');
const awsEndpoint = backendEnv.match(/AWS_ENDPOINT_URL_S3="([^"]+)"/)?.[1];
const awsAccessKey = backendEnv.match(/AWS_ACCESS_KEY_ID="([^"]+)"/)?.[1];
const awsSecretKey = backendEnv.match(/AWS_SECRET_ACCESS_KEY="([^"]+)"/)?.[1];
const awsBucket = backendEnv.match(/NEON_STORAGE_BUCKET=(\w+)/)?.[1];

if (!awsEndpoint || !awsAccessKey || !awsSecretKey || !awsBucket) {
  console.error('❌ AWS credentials не найдены в backend/.env');
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'eu-central-1',
  endpoint: awsEndpoint,
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretKey
  }
});

const prisma = new PrismaClient();

// Маппинг фотографий на товары
const photoMapping = {
  'AK-PENCIL-MVP': [
    'MVP пенал синий цвет.png',
    'MVP пенал красный цвет.png',
    'MVP пенал зеленый цвет.png'
  ],
  'AK-PENCIL-BSQ': [
    'Бежевый пенал в упаковке  BSQ.png',
    'Розовый пенал в упаковке BSQ.png',
    'Светло-голубой пенал BSQ в упаковке.png'
  ],
  'AK-PENCIL-TIGER': [
    'Милый пенал с тигрёнком-пирожным.png'
  ],
  'AK-PENCIL-LUCK': [
    'Фиолетовый пенал-карандаш с надписью _Удачи_.png'
  ],
  'AK-PENCIL-POPIT': [
    'Фиолетовый пенал с попит-фри-картошкой.png'
  ],
  'AK-PENCIL-SCHOOL': [
    'Школьный набор пеналов SCHOOL 马会.png'
  ],
  'AK-BADGE-PLASTIC': [
    'Бейджик желтый.png',
    'Бейджик зеленый.png',
    'Бейджик красный.png',
    'Бейджик синий.png',
    'Бейджик черный.png'
  ],
  'AK-BADGE-SCHOOL': [
    'Красный значок выпускник десткого сада.png',
    'Красный значок 1 класс.png'
  ],
  'AK-GLOBE': [
    'Настольный глобус маленького размера.png',
    'Настольный глобус большого размера.png.png'
  ]
};

async function uploadPhoto(filePath, productSku) {
  const fileName = path.basename(filePath);
  // Используем прямой URL из public папки вместо загрузки в S3
  const url = `/products/${encodeURIComponent(fileName)}`;
  return url;
}

async function uploadAllPhotos() {
  console.log('📸 Загружаю фотографии товаров...\n');

  const photosDir = 'frontend/public/products';

  try {
    for (const [sku, photos] of Object.entries(photoMapping)) {
      console.log(`📦 ${sku}:`);

      // Находим товар
      const product = await prisma.product.findFirst({
        where: { sku },
        include: { images: true }
      });

      if (!product) {
        console.log(`  ⚠️  Товар не найден, пропускаю\n`);
        continue;
      }

      // Удаляем старые фотографии
      if (product.images.length > 0) {
        await prisma.productImage.deleteMany({
          where: { productId: product.id }
        });
        console.log(`  🗑️  Удалено старых фото: ${product.images.length}`);
      }

      // Загружаем новые фотографии
      let sortOrder = 1;
      for (const photoFile of photos) {
        const photoPath = path.join(photosDir, photoFile);
        
        if (!fs.existsSync(photoPath)) {
          console.log(`  ⚠️  Файл не найден: ${photoFile}`);
          continue;
        }

        console.log(`  ⬆️  Загружаю: ${photoFile}...`);
        const url = await uploadPhoto(photoPath, sku);

        if (url) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url,
              altText: photoFile.replace('.png', '').replace('.jpg', ''),
              sortOrder: sortOrder++
            }
          });
          console.log(`  ✓ Загружено`);
        }
      }

      console.log(`  ✅ Добавлено фото: ${sortOrder - 1}\n`);
    }

    console.log('\n✅ ВСЁ ГОТОВО!');
    console.log('\n📊 Итоговая статистика:');

    const stats = await prisma.product.findMany({
      where: {
        sku: { in: Object.keys(photoMapping) }
      },
      include: {
        images: true,
        translations: { where: { locale: 'ru' } },
        prices: true
      }
    });

    stats.forEach(p => {
      const name = p.translations[0]?.name || 'Без названия';
      const price = p.prices[0]?.sellingPrice || 0;
      console.log(`\n  📦 ${p.sku}: ${name}`);
      console.log(`     Фото: ${p.images.length}, Цена: ${price} сом`);
    });

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadAllPhotos();
