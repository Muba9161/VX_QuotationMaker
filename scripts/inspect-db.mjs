import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = ["contacts", "documents", "document_items", "document_clauses", "templates", "template_items", "template_clauses"];
  for (const table of tables) {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = '${table}'
      ORDER BY ordinal_position;
    `);
    console.log(`\n=== TABLE: ${table} ===`);
    console.log(cols.map(c => `${c.column_name} (${c.data_type}${c.is_nullable === 'NO' ? ', NOT NULL' : ''})`).join(", "));
  }
  await prisma.$disconnect();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
