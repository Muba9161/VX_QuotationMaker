const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const orgs = await prisma.organization.findMany();
  console.log('ALL ORGS:', orgs.map(o => ({ id: o.id, name: o.name, displayName: o.displayName, email: o.email, phone: o.phone, address: o.address, signatory: o.defaultSignatoryName })));
}
main().finally(() => prisma.$disconnect());
