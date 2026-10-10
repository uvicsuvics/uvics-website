"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/src/components/atoms/Button/Button";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/src/components/molecule/NavBar/Navbar";

type NavSubItem = {
  title: string;
  link: string;
  desc: string;
  codeName?: string;
};

type NavItem = {
  name: string;
  link: string;
  subItems?: NavSubItem[];
};

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isBatch = Boolean(pathname?.startsWith("/batch"));
  const navItems: NavItem[] = [
    { name: "Beranda", link: "/" },
    {
      name: "Tentang",
      link: "/about",
      subItems: [
        {
          title: "Tentang UVICS",
          link: "/about",
          desc: "Siapa dan apa itu UVICS",
        },
        {
          title: "Visi & Misi",
          link: "/about/visi-misi",
          desc: "Arah dan tujuan organisasi",
        },
        {
          title: "Departemen",
          link: "/about/departemen",
          desc: "Divisi dan bidang kerja",
        },
      ],
    },
    {
      name: "Organisasi",
      link: "/organisasi/struktur",
      subItems: [
        {
          title: "Struktur Organisasi",
          link: "/organisasi/struktur",
          desc: "Pengurus dan susunan jabatan",
        },
        {
          title: "Member",
          link: "/batch",
          desc: "Jajaran member per angkatan",
        },
        {
          title: "Alumni",
          link: "/organisasi/alumni",
          desc: "Lulusan dan jejak karier",
        },
      ],
    },
    { name: "Program", link: "/program" },
    { name: "Kompetisi", link: "/kompetisi" },
    { name: "Prestasi", link: "/prestasi" },
    { name: "Project", link: "/showcase" },
    {
      name: "Informasi",
      link: "/informasi/event",
      subItems: [
        {
          title: "Event",
          link: "/informasi/event",
          desc: "Agenda dan kegiatan UVICS",
        },
        {
          title: "Berita",
          link: "/informasi/berita",
          desc: "Kabar terbaru dari UVICS",
        },
        {
          title: "Galeri",
          link: "/media",
          desc: "Foto dan dokumentasi",
        },
      ],
    },
  ];

  return (
    <Navbar alwaysVisible={isBatch} className="fixed top-4">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" href="/register">
            Join UVICS
          </Button>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-3 w-full">
            {navItems.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <a
                  href={item.link}
                  className="text-base font-semibold text-gray-800 hover:text-primary transition-colors py-1 flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.name}</span>
                </a>
                {item.subItems && (
                  <div className="pl-3 mt-1 space-y-1 border-l-2 border-primary/20">
                    {item.subItems.map((sub, sIdx) => (
                      <a
                        key={sIdx}
                        href={sub.link}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between gap-3 py-1 text-xs text-gray-600 hover:text-primary"
                      >
                        <span className="font-semibold">
                          {sub.codeName
                            ? `${sub.title} • ${sub.codeName}`
                            : sub.title}
                        </span>
                        <span className="text-[10px] text-gray-400 text-right">
                          {sub.desc}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-4 w-full">
              <Button className="w-full" variant="primary" href="/register">
                Join UVICS
              </Button>
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
