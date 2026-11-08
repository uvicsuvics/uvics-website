import { statusAction, type CmsNoun } from "@/lib/admin/cms";
import type { OperationResult } from "@/lib/backend/errors";
import type { ContentStatus } from "@/types/cms";
import { StatusActionButton } from "./StatusActionButton";

export type StatusMutation = (id: string) => Promise<OperationResult<null>>;

interface CmsStatusActionProps {
  id: string;
  title: string;
  status: ContentStatus;
  noun: CmsNoun;
  publish: StatusMutation;
  archive: StatusMutation;
  /** URL yang dibuka lagi setelah sukses; parameter `notice` ditambahkan di sini. */
  returnTo: string;
}

/** Memilih Server Action sesuai status, mengikatnya ke id, lalu merender tombolnya. */
export function CmsStatusAction({
  id,
  title,
  status,
  noun,
  publish,
  archive,
  returnTo,
}: CmsStatusActionProps) {
  const kind = statusAction(status, noun, title).kind;
  const notice = kind === "publish" ? "published" : "archived";
  return (
    <StatusActionButton
      status={status}
      noun={noun}
      title={title}
      action={(kind === "publish" ? publish : archive).bind(null, id)}
      successHref={`${returnTo}${returnTo.includes("?") ? "&" : "?"}notice=${notice}`}
    />
  );
}
