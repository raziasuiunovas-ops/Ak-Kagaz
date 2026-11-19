import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../backend/.env') });

const prisma = new PrismaClient();

async function getProductDetails() {
  const skus = ['AK-BADGE-PLASTIC', 'AK-BADGE-SCHOOL'];

  for (const sku of skus) {
    const product = await prisma.product.findUnique({
      where: { sku },
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
        brand: true,
        attributes: {
          include: {
            attribute: true,
          },
        },
        images: true,
      },
    });

    if (product) {
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log(`📦 Product: ${sku}`);
      console.log('═══════════════════════════════════════════════════════════════\n');

      const ruTrans = product.translations.find((t) => t.locale === 'ru');
      const kyTrans = product.translations.find((t) => t.locale === 'ky');

      console.log('🏷️  Basic Info:');
      console.log(`   ID: ${product.id}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Slug: ${product.slug}`);
      console.log(`   Status: ${product.status}`);
      console.log(`   Featured: ${product.isFeatured}`);
      console.log(`   Has Variants: ${product.hasVariants}\n`);

      console.log('🗂️  Category:');
      const ruCat = product.category.translations.find((t) => t.locale === 'ru');
      const kyCat = product.category.translations.find((t) => t.locale === 'ky');
      console.log(`   RU: ${ruCat?.name || 'N/A'}`);
      console.log(`   KY: ${kyCat?.name || 'N/A'}\n`);

      console.log('🏢 Brand:');
      console.log(`   ${product.brand?.name || 'N/A'}\n`);

      console.log('📝 Current Translations (RU):');
      if (ruTrans) {
        console.log(`   Name: ${ruTrans.name}`);
        console.log(`   Short Description: ${ruTrans.shortDescription || 'N/A'}`);
        console.log(`   Description: ${ruTrans.description || 'N/A'}`);
        console.log(`   Description Length: ${ruTrans.description?.length || 0} chars\n`);
      } else {
        console.log('   NOT FOUND\n');
      }

      console.log('📝 Current Translations (KY):');
      if (kyTrans) {
        console.log(`   Name: ${kyTrans.name}`);
        console.log(`   Short Description: ${kyTrans.shortDescription || 'N/A'}`);
        console.log(`   Description: ${kyTrans.description || 'N/A'}`);
        console.log(`   Description Length: ${kyTrans.description?.length || 0} chars\n`);
      } else {
        console.log('   NOT FOUND\n');
      }

      if (product.attributes.length > 0) {
        console.log('🔧 Attributes:');
        product.attributes.forEach((attr) => {
          console.log(`   ${attr.attribute.displayNameRu}: ${attr.value}`);
        });
        console.log('');
      }

      if (product.images.length > 0) {
        console.log(`📸 Images: ${product.images.length} images`);
        console.log('');
      }
    }
  }

  await prisma.$disconnect();
}

getProductDetails();
