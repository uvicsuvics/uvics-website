"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ADMIN_NAVIGATION } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Handle escape key & background body scroll locking
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="Buka menu navigasi"
        aria-expanded={isOpen}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Drawer & Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu Navigasi Admin"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white font-bold text-xs shadow-xs">
                  U
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-heading text-sm font-bold tracking-tight text-gray-900">
                    UVICS
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">
                    Admin Panel
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Tutup menu navigasi"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3.5">
              {ADMIN_NAVIGATION.map((section, idx) => (
                <div key={idx} className="space-y-0.5">
                  {section.title && (
                    <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {section.title}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary-50 text-primary font-semibold"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-gray-400"
                              )}
                              aria-hidden="true"
                            />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="border-t border-gray-100 p-3 text-center">
              <p className="text-[11px] text-gray-400">UVICS Platform · v1.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
