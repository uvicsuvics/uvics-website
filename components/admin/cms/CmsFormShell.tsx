import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { CmsNoun } from "@/lib/admin/cms";
import type { ContentStatus } from "@/types/cms";
import { CmsBanner } from "./CmsBanner";
import { ContentStatusBadge } from "./ContentStatusBadge";

interface CmsFormShellProps {
  noun: CmsNoun;
  /** Status entri; tanpa nilai berarti entri baru. */
  status?: ContentStatus;
  pending: boolean;
  banner?: string;
  cancelHref: string;
  /** Aksi status dan tanggal, dirender server untuk entri yang sudah ada. */
  statusSlot?: ReactNode;
  /** Kunci aksi status selama form punya perubahan: aksi status memakai isi database, bukan isi form. */
  statusLocked?: boolean;
  children: ReactNode;
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Tata letak form CMS (konsep A): field di kiri, kartu Publikasi dengan tombol simpan di kanan. */
export function CmsFormShell({
  noun,
  status,
  pending,
  banner,
  cancelHref,
  statusSlot,
  statusLocked = false,
  children,
}: CmsFormShellProps) {
  return (
    <div className="flex flex-col gap-5">
      {banner ? <CmsBanner tone="error">{banner}</CmsBanner> : null}
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[999_1_32rem] flex-col gap-5">
          {children}
        </div>
        <aside
          aria-label="Publikasi"
          className="flex flex-[1_1_18rem] flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 lg:sticky lg:top-20"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900">Publikasi</h2>
            {status ? <ContentStatusBadge status={status} /> : null}
          </div>
          {status === "PUBLISHED" ? (
            <p className="rounded-lg bg-secondary/20 p-3 text-sm text-gray-900">
              {`${capitalize(noun)} ini sudah terbit. Perubahan yang disimpan langsung tampil di website.`}
            </p>
          ) : null}
          {status ? null : (
            <p className="text-sm text-gray-600">
              {`${capitalize(noun)} baru disimpan sebagai Draf. Terbitkan setelah isinya siap.`}
            </p>
          )}
          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={pending}
            aria-busy={pending}
          >
            {pending
              ? "Menyimpan..."
              : status
                ? "Simpan perubahan"
                : "Simpan sebagai draf"}
          </Button>
          <Button
            href={cancelHref}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Batal
          </Button>
          {statusSlot ? (
            <fieldset
              disabled={statusLocked}
              aria-describedby={statusLocked ? "cms-status-locked" : undefined}
              className="flex min-w-0 flex-col gap-2"
            >
              {statusLocked ? (
                <p id="cms-status-locked" className="text-xs text-gray-600">
                  Simpan perubahan dulu sebelum mengubah status.
                </p>
              ) : null}
              {statusSlot}
            </fieldset>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

/** Kartu satu kelompok field di form CMS. */
export function CmsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}
