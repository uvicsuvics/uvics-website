export interface PublicNavSubItem {
  title: string;
  href: string;
  desc?: string;
  badge?: string;
  group?: string;
}

export interface PublicNavItem {
  name: string;
  link: string;
  layout?: "single-column" | "two-column";
  subItems?: PublicNavSubItem[];
}

/**
 * Public navigation structure for UVICS Platform.
 * Top-level items: Beranda, Tentang (2-column: Profil & Aktivitas/Media), Organisasi, Program, Kompetisi, Prestasi, Project.
 */
export const PUBLIC_NAVIGATION: PublicNavItem[] = [
  {
    name: "Beranda",
    link: "/",
  },
  {
    name: "Tentang",
    link: "/about",
    layout: "two-column",
    subItems: [
      // Column 1: Profil Organisasi
      {
        title: "Tentang UVICS",
        href: "/about",
        desc: "Mengenal profil, sejarah, dan identitas UVICS",
        group: "Profil Organisasi",
      },
      {
        title: "Visi & Misi",
        href: "/about#visi-misi",
        desc: "Nilai luhur dan komitmen pengembangan talenta",
        group: "Profil Organisasi",
      },
      {
        title: "Departemen",
        href: "/departments",
        desc: "Divisi kerja, bidang fokus, dan unit operasional",
        group: "Profil Organisasi",
      },
      // Column 2: Aktivitas & Media
      {
        title: "Event",
        href: "/events",
        desc: "Agenda seminar, workshop, dan kegiatan teknologi",
        group: "Aktivitas & Media",
      },
      {
        title: "Berita",
        href: "/news",
        desc: "Kabar terbaru, siaran pers, dan pengumuman",
        group: "Aktivitas & Media",
      },
      {
        title: "Galeri",
        href: "/gallery",
        desc: "Dokumentasi visual kegiatan dan momen komunitas",
        group: "Aktivitas & Media",
      },
    ],
  },
  {
    name: "Organisasi",
    link: "/organization",
    layout: "single-column",
    subItems: [
      {
        title: "Struktur Organisasi",
        href: "/organization",
        desc: "Bagan pimpinan dan kepengurusan organisasi",
      },
      {
        title: "Member",
        href: "/members",
        desc: "Direktori mahasiswa dan anggota aktif UVICS",
      },
      {
        title: "Alumni",
        href: "/alumni",
        desc: "Jejaring alumni dan kiprah lulusan di industri",
      },
    ],
  },
  {
    name: "Program",
    link: "/programs",
  },
  {
    name: "Kompetisi",
    link: "/competitions",
  },
  {
    name: "Prestasi",
    link: "/achievements",
  },
  {
    name: "Project",
    link: "/projects",
  },
];

/**
 * Determines whether a public navigation item is active based on current pathname.
 */
export function isPublicNavItemActive(pathname: string, item: PublicNavItem): boolean {
  if (item.link === "/") {
    return pathname === "/";
  }

  // Exact match or sub-route match with the primary link
  if (pathname === item.link || pathname.startsWith(`${item.link}/`)) {
    return true;
  }

  // If item has subItems, check if current path matches any of its subItems
  if (item.subItems) {
    return item.subItems.some((sub) => {
      const cleanSubHref = sub.href.split("#")[0];
      if (cleanSubHref && cleanSubHref !== "/") {
        return pathname === cleanSubHref || pathname.startsWith(`${cleanSubHref}/`);
      }
      return false;
    });
  }

  return false;
}
