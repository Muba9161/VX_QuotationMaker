import { NextResponse } from "next/server";
import { readTenantAsset } from "@/lib/storage/upload";

/**
 * GET /api/v1/templates/asset/[orgId]/[filename]
 *
 * Serves uploaded template images from private local storage with tenant isolation.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string; filename: string }> }
) {
  try {
    const { orgId, filename } = await params;

    const asset = await readTenantAsset(orgId, filename, "template");
    if (!asset) {
      return NextResponse.json({ error: "Template asset not found." }, { status: 404 });
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
    return NextResponse.json({ error: "Failed to serve template asset." }, { status: 500 });
  }
}

