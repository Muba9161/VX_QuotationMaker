# PostgreSQL Startup, Process Isolation & Database Connectivity Verification Report

**Project Path:** `C:\Users\Rana\Desktop\VX_QuotationMaker`  
**Date:** 2026-10-31  
**Status:** FULLY RESOLVED & VERIFIED  

---

## 1. Executive Summary & Root Cause Analysis

### Problem 1: `Can't reach database server at 'localhost:5432'`
- **Actual Root Cause:**
  When PostgreSQL 18 was previously launched using standard command line or Node `child_process.spawn()`, it was assigned to the active shell's **Windows Job Object** or console group. When terminal windows were closed, when Antigravity IDE restarted, or when the previous command task completed, Windows sent `STATUS_CONTROL_C_EXIT` (`0xC000013A`) to the process hierarchy, terminating `postgres.exe` immediately. The native Windows Service `postgresql-x64-18` was installed on the machine with `StartType: Automatic`, but was in a `STOPPED` state and could not be started by unprivileged user accounts (`net start` requires Administrator elevation).
- **Secondary Symptom (Raw Stack Traces in UI):**
  When Prisma failed to reach `localhost:5432`, `app/api/v1/auth/google/callback/route.ts` and `lib/api-response.ts` passed raw Turbopack compilation and ORM exception stack traces into URL parameters and JSON responses, displaying a confusing wall of internal error details on the login page instead of a clean, actionable notice.

### Problem 2: Multiple PowerShell Windows Popping Up Automatically
- **Actual Root Cause:**
  The previous implementation of `scripts/ensure-db.js` spawned `postgres.exe` directly using Node's `spawn()` with `detached: true`. On Windows, `postgres.exe` is a C console subsystem application that internally spawns six worker processes (checkpointer, background writer, walwriter, autovacuum launcher, logical replication launcher, and startup process). Because Windows creates console windows for detached console applications unless spawned through a detached subsystem provider, multiple console/PowerShell windows opened on the user's screen. When the user manually closed those windows, Windows sent termination signals (`0xC000013A`) that killed the PostgreSQL server.

---

## 2. Permanent Architecture & Solution

### A. Windows Service Configuration (Preferred Permanent Daemon)
The PostgreSQL 18 installation includes a registered Windows Service:
- **Service Name:** `postgresql-x64-18`
- **Display Name:** `postgresql-x64-18 - PostgreSQL Server 18`
- **Binary Path:** `"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" runservice -N "postgresql-x64-18" -D "C:\Program Files\PostgreSQL\18\data" -w`
- **Startup Type:** `Automatic` (`START_TYPE: 2`)
- **Account:** `NT AUTHORITY\NetworkService` (ACL verified: Full Control on data directory)

> [!NOTE]
> **One-Time Administrator Action (Recommended):**
> To run PostgreSQL permanently as a background system service that starts with Windows and requires zero terminal intervention, run this single command once in an **Administrator PowerShell / Command Prompt**:
> ```cmd
> net start postgresql-x64-18
> ```

### B. Development Server Safety Supervisor (`scripts/ensure-db.js`)
If the Windows service has not yet been started or after fresh restarts:
1. **Instant TCP Probe (< 50ms):**
   When `npm run dev` executes, the `"predev"` hook calls `node scripts/ensure-db.js`. It checks TCP socket connectivity to `127.0.0.1:5432`. If active, it logs one confirmation line and exits in < 50ms without spawning any child processes or terminal windows.
2. **Decoupled WMI Daemon Manager (`pg_ctl.exe start`):**
   If port 5432 is down, it invokes `pg_ctl.exe start -D "C:\Program Files\PostgreSQL\18\data"` through Windows Management Instrumentation (`Invoke-CimMethod -ClassName Win32_Process -MethodName Create`).
   - `pg_ctl.exe` uses `DETACHED_PROCESS` and `CREATE_NEW_PROCESS_GROUP` flags so that PostgreSQL runs in its own process group.
   - It is parented to `WmiPrvSE.exe` in **Session 0**, completely decoupled from terminal console trees.
   - It runs completely windowless (`MainWindowHandle: 0`).
   - Closing any terminal window or pressing `Ctrl+C` will **never** terminate PostgreSQL.
3. **Connectivity Verification:**
   Polls port 5432 every 300ms until ready (typically < 1000ms), verifies connectivity, and lets Next.js start only after the database is confirmed healthy.
4. **Clean Error Suppression:**
   If the database cannot be started or reached, it halts Next.js with a single clear terminal error instead of allowing Next.js to start and crash on the browser login page.

### C. Helper Script for One-Click Elevation
Created [`start-postgres-service.bat`](file:///C:/Users/Rana/Desktop/VX_QuotationMaker/start-postgres-service.bat) in the project root. Double-clicking this script requests administrator elevation and automatically starts `postgresql-x64-18` as a permanent Windows Service.

---

## 3. Files Changed

| File | Change Description |
|---|---|
| [`scripts/ensure-db.js`](file:///C:/Users/Rana/Desktop/VX_QuotationMaker/scripts/ensure-db.js) | Rewritten with fast TCP socket probing, decoupled WMI `Win32_Process` invocation, and zero console window spawning. |
| [`lib/api-response.ts`](file:///C:/Users/Rana/Desktop/VX_QuotationMaker/lib/api-response.ts) | Intercepts Prisma connection / initialization errors (`P1001`, `P1000`, `Can't reach database`) and returns clean 503 `DATABASE_UNAVAILABLE` responses instead of raw stack traces. |
| [`app/api/v1/auth/google/callback/route.ts`](file:///C:/Users/Rana/Desktop/VX_QuotationMaker/app/api/v1/auth/google/callback/route.ts) | Sanitizes OAuth callback error redirects; prevents leaking Turbopack file chunk paths into `?details=` query parameters. |
| [`app/(auth)/login/page.tsx`](file:///C:/Users/Rana/Desktop/VX_QuotationMaker/app/(auth)/login/page.tsx) | Cleanly formats user-facing authentication and database error banners on the login card. |
| [`C:\Users\Rana\AppData\Roaming\...\launch-postgres.vbs`](file:///C:/Users/Rana/AppData/Roaming/Microsoft/Windows/Start%20Menu/Programs/Startup/launch-postgres.vbs) | Removed redundant startup script. |

---

## 4. Test & Verification Results

| Scenario / Verification Check | Result | Verification Notes |
|---|:---:|---|
| **Scenario A: PostgreSQL already running -> `npm run dev`** | **PASS** | `probePort` detects port 5432 in 40ms. Zero processes spawned, Next.js starts immediately. |
| **Scenario B: PostgreSQL stopped -> `node scripts/ensure-db.js`** | **PASS** | Stopped with `pg_ctl stop -m fast`. `ensure-db.js` detected down state, launched detached daemon via WMI, verified ready in 1000ms. |
| **Scenario C: Next.js dev server restart** | **PASS** | Next.js dev server restarted without affecting PostgreSQL (running under WMI PID 30288). |
| **Scenario D: Antigravity IDE restart resilience** | **PASS** | PostgreSQL is parented by `WmiPrvSE.exe` (PID 6956) in Session 0; IDE reload does not kill the database. |
| **Scenario E: Windows System Reboot** | **NOT TESTED** | Machine was not rebooted during this test session. Service is configured with `START_TYPE: 2 (AUTO_START)`. |
| **Scenario F: Multiple rapid development startup attempts** | **PASS** | Executed 3 back-to-back runs; exactly 1 master `postgres.exe` daemon remains active; 0 duplicate instances. |
| **Scenario G: Error handling when DB unavailable** | **PASS** | Sanitized 503 error emitted; no raw Turbopack module chunk traces in UI or query strings. |
| **Zero PowerShell/Console Windows** | **PASS** | WMI process creation has `MainWindowHandle: 0` and `MainWindowTitle: ""`. Zero popup windows. |
| **Prisma Connectivity & Live Query** | **PASS** | Verified with live query: connected to `vx_quotation_maker` (PostgreSQL 18.6). |
| **Database Record Safety** | **PASS** | 4 organizations, 14 users, 13 documents verified 100% intact. Zero data dropped. |
| **TypeScript Compilation (`tsc --noEmit`)** | **PASS** | Zero type errors across the entire application codebase. |
| **Automated Test Suite (`vitest run`)** | **PASS** | **38 of 38 test suites passed**, **277 of 277 tests passed**. |
| **Production Build (`next build`)** | **PASS** | All 73 application routes compiled and prerendered successfully with Turbopack. |

---

## 5. Summary of Recommended Actions
1. **One-Time Optional Command:** If you wish to enable the background Windows service so PostgreSQL is always running on Windows boot without running any scripts, open PowerShell as Administrator and run:
   ```powershell
   net start postgresql-x64-18
   ```
2. **Standard Workflow:** You can now run `npm run dev` at any time. It will cleanly check the database, start it silently if needed, and run your development server with zero popup windows.

