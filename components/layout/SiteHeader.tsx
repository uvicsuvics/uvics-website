"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/Navbar";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isBatch = Boolean(pathname?.startsWith("/batch"));

  const navItems = [
    { name: "Home", link: "/" },
    {
      name: "Batch",
      link: "/batch",
      subItems: [
        { title: "Batch 2024", codeName: "Vanguard", link: "/batch?year=2024", desc: "AI & Distributed Systems" },
        { title: "Batch 2023", codeName: "Innovators", link: "/batch?year=2023", desc: "Hackathons & Web Engineering" },
        { title: "Batch 2022", codeName: "Trailblazers", link: "/batch?year=2022", desc: "Tech Unicorns & Rigor" },
        { title: "Batch 2021", codeName: "Genesis", link: "/batch?year=2021", desc: "UVICS Founding Pioneers" },
      ]
    },
    { name: "Showcase", link: "/showcase" },
    { name: "Media", link: "/media" },
    { name: "About", link: "/about" },
  ];

  return (
    <Navbar alwaysVisible={isBatch} className="fixed top-4">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" href="/register">Daftar Gratis</Button>
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
                        className="flex items-center justify-between py-1 text-xs text-gray-600 hover:text-primary"
                      >
                        <span className="font-semibold">{sub.title} • {sub.codeName}</span>
                        <span className="text-[10px] text-gray-400">{sub.desc}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-4 w-full">
              <Button className="w-full" variant="primary" href="/register">Daftar Gratis</Button>
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
