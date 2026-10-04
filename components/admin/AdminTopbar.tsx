import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { AdminUserDropdown } from "./AdminUserDropdown";

interface AdminTopbarProps {
  adminName: string;
}

export function AdminTopbar({ adminName }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6">
      {/* Left: Mobile Toggle & Dynamic Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <AdminMobileNav />
        <AdminBreadcrumb />
      </div>

      {/* Right: Quick actions & Admin Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Lihat Website (Desktop/Tablet) */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span>Lihat Website</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        <div className="hidden sm:block h-4 w-px bg-gray-200" aria-hidden="true" />

        {/* Profile Dropdown with embedded Logout */}
        <AdminUserDropdown adminName={adminName} />
      </div>
    </header>
  );
}
