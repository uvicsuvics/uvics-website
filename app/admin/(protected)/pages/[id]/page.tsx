import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BackLink } from "@/components/admin/cms/BackLink";
import { CmsBanner } from "@/components/admin/cms/CmsBanner";
import { CmsStatusPanel } from "@/components/admin/cms/CmsStatusPanel";
import { PageForm } from "@/components/admin/cms/PageForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { CMS_NOTICES, noticeMessage } from "@/lib/admin/cms";
import { loadForAdmin } from "@/lib/admin/server";
import { getAdminPage } from "@/lib/backend/pages";
import { readEnum, type SearchParams } from "@/lib/services/query";
import { archivePageAction, publishPageAction } from "../actions";

export const metadata: Metadata = {
  title: "Edit Halaman | UVICS Admin",
};

interface EditPagePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function EditPagePage({
  params,
  searchParams,
}: EditPagePageProps) {
  const { id } = await params;
  const notice = noticeMessage(
    readEnum(await searchParams, "notice", CMS_NOTICES),
    "halaman",
  );
  const result = await loadForAdmin((client) => getAdminPage(client, id));
  if (!result.ok && result.error.code === "NOT_FOUND") notFound();

  return (
    <div className="space-y-6">
      <BackLink href="/admin/pages">Daftar halaman</BackLink>
      <AdminPageHeader
        title="Edit halaman"
        description={result.ok ? result.data.title : undefined}
      />
      {notice ? <CmsBanner tone="success">{notice}</CmsBanner> : null}
      {result.ok ? (
        <PageForm
          // Muat ulang nilai form setelah simpan (updated_at berubah).
          key={result.data.updated_at}
          page={result.data}
          statusSlot={
            <CmsStatusPanel
              entry={result.data}
              noun="halaman"
              basePath="/admin/pages"
              publish={publishPageAction}
              archive={archivePageAction}
            />
          }
        />
      ) : (
        <ErrorState
          title="Halaman belum bisa dimuat"
          message={result.error.message}
        />
      )}
    </div>
  );
}
