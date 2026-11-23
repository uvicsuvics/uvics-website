import { formatDayMonth, formatTimeRange, toWitaDate } from "@/lib/format/date";

// Isi CONTOH (keputusan K2 #52, D22): bukan konten resmi UVICS. Nama program diambil dari
// guidebook; jadwal, lokasi, dan deskripsi hanya untuk menguji tampilan sampai data dari CMS ada.
// Bentuk `EventItem` dipertahankan karena EventsSection beranda (#51) masih memakainya;
// eventService memetakannya ke DTO `PublicEvent`.

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  venueType: "On-Campus" | "Online" | "Hybrid";
  startAt: string;
  endAt?: string;
  dateBadge: {
    day: string;
    month: string;
    year: string;
  };
  timeRange: string;
  registrationUrl?: string;
  poster: string;
  status: "UPCOMING" | "ONGOING" | "FINISHED" | "CANCELLED";
  category: "Workshop" | "Tech Talk" | "Hackathon Internal" | "Orientasi" | "Showcase";
  speaker?: {
    name: string;
    role: string;
  };
  seatsLeft?: number;
  featured?: boolean;
}

type EventSeed = Omit<EventItem, "dateBadge" | "timeRange">;

const EXAMPLE_NOTE = "Ini konten contoh. Jadwal, lokasi, dan detail resmi diumumkan pengurus UVICS.";

/** Field tampilan lama beranda diturunkan dari startAt/endAt supaya tidak berbeda dengan halaman event. */
function withLegacyFields(seed: EventSeed): EventItem {
  const date = toWitaDate(seed.startAt);
  const { day, month } = formatDayMonth(date);
  return {
    ...seed,
    dateBadge: { day, month: month.toUpperCase(), year: date.slice(0, 4) },
    timeRange: formatTimeRange(seed.startAt, seed.endAt ?? null),
  };
}

// Tiga event mendatang di depan karena EventsSection menampilkan tiga item pertama sebagai "Event Mendatang".
const EVENT_SEEDS: EventSeed[] = [
  {
    id: "evt-contoh-uvics-vibes",
    slug: "contoh-webinar-uvics-vibes",
    title: "Contoh: Webinar UVICS Vibes",
    description: `Contoh event: webinar teknologi dan pengembangan diri dari program UVICS Vibes.\n\n${EXAMPLE_NOTE}`,
    location: "Online",
    venueType: "Online",
    startAt: "2026-11-21T14:00:00+08:00",
    endAt: "2026-11-21T16:00:00+08:00",
    poster: "/images/img/foto-2.webp",
    status: "UPCOMING",
    category: "Tech Talk",
    featured: true,
  },
  {
    id: "evt-contoh-kabel",
    slug: "contoh-sesi-belajar-kabel",
    title: "Contoh: Sesi Belajar KABEL",
    description: `Contoh event: sesi belajar bersama program KABEL (Kamar Belajar) sesuai topik yang dipilih anggota.\n\n${EXAMPLE_NOTE}`,
    location: "Kampus UNKLAB, Airmadidi",
    venueType: "On-Campus",
    startAt: "2026-12-05T18:00:00+08:00",
    endAt: "2026-12-05T20:00:00+08:00",
    poster: "/images/img/foto-3.webp",
    status: "UPCOMING",
    category: "Workshop",
  },
  {
    id: "evt-contoh-bonding",
    slug: "contoh-bonding-anggota-uvics",
    title: "Contoh: Bonding Anggota UVICS",
    description: `Contoh event: kegiatan Bonding untuk mempererat hubungan antaranggota.\n\n${EXAMPLE_NOTE}`,
    location: "Kampus UNKLAB, Airmadidi",
    venueType: "On-Campus",
    startAt: "2027-01-16T09:00:00+08:00",
    endAt: "2027-01-16T15:00:00+08:00",
    poster: "/images/img/foto-9.webp",
    status: "UPCOMING",
    category: "Orientasi",
  },
  {
    id: "evt-contoh-mentor-community",
    slug: "contoh-sharing-session-mentor-community",
    title: "Contoh: Sharing Session Mentor Community",
    description: `Contoh event: sesi berbagi persiapan lomba dari program Mentor Community.\n\n${EXAMPLE_NOTE}`,
    location: "Kampus UNKLAB, Airmadidi",
    venueType: "On-Campus",
    startAt: "2026-10-18T15:00:00+08:00",
    endAt: "2026-10-18T17:00:00+08:00",
    poster: "/images/img/foto-8.webp",
    status: "FINISHED",
    category: "Workshop",
  },
  {
    id: "evt-contoh-devhub",
    slug: "contoh-kelas-devhub",
    title: "Contoh: Kelas DevHub",
    description: `Contoh event yang dibatalkan: kelas web development dari program DevHub.\n\n${EXAMPLE_NOTE}`,
    location: "Online",
    venueType: "Online",
    startAt: "2026-09-27T16:00:00+08:00",
    endAt: "2026-09-27T18:00:00+08:00",
    poster: "/images/img/foto-5.webp",
    status: "CANCELLED",
    category: "Workshop",
  },
  {
    id: "evt-contoh-bonding-awal",
    slug: "contoh-bonding-awal-periode",
    title: "Contoh: Bonding Awal Periode",
    description: `Contoh event: Bonding pembuka periode kepengurusan.\n\n${EXAMPLE_NOTE}`,
    location: "Kampus UNKLAB, Airmadidi",
    venueType: "On-Campus",
    startAt: "2026-09-06T09:00:00+08:00",
    endAt: "2026-09-06T14:00:00+08:00",
    poster: "/images/img/foto-12.webp",
    status: "FINISHED",
    category: "Orientasi",
  },
];

export const UVICS_EVENTS: EventItem[] = EVENT_SEEDS.map(withLegacyFields);
