const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSettings.findFirst();
  console.log('Current System Settings:', settings);
  if (settings && (settings.platformName === 'WorldX' || settings.supportEmail.includes('worldx.com'))) {
    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        platformName: 'VorldX',
        supportEmail: settings.supportEmail.replace('worldx.com', 'vorldx.com'),
      },
    });
    console.log('Updated System Settings to VorldX:', updated);
  }
}

main().finally(() => prisma.$disconnect());

