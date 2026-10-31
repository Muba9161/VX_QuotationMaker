import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/prisma";
import { isRedisConnected } from "@/lib/redis";
import { getStorageRoot } from "@/lib/storage/document-storage";
import fs from "fs";
import path from "path";

export interface ReadinessResponse {
  status: "ready" | "not_ready";
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: {
      status: "connected" | "disconnected";
      latencyMs?: number;
    };
    redis: {
      status: "connected" | "fallback_memory";
    };
    storage: {
      status: "writable" | "unwritable";
      path: string;
    };
  };
}

const NO_CACHE_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Deep Readiness Health Probe (/api/v1/health/ready)
 *
 * Verifies all system dependencies required to serve user traffic:
 * 1. PostgreSQL live query execution.
 * 2. Redis broker connectivity or fallback memory readiness.
 * 3. Local filesystem document storage writability.
 *
 * Returns:
 * - HTTP 200: All essential services ready.
 * - HTTP 503: Critical dependencies (e.g. Database) unavailable.
 */
export async function GET(): Promise<NextResponse<ReadinessResponse>> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  // 1. Database Check
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let dbLatencyMs: number | undefined;
  try {
    const dbHealth = await checkDatabaseHealth();
    dbStatus = dbHealth.connected ? "connected" : "disconnected";
    dbLatencyMs = dbHealth.latencyMs;
  } catch {
    dbStatus = "disconnected";
  }

  // 2. Redis Check
  let redisStatus: "connected" | "fallback_memory" = "fallback_memory";
  try {
    const connected = await isRedisConnected();
    redisStatus = connected ? "connected" : "fallback_memory";
  } catch {
    redisStatus = "fallback_memory";
  }

  // 3. Document Storage Check
  let storageStatus: "writable" | "unwritable" = "unwritable";
  const storageRoot = getStorageRoot();
  try {
    if (!fs.existsSync(storageRoot)) {
      fs.mkdirSync(storageRoot, { recursive: true });
    }
    const probeFile = path.resolve(storageRoot, ".readiness_probe");
    fs.writeFileSync(probeFile, "ok", "utf-8");
    fs.unlinkSync(probeFile);
    storageStatus = "writable";
  } catch {
    storageStatus = "unwritable";
  }

  // Critical dependency determination: DB must be connected and storage must be writable
  const isReady = dbStatus === "connected" && storageStatus === "writable";

  const responseBody: ReadinessResponse = {
    status: isReady ? "ready" : "not_ready",
    timestamp,
    uptimeSeconds,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      redis: {
        status: redisStatus,
      },
      storage: {
        status: storageStatus,
        path: storageRoot,
      },
    },
  };

  return NextResponse.json(responseBody, {
    status: isReady ? 200 : 503,
    headers: NO_CACHE_HEADERS,
  });
}

