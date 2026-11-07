import { cache } from "react";
import { UVICS_EVENTS, type EventItem } from "@/data/mock/events";
import { paginate } from "@/lib/services/query";
import { findBySlug } from "@/lib/services/shared";
import type { EventBoard, EventStatus, PublicEvent } from "@/types/event";

// Sumber data sementara: mock. Saat tabel `events` ada, isi fungsi diganti query Supabase
// (frontend-convention §11); signature tetap sehingga halaman tidak berubah.

/** Event lampau per halaman di /events. */
export const PAST_EVENTS_PAGE_SIZE = 9;

const UPCOMING: readonly EventStatus[] = ["UPCOMING", "ONGOING"];

// shortcut: memetakan bentuk mock lama yang masih dipakai EventsSection beranda; hapus saat #51
// memindahkan section ke service dan mock berbentuk DTO.
function toEvent(item: EventItem): PublicEvent {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    location: item.location || null,
    startAt: item.startAt,
    endAt: item.endAt ?? null,
    registrationUrl: item.registrationUrl ?? null,
    poster: item.poster || null,
    status: item.status,
    featured: item.featured ?? false,
  };
}

const listEvents = (): PublicEvent[] => UVICS_EVENTS.map(toEvent);

// Offset tiap datetime bisa berbeda, jadi dibandingkan sebagai waktu, bukan string.
const byStart = (descending = false) => (a: PublicEvent, b: PublicEvent) =>
  (Date.parse(a.startAt) - Date.parse(b.startAt)) * (descending ? -1 : 1);

function split(events: PublicEvent[]) {
  return {
    upcoming: events.filter((e) => UPCOMING.includes(e.status)).sort(byStart()),
    past: events.filter((e) => !UPCOMING.includes(e.status)).sort(byStart(true)),
  };
}

/**
 * Isi halaman /events: mendatang (UPCOMING, ONGOING) tanpa pagination, lampau (FINISHED, CANCELLED)
 * per halaman. Pembagian memakai status tersimpan sampai T06 diputuskan.
 * @throws AppError NOT_FOUND bila `page` melewati total halaman event lampau.
 */
export async function getEventBoard({ page = 1 }: { page?: number } = {}): Promise<EventBoard> {
  const { upcoming, past } = split(listEvents());
  return { upcoming, past: paginate(past, page, PAST_EVENTS_PAGE_SIZE) };
}

/** Dibungkus `cache` supaya `generateMetadata` dan page berbagi satu hasil per request. */
export const getEventBySlug = cache(
  async (slug: string): Promise<PublicEvent | null> => findBySlug(listEvents(), slug),
);

/** Event lain: mendatang terdekat dulu, lalu lampau terbaru; tanpa dirinya sendiri. */
export async function getRelatedEvents(slug: string, limit = 3): Promise<PublicEvent[]> {
  const events = listEvents();
  if (!findBySlug(events, slug)) return [];
  const { upcoming, past } = split(events.filter((e) => e.slug !== slug));
  return [...upcoming, ...past].slice(0, limit);
}
