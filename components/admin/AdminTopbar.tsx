import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminUserDropdown } from "./AdminUserDropdown";

interface AdminTopbarProps {
  adminName: string;
}

export function AdminTopbar({ adminName }: AdminTopbarProps) {
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

      {/* Right: Quick actions & Admin Profile Dropdown */}
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

        {/* Profile Dropdown with embedded Logout */}
        <AdminUserDropdown adminName={adminName} />
      </div>
    </header>
  );
}
