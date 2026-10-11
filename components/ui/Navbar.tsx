"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { isPublicNavItemActive, type PublicNavItem, type PublicNavSubItem } from "@/config/public-navigation";

// Backward-compatible type aliases
export type NavSubItem = PublicNavSubItem;
export type NavItemType = PublicNavItem;

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  alwaysVisible?: boolean;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  alwaysVisible?: boolean;
}

interface NavItemsProps {
  items: PublicNavItem[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  alwaysVisible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className, alwaysVisible }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(Boolean(alwaysVisible));

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (alwaysVisible) {
      setVisible(true);
    } else if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.header
      ref={ref}
      className={cn("sticky inset-x-0 top-0 z-40 w-full pt-4", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{
                visible?: boolean;
                alwaysVisible?: boolean;
              }>,
              { visible: alwaysVisible || visible, alwaysVisible },
            )
          : child,
      )}
    </motion.header>
  );
};

export const NavBody = ({
  children,
  className,
  visible,
  alwaysVisible,
}: NavBodyProps) => {
  const isVis = Boolean(alwaysVisible || visible);

  return (
    <motion.div
      animate={{
        backdropFilter: isVis ? "blur(16px)" : "none",
        boxShadow: isVis ? "0 10px 30px -10px rgba(2, 48, 167, 0.12)" : "none",
        borderColor: isVis ? "rgba(229, 231, 235, 0.9)" : "transparent",
        y: isVis ? 4 : 0,
      }}
      transition={
        alwaysVisible
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 260,
              damping: 28,
            }
      }
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full border bg-transparent px-5 py-2 lg:flex transition-colors duration-200",
        isVis ? "bg-white/95" : "bg-white/80 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const pathname = usePathname();

  const renderSubItem = (
    sub: PublicNavSubItem,
    sIdx: number,
    onItemClickCb?: () => void,
    closeDropdownCb?: () => void,
  ) => {
    const cleanHref = sub.href.split("#")[0];
    const isSubActive =
      cleanHref && cleanHref !== "/"
        ? pathname === cleanHref || pathname.startsWith(`${cleanHref}/`)
        : pathname === sub.href;

    return (
      <Link
        key={sIdx}
        href={sub.href}
        onClick={() => {
          closeDropdownCb?.();
          onItemClickCb?.();
        }}
        className={cn(
          "group flex items-start justify-between p-2 rounded-xl transition-all",
          isSubActive
            ? "bg-primary-50 text-primary"
            : "hover:bg-primary-50/70 text-gray-700",
        )}
      >
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-bold transition-colors",
                isSubActive
                  ? "text-primary"
                  : "text-gray-900 group-hover:text-primary",
              )}
            >
              {sub.title}
            </span>
            {sub.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                {sub.badge}
              </span>
            )}
          </div>
          {sub.desc && (
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-1">
              {sub.desc}
            </p>
          )}
        </div>
        <IconChevronRight
          size={14}
          className={cn(
            "shrink-0 mt-0.5 transition-transform duration-200 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5",
            isSubActive && "text-primary translate-x-0.5",
          )}
          aria-hidden="true"
        />
      </Link>
    );
  };

  return (
    <nav
      onMouseLeave={() => {
        setHovered(null);
        setActiveDropdown(null);
      }}
      className={cn(
        "relative hidden flex-1 flex-row items-center justify-center space-x-0.5 text-xs xl:text-sm font-medium text-gray-600 transition duration-200 lg:flex px-2",
        className,
      )}
      aria-label="Navigasi Utama"
    >
      {items.map((item, idx) => {
        const hasDropdown = Boolean(item.subItems && item.subItems.length > 0);
        const isDropdownOpen = activeDropdown === idx;
        const isActive = isPublicNavItemActive(pathname, item);
        const isTwoColumn = item.layout === "two-column";

        // Group items if two-column layout
        const col1Items = isTwoColumn
          ? item.subItems?.filter(
              (s) => s.group === "Profil Organisasi" || !s.group
            ) || []
          : [];
        const col2Items = isTwoColumn
          ? item.subItems?.filter((s) => s.group === "Aktivitas & Media") || []
          : [];

        return (
          <div
            key={`nav-item-${idx}`}
            className="relative"
            onMouseEnter={() => {
              setHovered(idx);
              if (hasDropdown) setActiveDropdown(idx);
              else setActiveDropdown(null);
            }}
          >
            <Link
              href={item.link}
              onClick={onItemClick}
              className={cn(
                "relative px-3 py-2 transition-colors inline-flex items-center gap-1 rounded-full cursor-pointer select-none",
                isActive
                  ? "text-primary font-semibold"
                  : "text-gray-600 hover:text-primary",
              )}
              aria-expanded={hasDropdown ? isDropdownOpen : undefined}
              aria-haspopup={hasDropdown ? "true" : undefined}
            >
              {hovered === idx && (
                <motion.div
                  layoutId="navbar-hover-pill"
                  className="absolute inset-0 h-full w-full rounded-full bg-primary-50/80 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.name}</span>
              {hasDropdown && (
                <IconChevronDown
                  size={14}
                  className={cn(
                    "relative z-10 transition-transform duration-200 text-gray-400",
                    isDropdownOpen && "rotate-180 text-primary",
                    isActive && "text-primary",
                  )}
                  aria-hidden="true"
                />
              )}
              {/* Subtle active underline indicator */}
              {isActive && (
                <span
                  className="absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </Link>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {hasDropdown && isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50",
                    isTwoColumn
                      ? "w-[500px] xl:w-[540px]"
                      : "w-72 xl:w-80",
                  )}
                >
                  <div className="bg-white/98 backdrop-blur-xl rounded-2xl p-3 shadow-2xl shadow-primary/15 border border-gray-200/90 ring-1 ring-black/5">
                    {isTwoColumn ? (
                      /* Side-by-side 2-column layout */
                      <div className="grid grid-cols-2 gap-3 divide-x divide-gray-100">
                        {/* Column 1: Profil Organisasi */}
                        <div className="space-y-0.5 pr-1">
                          <div className="px-2.5 py-1 mb-1 border-b border-gray-100/80 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Profil Organisasi
                            </span>
                          </div>
                          {col1Items.map((sub, sIdx) =>
                            renderSubItem(
                              sub,
                              sIdx,
                              onItemClick,
                              () => setActiveDropdown(null),
                            )
                          )}
                        </div>

                        {/* Column 2: Aktivitas & Media */}
                        <div className="space-y-0.5 pl-3">
                          <div className="px-2.5 py-1 mb-1 border-b border-gray-100/80 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Aktivitas & Media
                            </span>
                          </div>
                          {col2Items.map((sub, sIdx) =>
                            renderSubItem(
                              sub,
                              sIdx,
                              onItemClick,
                              () => setActiveDropdown(null),
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Single column layout */
                      <div>
                        <div className="px-3 py-1.5 mb-1 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {item.name}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {item.subItems?.map((sub, sIdx) =>
                            renderSubItem(
                              sub,
                              sIdx,
                              onItemClick,
                              () => setActiveDropdown(null),
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
};

export const MobileNav = ({
  children,
  className,
  visible,
  alwaysVisible,
}: MobileNavProps) => {
  const isVis = Boolean(alwaysVisible || visible);

  return (
    <motion.div
      animate={{
        backdropFilter: isVis ? "blur(12px)" : "none",
        boxShadow: isVis ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
        border: isVis
          ? "1px solid var(--color-muted)"
          : "1px solid transparent",
        width: isVis ? "92%" : "100%",
        paddingRight: isVis ? "12px" : "0px",
        paddingLeft: isVis ? "12px" : "0px",
        borderRadius: isVis ? "1rem" : "2rem",
        y: isVis ? 8 : 0,
      }}
      transition={
        alwaysVisible
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 220,
              damping: 30,
            }
      }
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        isVis && "bg-white/95",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        document.getElementById("mobile-nav-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl bg-white/98 backdrop-blur-xl px-5 py-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      id="mobile-nav-toggle"
      aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation"
      onClick={onClick}
    >
      {isOpen ? (
        <IconX className="text-gray-800" />
      ) : (
        <IconMenu2 className="text-gray-800" />
      )}
    </Button>
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-2 flex items-center space-x-2 px-1 py-1 shrink-0"
    >
      <Image
        width={143}
        height={144}
        sizes="32px"
        src="/logo/logo_uvics.webp"
        alt="Uvics Logo"
        className="h-8 w-auto object-contain"
        priority
      />
    </Link>
  );
};
