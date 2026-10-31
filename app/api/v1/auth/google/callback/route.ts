import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppConfig } from "@/lib/config";
import { createSession, attachSessionCookie } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit";
import {
  getOAuthStateFromRequest,
  clearOAuthStateCookie,
  exchangeGoogleCode,
  verifyGoogleIdToken,
  type VerifiedGoogleUser,
} from "@/lib/auth/google";

/**
 * GET /api/v1/auth/google/callback
 *
 * Handles the Google OAuth 2.0 authorization code response:
 * 1. Validates anti-CSRF state token.
 * 2. Exchanges code for Google tokens server-to-server.
 * 3. Verifies Google identity and email verification status.
 * 4. Resolves account: links existing user or claims pending team invitation.
 * 5. Rejects unknown users with account_not_found (never auto-provisions arbitrary orgs or admin roles).
 * 6. Creates revocable database session and sets HTTP-only session cookie.
 */
export async function GET(req: Request) {
  const config = getAppConfig();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Helper to build redirect responses with state cookie cleared
  const buildErrorRedirect = (errorCode: string, details?: string) => {
    const redirectUrl = new URL(`/login?error=${encodeURIComponent(errorCode)}`, config.appUrl);
    if (details) {
      redirectUrl.searchParams.set("details", details);
    }
    const res = NextResponse.redirect(redirectUrl);
    clearOAuthStateCookie(res);
    return res;
  };

  try {
    // 1. Check if user or Google returned an error
    if (error) {
      return buildErrorRedirect(error);
    }

    // 2. Validate anti-CSRF state token from cookie
    const cookieState = getOAuthStateFromRequest(req);
    if (!state || !cookieState || state !== cookieState) {
      return buildErrorRedirect("invalid_state");
    }

    // 3. Ensure authorization code is present
    if (!code) {
      return buildErrorRedirect("missing_code");
    }

    // 4. Ensure Google OAuth credentials are configured
    if (!config.googleClientId || !config.googleClientSecret) {
      return buildErrorRedirect("google_auth_not_configured");
    }

    // 5. Exchange authorization code for tokens
    const redirectUri =
      config.googleCallbackUrl || `${config.appUrl}/api/v1/auth/google/callback`;

    let tokens;
    try {
      tokens = await exchangeGoogleCode({
        code,
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
        redirectUri,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message.replace(/^\[Google OAuth Error\] Token exchange failed:\s*/, "") : "Unknown error";
      console.error("[Google OAuth Callback Error] Token exchange failed:", errMsg);
      return buildErrorRedirect("token_exchange_failed", errMsg);
    }

    if (!tokens.id_token) {
      return buildErrorRedirect("missing_id_token");
    }

    // 6. Cryptographically verify Google ID token signature, issuer, audience, exp, and email
    let verifiedUser: VerifiedGoogleUser;
    try {
      verifiedUser = await verifyGoogleIdToken({
        idToken: tokens.id_token,
        clientId: config.googleClientId,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Verification failed";
      console.error("[Google OAuth Callback Error] ID token verification failed:", errMsg);
      return buildErrorRedirect("invalid_id_token", errMsg);
    }

    // 7. Verify email presence and verification status
    if (!verifiedUser.email) {
      return buildErrorRedirect("missing_email");
    }

    if (!verifiedUser.emailVerified) {
      return buildErrorRedirect("email_not_verified");
    }

    const normalizedEmail = verifiedUser.email.trim().toLowerCase();

    // Network metadata for session & audit
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    // 8. Account Resolution
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { organization: true },
    });

    if (existingUser) {
      // 8a. Existing User Flow
      if (existingUser.status !== "ACTIVE") {
        return buildErrorRedirect("account_inactive");
      }

      if (existingUser.organization && existingUser.organization.status !== "ACTIVE") {
        return buildErrorRedirect("organization_inactive");
      }

      // Update emailVerified and avatar if missing
      await prisma.user
        .update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            avatarUrl: existingUser.avatarUrl || verifiedUser.picture || null,
            lastLoginAt: new Date(),
          },
        })
        .catch(() => {});

      // Establish database-backed session
      const { rawToken } = await createSession(existingUser.id, {
        ipAddress,
        userAgent,
      });

      // Record audit log with Google sub identifier
      await recordAuditLog({
        userId: existingUser.id,
        actorId: existingUser.id,
        organizationId: existingUser.organizationId,
        userName: existingUser.name,
        action: "LOGIN",
        details: `User authenticated successfully via Google OAuth (sub: ${verifiedUser.sub})`,
        ipAddress,
      });

      // Determine redirect target based on role
      let targetPath = "/dashboard";
      if (
        existingUser.role === "SUPER_ADMIN" ||
        existingUser.role === "SUPPORT_ADMIN"
      ) {
        targetPath = "/admin/dashboard";
      } else if (existingUser.role === "RECIPIENT") {
        targetPath = "/recipient/dashboard";
      }

      const redirectUrl = new URL(targetPath, config.appUrl);
      const res = NextResponse.redirect(redirectUrl);

      attachSessionCookie(res, rawToken);
      clearOAuthStateCookie(res);

      return res;
    }

    // 8b. New User Flow: Check for active team invitation
    const invitation = await prisma.teamInvitation.findFirst({
      where: {
        email: normalizedEmail,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      include: { organization: true },
    });

    if (!invitation) {
      // Tenant Isolation Rule: never silently create an organization or assign privileged roles.
      return buildErrorRedirect("account_not_found");
    }

    if (invitation.organization.status !== "ACTIVE") {
      return buildErrorRedirect("organization_inactive");
    }

    // Accept invitation and create member user atomically
    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: verifiedUser.name || normalizedEmail.split("@")[0],
          role: invitation.role,
          organizationId: invitation.organizationId,
          emailVerified: true,
          avatarUrl: verifiedUser.picture || null,
          status: "ACTIVE",
          lastLoginAt: new Date(),
        },
      });

      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      await tx.organization.update({
        where: { id: invitation.organizationId },
        data: {
          currentUsersCount: { increment: 1 },
        },
      });

      return created;
    });

    // Establish session for the new user
    const { rawToken } = await createSession(newUser.id, {
      ipAddress,
      userAgent,
    });

    await recordAuditLog({
      userId: newUser.id,
      actorId: newUser.id,
      organizationId: invitation.organizationId,
      userName: newUser.name,
      action: "USER_INVITE_ACCEPTED",
      details: `User accepted team invitation and signed in via Google OAuth (sub: ${verifiedUser.sub})`,
      ipAddress,
    });

    const redirectUrl = new URL("/dashboard", config.appUrl);
    const res = NextResponse.redirect(redirectUrl);

    attachSessionCookie(res, rawToken);
    clearOAuthStateCookie(res);

    return res;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Internal authentication error";
    if (process.env.NODE_ENV === "development") {
      console.error("[Google OAuth Callback Error]", err);
    }
    return buildErrorRedirect("oauth_callback_failed", errMsg);
  }
}

