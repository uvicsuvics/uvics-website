"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ADMIN_NAVIGATION, isAdminNavItemActive } from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white select-none shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-5 shrink-0">
        <Image
          src="/logo/logo_uvics.webp"
          alt="UVICS Logo"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          priority
        />
        <div className="flex flex-col leading-none">
          <span className="font-heading text-sm font-bold tracking-tight text-gray-900">
            UVICS
          </span>
          <span className="text-[10px] font-medium text-gray-400">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3.5 scrollbar-thin">
        {ADMIN_NAVIGATION.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {section.title && (
              <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = isAdminNavItemActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-primary-50 text-primary font-semibold"
                          : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
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

      {/* Footer Info */}
      <div className="border-t border-gray-100 p-3 text-center shrink-0">
        <p className="text-[11px] text-gray-400">UVICS Platform · v1.0</p>
      </div>
    </aside>
  );
}
