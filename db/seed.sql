-- ==============================================================================
-- WORLDX / VORLDX PLATFORM - POSTGRESQL SEED DATA
-- Version: 1.0.0
-- ==============================================================================

-- 1. Subscription Plans
INSERT INTO subscription_plans (id, code, name, description, price_monthly, price_yearly, currency, is_free, max_users, max_documents, storage_limit_mb, features)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'PLAN_BASIC', 'Basic', 'Essential document creation and digital signing for small teams', 999.00, 9990.00, 'INR', false, 3, 25, 1024, '["Unlimited Quotations", "5 MOUs per month", "Digital Signatures", "Standard Letterhead", "Email Support"]'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'PLAN_PRO', 'Pro', 'Complete white-label document management for growing businesses', 2499.00, 24990.00, 'INR', false, 10, 200, 5120, '["Everything in Basic", "Unlimited MOUs & NDAs", "Custom Domain", "Audit Trail & Cryptographic Signatures", "Priority Support", "Advanced Analytics"]'::jsonb),
    ('33333333-3333-3333-3333-333333333333', 'PLAN_ENTERPRISE', 'Enterprise', 'Dedicated cloud infrastructure, unlimited users and API access', 5999.00, 59990.00, 'INR', false, 50, 1000, 20480, '["Everything in Pro", "Unlimited Team Members", "Custom SLA", "API & Webhook Access", "Dedicated Account Manager", "SSO & SAML Auth"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- 2. System Settings
INSERT INTO system_settings (id, platform_name, support_email, max_upload_size_mb, allow_org_registration, email_notifications_enabled, maintenance_mode)
VALUES ('00000000-0000-0000-0000-000000000001', 'VorldX', 'support@vorldx.com', 10, true, true, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Demo Organizations (Tenants)
INSERT INTO organizations (
    id, plan_id, name, display_name, slug, domain, tagline, email, phone, website, address,
    tax_id, cin, primary_color, secondary_color, accent_color,
    letterhead_header_text, letterhead_footer_text, default_signatory_name, default_signatory_title,
    allow_member_registration, require_admin_approval, default_expiry_days, status
)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'Acme Technologies Pvt Ltd',
        'ACME Tech',
        'acme-tech',
        'acme.com',
        'Innovating for a Better Tomorrow',
        'contact@acme.com',
        '+91 98765 43210',
        'https://www.acme.com',
        'A-123, Sector 62, Noida, U.P. 201301',
        '07AABCU9603R1ZM',
        'U72900DL2021PTC123456',
        '#2563EB',
        '#10B981',
        '#06B6D4',
        'Acme Technologies Pvt Ltd • Software & Cloud Engineering Services',
        'Registered Office: A-123, Sector 62, Noida, U.P. 201301 • Contact: contact@acme.com',
        'Rahul Sharma',
        'Chief Executive Officer',
        true,
        true,
        30,
        'active'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'BrightPath Solutions',
        'BrightPath',
        'brightpath',
        'brightpath.com',
        'Strategic Tech Consulting',
        'sarah@brightpath.com',
        '+91 98111 22334',
        'https://www.brightpath.com',
        'Level 4, Prestige Tower, MG Road, Bengaluru, KA 560001',
        '29AABCU9603R1ZK',
        'U72900KA2020PTC654321',
        '#0D9488',
        '#8B5CF6',
        '#3B82F6',
        'BrightPath Solutions • Management & Enterprise Advisory',
        'Bengaluru • Mumbai • Singapore',
        'Sarah Jenkins',
        'Managing Director',
        true,
        true,
        30,
        'active'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        'Northstar Systems',
        'Northstar',
        'northstar',
        'northstar.com',
        'Enterprise Security & Infrastructure',
        'contact@northstar.com',
        '+91 98222 33445',
        'https://www.northstar.com',
        'Cyber City, Tower 8B, DLF Phase 2, Gurugram, HR 122002',
        '06AABCU9603R1ZL',
        'U72900HR2019PTC789101',
        '#0F172A',
        '#38BDF8',
        '#64748B',
        'Northstar Systems • Certified Cyber Defense & Architecture',
        'Gurugram, Haryana',
        'Vikram Malhotra',
        'VP Operations',
        true,
        false,
        30,
        'active'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '22222222-2222-2222-2222-222222222222',
        'Zenith Innovations',
        'Zenith',
        'zenith',
        'zenith.com',
        'Next-Gen Product Studio',
        'info@zenith.com',
        '+91 98333 44556',
        'https://www.zenith.com',
        'BKC, Bandra East, Mumbai, MH 400051',
        '27AABCU9603R1ZM',
        'U72900MH2022PTC112233',
        '#7C3AED',
        '#EC4899',
        '#F59E0B',
        'Zenith Innovations • Product Design & Venture Studio',
        'Mumbai, Maharashtra',
        'Rohan Kapoor',
        'Partner',
        true,
        true,
        30,
        'active'
    )
ON CONFLICT (slug) DO NOTHING;

-- 4. Organization Settings
INSERT INTO organization_settings (
    organization_id, default_tax_rate, default_currency, default_currency_symbol,
    default_payment_terms, standard_notes, standard_terms_conditions,
    enable_watermark, auto_reminders_enabled, reminder_days_before_expiry,
    notify_doc_viewed, notify_doc_signed, notify_doc_expired, notify_member_joined
)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    18.00,
    'INR',
    '₹',
    '50% advance, 50% on milestone delivery',
    'Thank you for your business. Valid for 30 days.',
    '• Payment within 30 days.\n• This quotation is valid for 30 days.\n• All intellectual property rights are reserved until final disbursement.',
    false,
    true,
    3,
    true,
    true,
    true,
    false
)
ON CONFLICT (organization_id) DO NOTHING;

-- 5. Users (Team Members, Admins & External Recipients)
INSERT INTO users (id, organization_id, name, email, password_hash, role, status, avatar_url, phone, title, email_verified)
VALUES
    -- Platform Super Admin
    (
        '99999999-9999-9999-9999-999999999999',
        NULL,
        'Platform Administrator',
        'admin@vorldx.com',
        crypt('Admin@12345', gen_salt('bf')),
        'super_admin',
        'active',
        NULL,
        '+91 99999 00000',
        'Chief Systems Administrator',
        true
    ),
    -- Acme Org Admin (Rahul Sharma)
    (
        'a1111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Rahul Sharma',
        'rahul@acme.com',
        crypt('Rahul@12345', gen_salt('bf')),
        'org_admin',
        'active',
        NULL,
        '+91 98765 43210',
        'Chief Executive Officer',
        true
    ),
    -- Acme Editors
    (
        'a2222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Priya Singh',
        'priya@acme.com',
        crypt('Priya@12345', gen_salt('bf')),
        'editor',
        'active',
        NULL,
        '+91 98765 43211',
        'Lead Product Manager',
        true
    ),
    (
        'a3333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Amit Verma',
        'amit@acme.com',
        crypt('Amit@12345', gen_salt('bf')),
        'editor',
        'active',
        NULL,
        '+91 98765 43212',
        'Sales Lead',
        true
    ),
    (
        'a4444444-4444-4444-4444-444444444444',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Neha Gupta',
        'neha@acme.com',
        crypt('Neha@12345', gen_salt('bf')),
        'editor',
        'invited',
        NULL,
        '+91 98765 43213',
        'Legal Associate',
        false
    ),
    -- Acme Viewer
    (
        'a5555555-5555-5555-5555-555555555555',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Karan Mehta',
        'karan@acme.com',
        crypt('Karan@12345', gen_salt('bf')),
        'viewer',
        'active',
        NULL,
        '+91 98765 43214',
        'Finance Analyst',
        true
    ),
    -- External Signer Recipient (John Doe)
    (
        'd1111111-1111-1111-1111-111111111111',
        NULL,
        'John Doe',
        'john.doe@email.com',
        crypt('John@12345', gen_salt('bf')),
        'recipient',
        'active',
        NULL,
        '+91 98111 55667',
        'VP Technology, Innovate India',
        true
    )
ON CONFLICT (email) DO NOTHING;

-- 6. Core Documents (Matching Image 2 in Recipient and Organization Dashboards)
INSERT INTO documents (
    id, organization_id, created_by_user_id, doc_number, title, type, status, page_count,
    client_name, client_company, client_email, client_phone, client_address,
    currency, currency_symbol, subtotal, tax_rate, tax_amount, discount_type, discount_value, discount_amount, total,
    payment_terms, notes, terms_and_conditions, issue_date, valid_till, share_token
)
VALUES
    -- 1. Quotation Q-001 (Pending Signature by John Doe)
    (
        'd0000001-0000-0000-0000-000000000001',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'a1111111-1111-1111-1111-111111111111',
        'Quotation - Q-001',
        'Web & Cloud Transformation Services',
        'quotation',
        'pending_signature',
        2,
        'Innovate India',
        'Innovate India Pvt Ltd',
        'john.doe@email.com',
        '+91 98111 55667',
        'BKC, Mumbai, Maharashtra 400051',
        'INR',
        '₹',
        100000.00,
        18.00,
        18000.00,
        'percentage',
        0.00,
        0.00,
        118000.00,
        '50% advance, 50% on milestone delivery',
        'Thank you for partnering with Acme Technologies.',
        '• Payment within 30 days.\n• This quotation is valid for 30 days.',
        '2026-10-28',
        '2026-11-28',
        'token-doc-quo-001'
    ),
    -- 2. MOU M-014 (BrightPath Solutions - Changes Requested)
    (
        'd0000002-0000-0000-0000-000000000002',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        NULL,
        'MOU - M-014',
        'Strategic Joint Venture Framework',
        'mou',
        'changes_requested',
        5,
        'Acme Technologies Pvt Ltd',
        'Acme Technologies',
        'john.doe@email.com',
        '+91 98765 43210',
        'A-123, Sector 62, Noida, U.P.',
        'INR',
        '₹',
        0.00,
        0.00,
        0.00,
        'percentage',
        0.00,
        0.00,
        0.00,
        'Quarterly joint revenue share',
        'Standard non-binding collaboration memorandum.',
        'Governed under Indian Commercial Arbitration Act.',
        '2026-10-26',
        '2026-11-15',
        'token-doc-mou-014'
    ),
    -- 3. Service Agreement SA-003 (Northstar Systems - Signed)
    (
        'd0000003-0000-0000-0000-000000000003',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        NULL,
        'Service Agreement - SA-003',
        'Managed Cloud Defense Agreement',
        'agreement',
        'signed',
        4,
        'Innovate India',
        'Innovate India',
        'john.doe@email.com',
        '+91 98222 33445',
        'Cyber City, Gurugram, Haryana',
        'INR',
        '₹',
        250000.00,
        18.00,
        45000.00,
        'percentage',
        0.00,
        0.00,
        295000.00,
        'Net 30 days monthly billing',
        'Fully executed agreement with certified timestamp.',
        'All standard SOC2 & ISO27001 requirements applicable.',
        '2026-10-22',
        '2026-11-30',
        'token-doc-sa-003'
    ),
    -- 4. Quotation Q-008 (Acme Technologies - Signed)
    (
        'd0000004-0000-0000-0000-000000000004',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'a1111111-1111-1111-1111-111111111111',
        'Quotation - Q-008',
        'Enterprise UI/UX Design System',
        'quotation',
        'signed',
        3,
        'Innovate India',
        'Innovate India',
        'john.doe@email.com',
        '+91 98765 43210',
        'BKC, Mumbai, Maharashtra',
        'INR',
        '₹',
        80000.00,
        18.00,
        14400.00,
        'percentage',
        0.00,
        0.00,
        94400.00,
        '100% on sign-off',
        'Completed design deliverables approved.',
        'Includes 6 months design maintenance and asset delivery.',
        '2026-10-20',
        '2026-11-20',
        'token-doc-quo-008'
    ),
    -- 5. NDA NDA-006 (Zenith Innovations - Declined)
    (
        'd0000005-0000-0000-0000-000000000005',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        NULL,
        'NDA - NDA-006',
        'Mutual Non-Disclosure Agreement',
        'nda',
        'declined',
        3,
        'Innovate India',
        'Innovate India',
        'john.doe@email.com',
        '+91 98333 44556',
        'Bandra East, Mumbai',
        'INR',
        '₹',
        0.00,
        0.00,
        0.00,
        'percentage',
        0.00,
        0.00,
        0.00,
        'N/A',
        'Declined due to non-standard indemnity clause 4.2.',
        'Standard 3-year confidentiality term.',
        '2026-10-18',
        '2026-11-15',
        'token-doc-nda-006'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Document Line Items (For Quotation Q-001)
INSERT INTO document_items (document_id, description, quantity, unit, rate, tax_percent, amount, sort_order)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'Web Development (Next.js & Microservices)', 1.00, 'Nos', 50000.00, 18.00, 50000.00, 1),
    ('d0000001-0000-0000-0000-000000000001', 'UI/UX Design & High-Fidelity Prototype', 1.00, 'Nos', 30000.00, 18.00, 30000.00, 2),
    ('d0000001-0000-0000-0000-000000000001', 'Maintenance Support & CI/CD Pipeline', 1.00, 'Nos', 20000.00, 18.00, 20000.00, 3);

-- 8. Document Legal Clauses (For MOU M-014)
INSERT INTO document_clauses (document_id, title, content, sort_order)
VALUES
    ('d0000002-0000-0000-0000-000000000002', '1. Scope of Collaboration', 'Both parties agree to collaborate on technology research, enterprise digital transformation, and joint market ventures.', 1),
    ('d0000002-0000-0000-0000-000000000002', '2. Confidentiality & IP', 'Proprietary information shared during the engagement shall remain protected under standard non-disclosure terms.', 2),
    ('d0000002-0000-0000-0000-000000000002', '3. Commercial Terms & Non-Exclusivity', 'This MOU does not establish an exclusive partnership. Each party is free to engage third parties for similar projects.', 3);

-- 9. Document Recipients (External Signers)
INSERT INTO document_recipients (
    id, document_id, user_id, name, email, role, status, sign_order, sign_token, has_signed, signed_at
)
VALUES
    (
        'e0000001-0000-0000-0000-000000000001',
        'd0000001-0000-0000-0000-000000000001',
        'd1111111-1111-1111-1111-111111111111',
        'John Doe',
        'john.doe@email.com',
        'signer',
        'pending',
        1,
        'sign-token-q-001',
        false,
        NULL
    ),
    (
        'e0000002-0000-0000-0000-000000000002',
        'd0000002-0000-0000-0000-000000000002',
        'd1111111-1111-1111-1111-111111111111',
        'John Doe',
        'john.doe@email.com',
        'signer',
        'changes_requested',
        1,
        'sign-token-m-014',
        false,
        NULL
    ),
    (
        'e0000003-0000-0000-0000-000000000003',
        'd0000003-0000-0000-0000-000000000003',
        'd1111111-1111-1111-1111-111111111111',
        'John Doe',
        'john.doe@email.com',
        'signer',
        'signed',
        1,
        'sign-token-sa-003',
        true,
        '2026-10-22 11:20:00+05:30'
    ),
    (
        'e0000004-0000-0000-0000-000000000004',
        'd0000004-0000-0000-0000-000000000004',
        'd1111111-1111-1111-1111-111111111111',
        'John Doe',
        'john.doe@email.com',
        'signer',
        'signed',
        1,
        'sign-token-q-008',
        true,
        '2026-10-20 09:45:00+05:30'
    ),
    (
        'e0000005-0000-0000-0000-000000000005',
        'd0000005-0000-0000-0000-000000000005',
        'd1111111-1111-1111-1111-111111111111',
        'John Doe',
        'john.doe@email.com',
        'signer',
        'declined',
        1,
        'sign-token-nda-006',
        false,
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- 10. Audit Log History for Cryptographic Verification
INSERT INTO document_audit_logs (document_id, actor_name, actor_email, action, details, ip_address)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'Rahul Sharma', 'rahul@acme.com', 'created', 'Created quotation document draft with 3 line items', '192.168.1.10'),
    ('d0000001-0000-0000-0000-000000000001', 'Rahul Sharma', 'rahul@acme.com', 'sent', 'Sent quotation via digital signing link to john.doe@email.com', '192.168.1.10'),
    ('d0000001-0000-0000-0000-000000000001', 'John Doe', 'john.doe@email.com', 'viewed', 'Opened signing portal from Chrome on Windows', '103.21.244.2'),
    ('d0000003-0000-0000-0000-000000000003', 'John Doe', 'john.doe@email.com', 'signed', 'Completed legally binding digital signature with drawn stroke data', '103.21.244.2');
