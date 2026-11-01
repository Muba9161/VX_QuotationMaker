import {
  Home,
  FileText,
  FileCheck2,
  LayoutGrid,
  Users,
  Image as ImageIcon,
  Settings,
  BarChart2,
  LucideIcon,
} from "lucide-react";

export interface OrgNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const editorNavItems: OrgNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Documents", href: "/my-documents", icon: FileText },
  { label: "Quotations", href: "/quotations", icon: FileCheck2 },
  { label: "MOUs", href: "/mou", icon: FileText },
  { label: "Templates", href: "/templates", icon: LayoutGrid },
  { label: "Clients", href: "/clients", icon: Users },
];

export const orgAdminNavItems: OrgNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Documents", href: "/my-documents", icon: FileText },
  { label: "Quotations", href: "/quotations", icon: FileCheck2 },
  { label: "MOUs", href: "/mou", icon: FileText },
  { label: "Templates", href: "/templates", icon: LayoutGrid },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Team Members", href: "/team", icon: Users },
  { label: "Branding & Letterhead", href: "/branding", icon: ImageIcon },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Reports", href: "/reports", icon: BarChart2 },
];
