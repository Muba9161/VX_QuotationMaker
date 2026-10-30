import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Applying safe additive migrations for Phase 3...");

  // 1. Add missing client/contact columns to contacts table
  await prisma.$executeRawUnsafe(`
    ALTER TABLE contacts 
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state VARCHAR(100),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
  `);
  console.log("✓ Contacts table columns added (website, city, state, country, postal_code, status)");

  // 2. Add item name / discount to document_items if not present
  await prisma.$executeRawUnsafe(`
    ALTER TABLE document_items 
    ADD COLUMN IF NOT EXISTS name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS discount NUMERIC(12, 2) DEFAULT 0.00;
  `);
  console.log("✓ Document items table columns added (name, discount)");

  // 3. Create document_counters table for concurrency-safe auto-numbering
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS document_counters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      year INT NOT NULL,
      last_number INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_document_counters UNIQUE(organization_id, type, year)
    );
  `);
  console.log("✓ Document counters table created with unique (organization_id, type, year)");

  // 4. Create index on document_counters
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_document_counters_org_type 
    ON document_counters(organization_id, type, year);
  `);
  console.log("✓ Document counters index verified");

  await prisma.$disconnect();
  console.log("All additive migrations completed successfully.");
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});

