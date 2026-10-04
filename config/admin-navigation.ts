import type { ComponentType } from "react";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Newspaper,
  CalendarDays,
  Trophy,
  Award,
  FolderGit2,
  Image,
  Handshake,
  UserCheck,
  Users,
  GraduationCap,
  Building2,
  BadgeCheck,
  CalendarRange,
  Settings,
  ShieldCheck,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  badge?: string;
}

export interface AdminNavSection {
  title?: string;
  items: AdminNavItem[];
}

export const ADMIN_NAVIGATION: AdminNavSection[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Website",
    items: [
      { title: "Pages", href: "/admin/pages", icon: FileText },
      { title: "Programs", href: "/admin/programs", icon: BookOpen },
      { title: "News", href: "/admin/news", icon: Newspaper },
      { title: "Events", href: "/admin/events", icon: CalendarDays },
      { title: "Competitions", href: "/admin/competitions", icon: Trophy },
      { title: "Achievements", href: "/admin/achievements", icon: Award },
      { title: "Projects", href: "/admin/projects", icon: FolderGit2 },
      { title: "Gallery", href: "/admin/gallery", icon: Image },
      { title: "Partners", href: "/admin/partners", icon: Handshake },
    ],
  },
  {
    title: "Membership",
    items: [
      { title: "Registrations", href: "/admin/registrations", icon: UserCheck },
      { title: "Members", href: "/admin/members", icon: Users },
      { title: "Alumni", href: "/admin/alumni", icon: GraduationCap },
      { title: "Departments", href: "/admin/departments", icon: Building2 },
      { title: "Positions", href: "/admin/positions", icon: BadgeCheck },
      { title: "Organization Periods", href: "/admin/periods", icon: CalendarRange },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Website Settings", href: "/admin/settings", icon: Settings },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    ],
  },
];
