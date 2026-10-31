"use client";

import React, { useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";

function QuotationEditRedirect({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/quotations/new?edit=${encodeURIComponent(id)}`);
    }
  }, [id, router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "#64748b",
        fontFamily: "sans-serif",
      }}
    >
      <p>Redirecting to quotation editor...</p>
    </div>
  );
}

export default function QuotationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            color: "#64748b",
            fontFamily: "sans-serif",
          }}
        >
          <p>Loading quotation...</p>
        </div>
      }
    >
      <QuotationEditRedirect params={params} />
    </Suspense>
  );
}
