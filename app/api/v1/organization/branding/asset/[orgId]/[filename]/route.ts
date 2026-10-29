import { NextResponse } from "next/server";
import { readTenantAsset } from "@/lib/storage/upload";

/**
 * GET /api/v1/organization/branding/asset/[orgId]/[filename]
 *
 * Serves uploaded organization logos and letterhead backgrounds from private local storage.
 * Enforces path traversal defense and sets appropriate caching headers.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; filename: string }> }
) {
  try {
    const { orgId, filename } = await params;

    const asset = await readTenantAsset(orgId, filename);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    return new Response(new Uint8Array(asset.buffer), {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to serve asset." }, { status: 500 });
  }
}
