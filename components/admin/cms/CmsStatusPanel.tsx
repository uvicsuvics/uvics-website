import type { CmsNoun } from "@/lib/admin/cms";
import { formatTimestamp } from "@/lib/format/date";
import type { ContentStatus } from "@/types/cms";
import { CmsStatusAction, type StatusMutation } from "./CmsStatusAction";

interface CmsStatusPanelProps {
  entry: {
    id: string;
    title: string;
    status: ContentStatus;
    created_at: string;
    updated_at: string;
    published_at?: string | null;
  };
  noun: CmsNoun;
  basePath: string;
  publish: StatusMutation;
  archive: StatusMutation;
}

/** Bagian bawah kartu Publikasi di halaman edit: aksi status dan tanggal. */
export function CmsStatusPanel({
  entry,
  noun,
  basePath,
  publish,
  archive,
}: CmsStatusPanelProps) {
  const dates: Array<[string, string]> = [
    ...(entry.published_at
      ? ([["Pertama terbit", entry.published_at]] as Array<[string, string]>)
      : []),
    ["Dibuat", entry.created_at],
    ["Diperbarui", entry.updated_at],
  ];
  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
      <div className="flex flex-wrap gap-2 [&>button]:w-full">
        <CmsStatusAction
          id={entry.id}
          title={entry.title}
          status={entry.status}
          noun={noun}
          publish={publish}
          archive={archive}
          returnTo={`${basePath}/${entry.id}`}
        />
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
        {dates.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-gray-600">{label}</dt>
            <dd className="text-gray-900">{formatTimestamp(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
