import { NextResponse, type NextRequest } from "next/server";
import {
  clearSessionCookie,
  isSessionValid,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const PUBLIC_PATHS = ["/", "/login", "/register", "/admin/login", "/invite", "/share", "/sign"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
  );
}

function redirectToLogin(request: NextRequest, clearCookie: boolean): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";

  const response = NextResponse.redirect(loginUrl);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  if (clearCookie) clearSessionCookie(response);
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return redirectToLogin(request, false);

  try {
    const isValid = await isSessionValid(sessionToken);
    if (!isValid) return redirectToLogin(request, true);

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("Unable to validate the session before serving a protected route.", error);
    return new NextResponse("Unable to verify your session. Please try again.", {
      status: 503,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
