"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/src/components/atoms/Button/Button";
import { cn } from "@/src/lib/utils";
import { IconMenu2, IconX, IconChevronDown } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState, useEffect } from "react";

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

export interface NavSubItem {
  title: string;
  codeName?: string;
  link: string;
  desc?: string;
}

export interface NavItemType {
  name: string;
  link: string;
  subItems?: NavSubItem[];
}

interface NavItemsProps {
  items: NavItemType[];
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
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}
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
    </motion.div>
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
        backdropFilter: isVis ? "blur(10px)" : "none",
        boxShadow: isVis ? "0 4px 12px rgba(0,0,0,0.10)" : "none",
        border: isVis
          ? "1px solid var(--color-muted)"
          : "1px solid transparent",
        width: isVis ? "40%" : "100%",
        y: isVis ? 20 : 0,
      }}
      transition={
        alwaysVisible
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 200,
              damping: 50,
            }
      }
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex",
        isVis && "bg-white/95",
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

  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
        setActiveDropdown(null);
      }}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium text-gray-600 transition duration-200 lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => {
        const hasDropdown = Boolean(item.subItems && item.subItems.length > 0);
        const isDropdownOpen = activeDropdown === idx;

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
            <a
              onClick={onItemClick}
              className="relative px-3.5 py-2 text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
              href={item.link}
            >
              {hovered === idx && (
                <motion.div
                  layoutId="hovered"
                  className="absolute inset-0 h-full w-full rounded-full bg-primary-50"
                />
              )}
              <span className="relative z-20">{item.name}</span>
              {hasDropdown && (
                <IconChevronDown
                  size={14}
                  className={cn(
                    "relative z-20 transition-transform duration-200 text-gray-400",
                    isDropdownOpen && "rotate-180 text-primary",
                  )}
                />
              )}
            </a>

            {/* Animated Dropdown Menu */}
            <AnimatePresence>
              {hasDropdown && isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50"
                >
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl shadow-primary/15 border border-gray-200/90 ring-1 ring-black/5">
                    <div className="px-3 py-1.5 mb-1 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Pilih Angkatan
                      </span>
                      <span className="text-[10px] font-mono text-primary font-semibold bg-primary-50 px-1.5 py-0.5 rounded">
                        UVICS
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {item.subItems?.map((sub, sIdx) => (
                        <a
                          key={sIdx}
                          href={sub.link}
                          onClick={() => {
                            setActiveDropdown(null);
                            onItemClick?.();
                          }}
                          className="flex items-start justify-between p-2.5 rounded-xl hover:bg-primary-50/80 group transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-800 group-hover:text-primary transition-colors">
                                {sub.title}
                              </span>
                              {sub.codeName && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                                  {sub.codeName}
                                </span>
                              )}
                            </div>
                            {sub.desc && (
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                {sub.desc}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-gray-100 px-2">
                      <a
                        href="/batch"
                        onClick={() => {
                          setActiveDropdown(null);
                          onItemClick?.();
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center justify-between py-1"
                      >
                        <span>Lihat Semua Angkatan</span>
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
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
        backdropFilter: isVis ? "blur(10px)" : "none",
        boxShadow: isVis ? "0 4px 12px rgba(0,0,0,0.10)" : "none",
        border: isVis
          ? "1px solid var(--color-muted)"
          : "1px solid transparent",
        width: isVis ? "90%" : "100%",
        paddingRight: isVis ? "12px" : "0px",
        paddingLeft: isVis ? "12px" : "0px",
        borderRadius: isVis ? "4px" : "2rem",
        y: isVis ? 20 : 0,
      }}
      transition={
        alwaysVisible
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 200,
              damping: 50,
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-lg border border-gray-100",
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
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
    >
      <Image
        width={143}
        height={144}
        sizes="32px"
        src="/logo/logo_uvics.webp"
        alt="Uvics Logo"
        className="h-8 w-auto object-contain"
      />
    </Link>
  );
};
