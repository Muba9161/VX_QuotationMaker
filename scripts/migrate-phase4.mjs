import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function exec(sql, desc) {
  await prisma.$executeRawUnsafe(sql);
  if (desc) console.log(`✓ ${desc}`);
}

async function main() {
  console.log("Applying safe additive migrations for Phase 4...");

  // 1. document_snapshots
  await exec(`
    CREATE TABLE IF NOT EXISTS document_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      version INT NOT NULL DEFAULT 1,
      title VARCHAR(255) NOT NULL,
      doc_number VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      content_json JSONB NOT NULL,
      content_hash VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `, "document_snapshots table verified");

  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_snapshots_org ON document_snapshots(organization_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_snapshots_doc ON document_snapshots(document_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_snapshots_hash ON document_snapshots(content_hash)`, "document_snapshots indexes verified");

  // 2. document_shares
  await exec(`
    CREATE TABLE IF NOT EXISTS document_shares (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      snapshot_id UUID REFERENCES document_snapshots(id) ON DELETE SET NULL,
      token_hash VARCHAR(64) UNIQUE NOT NULL,
      recipient_name VARCHAR(255) NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      recipient_role VARCHAR(50) NOT NULL DEFAULT 'CLIENT',
      signing_order INT NOT NULL DEFAULT 1,
      custom_message TEXT,
      require_otp BOOLEAN NOT NULL DEFAULT FALSE,
      allow_download BOOLEAN NOT NULL DEFAULT TRUE,
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      expires_at TIMESTAMPTZ NOT NULL,
      viewed_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `, "document_shares table verified");

  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_shares_org ON document_shares(organization_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_shares_doc ON document_shares(document_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_shares_token ON document_shares(token_hash)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_shares_status ON document_shares(status)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_shares_email ON document_shares(recipient_email)`, "document_shares indexes verified");

  // 3. document_otps
  await exec(`
    CREATE TABLE IF NOT EXISTS document_otps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      share_id UUID NOT NULL REFERENCES document_shares(id) ON DELETE CASCADE,
      otp_hash VARCHAR(64) NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      max_attempts INT NOT NULL DEFAULT 3,
      expires_at TIMESTAMPTZ NOT NULL,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `, "document_otps table verified");

  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_otps_share ON document_otps(share_id)`, "document_otps index verified");

  // 4. phase4_signatures
  await exec(`
    CREATE TABLE IF NOT EXISTS phase4_signatures (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      share_id UUID NOT NULL REFERENCES document_shares(id) ON DELETE CASCADE,
      signer_name VARCHAR(255) NOT NULL,
      signer_email VARCHAR(255) NOT NULL,
      signer_role VARCHAR(50) NOT NULL DEFAULT 'CLIENT',
      signature_type VARCHAR(20) NOT NULL DEFAULT 'DRAWN',
      signature_data TEXT NOT NULL,
      consent_statement TEXT NOT NULL,
      consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
      consent_accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ip_address VARCHAR(45),
      user_agent TEXT,
      snapshot_hash VARCHAR(64) NOT NULL,
      signed_pdf_hash VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `, "phase4_signatures table verified");

  await exec(`CREATE INDEX IF NOT EXISTS idx_p4_sig_org ON phase4_signatures(organization_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_p4_sig_doc ON phase4_signatures(document_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_p4_sig_share ON phase4_signatures(share_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_p4_sig_email ON phase4_signatures(signer_email)`, "phase4_signatures indexes verified");

  // 5. document_access_events
  await exec(`
    CREATE TABLE IF NOT EXISTS document_access_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      share_id UUID NOT NULL REFERENCES document_shares(id) ON DELETE CASCADE,
      document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `, "document_access_events table verified");

  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_access_events_share ON document_access_events(share_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_access_events_doc ON document_access_events(document_id)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_doc_access_events_type ON document_access_events(event_type)`, "document_access_events indexes verified");

  await prisma.$disconnect();
  console.log("Phase 4 additive database migration completed successfully.");
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
