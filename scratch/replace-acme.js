const fs = require('fs');

const files = [
  'components/OrgLayout.tsx',
  'components/UserRoleMenu.tsx',
  'lib/orgStorage.ts',
  'lib/adminStorage.ts',
  'app/recipient/changes/page.tsx',
  'app/recipient/dashboard/page.tsx',
  'app/recipient/declined/page.tsx',
  'app/recipient/downloads/page.tsx',
  'app/recipient/pending/page.tsx',
  'app/recipient/profile/page.tsx',
  'app/recipient/shared/page.tsx',
  'app/recipient/signed/page.tsx',
  'app/admin/audit-logs/page.tsx',
  'app/admin/branding-requests/page.tsx',
  'app/admin/branding/page.tsx',
  'app/admin/dashboard/page.tsx',
  'app/admin/documents/page.tsx',
  'app/admin/organizations/[id]/page.tsx',
  'app/admin/organizations/page.tsx',
  'app/admin/support-tickets/page.tsx',
  'app/admin/templates/page.tsx',
  'app/preview/[id]/page.tsx',
  'app/quotations/new/page.tsx',
  'app/(auth)/login/page.tsx',
  'db/seed.sql',
  'tests/phase5-queues.test.ts',
  'tests/organization-settings.test.ts',
  'README.md'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const updated = content
      .replaceAll('ACME Tech Solutions', 'VorldX Solutions')
      .replaceAll('ACME Tech', 'VorldX')
      .replaceAll('Acme Tech', 'VorldX')
      .replaceAll('acme tech', 'vorldx')
      .replaceAll('ACME Technologies Pvt Ltd', 'VorldX Technologies Pvt Ltd')
      .replaceAll('Acme Technologies Pvt Ltd', 'VorldX Technologies Pvt Ltd')
      .replaceAll('ACME Technologies', 'VorldX Technologies')
      .replaceAll('Acme Technologies', 'VorldX Technologies')
      .replaceAll('ACME TECHNOLOGIES', 'VORLDX TECHNOLOGIES')
      .replaceAll('acme.com', 'vorldx.com');

    if (content !== updated) {
      fs.writeFileSync(f, updated, 'utf8');
      console.log('Replaced ACME in:', f);
    }
  }
}

