import type { Metadata } from "next";
import { EventHero } from "@/components/events/EventHero";
import { EventTimelineSection } from "@/components/events/EventTimeline";
import { Pagination } from "@/components/ui/Pagination";
import { getEventBoard } from "@/lib/services/eventService";
import { orNotFound, readPage, type SearchParams } from "@/lib/services/query";
import { listHref } from "@/lib/utils";

const description = "Agenda webinar, kelas, dan kegiatan anggota UVICS.";

export const metadata: Metadata = { title: "Event | UVICS", description };

const PAST_ID = "event-lampau";

interface EventsPageProps {
  searchParams: Promise<SearchParams>;
}

// loading.tsx ada di route group (list) supaya tidak membungkus /events/[slug]: slug tak dikenal tetap HTTP 404.
export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { upcoming, past } = await orNotFound(getEventBoard({ page: readPage(await searchParams) }));

  return (
    <div className="flex flex-col">
      <EventHero nearest={upcoming[0] ?? null} />

      <div className="flex flex-col gap-14 mx-auto px-6 py-14 w-full max-w-7xl md:px-8">
        <EventTimelineSection
          id="event-mendatang"
          title="Akan datang"
          count={upcoming.length}
          events={upcoming}
          emptyMessage="Belum ada event mendatang."
        />

        {past.pagination.total_items > 0 && (
          <EventTimelineSection id={PAST_ID} title="Sudah berlangsung" count={past.pagination.total_items} events={past.items}>
            <Pagination
              className="pt-8"
              label="Navigasi halaman event yang sudah berlangsung"
              currentPage={past.pagination.page}
              totalPages={past.pagination.total_pages}
              getHref={(page) => `${listHref("/events", { page })}#${PAST_ID}`}
            />
          </EventTimelineSection>
        )}
      </div>
    </div>
  );
}
