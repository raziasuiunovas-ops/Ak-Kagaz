const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const globes = await prisma.product.findMany({
    where: { sku: { contains: 'GLOBE' } },
    select: { id: true, sku: true, status: true, isFeatured: true }
  });
  console.log('Глобусы:', JSON.stringify(globes, null, 2));
  
  const badges = await prisma.product.findMany({
    where: { sku: { contains: 'BADGE' } },
    select: { id: true, sku: true, status: true, isFeatured: true }
  });
  console.log('\nЗначки:', JSON.stringify(badges, null, 2));
  
  await prisma.$disconnect();
}

check();
