const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
  });

  if (org) {
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: {
        displayName: 'VorldX',
        name: org.name.includes('Acme') ? 'VorldX Technologies Pvt Ltd' : org.name,
        letterheadHeaderText: org.letterheadHeaderText?.replace(/Acme Technologies/gi, 'VorldX Technologies'),
      }
    });
    console.log('Updated Organization in DB:', {
      id: updated.id,
      name: updated.name,
      displayName: updated.displayName,
      letterheadHeaderText: updated.letterheadHeaderText
    });
  }

  // Also check if any team invitation or other records have 'ACME Tech'
  const allOrgs = await prisma.organization.findMany();
  for (const o of allOrgs) {
    if (o.displayName?.includes('Acme') || o.displayName?.includes('ACME Tech')) {
      await prisma.organization.update({
        where: { id: o.id },
        data: { displayName: 'VorldX' }
      });
      console.log(`Updated org ${o.id} displayName to VorldX`);
    }
  }
}

main().finally(() => prisma.$disconnect());

