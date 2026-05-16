const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Testing database connection...');
    
    // Try to query users table
    const users = await prisma.user.findMany();
    console.log(`✓ Database connected! Found ${users.length} users.`);
    
  } catch (err) {
    console.error('✗ Database error:', err.message);
    console.log('\nPlease run: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

main();
