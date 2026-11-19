import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../backend/.env') });

const prisma = new PrismaClient();

interface AnalysisResult {
  totalProducts: number;
  noDescription: { count: number; products: any[] };
  shortDescription: { count: number; products: any[] };
  goodDescription: { count: number };
  byLanguage: {
    ru: { missing: number; short: number; good: number };
    ky: { missing: number; short: number; good: number };
  };
}

async function analyzeProductDescriptions() {
  console.log('🔍 Analyzing product descriptions in AK KAGAZ database...\n');

  try {
    // Get all products with translations
    const products = await prisma.product.findMany({
      include: {
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
        brand: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const result: AnalysisResult = {
      totalProducts: products.length,
      noDescription: { count: 0, products: [] },
      shortDescription: { count: 0, products: [] },
      goodDescription: { count: 0 },
      byLanguage: {
        ru: { missing: 0, short: 0, good: 0 },
        ky: { missing: 0, short: 0, good: 0 },
      },
    };

    const MIN_DESCRIPTION_LENGTH = 80; // Минимум для качественного описания

    for (const product of products) {
      const ruTranslation = product.translations.find((t) => t.locale === 'ru');
      const kyTranslation = product.translations.find((t) => t.locale === 'ky');

      let hasIssue = false;

      // Check Russian description
      if (ruTranslation) {
        const desc = ruTranslation.description || '';
        if (!desc || desc.trim().length === 0) {
          result.byLanguage.ru.missing++;
          hasIssue = true;
        } else if (desc.trim().length < MIN_DESCRIPTION_LENGTH) {
          result.byLanguage.ru.short++;
          hasIssue = true;
        } else {
          result.byLanguage.ru.good++;
        }
      } else {
        result.byLanguage.ru.missing++;
        hasIssue = true;
      }

      // Check Kyrgyz description
      if (kyTranslation) {
        const desc = kyTranslation.description || '';
        if (!desc || desc.trim().length === 0) {
          result.byLanguage.ky.missing++;
          hasIssue = true;
        } else if (desc.trim().length < MIN_DESCRIPTION_LENGTH) {
          result.byLanguage.ky.short++;
          hasIssue = true;
        } else {
          result.byLanguage.ky.good++;
        }
      } else {
        result.byLanguage.ky.missing++;
        hasIssue = true;
      }

      // Categorize product
      const hasNoDesc =
        (!ruTranslation?.description || ruTranslation.description.trim().length === 0) &&
        (!kyTranslation?.description || kyTranslation.description.trim().length === 0);

      const hasShortDesc =
        !hasNoDesc &&
        ((ruTranslation?.description && ruTranslation.description.trim().length < MIN_DESCRIPTION_LENGTH) ||
          (kyTranslation?.description && kyTranslation.description.trim().length < MIN_DESCRIPTION_LENGTH));

      if (hasNoDesc) {
        result.noDescription.count++;
        result.noDescription.products.push({
          id: product.id,
          sku: product.sku,
          slug: product.slug,
          nameRu: ruTranslation?.name || 'N/A',
          nameKy: kyTranslation?.name || 'N/A',
          categoryRu: product.category.translations.find((t) => t.locale === 'ru')?.name || 'N/A',
          brand: product.brand?.name || 'N/A',
          status: product.status,
        });
      } else if (hasShortDesc) {
        result.shortDescription.count++;
        result.shortDescription.products.push({
          id: product.id,
          sku: product.sku,
          slug: product.slug,
          nameRu: ruTranslation?.name || 'N/A',
          nameKy: kyTranslation?.name || 'N/A',
          descRuLength: ruTranslation?.description?.trim().length || 0,
          descKyLength: kyTranslation?.description?.trim().length || 0,
          categoryRu: product.category.translations.find((t) => t.locale === 'ru')?.name || 'N/A',
          brand: product.brand?.name || 'N/A',
        });
      } else if (!hasIssue) {
        result.goodDescription.count++;
      }
    }

    // Print report
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 ANALYSIS REPORT: Product Descriptions');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`Total products in database: ${result.totalProducts}\n`);

    console.log('📝 Description Quality:');
    console.log(`  ✅ Good descriptions:     ${result.goodDescription.count}`);
    console.log(`  ⚠️  Short descriptions:    ${result.shortDescription.count}`);
    console.log(`  ❌ Missing descriptions:  ${result.noDescription.count}\n`);

    console.log('🌐 By Language:');
    console.log('  Russian (ru):');
    console.log(`    ✅ Good:    ${result.byLanguage.ru.good}`);
    console.log(`    ⚠️  Short:   ${result.byLanguage.ru.short}`);
    console.log(`    ❌ Missing: ${result.byLanguage.ru.missing}`);
    console.log('  Kyrgyz (ky):');
    console.log(`    ✅ Good:    ${result.byLanguage.ky.good}`);
    console.log(`    ⚠️  Short:   ${result.byLanguage.ky.short}`);
    console.log(`    ❌ Missing: ${result.byLanguage.ky.missing}\n`);

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('❌ PRODUCTS WITHOUT DESCRIPTIONS:');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (result.noDescription.products.length === 0) {
      console.log('  ✅ All products have descriptions!\n');
    } else {
      result.noDescription.products.slice(0, 20).forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.nameRu}`);
        console.log(`   SKU: ${p.sku} | Category: ${p.categoryRu} | Brand: ${p.brand}`);
        console.log(`   Status: ${p.status}\n`);
      });

      if (result.noDescription.products.length > 20) {
        console.log(`   ... and ${result.noDescription.products.length - 20} more\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('⚠️  PRODUCTS WITH SHORT DESCRIPTIONS:');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (result.shortDescription.products.length === 0) {
      console.log('  ✅ No products with short descriptions!\n');
    } else {
      result.shortDescription.products.slice(0, 20).forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.nameRu}`);
        console.log(`   SKU: ${p.sku} | Category: ${p.categoryRu} | Brand: ${p.brand}`);
        console.log(`   Description length: RU=${p.descRuLength} chars, KY=${p.descKyLength} chars\n`);
      });

      if (result.shortDescription.products.length > 20) {
        console.log(`   ... and ${result.shortDescription.products.length - 20} more\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('✅ Analysis complete!');

    return result;
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run analysis
analyzeProductDescriptions()
  .then((result) => {
    console.log('\n📋 Summary:');
    console.log(`   Total: ${result.totalProducts}`);
    console.log(`   Need attention: ${result.noDescription.count + result.shortDescription.count}`);
    console.log(`   Ready for work: ${result.noDescription.count > 0 || result.shortDescription.count > 0 ? 'YES ✅' : 'NO ❌'}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
