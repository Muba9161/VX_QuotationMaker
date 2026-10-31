-- ==============================================================================
-- WORLDX / VORLDX QUOTATION & MOU PLATFORM - POSTGRESQL DATABASE SCHEMA
-- Version: 1.0.0
-- Database: PostgreSQL 14+
-- Description: Multi-tenant, white-labeled Quotation, MOU & Digital Signing Platform
-- ==============================================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- ENUMS
-- ==============================================================================

-- User & Platform Roles
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'support_admin',
    'org_admin',
    'editor',
    'viewer',
    'recipient'
);

-- User Status
CREATE TYPE user_status AS ENUM (
    'active',
    'invited',
    'inactive',
    'suspended'
);

-- Organization Subscription Plan
CREATE TYPE subscription_tier AS ENUM (
    'free',
    'basic',
    'pro',
    'enterprise'
);

-- Organization Status
CREATE TYPE org_status AS ENUM (
    'active',
    'suspended',
    'pending_verification'
);

-- Document Types
CREATE TYPE document_type AS ENUM (
    'quotation',
    'mou',
    'agreement',
    'nda'
);

-- Document Lifecycle Status
CREATE TYPE document_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'sent',
    'viewed',
    'pending_signature',
    'changes_requested',
    'signed',
    'declined',
    'expired',
    'revoked'
);

-- Recipient Role in Document
CREATE TYPE recipient_role AS ENUM (
    'signer',
    'approver',
    'cc',
    'viewer'
);

-- Recipient Signature Status
CREATE TYPE recipient_status AS ENUM (
    'pending',
    'viewed',
    'signed',
    'changes_requested',
    'declined'
);

-- Digital Signature Method
CREATE TYPE signature_method AS ENUM (
    'draw',
    'type',
    'upload'
);

-- Audit Action Types
CREATE TYPE audit_action AS ENUM (
    'created',
    'updated',
    'submitted_for_approval',
    'approved',
    'sent',
    'delivered',
    'viewed',
    'downloaded',
    'signature_started',
    'signed',
    'changes_requested',
    'declined',
    'reminder_sent',
    'expired',
    'revoked'
);

-- Ticket Status
CREATE TYPE ticket_status AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);

-- Priority Levels
CREATE TYPE priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- ==============================================================================
-- 1. PLATFORM & SUBSCRIPTION TABLES
-- ==============================================================================

-- Subscription Plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    price_yearly NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    max_users INT NOT NULL DEFAULT 5,
    max_documents INT NOT NULL DEFAULT 50,
    storage_limit_mb INT NOT NULL DEFAULT 1024,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Platform-wide System Settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name VARCHAR(100) NOT NULL DEFAULT 'VorldX',
    support_email VARCHAR(255) NOT NULL DEFAULT 'support@vorldx.com',
    max_upload_size_mb INT NOT NULL DEFAULT 10,
    allow_org_registration BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    default_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    tax_name VARCHAR(50) NOT NULL DEFAULT 'GST',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. ORGANIZATIONS (TENANTS) & BRANDING
-- ==============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    tagline VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    tax_id VARCHAR(100), -- GSTIN / VAT / EIN
    cin VARCHAR(100),    -- Corporate Identification Number

    -- White-label Branding & Colors
    logo_url TEXT,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#2563EB',
    secondary_color VARCHAR(20) NOT NULL DEFAULT '#10B981',
    accent_color VARCHAR(20) NOT NULL DEFAULT '#06B6D4',

    -- Letterhead Customization
    letterhead_url TEXT,
    letterhead_header_text TEXT,
    letterhead_footer_text TEXT,
    letterhead_logo_position VARCHAR(20) NOT NULL DEFAULT 'left', -- left, center, right
    default_signatory_name VARCHAR(255),
    default_signatory_title VARCHAR(255),

    -- Workspace Preferences
    allow_member_registration BOOLEAN NOT NULL DEFAULT TRUE,
    require_admin_approval BOOLEAN NOT NULL DEFAULT TRUE,
    default_expiry_days INT NOT NULL DEFAULT 30,
    status org_status NOT NULL DEFAULT 'active',

    -- Usage Counters & Quotas
    current_users_count INT NOT NULL DEFAULT 0,
    current_documents_count INT NOT NULL DEFAULT 0,
    current_storage_bytes BIGINT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Organization Document Configuration Defaults
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    default_tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    default_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    default_currency_symbol VARCHAR(5) NOT NULL DEFAULT '₹',
    default_payment_terms TEXT DEFAULT '50% advance, 50% on milestone delivery',
    standard_notes TEXT DEFAULT 'Thank you for your business. Valid for 30 days.',
    standard_terms_conditions TEXT DEFAULT '• Payment within 30 days.\n• This quotation is valid for 30 days.',
    enable_watermark BOOLEAN NOT NULL DEFAULT FALSE,
    auto_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_days_before_expiry INT NOT NULL DEFAULT 3,

    -- Notification preferences
    notify_doc_viewed BOOLEAN NOT NULL DEFAULT TRUE,
    notify_doc_signed BOOLEAN NOT NULL DEFAULT TRUE,
    notify_doc_expired BOOLEAN NOT NULL DEFAULT TRUE,
    notify_member_joined BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. USERS, MEMBERSHIPS & AUTHENTICATION
-- ==============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'editor',
    status user_status NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    phone VARCHAR(50),
    title VARCHAR(100), -- Designation
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Auth Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Team Member Invitations
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'editor',
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    invited_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, expired, revoked
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. CONTACTS / ADDRESS BOOK
-- ==============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100), -- GSTIN / Tax number
    notes TEXT,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. TEMPLATES (QUOTATION & MOU/AGREEMENT)
-- ==============================================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type document_type NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INT NOT NULL DEFAULT 1,
    content_schema JSONB DEFAULT '{}'::jsonb,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Template Default Line Items
CREATE TABLE template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    default_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL DEFAULT 'Nos',
    default_rate NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sort_order INT NOT NULL DEFAULT 0
);

-- Template Default Clauses (MOUs & Agreements)
CREATE TABLE template_clauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

-- ==============================================================================
-- 6. CORE DOCUMENTS (QUOTATIONS, MOUS, AGREEMENTS, NDAS)
-- ==============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

    -- Document Identifiers
    doc_number VARCHAR(100) NOT NULL, -- e.g., QUO-001, MOU-M-014
    title VARCHAR(255) NOT NULL,
    type document_type NOT NULL,
    status document_status NOT NULL DEFAULT 'draft',
    page_count INT NOT NULL DEFAULT 1,

    -- Client / Counterparty Details
    client_name VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_address TEXT,

    -- Financial Breakdown (For Quotations & Agreements)
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    currency_symbol VARCHAR(5) NOT NULL DEFAULT '₹',
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' | 'fixed'
    discount_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(14, 2) NOT NULL DEFAULT 0.00,

    -- Terms & Execution Details
    payment_terms TEXT,
    notes TEXT,
    terms_and_conditions TEXT,
    governing_law VARCHAR(255) DEFAULT 'Indian Jurisdiction',
    purpose TEXT,

    -- Dates & Security Tokens
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_till DATE,
    effective_date DATE,
    expiry_date DATE,
    share_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),

    -- Document Artifacts
    pdf_url TEXT,
    signed_pdf_url TEXT,

    -- Milestones
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. DOCUMENT LINE ITEMS & CLAUSES
-- ==============================================================================

-- Document Line Items (Items listed in quotations / agreements)
CREATE TABLE document_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50) NOT NULL DEFAULT 'Nos',
    rate NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    sort_order INT NOT NULL DEFAULT 0
);

-- Document Legal Clauses (For MOUs, Agreements & NDAs)
CREATE TABLE document_clauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

-- ==============================================================================
-- 8. RECIPIENTS, SIGNERS & REVISION REQUESTS
-- ==============================================================================

CREATE TABLE document_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to user if registered
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization_name VARCHAR(255),
    designation VARCHAR(100),

    role recipient_role NOT NULL DEFAULT 'signer',
    status recipient_status NOT NULL DEFAULT 'pending',
    sign_order INT NOT NULL DEFAULT 1,
    sign_token VARCHAR(255) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

    -- Security & Audit Tracking
    has_signed BOOLEAN NOT NULL DEFAULT FALSE,
    viewed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    decline_reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Change / Revision Requests Made by Recipients
CREATE TABLE document_change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES document_recipients(id) ON DELETE CASCADE,
    comments TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, resolved, dismissed
    resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. DIGITAL SIGNATURES & AUDIT LOGS
-- ==============================================================================

CREATE TABLE signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES document_recipients(id) ON DELETE CASCADE,
    signer_name VARCHAR(255) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    method signature_method NOT NULL DEFAULT 'draw',

    -- Signature Vector / Image Data
    signature_svg TEXT,
    signature_image_url TEXT,
    signature_text VARCHAR(255),

    -- Verification & Legal Integrity
    certificate_hash VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Document Audit Trail
CREATE TABLE document_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_recipient_id UUID REFERENCES document_recipients(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_email VARCHAR(255),
    action audit_action NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Platform-level Audit Logs
CREATE TABLE platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 10. NOTIFICATIONS & SUPPORT
-- ==============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info', -- 'info' | 'success' | 'warning' | 'error'
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status ticket_status NOT NULL DEFAULT 'open',
    priority priority_level NOT NULL DEFAULT 'medium',
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. INDEXES FOR PERFORMANCE & SEARCH
-- ==============================================================================

-- Documents
CREATE INDEX idx_documents_org_id ON documents(organization_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_share_token ON documents(share_token);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_doc_number ON documents(doc_number);

-- Full-Text Search on Documents
CREATE INDEX idx_documents_search ON documents USING gin(
    to_tsvector('english', title || ' ' || doc_number || ' ' || client_name)
);

-- Document Items & Clauses
CREATE INDEX idx_doc_items_doc_id ON document_items(document_id, sort_order);
CREATE INDEX idx_doc_clauses_doc_id ON document_clauses(document_id, sort_order);

-- Recipients
CREATE INDEX idx_recipients_doc_id ON document_recipients(document_id);
CREATE INDEX idx_recipients_email ON document_recipients(email);
CREATE INDEX idx_recipients_sign_token ON document_recipients(sign_token);
CREATE INDEX idx_recipients_status ON document_recipients(status);

-- Signatures & Audit Logs
CREATE INDEX idx_signatures_doc_id ON signatures(document_id);
CREATE INDEX idx_audit_logs_doc_id ON document_audit_logs(document_id, created_at DESC);

-- Users & Organizations
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_orgs_slug ON organizations(slug);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- 12. TRIGGERS: AUTOMATIC updated_at TIMESTAMP
-- ==============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_org_settings_updated_at BEFORE UPDATE ON organization_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_recipients_updated_at BEFORE UPDATE ON document_recipients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 13. BUSINESS VIEWS FOR FAST QUERIES & DASHBOARDS
-- ==============================================================================

-- View: Recipient Shared Documents View (Powering /recipient/shared & /recipient/pending)
CREATE OR REPLACE VIEW v_recipient_documents AS
SELECT
    r.id AS recipient_id,
    r.email AS recipient_email,
    r.name AS recipient_name,
    r.role AS recipient_role,
    r.status AS recipient_status,
    r.sign_token,
    r.signed_at,
    d.id AS document_id,
    d.doc_number,
    d.title AS document_title,
    d.type AS document_type,
    d.status AS document_status,
    d.page_count,
    d.currency_symbol,
    d.total AS grand_total,
    d.issue_date,
    d.valid_till,
    d.created_at AS document_created_at,
    o.id AS sender_org_id,
    o.name AS sender_company_name,
    o.email AS sender_company_email,
    o.logo_url AS sender_company_logo,
    o.primary_color AS sender_primary_color
FROM document_recipients r
JOIN documents d ON r.document_id = d.id
JOIN organizations o ON d.organization_id = o.id;

-- View: Organization Dashboard Summary
CREATE OR REPLACE VIEW v_organization_summary AS
SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    COUNT(DISTINCT d.id) AS total_documents,
    COUNT(DISTINCT CASE WHEN d.status = 'signed' THEN d.id END) AS signed_documents,
    COUNT(DISTINCT CASE WHEN d.status IN ('sent', 'pending_signature') THEN d.id END) AS pending_documents,
    COUNT(DISTINCT CASE WHEN d.status = 'declined' THEN d.id END) AS declined_documents,
    COALESCE(SUM(CASE WHEN d.status = 'signed' THEN d.total ELSE 0 END), 0) AS total_signed_revenue,
    COUNT(DISTINCT u.id) AS total_team_members
FROM organizations o
LEFT JOIN documents d ON o.id = d.organization_id
LEFT JOIN users u ON o.id = u.organization_id AND u.status = 'active'
GROUP BY o.id, o.name;
