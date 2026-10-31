const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.$executeRawUnsafe('ALTER TABLE team_invitations ADD COLUMN IF NOT EXISTS name VARCHAR(255);');
  console.log('ALTER TABLE result:', res);
  // Also update user raghuvanshiranapratapsingh@gmail.com with their real display name
  const updatedUser = await prisma.user.updateMany({
    where: { email: 'raghuvanshiranapratapsingh@gmail.com', name: 'raghuvanshiranapratapsingh' },
    data: { name: 'Rana Pratap Singh' },
  });
  console.log('Updated user name count:', updatedUser.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());

