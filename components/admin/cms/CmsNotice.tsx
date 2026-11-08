"use client";

import { useSearchParams } from "next/navigation";
import { CmsBanner } from "./CmsBanner";

/** Banner sukses dari `?notice=`; hilang begitu `dismissNotice` menghapus parameter itu. */
export function CmsNotice({ message }: { message?: string }) {
  const visible = useSearchParams().has("notice");
  return message && visible ? (
    <CmsBanner tone="success">{message}</CmsBanner>
  ) : null;
}

/**
 * Hapus `notice` dari URL tanpa request ke server (history Next.js ikut sinkron),
 * agar banner sukses lama tidak tampil bersama galat aksi berikutnya.
 */
export function dismissNotice() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("notice")) return;
  url.searchParams.delete("notice");
  window.history.replaceState(null, "", url.toString());
}
