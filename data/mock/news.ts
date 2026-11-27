import { formatDate } from "@/lib/format/date";

// Isi CONTOH (keputusan K2 #52, D22): bukan berita resmi UVICS. Nama program dan departemen diambil
// dari guidebook; judul, tanggal, dan isi hanya untuk menguji tampilan sampai data dari CMS ada.
// Bentuk `NewsItem` dipertahankan karena NewsSection beranda (#51) masih memakainya;
// newsService memetakannya ke DTO `NewsArticle`.

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Teks polos, paragraf dipisah baris kosong. */
  content: string;
  category: string;
  date: string;
  isoDate: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  featured?: boolean;
}

type NewsSeed = Omit<NewsItem, "date" | "readingTime" | "author">;

const AUTHOR = { name: "Pengurus UVICS", role: "Pengurus", avatar: "/logo/logo_uvics.webp" };
const EXAMPLE_NOTE = "Ini konten contoh. Isi resmi ditulis pengurus UVICS melalui CMS.";
const WORDS_PER_MINUTE = 200;

/** Field tampilan lama beranda diturunkan dari isoDate dan content supaya tidak berbeda dengan halaman berita. */
function withLegacyFields(seed: NewsSeed): NewsItem {
  const minutes = Math.max(1, Math.round(seed.content.split(/\s+/).length / WORDS_PER_MINUTE));
  return { ...seed, date: formatDate(seed.isoDate, "long"), readingTime: `${minutes} mnt baca`, author: AUTHOR };
}

// Urutan array: terbaru dulu (published_at desc), sama dengan urutan backend nanti.
const NEWS_SEEDS: NewsSeed[] = [
  {
    id: "news-contoh-pendaftaran",
    slug: "contoh-pendaftaran-anggota-baru-dibuka",
    title: "Contoh: Pendaftaran Anggota Baru Dibuka",
    excerpt: "Contoh ringkasan: pengumuman pembukaan pendaftaran anggota. Jadwal dan syarat resmi mengikuti pengumuman pengurus.",
    content: `Contoh paragraf pembuka: pengumuman pembukaan pendaftaran anggota baru UVICS.\n\nContoh paragraf kedua: syarat dan alur pendaftaran mengikuti halaman Join UVICS.\n\n${EXAMPLE_NOTE}`,
    category: "Pengumuman",
    isoDate: "2026-11-02",
    image: "/images/img/foto-12.webp",
    featured: true,
  },
  {
    id: "news-contoh-uvics-vibes",
    slug: "contoh-rangkuman-webinar-uvics-vibes",
    title: "Contoh: Rangkuman Webinar UVICS Vibes",
    excerpt: "Contoh ringkasan: catatan singkat dari webinar dan materi yang bisa dipelajari ulang.",
    content: `Contoh paragraf pembuka: ringkasan kegiatan, kapan, dan siapa yang terlibat.\n\nContoh paragraf kedua: materi yang dibahas dan poin penting untuk anggota yang tidak sempat hadir.\n\n${EXAMPLE_NOTE}`,
    category: "Kegiatan",
    isoDate: "2026-10-24",
    image: "/images/img/foto-2.webp",
  },
  {
    id: "news-contoh-mentor-community",
    slug: "contoh-kabar-tim-lomba-mentor-community",
    title: "Contoh: Kabar Tim Lomba Binaan Mentor Community",
    excerpt: "Contoh ringkasan: perkembangan persiapan tim lomba yang didampingi program Mentor Community.",
    content: `Contoh paragraf pembuka: kabar persiapan tim lomba yang didampingi Mentor Community.\n\n${EXAMPLE_NOTE}`,
    category: "Kompetisi",
    isoDate: "2026-10-15",
    image: "/images/img/foto-8.webp",
  },
  {
    id: "news-contoh-devhub",
    slug: "contoh-catatan-kelas-devhub",
    title: "Contoh: Catatan Kelas DevHub",
    excerpt: "Contoh ringkasan: materi dan latihan dari sesi belajar web development bersama departemen.",
    content: `Contoh paragraf pembuka: catatan materi dari kelas DevHub.\n\n${EXAMPLE_NOTE}`,
    category: "Kegiatan",
    isoDate: "2026-09-30",
    image: "/images/img/foto-5.webp",
  },
  {
    id: "news-contoh-web-development",
    slug: "contoh-profil-departemen-web-development",
    title: "Contoh: Profil Departemen Web Development",
    excerpt: "Contoh ringkasan: pengenalan departemen dan program yang dikelolanya.",
    content: `Contoh paragraf pembuka: pengenalan departemen Web Development.\n\n${EXAMPLE_NOTE}`,
    category: "Organisasi",
    isoDate: "2026-09-20",
    image: "/images/img/foto-9.webp",
  },
  {
    id: "news-contoh-bonding",
    slug: "contoh-agenda-bonding-periode-baru",
    title: "Contoh: Agenda Bonding Periode Baru",
    excerpt: "Contoh ringkasan: pengumuman agenda Bonding untuk anggota periode baru.",
    content: `Contoh paragraf pembuka: pengumuman agenda Bonding.\n\n${EXAMPLE_NOTE}`,
    category: "Pengumuman",
    isoDate: "2026-09-05",
    image: "/images/img/foto-13.webp",
  },
];

export const UVICS_NEWS: NewsItem[] = NEWS_SEEDS.map(withLegacyFields);
