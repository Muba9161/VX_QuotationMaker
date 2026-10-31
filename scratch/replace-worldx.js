const fs = require('fs');

const files = [
  'db/schema.sql',
  'db/seed.sql'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const updated = content
      .replaceAll('WorldX', 'VorldX')
      .replaceAll('worldx.com', 'vorldx.com');
    if (content !== updated) {
      fs.writeFileSync(f, updated, 'utf8');
      console.log('Updated:', f);
    }
  }
}
