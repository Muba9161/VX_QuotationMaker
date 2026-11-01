# VX_QuotationMaker — Instructor-Requested Features Documentation

**Product:** VorldX — White-Label Quotation, MOU Creation & Digital Signing Platform  
**Target:** Extension of Production Application for Academic & Production Demonstration  
**Platform Stack:** Next.js App Router (16.4.3), React 19, TypeScript 5, Tailwind CSS, PostgreSQL, Prisma ORM, Redis, BullMQ, Nodemailer, pdf-lib, jsPDF  

---

## Executive Summary

Five core architectural and business-critical extensions were requested to elevate VorldX from a standard document generator to a enterprise-grade white-label quotation and MOU platform:

1. **Bulk Email Functionality:** Scalable, private email delivery to client contacts utilizing existing Redis & BullMQ queue pipelines with live delivery tracking.
2. **Template Image Upload:** Upload, preview, replacement, and automatic rendering of template header graphics across quotations and MOUs.
3. **Branding & Letterhead Image/PDF Upload:** Centralized corporate letterhead upload (supporting vector PDF and raster images) with multi-page background composition via `pdf-lib`.
4. **Optional Logo Upload during Organization Signup:** Frictionless onboarding allowing immediate tenant brand personalization without breaking existing signup workflows.
5. **Organization Identity & Strict VorldX Footer Attribution:** Prioritizing the organization's legal name and logo while strictly isolating the `"Powered by VorldX"` attribution exclusively to application footers.

---

## 1. Feature One: Bulk Email Functionality

### 1.1 Overview & Architecture
The Bulk Email module enables authorized organization members (Org Admins, Editors) to dispatch verified, private communications to multiple active clients and contacts simultaneously. Rather than exposing recipient email addresses via CC or BCC, the system delivers individualized emails asynchronously through the BullMQ queue worker process.

### 1.2 User Interface Components
* **Dedicated Route:** `/bulk-email` (integrated in sidebar navigation for Org Admins and Editors).
* **Recipient Selector (`components/bulk-email/RecipientSelector.tsx`):**
  * Search bar with real-time filtering across client contact names, company names, and email addresses.
  * Multi-select checkboxes with "Select All" / "Deselect All" options.
  * Counter badge displaying total selected vs eligible contacts.
  * Automatic deduplication preventing redundant delivery to the same email.
* **Email Composer (`components/bulk-email/EmailComposer.tsx`):**
  * Subject input with character counter (3–200 characters).
  * Rich message textarea supporting paragraph breaks and up to 50,000 characters.
  * Send button protection preventing accidental double-submissions.
* **Confirmation & Preview Modal (`components/bulk-email/EmailPreviewModal.tsx`):**
  * Displays simulated recipient view with organization header, personalized greeting, formatted body, and privacy notice before dispatching.
* **Delivery Tracker (`components/bulk-email/DeliveryTracker.tsx` & `BatchDetailsModal.tsx`):**
  * Real-time campaign history table with status breakdown pills: **Queued** (slate), **Processing** (blue), **Completed** (green), **Partial Failure** (amber), **Failed** (red).
  * Drill-down modal inspecting per-recipient delivery statuses, sent timestamps, and diagnostic error reasons.

### 1.3 Backend API Endpoints
* `GET /api/v1/emails/recipients`: Returns all active, verified contacts for the authenticated tenant.
* `POST /api/v1/emails/bulk`: Validates subject, message, and recipient list; enforces cross-tenant boundary checks; creates `BulkEmailBatch` and `BulkEmailRecipient` records; enqueues jobs to BullMQ.
* `GET /api/v1/emails/bulk`: Returns paginated campaign batches with live delivery progress counts.
* `GET /api/v1/emails/bulk/[batchId]`: Retrieves detailed recipient delivery logs for a specific batch.

### 1.4 Queue & Worker Processing
* **Queue Integration (`lib/queue/queue-manager.ts`):** `enqueueBulkEmailRecipient` enqueues individual jobs onto BullMQ `email-queue` with exponential backoff (2s, 4s, 8s).
* **Worker Process (`worker/index.ts`):** Handles `bulk-email-recipient` jobs, transitions status (`QUEUED` → `PROCESSING` → `SENT` or `FAILED`), and updates batch counters atomically.
* **Direct Runner Fallback:** When Redis is offline during local test execution, `processBulkEmailBatchDirect` processes jobs asynchronously via the event loop tick without blocking the HTTP request.

---

## 2. Feature Two: Template Image Upload

### 2.1 Overview & Architecture
Enables organizations to upload header images, banner graphics, or custom branding assets directly to their document templates. The uploaded asset is stored locally in the tenant's isolated directory and automatically reflects in template previews and generated PDFs.

### 2.2 User Interface Components
* **Template Management Integration (`app/templates/page.tsx`):**
  * Every template card displays an "Image" button and thumbnail preview banner when an image is associated.
* **Image Modal (`components/templates/TemplateImageModal.tsx`):**
  * Drag-and-drop or file selector supporting PNG, JPG, JPEG, and WebP (up to 5MB).
  * Live client-side thumbnail preview before and after saving.
  * Options to Replace Image or Remove Image.
  * Upload progress indicators and user feedback alerts.

### 2.3 Backend & PDF Integration
* `POST /api/v1/templates/[id]/image`: Saves asset to `<STORAGE_DIR>/<orgId>/template/` using `saveTenantAsset`, automatically removes old orphaned image files, and updates `imageUrl`, `imageFilename`, and `imageMimeType` on the template.
* `DELETE /api/v1/templates/[id]/image`: Removes physical asset and clears database metadata.
* `GET /api/v1/templates/asset/[orgId]/[filename]`: Serves cached template assets securely.
* **PDF Rendering:** Both `lib/pdf/quotation-pdf.ts` and `lib/pdf/mou-pdf.ts` accept `templateImageBase64` and render the graphic as an elegant document header banner.
* **Document Previews:** `QuotationPreviewSheet.tsx` and `MouPreviewSheet.tsx` render the uploaded template graphic in real-time.

---

## 3. Feature Three: Branding & Letterhead Image/PDF Upload

### 3.1 Overview & Architecture
Provides centralized organization-wide letterhead management under `/branding`. Supports both multi-page vector PDF letterheads and high-resolution raster images (PNG, JPG, WebP), with granular document application scopes.

### 3.2 User Interface (`components/branding/LetterheadManager.tsx`)
* Seamlessly integrated into the "Letterhead & Document Layout" tab of `app/branding/page.tsx`.
* Upload button supporting `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.webp` (up to 10MB).
* Dynamic preview: interactive embedded iframe for PDF letterheads and responsive image container for image letterheads.
* Displays file name, MIME type, and uploaded date.
* Replace and Remove controls.
* **Application Scope Toggles:** Independent checkboxes allowing organizations to apply letterhead to:
  * Quotations (`letterheadApplyQuotations`)
  * MOUs (`letterheadApplyMous`)

### 3.3 Vector PDF Background Layering (`lib/pdf/letterhead-composer.ts`)
* Implemented using `pdf-lib` (pure JavaScript, 100% deterministic, zero binary dependencies).
* Multi-page embedding via `embedPdf(baseDoc, baseDoc.getPageIndices())`.
* Places the corporate letterhead in the **background layer**, drawing generated proposal tables, totals, and signatures in the **foreground layer**.
* Ensures 100% vector clarity without downsampling or raster artifacting.
* Integrated into:
  * Quotation PDF export (`/api/v1/quotations/[id]/pdf`)
  * MOU PDF export (`/api/v1/mous/[id]/pdf`)
  * Public download endpoint (`/api/v1/public/shares/[token]/download`)

---

## 4. Feature Four: Optional Logo Upload during Organization Signup

### 4.1 Overview & Architecture
Adds an optional logo upload field to the public registration page (`app/(auth)/register/page.tsx`). Onboarding organizations can upload their brand logo immediately upon signup or skip it and configure branding later.

### 4.2 User Interface (`components/auth/LogoUploadField.tsx`)
* Clean dashed upload zone on the registration form.
* Client-side validation for PNG, JPG, JPEG, and WebP (up to 5MB).
* Instant thumbnail preview with Replace and Remove actions.
* Non-blocking and purely optional — users can register without selecting a file.

### 4.3 Backend Handling (`app/api/v1/auth/register/route.ts`)
* Validates optional `logoBase64`, `logoFilename`, and `logoMimeType` in `registerOrgSchema`.
* Atomic transaction:
  1. Creates Organization and obtains tenant UUID.
  2. If logo provided, writes asset to tenant directory via `saveTenantAssetBuffer(org.id, ...)` and sets `logoUrl`.
  3. If database transaction fails, automatically rolls back and cleans up any saved file.

---

## 5. Feature Five: Organization Identity & Strict VorldX Footer Attribution

### 5.1 Overview & Policy
Enforces a true white-label SaaS experience by ensuring the organization's legal name and logo are primary throughout the workspace, while strictly confining the `"Powered by VorldX"` attribution to application footers.

### 5.2 Implementation Highlights
* **Application Footer (`components/Footer.tsx`):**
  * Centrally displays `"Powered by VorldX"` alongside dynamic copyright year and legal organization name.
  * Embedded at the bottom of `OrgLayout.tsx`, `AdminLayout.tsx`, and `RecipientLayout.tsx`.
* **Clean Document & Communication Boundaries:**
  * Removed all occurrences of `"Powered by VorldX"` from email notifications (`lib/email-templates/sharing-emails.ts`).
  * Removed from digitally signed PDF stamps (`lib/pdf/signed-pdf-generator.ts`).
  * Removed from external recipient signing workflows.
* **Strict Attribution Enforcement:**
  * Automated regression test in `tests/organization-branding-v2.test.ts` scans all component, template, and PDF files to verify that `"Powered by VorldX"` appears **exclusively in `components/Footer.tsx`** and nowhere else.

---

## 6. Verification & Test Suite Summary

* **Total Test Suites:** 43 passed (43)
* **Total Tests:** 300 passed (300)
* **Pass Rate:** 100%
* **TypeScript Compilation:** 0 errors (`npx tsc --noEmit`)
* **ESLint Validation:** 0 errors (`npm run lint`)
* **Next.js Production Build:** 76/76 static & dynamic routes compiled successfully (`npm run build`)

