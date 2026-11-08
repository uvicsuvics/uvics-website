import { CONTENT_STATUS_LABELS } from "@/lib/format/labels";
import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/types/cms";

const STYLE: Record<ContentStatus, { badge: string; dot: string }> = {
  DRAFT: { badge: "bg-gray-100 text-gray-700", dot: "bg-gray-500" },
  PUBLISHED: { badge: "bg-primary-50 text-primary", dot: "bg-success" },
  ARCHIVED: { badge: "bg-secondary/20 text-gray-800", dot: "bg-warning" },
};

/** Badge status konten CMS; label dari `CONTENT_STATUS_LABELS`. */
export function ContentStatusBadge({
  status,
  className,
}: {
  status: ContentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STYLE[status].badge,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", STYLE[status].dot)}
      />
      {CONTENT_STATUS_LABELS[status]}
    </span>
  );
}
