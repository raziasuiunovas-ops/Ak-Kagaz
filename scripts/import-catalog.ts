import { pathToFileURL } from 'node:url';
import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { categories, products, variantGroups } from './catalog-content';

dotenv.config();
const productsDirectory = resolve(process.cwd(), 'frontend/public/products');
const variantFiles = new Set(variantGroups.flatMap((group) => group.files));
const omittedFiles = new Set(['Рабочие тетради «Я и мир».png']);
let disconnect: () => Promise<void> = async () => undefined;
const oldShortTexts = new Set([
  'Для переноски повседневных вещей на учёбу, прогулку или в поездку.',
  'Күнүмдүк буюмдарды окууга, сейилдөөгө же жолго алып жүрүүгө ылайыктуу.',
  'Помогает хранить письменные принадлежности вместе и поддерживать порядок.',
  'Жазуу буюмдарын чогуу сактап, иреттүү алып жүрүүгө жардам берет.',
  'Для записей, школьных заданий и повседневной письменной работы.',
  'Жазууга, окуу тапшырмаларына жана күнүмдүк ишке арналган.',
  'Бумажная принадлежность для учёбы, заметок, печати или творчества.',
  'Окууга, жазууга, басып чыгарууга же чыгармачылыкка керектүү кагаз буюм.',
  'Учебное издание для занятий по предмету и самостоятельной работы.',
  'Сабакка жана өз алдынча иштөөгө арналган окуу басылмасы.',
  'Наглядное пособие для объяснения темы и учебных занятий.',
  'Теманы түшүндүрүүгө жана сабак учурунда колдонууга арналган көрсөтмө курал.',
  'Для школьных событий, обозначения имени или памятного повода.',
  'Мектеп иш-чараларына, ысымды же өзгөчө учурду көрсөтүүгө ылайыктуу.',
  'Небольшой аксессуар для ключей, сумки или подходящей принадлежности.',
  'Ачкычка, сумкага же ылайыктуу буюмга тагыла турган чакан аксессуар.',
  'Практичная принадлежность для занятий и организации рабочего места.',
  'Сабак өтүүгө жана иш ордун уюштурууга керектүү буюм.',
  'Диффузор для ароматизации помещения в выбранном варианте аромата.',
  'Тандалган жыттагы бөлмө диффузору.',
]);

async function main() {
  const clientModule = process.env.CATALOG_CLIENT_MODULE ?? '@prisma/client';
  const clientUrl = clientModule.includes(':') ? clientModule : pathToFileURL(resolve(clientModule)).href;
  const { PrismaClient } = await import(clientUrl);
  const prisma = new PrismaClient();
  disconnect = () => prisma.$disconnect();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  for (const entry of products) {
    for (const filename of [...entry.files, ...(entry.extraFiles ?? [])]) {
      if (!existsSync(resolve(productsDirectory, filename))) throw new Error(`Missing source image: ${filename}`);
    }
  }
  for (const filename of variantFiles) {
    if (!existsSync(resolve(productsDirectory, filename))) throw new Error(`Missing variant image: ${filename}`);
  }

  const categoryIds = new Map<string, string>();
  for (const entry of categories) {
    const representativeImage = products.find((product) => product.category === entry.slug)?.files[0];
    const imageUrl = representativeImage ? `/products/${encodeURIComponent(representativeImage)}` : undefined;
    let category = await prisma.category.findUnique({ where: { slug: entry.slug }, include: { translations: true } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          slug: entry.slug,
          imageUrl,
          isActive: true,
          sortOrder: categories.indexOf(entry),
          translations: { create: [
            { locale: 'ru', name: entry.ru, description: entry.descRu },
            { locale: 'ky', name: entry.ky, description: entry.descKy },
          ] },
        }, include: { translations: true },
      });
    } else if (!category.imageUrl && imageUrl) {
      category = await prisma.category.update({ where: { id: category.id }, data: { imageUrl }, include: { translations: true } });
    }
    for (const translation of [
      { locale: 'ru', name: entry.ru, description: entry.descRu },
      { locale: 'ky', name: entry.ky, description: entry.descKy },
    ]) {
      if (!category.translations.some((item) => item.locale === translation.locale)) {
        await prisma.categoryTranslation.create({ data: { categoryId: category.id, ...translation } });
      }
    }
    categoryIds.set(entry.slug, category.id);
  }

  const attributeIds = new Map<string, string>();
  const allAttributes = [...new Map(products.flatMap((product) => Object.entries(product.attributes ?? {}))).entries()];
  const attributeLabels: Record<string, { ru: string; ky: string }> = {
    model: { ru: 'Модель', ky: 'Үлгүсү' },
    color: { ru: 'Цвет', ky: 'Түсү' },
    coverColor: { ru: 'Цвет обложки', ky: 'Мукабанын түсү' },
    design: { ru: 'Оформление', ky: 'Жасалгасы' },
    subject: { ru: 'Предмет', ky: 'Сабак' },
    grade: { ru: 'Класс', ky: 'Класс' },
    occasion: { ru: 'Повод', ky: 'Майрамы' },
    quantity: { ru: 'Количество', ky: 'Саны' },
    brand: { ru: 'Марка', ky: 'Маркасы' },
    inkType: { ru: 'Тип чернил', ky: 'Сыянын түрү' },
    type: { ru: 'Тип', ky: 'Түрү' },
    part: { ru: 'Часть', ky: 'Бөлүгү' },
    finish: { ru: 'Покрытие', ky: 'Бетинин түрү' },
    size: { ru: 'Формат', ky: 'Форматы' },
    shape: { ru: 'Форма', ky: 'Формасы' },
    scent: { ru: 'Аромат', ky: 'Жыты' },
  };
  for (const [name] of allAttributes) {
    const labels = attributeLabels[name] ?? { ru: name, ky: name };
    const attribute = await prisma.productAttribute.upsert({
      where: { name },
      update: {},
      create: {
        name,
        displayNameRu: labels.ru,
        displayNameKy: labels.ky,
        type: name === 'color' || name === 'coverColor' ? 'COLOR' : 'TEXT',
      },
    });
    attributeIds.set(name, attribute.id);
  }

  const imported = new Set<string>();
  let created = 0;
  let skipped = 0;
  const priceTier = await prisma.priceTier.upsert({
    where: { name: 'retail' },
    update: {},
    create: {
      name: 'retail',
      displayNameRu: 'Розничная цена',
      displayNameKy: 'Чекене баа',
      description: 'Стандартная цена для розничных покупателей.',
      minQuantity: 1,
      isActive: true,
    },
  });

  for (const entry of products) {
    if (variantFiles.has(entry.files[0])) { skipped += 1; continue; }
    if (omittedFiles.has(entry.files[0])) { skipped += 1; continue; }
    if (imported.has(entry.sku)) continue;
    imported.add(entry.sku);
    const existingProduct = await prisma.product.findUnique({ where: { sku: entry.sku } });
    if (existingProduct) {
      for (const [index, filename] of (entry.extraFiles ?? []).entries()) {
        const url = `/products/${encodeURIComponent(filename)}`;
        const linkedImage = await prisma.productImage.findFirst({ where: { productId: existingProduct.id, url } });
        if (!linkedImage) await prisma.productImage.create({ data: { productId: existingProduct.id, url, altText: entry.ru.name, sortOrder: entry.files.length + index } });
      }
      const existingTranslations = await prisma.productTranslation.findMany({ where: { productId: existingProduct.id } });
      for (const [locale, replacement] of [['ru', entry.ru.short], ['ky', entry.ky.short]] as const) {
        const existingTranslation = existingTranslations.find((translation) => translation.locale === locale);
        if (existingTranslation?.shortDescription && oldShortTexts.has(existingTranslation.shortDescription)) {
          await prisma.productTranslation.update({ where: { id: existingTranslation.id }, data: { shortDescription: replacement } });
        }
        if (existingTranslation && !existingTranslation.metaTitle) {
          const localized = locale === 'ru' ? entry.ru : entry.ky;
          await prisma.productTranslation.update({ where: { id: existingTranslation.id }, data: { metaTitle: `${localized.name} | AK KAGAZ`.slice(0, 200), metaDescription: localized.short.slice(0, 500) } });
        }
      }
      if (entry.estimate) {
        const existingPrice = await prisma.productPrice.findUnique({ where: { productId_tierId: { productId: existingProduct.id, tierId: priceTier.id } } });
        if (!existingPrice) await prisma.productPrice.create({ data: {
          productId: existingProduct.id, tierId: priceTier.id, purchasePrice: null,
          sellingPrice: entry.estimate.price, currency: 'KGS', isActive: false,
          isEstimate: true, estimateBasis: entry.estimate.basis,
        } });
        else if (existingPrice.isEstimate && !existingPrice.isActive && (
          existingPrice.estimateBasis?.startsWith('ОЦЕНКА — НЕ УТВЕРЖДЁННАЯ ЦЕНА. Предварительный ориентир') ||
          existingPrice.estimateBasis?.startsWith('Предварительный ориентир по сопоставимым предложениям магазинов Кыргызстана; цену')
        )) {
          await prisma.productPrice.update({ where: { id: existingPrice.id }, data: { estimateBasis: entry.estimate.basis } });
        }
      }
      skipped += 1;
      continue;
    }
    const categoryId = categoryIds.get(entry.category);
    if (!categoryId) throw new Error(`Missing category ${entry.category}`);
    const group = variantGroups.find((candidate) => candidate.baseSku === entry.sku);
    const groupFiles = group ? [entry.files[0], ...group.files] : entry.files;
    const variants = group?.files.map((filename, index) => ({
      sku: `${entry.sku}-V${String(index + 1).padStart(2, '0')}`,
      name: group.names[index] ?? `Вариант ${index + 1}`,
      imageUrl: `/products/${encodeURIComponent(filename)}`,
      sortOrder: index + 1,
    })) ?? [];

    const product = await prisma.product.create({
      data: {
        sku: entry.sku,
        slug: entry.slug,
        categoryId,
        status: 'INACTIVE',
        hasVariants: variants.length > 0,
        thumbnailUrl: `/products/${encodeURIComponent(entry.files[0])}`,
        translations: { create: [
          { locale: 'ru', name: entry.ru.name, description: entry.ru.description, shortDescription: entry.ru.short, metaTitle: `${entry.ru.name} | AK KAGAZ`.slice(0, 200), metaDescription: entry.ru.short.slice(0, 500) },
          { locale: 'ky', name: entry.ky.name, description: entry.ky.description, shortDescription: entry.ky.short, metaTitle: `${entry.ky.name} | AK KAGAZ`.slice(0, 200), metaDescription: entry.ky.short.slice(0, 500) },
        ] },
        images: { create: [...groupFiles, ...(entry.extraFiles ?? [])].map((filename, index) => ({
          url: `/products/${encodeURIComponent(filename)}`,
          altText: entry.ru.name,
          sortOrder: index,
        })) },
        variants: { create: variants },
        attributes: { create: Object.entries(entry.attributes ?? {}).map(([name, value]) => ({ attributeId: attributeIds.get(name)!, value })) },
      },
    });
    if (entry.estimate) {
      await prisma.productPrice.create({ data: {
        productId: product.id,
        tierId: priceTier.id,
        purchasePrice: null,
        sellingPrice: entry.estimate.price,
        currency: 'KGS',
        isActive: false,
        isEstimate: true,
        estimateBasis: entry.estimate.basis,
      } });
    }
    created += 1;
  }
  console.log(JSON.stringify({ created, skipped, categories: categories.length, variants: variantGroups.reduce((count, group) => count + group.files.length, 0), estimateTierAvailable: Boolean(priceTier) }, null, 2));
}

main().catch((error: unknown) => {
  console.error('Catalog import failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}).finally(async () => { await disconnect(); });
