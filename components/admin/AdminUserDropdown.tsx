"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { AdminLogoutButton } from "@/components/forms/AdminLogoutButton";
import { cn } from "@/lib/utils";

interface AdminUserDropdownProps {
  adminName: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminUserDropdown({ adminName }: AdminUserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(adminName);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100/80 focus-visible:outline-2 focus-visible:outline-primary"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Menu profil administrator"
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-[11px] font-bold text-primary"
          aria-hidden="true"
        >
          {initials}
        </div>
        <span className="hidden max-w-[120px] truncate text-xs font-semibold text-gray-700 sm:inline-block">
          {adminName}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180 text-gray-600"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 duration-100"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Details */}
          <div className="px-2.5 py-2">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {adminName}
            </p>
            <p className="text-[11px] text-gray-400">Administrator</p>
          </div>

          <div className="my-1 border-t border-gray-100" role="separator" />

          {/* Logout Action */}
          <div role="none">
            <AdminLogoutButton variant="dropdown-item" />
          </div>
        </div>
      )}
    </div>
  );
}
