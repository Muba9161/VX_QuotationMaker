const fs = require('fs');

const adminFiles = [
  'app/admin/branding/page.tsx',
  'app/admin/documents/page.tsx',
  'app/admin/organizations/[id]/page.tsx',
  'app/admin/templates/page.tsx'
];

for (const f of adminFiles) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const updated = content
      .replaceAll('ACME', 'VorldX')
      .replaceAll('Acme', 'VorldX');
    if (content !== updated) {
      fs.writeFileSync(f, updated, 'utf8');
      console.log('Cleaned ACME in:', f);
    }
  }
}

