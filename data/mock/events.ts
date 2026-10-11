export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  venueType: "On-Campus" | "Online" | "Hybrid";
  startAt: string;
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

export const UVICS_EVENTS: EventItem[] = [
  {
    id: "evt-tech-talk-fullstack",
    slug: "tech-talk-scalable-fullstack-2026",
    title: "UVICS Tech Talk: Architecting Scalable Next.js & Cloud Systems",
    description: "Sesi mendalam mengenai praktik rekayasa perangkat lunak modern, optimasi SSR di edge, dan strategi membangun backend resilient untuk jutaan pengguna.",
    location: "Auditorium GK1 UNKLAB & Live Zoom",
    venueType: "Hybrid",
    startAt: "2026-10-12T14:00:00+08:00",
    dateBadge: {
      day: "12",
      month: "OKT",
      year: "2026",
    },
    timeRange: "14:00 - 16:30 WITA",
    registrationUrl: "https://uvics.org/events/register/tech-talk-fullstack",
    poster: "/images/img/foto-2.webp",
    status: "UPCOMING",
    category: "Tech Talk",
    speaker: {
      name: "Kevin Runtuwene",
      role: "Staff Software Engineer & Alumnus UVICS",
    },
    seatsLeft: 45,
    featured: true,
  },
  {
    id: "evt-workshop-cv-pytorch",
    slug: "hands-on-deep-learning-pytorch",
    title: "Hands-on Bootcamp: Practical Computer Vision with PyTorch",
    description: "Workshop interaktif pemrograman model deep learning, transfer learning untuk deteksi objek, dan deployment model AI langsung ke antarmuka web.",
    location: "Lab Komputer 3, Gedung FIK UNKLAB",
    venueType: "On-Campus",
    startAt: "2026-10-24T09:00:00+08:00",
    dateBadge: {
      day: "24",
      month: "OKT",
      year: "2026",
    },
    timeRange: "09:00 - 15:00 WITA",
    registrationUrl: "https://uvics.org/events/register/deep-learning-pytorch",
    poster: "/images/img/foto-3.webp",
    status: "UPCOMING",
    category: "Workshop",
    speaker: {
      name: "Sarah Manoppo",
      role: "Lead Researcher AI & Data UVICS",
    },
    seatsLeft: 18,
    featured: false,
  },
  {
    id: "evt-internal-hackathon",
    slug: "uvics-codesprint-hackathon-2026",
    title: "UVICS CodeSprint: 48-Hour Campus Innovation Challenge",
    description: "Kompetisi hackathon internal tahunan di mana anggota UVICS membentuk tim lintas angkatan untuk menyelesaikan tantangan digitalisasi kampus Universitas Klabat.",
    location: "Innovation Hall Gedung Pioneer UNKLAB",
    venueType: "On-Campus",
    startAt: "2026-11-07T08:00:00+08:00",
    dateBadge: {
      day: "07",
      month: "NOV",
      year: "2026",
    },
    timeRange: "08:00 WITA (Non-stop 48 Jam)",
    registrationUrl: "https://uvics.org/events/register/codesprint-2026",
    poster: "/images/img/foto-12.webp",
    status: "UPCOMING",
    category: "Hackathon Internal",
    seatsLeft: 12,
    featured: true,
  },
  {
    id: "evt-design-critique-uiux",
    slug: "design-system-critique-session",
    title: "Design Critique & Accessibility Audit Clinic",
    description: "Sesi bedah antarmuka dan usability testing langsung terhadap prototipe proyek anggota, dipandu oleh UI/UX designer profesional.",
    location: "Studio Desain Kreatif & Discord Voice",
    venueType: "Hybrid",
    startAt: "2026-11-18T16:00:00+08:00",
    dateBadge: {
      day: "18",
      month: "NOV",
      year: "2026",
    },
    timeRange: "16:00 - 18:00 WITA",
    registrationUrl: "https://uvics.org/events/register/design-critique",
    poster: "/images/img/foto-13.webp",
    status: "UPCOMING",
    category: "Workshop",
    speaker: {
      name: "Kezia Sondakh",
      role: "Product Design Lead UVICS",
    },
    seatsLeft: 25,
    featured: false,
  },
];
