# VorldX Quotation & MOU Platform — Phase 1: Authentication & Authorization

## 1. Executive Summary

This document specifies the backend authentication, session management, Role-Based Access Control (RBAC), and multi-tenant isolation architecture for the VorldX White-Label Quotation & MOU Platform.

The implementation strictly preserves the Next.js App Router frontend, adheres to PostgreSQL relational constraints, and establishes high-assurance security practices without relying on third-party SaaS authentication services (such as Firebase, Supabase, or Auth0).

---

## 2. Authentication Architecture & Session Security

### 2.1 Opaque Revocable Token Flow
Rather than issuing stateless JSON Web Tokens (which cannot be revoked instantly without distributed blacklists), the platform issues **opaque, cryptographically secure random session tokens**:

1. **Token Generation**: On successful authentication or registration, a 64-character hexadecimal token (256 bits of entropy) is generated using `crypto.randomBytes(32)`.
2. **Storage Hashing**: The raw token is **never stored** in the database. Only its **SHA-256 digest** (`crypto.createHash('sha256').update(rawToken).digest('hex')`) is saved in `sessions.session_token`. If the database is compromised, existing active sessions cannot be hijacked.
3. **Cookie Delivery**: The raw token is delivered to the browser exclusively through a secure `Set-Cookie` header (`vx_session`).
4. **Validation**: For incoming requests, the token from `vx_session` (or `Authorization: Bearer <token>`) is hashed via SHA-256 and matched against `sessions.session_token`. The session must be unexpired (`expires_at > NOW()`) and the associated user must be `ACTIVE`.
5. **Instant Revocation**: Logout executes `DELETE FROM sessions WHERE session_token = <sha256_hash>` and overwrites the cookie with `Max-Age=0`, instantly invalidating the session.

### 2.2 Cookie Configuration
| Attribute | Production Value | Development Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Name** | `vx_session` | `vx_session` | Session identifier cookie |
| **HttpOnly** | `true` | `true` | Blocks client-side JavaScript access (XSS mitigation) |
| **Secure** | `true` | `false` | Requires HTTPS in production |
| **SameSite** | `lax` | `lax` | Defends against Cross-Site Request Forgery (CSRF) while allowing top-level navigations |
| **Path** | `/` | `/` | Accessible across all API endpoints |
| **Max-Age** | 28,800 sec (8 hours) | 28,800 sec | Enforces bounded session validity |

---

## 3. Password Security & Hashing

- **Hashing Algorithm**: `bcryptjs` with a work factor of **12 salt rounds**.
- **Password Strength Rules**:
  - Minimum 8 characters; maximum 128 characters.
  - Requires both alphabetical letters and numeric/special characters.
- **Timing Protection**:
  - Unregistered email lookups perform dummy checks or return generic "Invalid email or password" messages to prevent account enumeration.
  - Password hashes are never returned in JSON payloads (sanitized via `toSafeUser`).

---

## 4. Role-Based Access Control (RBAC)

The platform defines 6 distinct roles across platform-level and organization-level contexts:

| Role | Scope | Key Capabilities |
| :--- | :--- | :--- |
| **SUPER_ADMIN** | Platform | Global tenant management, plan configuration, platform audit logs, support tickets, all org and document features. |
| **SUPPORT_ADMIN** | Platform | Cross-tenant visibility, audit logs, support ticket triage, document viewing (no billing/plan modifications). |
| **ORG_ADMIN** | Organization | Full tenant administration: workspace branding, user management, invites, document creation/approval/deletion, reports. |
| **EDITOR** | Organization | Document creation, line item editing, and sending within their organization workspace. |
| **VIEWER** | Organization | Read-only access to documents, quotes, and reports within their organization. |
| **RECIPIENT** | External | Document-specific access to view, digitally sign, decline, or submit change requests. |

### Complete Permission Matrix
```
Permission                    | SUPER | SUPPORT | ORG_ADMIN | EDITOR | VIEWER | RECIPIENT
------------------------------+-------+---------+-----------+--------+--------+----------
platform:manage_orgs          |   ✓   |    ✓    |     -     |   -    |   -    |    -
platform:manage_plans         |   ✓   |    -    |     -     |   -    |   -    |    -
platform:manage_settings      |   ✓   |    -    |     -     |   -    |   -    |    -
platform:view_audit_logs      |   ✓   |    ✓    |     -     |   -    |   -    |    -
platform:support_tickets      |   ✓   |    ✓    |     -     |   -    |   -    |    -
org:manage_branding           |   ✓   |    -    |     ✓     |   -    |   -    |    -
org:manage_settings           |   ✓   |    -    |     ✓     |   -    |   -    |    -
org:manage_team               |   ✓   |    -    |     ✓     |   -    |   -    |    -
org:invite_members            |   ✓   |    -    |     ✓     |   -    |   -    |    -
org:view_reports              |   ✓   |    -    |     ✓     |   -    |   -    |    -
doc:create                    |   ✓   |    -    |     ✓     |   ✓    |   -    |    -
doc:edit                      |   ✓   |    -    |     ✓     |   ✓    |   -    |    -
doc:approve                   |   ✓   |    -    |     ✓     |   -    |   -    |    -
doc:send                      |   ✓   |    -    |     ✓     |   ✓    |   -    |    -
doc:delete                    |   ✓   |    -    |     ✓     |   -    |   -    |    -
doc:view                      |   ✓   |    ✓    |     ✓     |   ✓    |   ✓    |    -
recipient:sign                |   -   |    -    |     -     |   -    |   -    |    ✓
recipient:change_request      |   -   |    -    |     -     |   -    |   -    |    ✓
recipient:decline             |   -   |    -    |     -     |   -    |   -    |    ✓
```

---

## 5. Multi-Tenant Isolation & Request Guards

Multi-tenant data isolation is enforced through server-side request guards in `lib/auth/guards.ts`:

1. **Session Binding**: `requireTenantContext(req)` extracts the authenticated user record from the PostgreSQL session.
2. **Untrusted Header Repudiation**: Organization members (`ORG_ADMIN`, `EDITOR`, `VIEWER`) are **strictly locked** to `user.organizationId`. Client-supplied headers (e.g. `x-tenant-id`) or request parameters are ignored, preventing cross-tenant spoofing.
3. **Workspace Verification**: The guard checks `organization.status === 'ACTIVE'`. If an organization is suspended or pending verification, access is blocked with HTTP 403 (`ORGANIZATION_INACTIVE`).
4. **Platform Administrator Override**: Platform Admins (`SUPER_ADMIN`, `SUPPORT_ADMIN`) may inspect a tenant workspace if a matching `x-tenant-id` header is explicitly provided.

---

## 6. API Route Contracts

### 6.1 `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@organization.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (200 OK)**:
  - Header: `Set-Cookie: vx_session=<token>; HttpOnly; Path=/; SameSite=Lax`
  - Body:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "uuid",
          "name": "Jane Doe",
          "email": "user@organization.com",
          "role": "ORG_ADMIN",
          "status": "ACTIVE"
        },
        "organization": {
          "id": "uuid",
          "name": "Acme Corp",
          "slug": "acme-corp",
          "primaryColor": "#2563EB",
          "status": "ACTIVE"
        },
        "permissions": ["doc:create", "org:manage_team", "..."]
      }
    }
    ```
- **Error Responses**:
  - `400 Bad Request`: `VALIDATION_ERROR` or `INVALID_JSON`
  - `401 Unauthorized`: `INVALID_CREDENTIALS`
  - `403 Forbidden`: `ACCOUNT_INACTIVE` or `ORGANIZATION_INACTIVE`

### 6.2 `POST /api/v1/auth/logout`
- **Request**: Cookie `vx_session=<token>`
- **Success Response (200 OK)**:
  - Header: `Set-Cookie: vx_session=; Path=/; Max-Age=0`
  - Body:
    ```json
    {
      "success": true,
      "data": {
        "message": "Successfully signed out."
      }
    }
    ```

### 6.3 `GET /api/v1/auth/me`
- **Request**: Cookie `vx_session=<token>`
- **Success Response (200 OK)**: Returns the current `user`, `organization`, and `permissions` array.
- **Error Response (401 Unauthorized)**: `UNAUTHORIZED` if cookie is missing or invalid.

### 6.4 `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "orgName": "VorldX Client Corp",
    "adminName": "John Doe",
    "email": "john@vorldxclient.com",
    "password": "SuperSecretPassword123!",
    "phone": "+91 9876543210"
  }
  ```
- **Execution**: Atomic `prisma.$transaction` creating:
  1. `Organization` (status `ACTIVE`, default branding colors)
  2. `OrganizationSettings` (default tax 18%, currency INR, standard quotation terms)
  3. `User` (assigned strictly to `ORG_ADMIN`, status `ACTIVE`)
  4. `PlatformAuditLog` (action `ORGANIZATION_REGISTERED`)
- **Success Response (201 Created)**:
  - Header: `Set-Cookie: vx_session=<token>`
  - Body contains created user, organization, permissions, and status confirmation.

---

## 7. Frontend Integration Guidelines

Frontend pages and components consume these backend APIs as follows:
- **`app/login/page.tsx`**: Dispatches `POST /api/v1/auth/login`. On 200, redirects to `/dashboard` or the return URL. Because `Set-Cookie` is returned, all subsequent requests automatically carry authentication credentials.
- **`app/register/page.tsx`**: Dispatches `POST /api/v1/auth/register`. On 201, redirects directly into the newly provisioned workspace.
- **Navigation/Header User Profile**: Invokes `GET /api/v1/auth/me` on mount to display user initials, organization name, and dynamically toggle UI features according to the `permissions` array.
- **Logout Action**: Calls `POST /api/v1/auth/logout` and redirects to `/login`.

