// Test Neon PostgreSQL connection with Prisma
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function testConnection() {
  try {
    console.log('🔌 Connecting to Neon PostgreSQL via Prisma...');
    
    // Test raw query
    const result = await prisma.$queryRaw`SELECT version(), current_database(), current_user`;
    console.log('✅ Connected successfully!');
    
    console.log('\n📊 Database Info:');
    console.log('  Version:', result[0].version.split(' ').slice(0, 2).join(' '));
    console.log('  Database:', result[0].current_database);
    console.log('  User:', result[0].current_user);

    // Check if any tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\n📋 Tables:', tables.length > 0 ? tables.map(r => r.table_name).join(', ') : 'No tables yet (schema is empty)');
    
    console.log('\n✅ Neon PostgreSQL connection is working!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Connection closed.');
  }
}

testConnection();
