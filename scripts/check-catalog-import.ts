import { pathToFileURL } from 'node:url';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { categories, products, variantGroups } from './catalog-content';

dotenv.config();

async function main() {
  const clientModule = process.env.CATALOG_CLIENT_MODULE ?? '@prisma/client';
  const clientUrl = clientModule.includes(':') ? clientModule : pathToFileURL(resolve(clientModule)).href;
  const { PrismaClient } = await import(clientUrl);
  const prisma = new PrismaClient();
  try {
    const slugs = categories.map((category) => category.slug);
    const skuList = products.map((product) => product.sku);
    const [categoryRows, productRows, estimatedPrices, activePrices, bundleCount] = await Promise.all([
      prisma.category.findMany({ where: { slug: { in: slugs } }, include: { translations: true, _count: { select: { products: true } } }, orderBy: { sortOrder: 'asc' } }),
      prisma.product.findMany({ where: { sku: { in: skuList } }, include: { translations: true, variants: true, images: true, prices: true, attributes: true } }),
      prisma.productPrice.count({ where: { isEstimate: true, isActive: false, product: { sku: { in: skuList } } } }),
      prisma.productPrice.count({ where: { isEstimate: false, isActive: true, product: { sku: { in: skuList } } } }),
      prisma.productBundle.count(),
    ]);
    const missingTranslationCount = productRows.filter((product) => !['ru', 'ky'].every((locale) => product.translations.some((translation) => translation.locale === locale && translation.name && translation.shortDescription && translation.description))).length;
    const missingSeoCount = productRows.filter((product) => !['ru', 'ky'].every((locale) => product.translations.some((translation) => translation.locale === locale && translation.metaTitle && translation.metaDescription))).length;
    const allInactive = productRows.every((product) => product.status === 'INACTIVE');
    const wordCount = (value: string | null) => value?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    const invalidTextCount = productRows.reduce((total, product) => total + ['ru', 'ky'].filter((locale) => {
      const translation = product.translations.find((item) => item.locale === locale);
      return !translation || wordCount(translation.description) < 40 || wordCount(translation.description) > 80 || wordCount(translation.shortDescription) < 10 || wordCount(translation.shortDescription) > 20;
    }).length, 0);
    const sourceFiles = readdirSync(resolve(process.cwd(), 'frontend/public/products'));
    const bundleFiles = ['ak_kagaz_backpack_dinosaur_3x4.png', 'ak_kagaz_backpack_happy_day_3x4.png', 'ak_kagaz_star_a4_paper_3x4.png'];
    const accountedFiles = new Set([...products.flatMap((product) => [...product.files, ...(product.extraFiles ?? [])]), ...variantGroups.flatMap((group) => group.files), ...bundleFiles]);
    console.log(JSON.stringify({
      expectedProducts: products.filter((product) => !variantGroups.some((group) => group.files.includes(product.files[0])) && product.files[0] !== 'Рабочие тетради «Я и мир».png').length,
      importedProducts: productRows.length,
      photosFound: sourceFiles.length,
      photosAccountedFor: sourceFiles.filter((file) => accountedFiles.has(file)).length,
      bundlePhotosReserved: bundleFiles.length,
      unaccountedPhotos: sourceFiles.filter((file) => !accountedFiles.has(file)),
      categories: categoryRows.map((category) => ({ slug: category.slug, ru: category.translations.find((translation) => translation.locale === 'ru')?.name, ky: category.translations.find((translation) => translation.locale === 'ky')?.name, products: category._count.products })),
      variants: productRows.reduce((sum, product) => sum + product.variants.length, 0),
      images: productRows.reduce((sum, product) => sum + product.images.length, 0),
      missingBilingualDescriptionCount: missingTranslationCount,
      missingBilingualSeoCount: missingSeoCount,
      descriptionsOutsideRequestedWordCounts: invalidTextCount,
      estimatesInactive: estimatedPrices,
      activeConfirmedPrices: activePrices,
      allImportedProductsInactive: allInactive,
      bundlesPresent: bundleCount,
    }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Catalog verification failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
