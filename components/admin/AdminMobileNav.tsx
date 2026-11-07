"use client";

import React, { useState, useEffect, useRef } from "react";
import { PanelLeftOpen, X } from "lucide-react";
import { AdminBrand, AdminSidebarMenu } from "@/components/admin/AdminSidebar";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap, ESC listener, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Return focus to trigger button when closed
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-900/5 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="Buka menu navigasi"
        aria-expanded={isOpen}
      >
        <PanelLeftOpen className="size-4.5" strokeWidth={1.5} aria-hidden="true" />
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
          <div
            ref={drawerRef}
            className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-50 p-3 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <AdminBrand />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-900/5 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary"
                aria-label="Tutup menu navigasi"
              >
                <X className="size-4.5" strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>

            <AdminSidebarMenu onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
