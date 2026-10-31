/**
 * VorldX Platform - PostgreSQL Lifecycle & Health Supervisor
 *
 * Ensures PostgreSQL 18 is active and accepting connections before Next.js dev server starts.
 *
 * Rules:
 * - Zero visible console or PowerShell windows.
 * - Idempotent: checks port 5432 first. If already listening, exits in < 50ms without spawning.
 * - Decoupled: when launching, uses WMI (Win32_Process) so postgres runs detached from IDE terminal jobs.
 * - Prevents multiple duplicate instances.
 * - Blocks Next.js with a clear single-line message if database cannot be reached.
 */
const net = require("net");
const { execFile } = require("child_process");
const fs = require("fs");

const PG_CTL_BIN = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe";
const POSTGRES_BIN = "C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe";
const POSTGRES_DATA = "C:\\Program Files\\PostgreSQL\\18\\data";
const PORT = 5432;
const HOST = "127.0.0.1";

/**
 * Checks whether PostgreSQL is actively listening on TCP port 5432.
 */
function probePort(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    const finish = (result) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));

    socket.connect(port, host);
  });
}

/**
 * Spawns postgres.exe via Windows Management Instrumentation (WMI).
 * This ensures the daemon is parented by WmiPrvSE in Session 0,
 * completely detached from the current console and terminal job object,
 * with ZERO popup windows.
 */
function launchPostgresViaWmi() {
  return new Promise((resolve, reject) => {
    // Attempt starting via pg_ctl start through WMI so it spawns in a detached process group
    const psScript = `
      $proc = Get-Process -Name postgres -ErrorAction SilentlyContinue
      if (-not $proc) {
        Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
          CommandLine = '"${PG_CTL_BIN}" start -D "${POSTGRES_DATA}"'
        } | Out-Null
      }
    `;

    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", psScript],
      { windowsHide: true },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

async function main() {
  // 1. Fast check: is PostgreSQL already up?
  const alreadyUp = await probePort(HOST, PORT, 600);
  if (alreadyUp) {
    console.log("[VorldX DB] PostgreSQL is active and accepting connections on port 5432.");
    process.exit(0);
  }

  // 2. Check installation paths exist
  if (!fs.existsSync(POSTGRES_BIN) || !fs.existsSync(POSTGRES_DATA)) {
    console.error("[VorldX DB] Error: PostgreSQL 18 installation or data directory not found.");
    console.error(`  Expected Bin : ${POSTGRES_BIN}`);
    console.error(`  Expected Data: ${POSTGRES_DATA}`);
    process.exit(1);
  }

  console.log("[VorldX DB] Port 5432 not responding. Initiating detached PostgreSQL daemon...");

  try {
    await launchPostgresViaWmi();
  } catch (err) {
    console.warn("[VorldX DB] WMI launch trigger warning:", err.message);
  }

  // 3. Poll port 5432 for up to 10 seconds
  const maxAttempts = 20;
  const pollIntervalMs = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));
    const isReady = await probePort(HOST, PORT, 400);
    if (isReady) {
      console.log(`[VorldX DB] PostgreSQL daemon ready on port 5432 (verified in ${attempt * pollIntervalMs}ms).`);
      process.exit(0);
    }
  }

  // 4. Failed to connect within timeout - display clear, actionable error
  console.error("\n===============================================================================");
  console.error("[VorldX DB Error] Could not connect to PostgreSQL on port 5432.");
  console.error("The database server did not respond within 10 seconds.");
  console.error("To start the official Windows service, run this one-time command in an Administrator prompt:");
  console.error("  net start postgresql-x64-18");
  console.error("===============================================================================\n");
  process.exit(1);
}

main();
