"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronDown } from "@tabler/icons-react";
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
import {
  PUBLIC_NAVIGATION,
  isPublicNavItemActive,
} from "@/config/public-navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleSection = (name: string) => {
    setExpandedSection((prev) => (prev === name ? null : name));
  };

  return (
    <Navbar className="fixed top-0">
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={PUBLIC_NAVIGATION} />
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" size="sm" href="/register">
            Join UVICS
          </Button>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-1 w-full">
            {PUBLIC_NAVIGATION.map((item, idx) => {
              const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
              const isExpanded = expandedSection === item.name;
              const isActive = isPublicNavItemActive(pathname, item);

              if (!hasSubItems) {
                return (
                  <Link
                    key={idx}
                    href={item.link}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-lg text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary font-bold"
                        : "text-gray-800 hover:bg-gray-50 hover:text-primary",
                    )}
                  >
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <div key={idx} className="flex flex-col rounded-lg overflow-hidden">
                  {/* Category Toggle Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(item.name)}
                    className={cn(
                      "flex items-center justify-between py-2 px-3 rounded-lg text-sm font-semibold transition-colors w-full text-left",
                      isActive
                        ? "bg-primary-50/60 text-primary font-bold"
                        : "text-gray-800 hover:bg-gray-50 hover:text-primary",
                    )}
                    aria-expanded={isExpanded}
                  >
                    <span>{item.name}</span>
                    <IconChevronDown
                      size={16}
                      className={cn(
                        "text-gray-400 transition-transform duration-200",
                        isExpanded && "rotate-180 text-primary",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Sub-items List (Expandable) */}
                  {isExpanded && (
                    <div className="my-1 ml-4 pl-3 space-y-1 border-l-2 border-primary/25">
                      {item.subItems?.map((sub, sIdx) => {
                        const cleanHref = sub.href.split("#")[0];
                        const isSubActive =
                          cleanHref && cleanHref !== "/"
                            ? pathname === cleanHref || pathname.startsWith(`${cleanHref}/`)
                            : pathname === sub.href;

                        return (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex flex-col py-1.5 px-2.5 rounded-lg transition-colors",
                              isSubActive
                                ? "bg-primary-50 text-primary font-semibold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-primary",
                            )}
                          >
                            <span className="text-xs font-semibold">
                              {sub.title}
                            </span>
                            {sub.desc && (
                              <span className="text-[11px] text-gray-400 line-clamp-1">
                                {sub.desc}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile CTA Button */}
            <div className="pt-3 mt-2 border-t border-gray-100 w-full">
              <Button
                className="w-full"
                variant="primary"
                href="/register"
                onClick={() => setIsOpen(false)}
              >
                Join UVICS
              </Button>
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
