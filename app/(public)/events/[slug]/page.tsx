import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventDetailHeader } from "@/components/events/EventDetailHeader";
import { EventTimelineSection } from "@/components/events/EventTimeline";
import { getEventBySlug, getRelatedEvents } from "@/lib/services/eventService";
import { toParagraphs } from "@/lib/utils";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  if (!event) {
    return { title: "Event Tidak Ditemukan | UVICS" };
  }
  return { title: `${event.title} | Event UVICS`, description: toParagraphs(event.description)[0] };
}

// Tanpa loading.tsx di segmen ini: notFound() harus terjadi sebelum streaming agar status HTTP 404.
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const related = await getRelatedEvents(slug);

  return (
    <div className="flex flex-col">
      <EventDetailHeader event={event} />

      <div className="flex flex-col gap-14 mx-auto px-6 py-14 w-full max-w-7xl md:px-8">
        <section aria-labelledby="tentang-event-heading" className="flex flex-col gap-4 max-w-3xl">
          <h2
            id="tentang-event-heading"
            className="pb-2.5 font-heading text-2xl font-bold text-gray-900 border-b-2 border-gray-900"
          >
            Tentang event
          </h2>
          {toParagraphs(event.description).map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </section>

        {related.length > 0 && (
          <EventTimelineSection
            id="event-lainnya"
            title="Event lainnya"
            events={related}
            action={
              <Link href="/events" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
                Semua event
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
