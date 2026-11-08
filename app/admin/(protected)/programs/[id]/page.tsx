import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BackLink } from "@/components/admin/cms/BackLink";
import { CmsNotice } from "@/components/admin/cms/CmsNotice";
import { CmsStatusPanel } from "@/components/admin/cms/CmsStatusPanel";
import { ProgramForm } from "@/components/admin/cms/ProgramForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { CMS_NOTICES, noticeMessage } from "@/lib/admin/cms";
import { loadForAdmin } from "@/lib/admin/server";
import { getAdminProgram } from "@/lib/backend/programs";
import { readEnum, type SearchParams } from "@/lib/services/query";
import { archiveProgramAction, publishProgramAction } from "../actions";

export const metadata: Metadata = {
  title: "Edit Program | UVICS Admin",
};

interface EditProgramPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function EditProgramPage({
  params,
  searchParams,
}: EditProgramPageProps) {
  const { id } = await params;
  const notice = noticeMessage(
    readEnum(await searchParams, "notice", CMS_NOTICES),
    "program",
  );
  const result = await loadForAdmin((client) => getAdminProgram(client, id));
  if (!result.ok && result.error.code === "NOT_FOUND") notFound();

  return (
    <div className="space-y-6">
      <BackLink href="/admin/programs">Daftar program</BackLink>
      <AdminPageHeader
        title="Edit program"
        description={result.ok ? result.data.name : undefined}
      />
      <CmsNotice message={notice} />
      {result.ok ? (
        <ProgramForm
          // Muat ulang nilai form setelah simpan (updated_at berubah).
          key={result.data.updated_at}
          program={result.data}
          statusSlot={
            <CmsStatusPanel
              entry={{ ...result.data, title: result.data.name }}
              noun="program"
              basePath="/admin/programs"
              publish={publishProgramAction}
              archive={archiveProgramAction}
            />
          }
        />
      ) : (
        <ErrorState
          title="Program belum bisa dimuat"
          message={result.error.message}
        />
      )}
    </div>
  );
}
