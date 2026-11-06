import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create roles
  const roles = [
    {
      name: 'SUPER_ADMIN',
      displayNameRu: 'Суперадминистратор',
      displayNameKy: 'Супер администратор',
      description: 'Full system access',
      isSystem: true,
    },
    {
      name: 'ADMIN',
      displayNameRu: 'Администратор',
      displayNameKy: 'Администратор',
      description: 'Manage products, orders, customers',
      isSystem: true,
    },
    {
      name: 'MANAGER',
      displayNameRu: 'Менеджер',
      displayNameKy: 'Менеджер',
      description: 'Manage orders and customers',
      isSystem: true,
    },
    {
      name: 'WAREHOUSE',
      displayNameRu: 'Складской работник',
      displayNameKy: 'Кампа кызматкери',
      description: 'Manage warehouse and stock',
      isSystem: true,
    },
    {
      name: 'CUSTOMER',
      displayNameRu: 'Покупатель',
      displayNameKy: 'Сатып алуучу',
      description: 'Regular customer',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles created');

  // Create basic permissions
  const permissions = [
    { name: 'users.read', displayNameRu: 'Просмотр пользователей', displayNameKy: 'Колдонуучуларды көрүү', module: 'users' },
    { name: 'users.write', displayNameRu: 'Управление пользователями', displayNameKy: 'Колдонуучуларды башкаруу', module: 'users' },
    { name: 'products.read', displayNameRu: 'Просмотр товаров', displayNameKy: 'Товарларды көрүү', module: 'products' },
    { name: 'products.write', displayNameRu: 'Управление товарами', displayNameKy: 'Товарларды башкаруу', module: 'products' },
    { name: 'orders.read', displayNameRu: 'Просмотр заказов', displayNameKy: 'Заказдарды көрүү', module: 'orders' },
    { name: 'orders.write', displayNameRu: 'Управление заказами', displayNameKy: 'Заказдарды башкаруу', module: 'orders' },
    { name: 'warehouse.read', displayNameRu: 'Просмотр склада', displayNameKy: 'Кампаны көрүү', module: 'warehouse' },
    { name: 'warehouse.write', displayNameRu: 'Управление складом', displayNameKy: 'Кампаны башкаруу', module: 'warehouse' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log('✅ Permissions created');

  // Assign permissions to roles
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const allPermissions = await prisma.permission.findMany();

  if (superAdminRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Permissions assigned to SUPER_ADMIN');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
