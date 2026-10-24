// Konten sementara untuk Admin → Pages → About UVICS dan Vision & Mission.
// Tahun berdiri 2024 sudah dikonfirmasi. Angka statistik, narasi sejarah, dan isi tonggak
// masih placeholder yang belum dikonfirmasi PM; ganti dengan data resmi sebelum rilis.

export interface CtaLink {
  label: string;
  href: string;
}

/** meta_title dan meta_description halaman (spesifikasi §28). */
export interface PageMeta {
  title: string;
  description: string;
}

export interface ImageContent {
  src: string;
  alt: string;
}

export interface SectionHeading {
  title: string;
  /** Kata penutup judul yang diberi warna biru. */
  titleHighlight: string;
  description?: string;
}

export interface PageHeroContent {
  title: string;
  /** Kata penutup judul yang diberi warna biru, mis. "UVICS". */
  titleHighlight: string;
  description: string;
  /** Foto latar hero. */
  image: ImageContent;
}

export interface ClosingCtaContent {
  title: string;
  description: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
}

export interface AboutStatItem {
  value: string;
  label: string;
  description: string;
}

export interface CoreValueItem {
  id: string;
  title: string;
  description: string;
  iconName: "Shield" | "Trophy" | "Users" | "Sparkles" | "TrendingUp" | "HeartHandshake";
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  schedule: string;
  output: string;
  iconName: "Trophy" | "BookOpen" | "Cpu" | "Share2";
}

export interface MilestoneItem {
  year: string;
  title: string;
  description: string;
  achievements: string[];
}

export interface VisionPillarItem {
  title: string;
  description: string;
}

export interface MissionItem {
  number: string;
  title: string;
  description: string;
  points: string[];
  iconName: "Target" | "Cpu" | "GraduationCap" | "Scale" | "Network";
}

export interface PrincipleItem {
  id: string;
  title: string;
  description: string;
  quote: string;
}

export interface AboutContent {
  meta: PageMeta;
  hero: PageHeroContent;
  overview: SectionHeading & { paragraphs: string[]; stats: AboutStatItem[] };
  history: SectionHeading & { paragraphs: string[]; turningPoint: string; image: ImageContent };
  /** Pratinjau; pernyataan visi dan daftar misi dibaca dari UVICS_VISION_MISSION. */
  visionMission: SectionHeading & { visionLabel: string; missionLabel: string; link: CtaLink };
  values: SectionHeading & { items: CoreValueItem[] };
  activities: SectionHeading & { scheduleLabel: string; outputLabel: string; items: ActivityItem[] };
  milestones: SectionHeading & { items: MilestoneItem[] };
  cta: ClosingCtaContent;
}

export interface VisionMissionContent {
  meta: PageMeta;
  hero: PageHeroContent;
  vision: SectionHeading & { statement: string; elaboration: string[]; pillars: VisionPillarItem[] };
  mission: SectionHeading & { items: MissionItem[] };
  principles: SectionHeading & { items: PrincipleItem[] };
  cta: ClosingCtaContent;
}

export const UVICS_ABOUT: AboutContent = {
  meta: {
    title: "Tentang UVICS",
    description:
      "Profil, sejarah, nilai, dan kegiatan UVICS, komunitas mahasiswa komputasi dan teknologi Universitas Klabat.",
  },
  hero: {
    title: "Talenta Teknologi, Berakar dalam",
    titleHighlight: "Kebajikan",
    description:
      "UVICS adalah wadah kolaborasi komputasi dan teknologi bagi mahasiswa Universitas Klabat untuk mengasah kompetensi, membangun riset terapan, dan bersaing di tingkat nasional maupun internasional.",
    image: {
      src: "/images/img/foto-2.webp",
      alt: "Foto bersama anggota UVICS di ruang kelas Universitas Klabat",
    },
  },
  overview: {
    title: "Komunitas mahasiswa komputasi",
    titleHighlight: "Universitas Klabat",
    paragraphs: [
      "Unklab Virtue In Computer Science (UVICS) menghimpun mahasiswa Universitas Klabat yang menekuni rekayasa perangkat lunak, kecerdasan buatan, keamanan siber, dan desain sistem digital.",
      "Kami menyatukan talenta dari berbagai program studi dalam lingkungan yang memadukan keunggulan teknis, etika Kristiani, dan semangat berkompetisi secara sehat.",
      "Melalui pembinaan terstruktur, riset terarah, dan mentoring, UVICS mendampingi anggotanya mengikuti kompetisi seperti GEMASTIK dan hackathon serta membangun proyek digital yang bermanfaat.",
    ],
    stats: [
      { value: "2024", label: "Tahun berdiri", description: "Dimulai dari kelompok belajar mahasiswa" },
      { value: "24+", label: "Penghargaan", description: "Tingkat regional dan nasional" },
      { value: "120+", label: "Anggota dan alumni", description: "Lintas angkatan dan program studi" },
      { value: "18+", label: "Proyek terapan", description: "Untuk kampus dan masyarakat" },
    ],
  },
  history: {
    title: "Perjalanan terbentuknya",
    titleHighlight: "UVICS",
    description: "Dari kelompok belajar mahasiswa menjadi organisasi dengan departemen dan program pembinaan.",
    paragraphs: [
      "Pada 2024, sekelompok mahasiswa dan mentor di Fakultas Ilmu Komputer Universitas Klabat melihat perlunya wadah bagi mahasiswa yang ingin belajar melampaui kurikulum kelas reguler.",
      "Kompetisi nasional seperti GEMASTIK dan ICPC menuntut pemahaman algoritma lanjutan dan kerja sama tim lintas keahlian. Dari kelompok belajar kecil di laboratorium kampus, nama UVICS diresmikan dengan membawa filosofi 'Virtue' (kebajikan) sebagai landasan setiap karya.",
      "Seiring waktu, UVICS berkembang menjadi organisasi mandiri dengan struktur kepengurusan, departemen yang berfokus pada kompetisi, publikasi, dan riset internal, serta bimbingan bagi delegasi kampus.",
    ],
    turningPoint:
      "Keikutsertaan pertama delegasi UVICS di kompetisi nasional menjadi titik balik yang mengukuhkan UVICS sebagai wadah delegasi teknologi Universitas Klabat.",
    image: {
      src: "/images/img/foto-10.webp",
      alt: "Enam pengurus UVICS berseragam biru berpose di tangga kampus Universitas Klabat",
    },
  },
  visionMission: {
    title: "Arah dan",
    titleHighlight: "komitmen UVICS",
    visionLabel: "Visi",
    missionLabel: "Misi",
    link: { label: "Baca visi dan misi lengkap", href: "/vision-mission" },
  },
  values: {
    title: "Enam nilai yang",
    titleHighlight: "kami pegang",
    items: [
      {
        id: "val-integrity",
        title: "Kebajikan & Integritas",
        description:
          "Kejujuran intelektual dan etika adalah fondasi. Setiap baris kode, penelitian, dan capaian harus mencerminkan kejujuran.",
        iconName: "Shield",
      },
      {
        id: "val-excellence",
        title: "Keunggulan & Daya Saing",
        description:
          "Kami terus melatih diri dan menetapkan standar tinggi agar siap bersaing di setiap kompetisi.",
        iconName: "Trophy",
      },
      {
        id: "val-collaboration",
        title: "Kolaborasi",
        description:
          "Karya terbaik lahir ketika developer, desainer, dan problem solver bekerja sama dan saling melengkapi.",
        iconName: "Users",
      },
      {
        id: "val-innovation",
        title: "Inovasi",
        description:
          "Kami berani menguji ide baru dan menjadikan kegagalan sebagai bahan belajar dalam riset teknologi.",
        iconName: "Sparkles",
      },
      {
        id: "val-growth",
        title: "Pertumbuhan Berkelanjutan",
        description:
          "Belajar tidak pernah selesai. Kami saling membimbing, termasuk adik tingkat, dan berkembang bersama.",
        iconName: "TrendingUp",
      },
      {
        id: "val-impact",
        title: "Karya yang Berdampak",
        description:
          "Teknologi yang kami bangun diarahkan untuk memuliakan Tuhan dan memberi manfaat nyata bagi sesama.",
        iconName: "HeartHandshake",
      },
    ],
  },
  activities: {
    title: "Apa yang kami",
    titleHighlight: "kerjakan",
    scheduleLabel: "Jadwal",
    outputLabel: "Hasil",
    items: [
      {
        id: "act-mentoring",
        title: "Pendampingan Kompetisi",
        category: "Kompetisi",
        description:
          "Pendampingan dari mentor dan alumni untuk mematangkan proposal, algoritma pemecahan masalah, prototipe, dan presentasi.",
        schedule: "Mingguan dan menjelang lomba",
        output: "Delegasi lomba yang siap bertanding",
        iconName: "Trophy",
      },
      {
        id: "act-workshops",
        title: "Workshop Teknologi",
        category: "Pelatihan",
        description:
          "Sesi praktik tentang framework web modern, arsitektur cloud, dan machine learning yang relevan dengan kebutuhan industri.",
        schedule: "Dua minggu sekali",
        output: "Penguasaan teknologi terkini",
        iconName: "BookOpen",
      },
      {
        id: "act-incubation",
        title: "Inkubasi Proyek & Hackathon Internal",
        category: "Proyek",
        description:
          "Tim merancang perangkat lunak dari awal hingga siap didemokan untuk melatih kecepatan eksekusi dan komunikasi.",
        schedule: "Setiap semester",
        output: "Prototipe yang siap diuji",
        iconName: "Cpu",
      },
      {
        id: "act-sharing",
        title: "Berbagi Pengetahuan",
        category: "Komunitas",
        description:
          "Diskusi terbuka bersama praktisi industri dan alumni, serta sesi berbagi hasil lomba untuk anggota dan publik.",
        schedule: "Bulanan",
        output: "Wawasan industri terkini",
        iconName: "Share2",
      },
    ],
  },
  milestones: {
    title: "Tonggak perkembangan",
    titleHighlight: "UVICS",
    items: [
      {
        year: "2024",
        title: "Pembentukan komunitas",
        description:
          "UVICS didirikan oleh mahasiswa Fakultas Ilmu Komputer sebagai wadah latihan algoritma dan persiapan kompetisi.",
        achievements: [
          "Kelompok belajar algoritma dan pemrograman",
          "Kurikulum internal angkatan pertama",
          "Delegasi pertama di kompetisi teknologi",
        ],
      },
      {
        year: "2025",
        title: "Pembentukan departemen",
        description:
          "Struktur departemen diresmikan (Web Dev, Internal Dev, Editor, Competition Handler, PR) dan delegasi mulai mengikuti kompetisi nasional.",
        achievements: [
          "Kepengurusan dan departemen pertama",
          "Delegasi di kompetisi nasional seperti GEMASTIK",
          "Workshop teknologi untuk anggota",
        ],
      },
      {
        year: "2026",
        title: "Platform terpadu",
        description:
          "UVICS memperkuat tata kelola organisasi dan membangun platform web terintegrasi untuk anggota dan publik.",
        achievements: [
          "Platform digital UVICS (CMS, registrasi, direktori)",
          "Rekrutmen anggota angkatan berikutnya",
          "Inkubasi proyek berbasis open source",
        ],
      },
    ],
  },
  cta: {
    title: "Siap bergabung dengan UVICS?",
    description:
      "Kembangkan kemampuan komputasimu, ikuti kompetisi, dan belajar bersama komunitas mahasiswa teknologi Universitas Klabat.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Lihat Departemen", href: "/departments" },
  },
};

export const UVICS_VISION_MISSION: VisionMissionContent = {
  meta: {
    title: "Visi & Misi | UVICS",
    description: "Visi, lima misi, dan prinsip yang memandu program UVICS di Universitas Klabat.",
  },
  hero: {
    title: "Visi dan Misi",
    titleHighlight: "UVICS",
    description:
      "Arah jangka panjang dan komitmen yang memandu setiap program UVICS dalam membina insan komputasi yang berdaya saing dan berlandaskan kebajikan.",
    image: {
      src: "/images/img/foto-16.webp",
      alt: "Tujuh pengurus UVICS berseragam biru berpose di bangku taman kampus Universitas Klabat",
    },
  },
  vision: {
    title: "Visi",
    titleHighlight: "UVICS",
    statement:
      "Menjadi pusat keunggulan talenta teknologi dan komputasi mahasiswa di Indonesia yang berdaya saing global, berkarakter luhur, dan menghasilkan inovasi digital yang berdampak bagi masyarakat.",
    elaboration: [
      "Kami memandang teknologi bukan sekadar alat teknis, melainkan sarana pengabdian untuk memecahkan persoalan nyata dengan berlandaskan moral dan etika.",
      "Visi ini diterjemahkan ke dalam kurikulum internal yang mendorong anggota melampaui teori, bereksperimen dengan teknologi baru, dan berkompetisi secara sportif.",
    ],
    pillars: [
      {
        title: "Daya Saing",
        description: "Standar teknis tinggi dan latihan rutin untuk menyiapkan delegasi kompetisi.",
      },
      {
        title: "Integritas & Kebajikan",
        description: "Menjunjung kejujuran akademik dan etika Kristiani dalam setiap pencapaian.",
      },
      {
        title: "Rekayasa yang Berdampak",
        description: "Mengarahkan ide dan riset pada perangkat lunak yang manfaatnya dirasakan pengguna.",
      },
      {
        title: "Pembinaan Inklusif",
        description: "Saling berbagi ilmu dan membimbing anggota baru hingga berkembang optimal.",
      },
    ],
  },
  mission: {
    title: "Misi",
    titleHighlight: "UVICS",
    description: "Lima langkah yang kami jalankan di setiap periode kepengurusan.",
    items: [
      {
        number: "01",
        title: "Menyiapkan delegasi kompetisi nasional dan internasional",
        description:
          "Menyelenggarakan seleksi, simulasi kompetisi, bimbingan berkala, dan pendampingan mentor agar mahasiswa Universitas Klabat berprestasi di ajang sains dan teknologi.",
        points: [
          "Simulasi berkala dengan standar GEMASTIK, ICPC, dan LIDM",
          "Pendampingan oleh alumni pemenang lomba dan dosen pembimbing",
          "Bank soal, studi kasus, dan workshop algoritma lanjutan",
        ],
        iconName: "Target",
      },
      {
        number: "02",
        title: "Mengembangkan produk digital dan rekayasa terapan",
        description:
          "Memfasilitasi anggota merancang, membangun, dan merilis produk digital yang dapat diuji oleh warga kampus maupun publik sebagai portofolio.",
        points: [
          "Kolaborasi lintas peran: software engineer, UI/UX, QA, dan project manager",
          "Penerapan teknologi modern seperti Next.js, TypeScript, dan Supabase",
          "Praktik clean code dan keamanan data",
        ],
        iconName: "Cpu",
      },
      {
        number: "03",
        title: "Membangun budaya belajar berkelanjutan",
        description:
          "Menyelenggarakan workshop berkala, tech talk, peer mentoring mingguan, dan dokumentasi pengetahuan untuk kepengurusan berikutnya.",
        points: [
          "Workshop internal dua minggu sekali",
          "Program pendampingan anggota baru",
          "Repositori riset dan dokumentasi proyek yang terbuka",
        ],
        iconName: "GraduationCap",
      },
      {
        number: "04",
        title: "Menguatkan karakter, integritas, dan etika",
        description:
          "Menanamkan kejujuran, sportivitas, kerendahan hati, dan semangat pelayanan Kristiani dalam kepengurusan, perlombaan, dan karya.",
        points: [
          "Kode etik tentang orisinalitas karya dan anti-plagiarisme",
          "Refleksi berkala dan persekutuan doa",
          "Melayani almamater Universitas Klabat dengan integritas",
        ],
        iconName: "Scale",
      },
      {
        number: "05",
        title: "Menjalin kemitraan dengan industri dan komunitas",
        description:
          "Membangun kerja sama dengan perusahaan teknologi, startup, komunitas open source, dan alumni untuk membuka peluang magang dan karier.",
        points: [
          "Kunjungan industri dan sesi berbagi bersama praktisi",
          "Acara bersama komunitas developer Sulawesi Utara",
          "Jejaring karier bagi alumni",
        ],
        iconName: "Network",
      },
    ],
  },
  principles: {
    title: "Prinsip yang menopang",
    titleHighlight: "program kami",
    description: "Fondasi moral yang menjaga setiap program kerja tetap bernilai dan bermakna.",
    items: [
      {
        id: "pr-virtue",
        title: "Kebajikan sebelum algoritma",
        description:
          "Keahlian teknis adalah alat, sedangkan karakter menentukan apakah alat itu membawa kebaikan.",
        quote: "Bukan hanya menjadi programmer yang mahir, tetapi insan komputasi yang berakhlak.",
      },
      {
        id: "pr-preparation",
        title: "Persiapan yang tekun",
        description:
          "Kemenangan di kompetisi adalah hasil dari ratusan jam latihan, iterasi, dan disiplin diri.",
        quote: "Keberuntungan datang ketika persiapan bertemu kesempatan.",
      },
      {
        id: "pr-servant",
        title: "Kepemimpinan yang melayani",
        description:
          "Semakin tinggi kemampuan teknis yang diraih, semakin besar tanggung jawab untuk melayani kampus dan masyarakat.",
        quote: "Karya terbaik adalah karya yang meringankan beban orang lain.",
      },
    ],
  },
  cta: {
    title: "Wujudkan visi ini bersama UVICS",
    description:
      "Bergabunglah dengan mahasiswa yang belajar, berkompetisi, dan berkarya dengan landasan kebajikan.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Kembali ke Tentang UVICS", href: "/about" },
  },
};
