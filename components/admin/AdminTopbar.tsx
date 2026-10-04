import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminLogoutButton } from "@/components/forms/AdminLogoutButton";

interface AdminTopbarProps {
  adminName: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AdminTopbar({ adminName }: AdminTopbarProps) {
  const initials = getInitials(adminName);

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="font-medium text-gray-400">Admin</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-800">Dashboard</span>
        </nav>
      </div>

      {/* Right: Quick actions & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Lihat Website */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span className="hidden sm:inline">Lihat Website</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        <div className="h-4 w-px bg-gray-200" aria-hidden="true" />

        {/* User Badge & Logout */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary border border-primary-100"
            title={adminName}
            aria-hidden="true"
          >
            {initials}
          </div>
          <span className="hidden text-xs font-semibold text-gray-700 sm:inline-block max-w-[120px] truncate">
            {adminName}
          </span>
          <div className="shrink-0">
            <AdminLogoutButton size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
