require('dotenv').config();
const prisma = require('./lib/prisma');

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
