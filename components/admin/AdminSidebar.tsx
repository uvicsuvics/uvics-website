"use client";

import { useId, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import { AdminLogoutButton } from "@/components/forms/AdminLogoutButton";
import {
  ADMIN_NAVIGATION,
  ADMIN_NAVIGATION_FOOTER,
  isAdminNavItemActive,
  type AdminNavGroup,
  type AdminNavLink,
} from "@/config/admin-navigation";
import { cn } from "@/lib/utils";

const SIDEBAR_ID = "admin-sidebar";
const COLLAPSED_STORAGE_KEY = "uvics:admin-sidebar-collapsed";

const NAV_ITEM_CLASS =
  "group flex min-h-8 w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-900/5 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:text-gray-400 hover:[&_svg]:text-gray-600";
const NAV_ITEM_ACTIVE_CLASS =
  "bg-primary/8 font-semibold text-gray-900 hover:bg-primary/8 [&_svg]:text-primary hover:[&_svg]:text-primary";

// Status buka/tutup sidebar desktop disimpan per viewer; nilai di memori tetap dipakai bila localStorage diblokir.
// shortcut: server selalu merender sidebar terbuka, jadi sidebar yang ditutup sempat tampil sesaat saat hydrate; pindah ke cookie bila mengganggu.
const collapsedListeners = new Set<() => void>();
let collapsedValue: boolean | undefined;

function readCollapsed(): boolean {
  if (collapsedValue === undefined) {
    try {
      collapsedValue = window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "1";
    } catch {
      collapsedValue = false;
    }
  }
  return collapsedValue;
}

function writeCollapsed(value: boolean) {
  collapsedValue = value;
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Storage tidak tersedia: status hanya bertahan sampai halaman dimuat ulang.
  }
  collapsedListeners.forEach((listener) => listener());
}

function subscribeCollapsed(listener: () => void) {
  collapsedListeners.add(listener);
  return () => {
    collapsedListeners.delete(listener);
  };
}

function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
}

interface AdminNavLinkRowProps {
  link: AdminNavLink;
  icon?: LucideIcon;
  onNavigate?: () => void;
}

function AdminNavLinkRow({ link, icon: Icon, onNavigate }: AdminNavLinkRowProps) {
  const pathname = usePathname();
  const isActive = isAdminNavItemActive(pathname, link.href);

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(NAV_ITEM_CLASS, isActive && NAV_ITEM_ACTIVE_CLASS)}
    >
      {Icon && <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />}
      <span className="truncate">{link.title}</span>
    </Link>
  );
}

function AdminNavGroupRow({ group, onNavigate }: { group: AdminNavGroup; onNavigate?: () => void }) {
  const pathname = usePathname();
  const listId = useId();
  const hasActiveChild = group.items.some((link) => isAdminNavItemActive(pathname, link.href));
  // null = belum disentuh pengguna, jadi grup terbuka hanya bila salah satu anaknya aktif.
  const [open, setOpen] = useState<boolean | null>(null);
  const isExpanded = open ?? hasActiveChild;
  const Icon = group.icon;

  return (
    <>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={listId}
        onClick={() => setOpen(!isExpanded)}
        className={NAV_ITEM_CLASS}
      >
        <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
        <span className="flex-1 truncate">{group.title}</span>
        <ChevronRight
          className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
          aria-hidden="true"
        />
      </button>
      <ul
        id={listId}
        hidden={!isExpanded}
        className="mt-0.5 ml-[17px] flex flex-col gap-0.5 border-l border-gray-900/8 pl-2"
      >
        {group.items.map((link) => (
          <li key={link.href}>
            <AdminNavLinkRow link={link} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Logo dan nama panel, dipakai di sidebar desktop dan drawer mobile. */
export function AdminBrand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-2", className)}>
      <Image
        src="/logo/logo_uvics.webp"
        alt="UVICS Logo"
        width={32}
        height={32}
        className="size-8 rounded-md object-contain"
      />
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[13px] font-semibold text-gray-900">UVICS</span>
        <span className="text-[11px] text-gray-500">Admin Panel</span>
      </div>
    </div>
  );
}

/**
 * Isi navigasi admin: grup menu, lalu Pengaturan Website, Log Audit, dan Keluar di bawah.
 * @param onNavigate - dipanggil setelah tautan diklik (drawer mobile memakainya untuk menutup diri)
 */
export function AdminSidebarMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Navigasi admin" className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto scrollbar-thin">
        {ADMIN_NAVIGATION.map((section, idx) => (
          <div key={section.title ?? idx}>
            {section.title && (
              <p className="mb-1 px-2.5 text-[11px] font-semibold tracking-[0.08em] text-gray-500 uppercase">
                {section.title}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((entry) => (
                <li key={entry.title}>
                  {"items" in entry ? (
                    <AdminNavGroupRow group={entry} onNavigate={onNavigate} />
                  ) : (
                    <AdminNavLinkRow link={entry} icon={entry.icon} onNavigate={onNavigate} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ul className="mt-3 flex flex-col gap-0.5 border-t border-gray-900/8 pt-3">
        {ADMIN_NAVIGATION_FOOTER.map((item) => (
          <li key={item.href}>
            <AdminNavLinkRow link={item} icon={item.icon} onNavigate={onNavigate} />
          </li>
        ))}
        <li>
          <AdminLogoutButton variant="sidebar-item" className={NAV_ITEM_CLASS} />
        </li>
      </ul>
    </nav>
  );
}

/** Sidebar desktop; bisa ditutup lewat `AdminSidebarToggle` di topbar. */
export function AdminSidebar({ className }: { className?: string }) {
  const isCollapsed = useSidebarCollapsed();

  return (
    <aside
      id={SIDEBAR_ID}
      aria-label="Sidebar admin"
      hidden={isCollapsed}
      className={cn(
        "sticky top-0 flex h-screen w-65 shrink-0 flex-col border-r border-gray-900/8 bg-gray-50 p-3 select-none",
        className
      )}
    >
      <AdminBrand className="mb-3" />
      <AdminSidebarMenu />
    </aside>
  );
}

/** Tombol buka/tutup sidebar desktop di topbar. Di bawah `lg` navigasi memakai `AdminMobileNav`. */
export function AdminSidebarToggle() {
  const isCollapsed = useSidebarCollapsed();
  const Icon = isCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <button
      type="button"
      onClick={() => writeCollapsed(!isCollapsed)}
      aria-label={isCollapsed ? "Buka sidebar" : "Tutup sidebar"}
      aria-expanded={!isCollapsed}
      aria-controls={SIDEBAR_ID}
      className="hidden size-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-900/5 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary lg:inline-flex"
    >
      <Icon className="size-4.5" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
