import Link from "next/link";
import { FileText, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { countByStatus, filterCmsItems, type CmsNoun } from "@/lib/admin/cms";
import { formatTimestamp } from "@/lib/format/date";
import { CONTENT_STATUS_LABELS } from "@/lib/format/labels";
import { cn, listHref } from "@/lib/utils";
import { CONTENT_STATUSES, type ContentStatus } from "@/types/cms";
import { CmsStatusAction, type StatusMutation } from "./CmsStatusAction";
import { ContentStatusBadge } from "./ContentStatusBadge";

export interface CmsRow {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  updated_at: string;
  /** Urutan tampil (program); tanpa nilai, kolom urutan tidak dirender. */
  order?: number;
}

interface CmsIndexProps {
  noun: CmsNoun;
  basePath: string;
  rows: CmsRow[];
  status?: ContentStatus;
  search?: string;
  publish: StatusMutation;
  archive: StatusMutation;
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Daftar modul CMS: tab status, pencarian, baris entri dengan aksi, dan state kosong. */
export function CmsIndex({
  noun,
  basePath,
  rows,
  status,
  search,
  publish,
  archive,
}: CmsIndexProps) {
  if (!rows.length)
    return (
      <EmptyState
        icon={FileText}
        title={`Belum ada ${noun}`}
        message={`${capitalize(noun)} yang dibuat muncul di sini dan tersimpan sebagai Draf.`}
        action={
          <Button href={`${basePath}/new`} size="sm">
            {`Tambah ${noun}`}
          </Button>
        }
        className="bg-white"
      />
    );

  const searched = filterCmsItems(rows, { search });
  const counts = countByStatus(searched);
  const visible = filterCmsItems(searched, { status });
  const showOrder = rows.some((row) => row.order !== undefined);
  const returnTo = listHref(basePath, { status, search });
  const columns = showOrder
    ? "md:grid-cols-[4.5rem_minmax(0,1fr)_7rem_7rem_auto]"
    : "md:grid-cols-[minmax(0,1fr)_7rem_7rem_auto]";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <nav
          aria-label="Filter status"
          className="flex flex-wrap gap-1 self-start rounded-lg bg-gray-100 p-1"
        >
          {[undefined, ...CONTENT_STATUSES].map((value) => (
            <Link
              key={value ?? "ALL"}
              href={listHref(basePath, { status: value, search })}
              aria-current={value === status ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-gray-600 hover:text-gray-900",
                value === status && "bg-white text-primary shadow-sm",
              )}
            >
              {value ? CONTENT_STATUS_LABELS[value] : "Semua"}
              <span className="text-gray-500">{counts[value ?? "ALL"]}</span>
            </Link>
          ))}
        </nav>
        <form role="search" action={basePath} className="flex gap-2 lg:w-80">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <label htmlFor={`${noun}-search`} className="sr-only">
            Cari judul atau slug
          </label>
          <Input
            id={`${noun}-search`}
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Cari judul atau slug"
            className="h-10 text-sm"
          />
          <Button type="submit" variant="outline" size="sm">
            Cari
          </Button>
        </form>
      </div>

      {visible.length ? (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "hidden gap-4 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-600 md:grid",
              columns,
            )}
          >
            {showOrder ? <span>Urutan</span> : null}
            <span>Judul</span>
            <span>Status</span>
            <span>Diperbarui</span>
            <span className="text-right">Aksi</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {visible.map((row) => (
              <li
                key={row.id}
                className={cn(
                  "grid gap-x-4 gap-y-2 px-4 py-4 md:items-center",
                  columns,
                )}
              >
                {row.order !== undefined ? (
                  <span className="text-sm font-semibold text-gray-700">
                    <span className="md:hidden">{`Urutan ${row.order}`}</span>
                    <span className="hidden md:inline">
                      <span className="sr-only">Urutan </span>
                      {`#${row.order}`}
                    </span>
                  </span>
                ) : null}
                <div className="min-w-0">
                  <Link
                    href={`${basePath}/${row.id}`}
                    className="font-semibold text-gray-900 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {row.title}
                  </Link>
                  <p className="truncate text-xs text-gray-600">/{row.slug}</p>
                </div>
                <div>
                  <ContentStatusBadge status={row.status} />
                </div>
                <p className="text-sm text-gray-600">
                  <span className="md:sr-only">Diperbarui </span>
                  {formatTimestamp(row.updated_at)}
                </p>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Button
                    href={`${basePath}/${row.id}`}
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${row.title}`}
                  >
                    Edit
                  </Button>
                  <CmsStatusAction
                    id={row.id}
                    title={row.title}
                    status={row.status}
                    noun={noun}
                    publish={publish}
                    archive={archive}
                    returnTo={returnTo}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-600">{`${visible.length} ${noun}`}</p>
        </>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Tidak ada yang cocok"
          message={`Tidak ada ${noun} yang cocok dengan filter ini.`}
          action={
            <Button href={basePath} variant="outline" size="sm">
              Hapus filter
            </Button>
          }
          className="m-4 border-0"
        />
      )}
    </div>
  );
}
