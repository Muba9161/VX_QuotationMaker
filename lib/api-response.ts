import { NextResponse } from "next/server";

/**
 * Standard API Response & Error Handling Conventions
 *
 * Guarantees consistent JSON responses across all versioned API endpoints,
 * prevents accidental leakage of stack traces or credentials, and ensures strict TypeScript.
 */

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

const DEFAULT_HEADERS: HeadersInit = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Creates a standardized successful JSON API response.
 */
export function successResponse<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
  customHeaders?: HeadersInit
): NextResponse<ApiSuccessPayload<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    {
      status,
      headers: {
        ...DEFAULT_HEADERS,
        ...customHeaders,
      },
    }
  );
}

/**
 * Creates a standardized error JSON API response without leaking stack traces.
 */
export function errorResponse(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: unknown,
  customHeaders?: HeadersInit
): NextResponse<ApiErrorPayload> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status,
      headers: {
        ...DEFAULT_HEADERS,
        ...customHeaders,
      },
    }
  );
}

/**
 * Global handler for unhandled errors inside API route handlers.
 * Logs internal error details in development while emitting a sanitized public response.
 */
export function handleApiError(
  err: unknown,
  fallbackMessage = "An unexpected error occurred while processing the request."
): NextResponse<ApiErrorPayload> {
  // If the error carries an explicit HTTP status and application code (e.g., AuthError)
  if (
    err &&
    typeof err === "object" &&
    "status" in err &&
    "code" in err &&
    typeof (err as { status: unknown }).status === "number" &&
    typeof (err as { code: unknown }).code === "string"
  ) {
    const statusErr = err as { status: number; code: string; message: string; details?: unknown };
    return errorResponse(
      statusErr.message || fallbackMessage,
      statusErr.code,
      statusErr.status,
      statusErr.details
    );
  }

  const isDev = process.env.NODE_ENV === "development";
  const internalMessage = err instanceof Error ? err.message : String(err);

  if (isDev) {
    console.error("[API Error]", internalMessage, err instanceof Error ? err.stack : "");
  }

  return errorResponse(
    isDev ? internalMessage : fallbackMessage,
    "INTERNAL_SERVER_ERROR",
    500
  );
}

