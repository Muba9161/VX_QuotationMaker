import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/prisma";

export interface HealthResponse {
  status: "ok" | "degraded";
  timestamp: string;
  services: {
    database: "connected" | "disconnected";
  };
  latencyMs?: number;
}

const NO_CACHE_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Health Check API Endpoint (v1)
 *
 * Verifies Node.js process vitality and live PostgreSQL database connectivity.
 * Returns HTTP 200 when all services are healthy, or HTTP 503 when the database is unavailable.
 * Guarantees zero leakage of credentials, SQL queries, or internal stack traces.
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const timestamp = new Date().toISOString();

  try {
    const dbHealth = await checkDatabaseHealth();

    if (!dbHealth.connected) {
      return NextResponse.json(
        {
          status: "degraded",
          timestamp,
          services: {
            database: "disconnected",
          },
        },
        {
          status: 503,
          headers: NO_CACHE_HEADERS,
        }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        timestamp,
        services: {
          database: "connected",
        },
        ...(dbHealth.latencyMs !== undefined ? { latencyMs: dbHealth.latencyMs } : {}),
      },
      {
        status: 200,
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch {
    // Failsafe catch block ensuring no unhandled exception leaks to client
    return NextResponse.json(
      {
        status: "degraded",
        timestamp,
        services: {
          database: "disconnected",
        },
      },
      {
        status: 503,
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}

