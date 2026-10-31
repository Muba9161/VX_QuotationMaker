const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
  });
  console.log('Org in DB:', { id: org?.id, name: org?.name, displayName: org?.displayName });
}

main().finally(() => prisma.$disconnect());

