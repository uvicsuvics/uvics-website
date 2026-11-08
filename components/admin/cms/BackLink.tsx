import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Tautan kembali ke daftar modul di atas halaman form. */
export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:text-accent focus-visible:outline-2 focus-visible:outline-primary"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      {children}
    </Link>
  );
}
