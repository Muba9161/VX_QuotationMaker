import { NextResponse } from "next/server";
import { readTenantAsset } from "@/lib/storage/upload";

/**
 * GET /api/v1/organization/assets/file/[orgId]/[filename]
 *
 * Serves tenant visual assets (logos, signatures, headers, etc.) with caching and nosniff protection.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; filename: string }> }
) {
  try {
    const { orgId, filename } = await params;

    const asset = await readTenantAsset(orgId, filename, "asset");
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

