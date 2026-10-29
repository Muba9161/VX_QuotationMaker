import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Session, User, Organization } from "@prisma/client";

/**
 * Database-Backed Revocable Session Management
 *
 * Security Model:
 * 1. Opaque 64-character cryptographic tokens generated using crypto.randomBytes(32).
 * 2. Only the SHA-256 hash of the token is stored in the database (`sessions.session_token`).
 * 3. The raw token is delivered exclusively through a secure HTTP-only cookie (`vx_session`).
 * 4. Token verification looks up the SHA-256 hash, checks expiration, and validates active user status.
 * 5. Logout deletes the database record immediately, ensuring instant revocation.
 */

export const SESSION_COOKIE_NAME = "vx_session";
export const DEFAULT_SESSION_MAX_AGE_SECONDS = 28800; // 8 hours

export interface SessionContext {
  session: Session;
  user: User;
  organization: Organization | null;
}

/**
 * Derives the SHA-256 hash of a raw session token for database lookup.
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a high-entropy random session token.
 */
export function generateRawSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates a new database session record and returns the unhashed client token.
 */
export async function createSession(
  userId: string,
  options?: {
    ipAddress?: string;
    userAgent?: string;
    maxAgeSeconds?: number;
  }
): Promise<{ session: Session; rawToken: string }> {
  const rawToken = generateRawSessionToken();
  const hashedToken = hashSessionToken(rawToken);
  const maxAge = options?.maxAgeSeconds ?? DEFAULT_SESSION_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      sessionToken: hashedToken,
      ipAddress: options?.ipAddress || null,
      userAgent: options?.userAgent ? options.userAgent.slice(0, 500) : null,
      expiresAt,
    },
  });

  return { session, rawToken };
}

/**
 * Validates a raw session token against PostgreSQL.
 * Verifies that the session is not expired and the user account is ACTIVE.
 */
export async function validateSession(rawToken: string): Promise<SessionContext | null> {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  const hashedToken = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { sessionToken: hashedToken },
    include: {
      user: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt.getTime() <= Date.now()) {
    // Delete expired session asynchronously
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Check user account status
  if (session.user.status !== "ACTIVE") {
    return null;
  }

  return {
    session,
    user: session.user,
    organization: session.user.organization,
  };
}

/**
 * Revokes an active session immediately from the database.
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;

  const hashedToken = hashSessionToken(rawToken);

  try {
    const deleted = await prisma.session.deleteMany({
      where: { sessionToken: hashedToken },
    });
    return deleted.count > 0;
  } catch {
    return false;
  }
}

/**
 * Revokes all sessions belonging to a specific user (e.g. on password change).
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const deleted = await prisma.session.deleteMany({
    where: { userId },
  });
  return deleted.count;
}

/**
 * Extracts the raw session token from incoming request cookies or Authorization header.
 */
export function getSessionTokenFromRequest(req: Request): string | null {
  // 1. Check HTTP cookie
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (match) {
      const token = match.substring(`${SESSION_COOKIE_NAME}=`.length);
      if (token) return decodeURIComponent(token);
    }
  }

  // 2. Check Authorization Bearer header as secondary fallback for APIs
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  return null;
}

/**
 * Attaches the secure session cookie to an outgoing HTTP response.
 */
export function attachSessionCookie(
  res: NextResponse,
  rawToken: string,
  maxAgeSeconds = DEFAULT_SESSION_MAX_AGE_SECONDS
): void {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/**
 * Clears the session cookie on logout.
 */
export function clearSessionCookie(res: NextResponse): void {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

