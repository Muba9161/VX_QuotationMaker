"use client";

import React, { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import OrgLayout from "@/components/OrgLayout";
import SuccessPopup from "@/components/SuccessPopup";

const ORGANIZATION_ROUTE_PREFIXES = [
  "/dashboard",
  "/my-documents",
  "/quotations",
  "/mou",
  "/templates",
  "/clients",
  "/contacts",
  "/team",
  "/branding",
  "/settings",
  "/reports",
  "/documents",
  "/preview",
];

function isOrganizationRoute(pathname: string): boolean {
  return ORGANIZATION_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return isOrganizationRoute(pathname) ? (
    <OrgLayout persistent>{children}</OrgLayout>
  ) : (
    children
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <>
        <RouteShell>{children}</RouteShell>
        <SuccessPopup />
      </>
    </Suspense>
  );
}
