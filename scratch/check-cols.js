const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cols = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'team_invitations'");
  console.log(JSON.stringify(cols, null, 2));
}
main().finally(() => prisma.$disconnect());

