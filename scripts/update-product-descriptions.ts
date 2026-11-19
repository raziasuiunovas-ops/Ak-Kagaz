import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../backend/.env') });

const prisma = new PrismaClient();

interface ProductUpdate {
  sku: string;
  translations: {
    locale: string;
    description: string;
  }[];
}

// Новые качественные описания для товаров
const updates: ProductUpdate[] = [
  {
    sku: 'AK-BADGE-PLASTIC',
    translations: [
      {
        locale: 'ru',
        description:
          'Практичные пластиковые бейджи для учителей, сотрудников школы и учащихся. В комплект входит прочная текстильная лента для удобного ношения на шее. Бейдж изготовлен из качественного прозрачного пластика, который защищает содержимое от загрязнений и повреждений. Подходит для размещения пропусков, визитных карточек, фотографий и идентификационных данных. Универсальный размер позволяет использовать стандартные форматы карточек. Яркий жёлтый цвет обеспечивает хорошую видимость в коридорах и помещениях школы. Незаменимый аксессуар для организации пропускной системы и идентификации персонала в образовательных учреждениях.',
      },
      {
        locale: 'ky',
        description:
          'Мугалимдер, мектеп кызматкерлери жана окуучулар үчүн ыңгайлуу пластикалык бейджилер. Комплектке мойнуңузга асып жүрүү үчүн бекем текстилдик лента кирет. Бейдж сапаттуу ачык пластиктен жасалган, ал ичиндегини булганууда жана бузулуудан коргойт. Өтүү карточкаларын, визиттик карточкаларды, фотосүрөттөрдү жана идентификациялык маалыматтарды жайгаштыруу үчүн ылайыктуу. Универсалдуу өлчөмү стандарттык форматтагы карточкаларды колдонууга мүмкүндүк берет. Жарык сары түсү мектептин коридорлорунда жана бөлмөлөрүндө жакшы көрүнүүнү камсыз кылат. Билим берүү мекемелеринде өтүү системасын уюштуруу жана кызмат адамдарын идентификациялоо үчүн алмаштырылгыс аксессуар.',
      },
    ],
  },
  {
    sku: 'AK-BADGE-SCHOOL',
    translations: [
      {
        locale: 'ru',
        description:
          'Школьные значки для обозначения класса учащихся — практичное решение для организации образовательного процесса. Яркие и заметные значки помогают быстро определить, к какому классу относится ученик, что особенно удобно для новых учителей, администрации и технического персонала школы. Изделия выполнены из прочных материалов, устойчивых к ежедневной носке. Значки легко крепятся на школьную форму, рюкзак или сумку с помощью безопасной застёжки. Способствуют формированию у детей чувства принадлежности к классному коллективу и дисциплины. Могут использоваться для проведения внеклассных мероприятий, экскурсий и школьных праздников. Идеальный выбор для начальной и средней школы.',
      },
      {
        locale: 'ky',
        description:
          'Окуучулардын классын белгилөө үчүн мектептик значоктор — билим берүү процессин уюштурууга практикалуу чечим. Жаркыраган жана көрүнгөн значоктор окуучунун кайсы класска тийиштүү экенин тез аныктоого жардам берет, бул өзгөчө жаңы мугалимдер, администрация жана мектептин техникалык кызматкерлери үчүн ыңгайлуу. Буюмдар күнүмдүк тагынууга туруштук берген бекем материалдардан жасалган. Значоктор коопсуз кысыргыч жардамы менен мектеп формасына, рюкзакка же сумкага оңой бекитилет. Балдардын класс коллективине таандык сезимин жана тартипти калыптандырууга өбөлгө түзөт. Класстан тышкаркы иш-чараларды, экскурсияларды жана мектептик майрамдарды өткөрүү үчүн колдонулушу мүмкүн. Башталгыч жана орто мектеп үчүн мыкты тандоо.',
      },
    ],
  },
];

async function updateDescriptions() {
  console.log('🔄 Starting product description updates...\n');

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      console.log(`📝 Processing product: ${update.sku}`);

      try {
        // Find product
        const product = await prisma.product.findUnique({
          where: { sku: update.sku },
          include: {
            translations: true,
          },
        });

        if (!product) {
          console.log(`   ❌ Product not found: ${update.sku}\n`);
          errorCount++;
          continue;
        }

        // Update each translation
        for (const translation of update.translations) {
          const existing = product.translations.find((t) => t.locale === translation.locale);

          if (existing) {
            // Check if description is actually short
            const currentLength = existing.description?.length || 0;

            if (currentLength >= 80) {
              console.log(`   ⏭️  Skipping ${translation.locale}: description already good (${currentLength} chars)`);
              continue;
            }

            console.log(`   📄 Old ${translation.locale} description (${currentLength} chars):`);
            console.log(`      "${existing.description}"`);
            console.log(`   ✏️  New ${translation.locale} description (${translation.description.length} chars):`);
            console.log(`      "${translation.description.substring(0, 100)}..."`);

            // Update translation
            await prisma.productTranslation.update({
              where: { id: existing.id },
              data: {
                description: translation.description,
                updatedAt: new Date(),
              },
            });

            console.log(`   ✅ Updated ${translation.locale} translation`);
          } else {
            console.log(`   ⚠️  Translation not found for locale: ${translation.locale}`);
          }
        }

        successCount++;
        console.log(`   ✅ Product ${update.sku} updated successfully\n`);
      } catch (error) {
        console.error(`   ❌ Error updating product ${update.sku}:`, error);
        errorCount++;
      }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 Update Summary:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`   Total products processed: ${updates.length}`);
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Verify updates
    console.log('🔍 Verifying updates...\n');

    for (const update of updates) {
      const product = await prisma.product.findUnique({
        where: { sku: update.sku },
        include: {
          translations: true,
        },
      });

      if (product) {
        console.log(`✅ ${update.sku}:`);
        product.translations.forEach((t) => {
          console.log(`   ${t.locale}: ${t.description?.length || 0} chars`);
        });
      }
    }

    console.log('\n✅ All updates completed successfully!');
  } catch (error) {
    console.error('❌ Fatal error during update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run updates
updateDescriptions()
  .then(() => {
    console.log('\n🎉 Description update process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
