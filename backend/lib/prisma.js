const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

let prisma;

function missingDatabaseProxy() {
  return new Proxy({}, {
    get() {
      throw new Error('DATABASE_URL is not set. Add it to backend/.env before using database routes.');
    },
  });
}

function getPrisma() {
  if (prisma) return prisma;

  if (!process.env.DATABASE_URL) {
    prisma = missingDatabaseProxy();
    return prisma;
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

module.exports = getPrisma();
