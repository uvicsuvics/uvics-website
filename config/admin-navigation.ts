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
  Building,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavLink {
  title: string;
  href: string;
}

export interface AdminNavItem extends AdminNavLink {
  icon: LucideIcon;
  badge?: string;
}

/** Entri sidebar yang bisa dilipat; tautan anaknya tampil tanpa ikon. */
export interface AdminNavGroup {
  title: string;
  icon: LucideIcon;
  items: AdminNavLink[];
}

export interface AdminNavSection {
  title?: string;
  items: (AdminNavItem | AdminNavGroup)[];
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
      { title: "Halaman", href: "/admin/pages", icon: FileText },
      { title: "Program", href: "/admin/programs", icon: BookOpen },
      { title: "Berita", href: "/admin/news", icon: Newspaper },
      { title: "Event", href: "/admin/events", icon: CalendarDays },
      { title: "Kompetisi", href: "/admin/competitions", icon: Trophy },
      { title: "Prestasi", href: "/admin/achievements", icon: Award },
      { title: "Project", href: "/admin/projects", icon: FolderGit2 },
      { title: "Galeri", href: "/admin/gallery", icon: Image },
      { title: "Partner", href: "/admin/partners", icon: Handshake },
    ],
  },
  {
    title: "Membership",
    items: [
      { title: "Pendaftaran", href: "/admin/registrations", icon: UserCheck },
      { title: "Anggota", href: "/admin/members", icon: Users },
      { title: "Alumni", href: "/admin/alumni", icon: GraduationCap },
      {
        title: "Organisasi",
        icon: Building,
        items: [
          { title: "Departemen", href: "/admin/departments" },
          { title: "Posisi", href: "/admin/positions" },
          { title: "Periode Organisasi", href: "/admin/organization-periods" },
        ],
      },
    ],
  },
];

/** Tautan sistem di bagian bawah sidebar, di atas tombol Keluar. */
export const ADMIN_NAVIGATION_FOOTER: AdminNavItem[] = [
  { title: "Pengaturan Website", href: "/admin/settings", icon: Settings },
  { title: "Log Audit", href: "/admin/audit-logs", icon: ShieldCheck },
];

/** Semua tautan admin dalam satu daftar datar, termasuk anak grup dan footer. */
export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  ...ADMIN_NAVIGATION.flatMap((section) =>
    section.items.flatMap((entry) => ("items" in entry ? entry.items : [entry]))
  ),
  ...ADMIN_NAVIGATION_FOOTER,
];

/**
 * Determines whether a navigation item is active based on the current pathname.
 * Supports exact match as well as nested child routes (e.g. /admin/news/create matches /admin/news).
 * Prevents false positives by ensuring route segments match on boundary.
 */
export function isAdminNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (pathname.startsWith(`${href}/`)) return true;
  return false;
}

export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COMMON_NESTED_ACTIONS: Record<string, string> = {
  create: "Tambah",
  new: "Tambah",
  edit: "Edit",
  detail: "Detail",
};

/**
 * Derives dynamic breadcrumbs from pathname using ADMIN_NAV_LINKS as the single source of truth.
 */
export function getAdminBreadcrumbs(pathname: string): AdminBreadcrumbItem[] {
  const crumbs: AdminBreadcrumbItem[] = [
    { label: "Admin", href: "/admin/dashboard" },
  ];

  // If path is root admin or dashboard
  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    crumbs.push({ label: "Dashboard", href: "/admin/dashboard", isCurrent: true });
    return crumbs;
  }

  let matchedItem: AdminNavLink | undefined;
  for (const item of ADMIN_NAV_LINKS) {
    if (isAdminNavItemActive(pathname, item.href)) {
      if (!matchedItem || item.href.length > matchedItem.href.length) {
        matchedItem = item;
      }
    }
  }

  if (matchedItem) {
    if (pathname === matchedItem.href) {
      crumbs.push({ label: matchedItem.title, href: matchedItem.href, isCurrent: true });
      return crumbs;
    }

    crumbs.push({ label: matchedItem.title, href: matchedItem.href });

    const remainingSegments = pathname
      .slice(matchedItem.href.length)
      .split("/")
      .filter(Boolean);

    let currentPath = matchedItem.href;
    remainingSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === remainingSegments.length - 1;
      const lower = segment.toLowerCase();
      // Segmen UUID adalah halaman edit entri (mis. /admin/pages/<id>).
      const label = UUID.test(segment)
        ? COMMON_NESTED_ACTIONS.edit
        : COMMON_NESTED_ACTIONS[lower] || decodeURIComponent(segment);
      crumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: currentPath,
        isCurrent: isLast,
      });
    });

    return crumbs;
  }

  // Fallback for custom or unlisted admin routes
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  let currentPath = "/admin";
  segments.forEach((seg, index) => {
    currentPath += `/${seg}`;
    const isLast = index === segments.length - 1;
    const lower = seg.toLowerCase();
    const label = COMMON_NESTED_ACTIONS[lower] || decodeURIComponent(seg);
    crumbs.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      href: currentPath,
      isCurrent: isLast,
    });
  });

  return crumbs;
}
