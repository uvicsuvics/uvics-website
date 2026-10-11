export interface CoreValueItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: "Shield" | "Trophy" | "Users" | "Sparkles" | "TrendingUp" | "HeartHandshake";
  badge: string;
}

export interface MilestoneItem {
  year: string;
  period: string;
  title: string;
  tagline: string;
  description: string;
  achievements: string[];
  image: string;
  badge: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  schedule: string;
  output: string;
  iconName: "Trophy" | "BookOpen" | "Cpu" | "Network" | "Share2";
}

export interface MissionItem {
  number: string;
  title: string;
  tagline: string;
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

export interface AboutContentData {
  identity: {
    name: string;
    fullName: string;
    university: string;
    location: string;
    foundedYear: string;
    tagline: string;
    heroHeadline: string;
    heroSubtitle: string;
    overviewParagraphs: string[];
    stats: {
      label: string;
      value: string;
      description: string;
    }[];
  };
  history: {
    title: string;
    subtitle: string;
    originStory: string[];
    turningPoint: string;
  };
  vision: {
    statement: string;
    elaboration: string[];
    pillars: {
      title: string;
      description: string;
    }[];
  };
  missions: MissionItem[];
  coreValues: CoreValueItem[];
  activities: ActivityItem[];
  milestones: MilestoneItem[];
  principles: PrincipleItem[];
  cta: {
    title: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
  };
}

export const ABOUT_DATA: AboutContentData = {
  identity: {
    name: "UVICS",
    fullName: "Unklab Virtue In Computer Science",
    university: "Universitas Klabat (UNKLAB)",
    location: "Airmadidi, Minahasa Utara, Sulawesi Utara",
    foundedYear: "2021",
    tagline: "Empowering Tech Talents, Fostering Innovation, Competing Globally",
    heroHeadline: "Membina Talenta Teknologi, Mengukir Prestasi, Berakar dalam Kebajikan",
    heroSubtitle:
      "UVICS adalah wadah kolaborasi komputasi dan teknologi bagi mahasiswa berprestasi Universitas Klabat untuk mengasah kompetensi, membangun riset terapan, dan bersaing di panggung nasional serta global.",
    overviewParagraphs: [
      "Unklab Virtue In Computer Science (UVICS) berdiri sebagai katalisator potensi mahasiswa Universitas Klabat yang memiliki gairah mendalam di bidang rekayasa perangkat lunak, kecerdasan buatan, keamanan siber, dan desain sistem digital.",
      "Kami menyatukan talenta dari berbagai program studi dalam satu lingkungan yang memadukan keunggulan teknis, etika Kristiani yang berintegritas, serta mentalitas juara dalam menghadapi kompetisi sains dan teknologi terkemuka di tanah air.",
      "Melalui program pembinaan terstruktur, riset terarah, dan mentoring intensif, UVICS telah membuktikan eksistensinya dengan puluhan pencapaian di kompetisi bergengsi seperti GEMASTIK, Pagelaran Mahasiswa Nasional, Hackathon, serta proyek digital yang berdampak nyata.",
    ],
    stats: [
      { label: "Tahun Berdiri", value: "2021", description: "Perjalanan inovasi berkelanjutan" },
      { label: "Piala & Penghargaan", value: "24+", description: "Prestasi tingkat nasional & regional" },
      { label: "Anggota & Alumni", value: "120+", description: "Talenta aktif dan alumni berkarir" },
      { label: "Proyek Terapan", value: "18+", description: "Solusi digital untuk kampus & publik" },
    ],
  },
  history: {
    title: "Perjalanan Terbentuknya UVICS",
    subtitle: "Dari Inisiatif Mahasiswa Menjadi Pusat Keunggulan Komputasi Kampus",
    originStory: [
      "Pada awal tahun 2021, sekelompok mahasiswa dan mentor di Fakultas Ilmu Komputer Universitas Klabat melihat adanya kebutuhan wadah akselerasi terpadu bagi mahasiswa yang ingin melangkah lebih jauh dari kurikulum kelas reguler.",
      "Tantangan kompetisi nasional seperti GEMASTIK dan ICPC menuntut kecepatan iterasi, pemahaman algoritma lanjutan, serta kerja sama tim lintas keahlian. Berawal dari kelompok belajar kecil yang berlatih hingga larut malam di laboratorium kampus, nama UVICS diresmikan dengan membawa filosofi 'Virtue' (kebajikan) sebagai landasan moral setiap karya cipta.",
      "Seiring waktu, UVICS berkembang menjadi organisasi mandiri dengan struktur kepengurusan profesional, departemen khusus yang fokus pada kompetisi, publikasi, riset internal, serta bimbingan intensif bagi delegasi kampus.",
    ],
    turningPoint:
      "Kemenangan pertama di kompetisi nasional pada tahun 2022 menjadi titik balik krusial yang mengukuhkan posisi UVICS sebagai garda terdepan delegasi teknologi Universitas Klabat.",
  },
  vision: {
    statement:
      "Menjadi pusat keunggulan talenta teknologi dan komputasi mahasiswa di Indonesia yang berdaya saing global, berkarakter luhur, dan menghasilkan inovasi digital berdampak nyata bagi kemajuan masyarakat.",
    elaboration: [
      "Kami memandang teknologi bukan hanya sebagai instrumen teknis semata, melainkan sarana pengabdian untuk memecahkan persoalan riil kehidupan dengan berlandaskan moral dan etika yang teguh.",
      "Visi ini diterjemahkan ke dalam kurikulum internal yang menantang anggota untuk melampaui batas kemampuan teoritis, berani bereksperimen dengan teknologi mutakhir, dan berkompetisi secara sportif di panggung tertinggi.",
    ],
    pillars: [
      {
        title: "Competitive Rigor",
        description: "Standar teknis tinggi dan disiplin latihan intensif untuk mencetak delegasi berdaya saing juara.",
      },
      {
        title: "Moral Integrity & Virtue",
        description: "Menjunjung integritas akademik, kejujuran intelektual, dan etika Kristiani dalam setiap pencapaian.",
      },
      {
        title: "Impactful Engineering",
        description: "Mengarahkan ide dan riset pada solusi perangkat lunak terapan yang nyata dirasakan manfaatnya.",
      },
      {
        title: "Inclusive Mentorship",
        description: "Ekosistem saling mengasah, berbagi ilmu tanpa sekat, dan membimbing anggota baru menuju potensi puncaknya.",
      },
    ],
  },
  missions: [
    {
      number: "01",
      title: "Akselerasi Delegasi Kompetisi Nasional & Internasional",
      tagline: "Mempersiapkan Mentalitas dan Keunggulan Teknis Juara",
      description:
        "Menyelenggarakan proses kurasi bakat, simulasi kompetisi, bimbingan intensif berkala, dan pendampingan mentor untuk mengantarkan mahasiswa Universitas Klabat meraih podium tertinggi pada ajang sains dan teknologi bergengsi.",
      points: [
        "Simulasi berkala setara standar GEMASTIK, ICPC, dan LIDM",
        "Pendampingan langsung oleh alumni pemenang lomba dan dosen pembimbing",
        "Penyediaan bank soal, kajian studi kasus, dan workshop algoritma tingkat lanjut",
      ],
      iconName: "Target",
    },
    {
      number: "02",
      title: "Inkubasi Produk Digital dan Rekayasa Terapan",
      tagline: "Dari Ide Konseptual Menjadi Perangkat Lunak Berdaya Guna",
      description:
        "Memfasilitasi anggota dalam merancang, mengembangkan, dan meluncurkan produk digital yang dapat diuji coba oleh masyarakat kampus maupun publik luas sebagai portofolio engineering berstandar industri.",
      points: [
        "Kolaborasi tim lintas divisi (Software Engineer, UI/UX, QA, dan Project Manager)",
        "Penerapan teknologi modern (Next.js, Tailwind, TypeScript, Supabase, Cloud)",
        "Penyelarasan arsitektur sistem dengan best-practice clean code dan keamanan data",
      ],
      iconName: "Cpu",
    },
    {
      number: "03",
      title: "Budaya Belajar Berkelanjutan dan Transfer Pengetahuan",
      tagline: "Ekosistem Kolaboratif Tanpa Sekat Angkatan",
      description:
        "Menyelenggarakan lokakarya teknologi berkala, sesi 'Tech Talk', peer-mentoring mingguan, serta dokumentasi pengetahuan yang dapat diakses secara berkesinambungan oleh generasi kepengurusan berikutnya.",
      points: [
        "Internal workshops dwi-mingguan yang membahas topik mutakhir",
        "Program 'Buddy Mentoring' untuk anggota baru agar cepat beradaptasi",
        "Repositori riset internal dan dokumentasi proyek yang terbuka",
      ],
      iconName: "GraduationCap",
    },
    {
      number: "04",
      title: "Penguatan Karakter, Integritas, dan Etika Kebajikan",
      tagline: "Menempatkan Virtue sebagai Kompas Moral Setiap Karya",
      description:
        "Menanamkan nilai-nilai kejujuran, sportivitas, kerendahan hati, dan komitmen pelayanan Kristiani dalam setiap aktivitas kepengurusan, perlombaan, maupun karya rekayasa komputasi.",
      points: [
        "Penerapan kode etik ketat terhadap orisinalitas karya dan anti-plagiarisme",
        "Refleksi berkala dan persekutuan doa sebagai bagian integral kehidupan berorganisasi",
        "Komitmen melayani almamater Universitas Klabat dengan integritas tanpa kompromi",
      ],
      iconName: "Scale",
    },
    {
      number: "05",
      title: "Kemitraan Strategis dengan Industri dan Komunitas",
      tagline: "Menghubungkan Kampus dengan Ekosistem Teknologi Global",
      description:
        "Membangun hubungan kolaboratif dengan perusahaan teknologi, startup, komunitas open-source, dan jaringan alumni untuk membuka peluang magang, karier, dan pembinaan industri.",
      points: [
        "Kunjungan industri dan sesi sharing eksklusif bersama praktisi",
        "Kolaborasi acara bersama komunitas developer regional Sulawesi Utara",
        "Jejaring rujukan karier terpercaya bagi alumni yang telah lulus",
      ],
      iconName: "Network",
    },
  ],
  coreValues: [
    {
      id: "val-integrity",
      title: "Virtue & Integrity",
      tagline: "Kebajikan & Integritas",
      description:
        "Kejujuran intelektual dan etika adalah fondasi mutlak. Setiap baris kode, penelitian, dan capaian kami harus mencerminkan nilai kejujuran yang tidak goyah.",
      iconName: "Shield",
      badge: "Nilai Utama",
    },
    {
      id: "val-excellence",
      title: "Competitive Rigor",
      tagline: "Keunggulan & Daya Saing",
      description:
        "Kami menolak kepuasan instan. Semangat untuk terus melatih diri dan menetapkan standar tinggi menjadi motor penggerak setiap delegasi juara.",
      iconName: "Trophy",
      badge: "Pondasi Juara",
    },
    {
      id: "val-collaboration",
      title: "Synergy in Diversity",
      tagline: "Kolaborasi & Kebersamaan",
      description:
        "Karya terbaik lahir ketika developer, designer, dan problem solver bersatu dengan empati dan saling melengkapi kekuatan masing-masing.",
      iconName: "Users",
      badge: "Kerja Tim",
    },
    {
      id: "val-innovation",
      title: "Fearless Innovation",
      tagline: "Inovasi & Eksplorasi",
      description:
        "Keberanian menguji ide-ide baru dan merangkul kegagalan sebagai bahan bakar riset menuju penemuan terobosan teknologi terkini.",
      iconName: "Sparkles",
      badge: "Daya Cipta",
    },
    {
      id: "val-growth",
      title: "Continuous Growth",
      tagline: "Pertumbuhan Berkelanjutan",
      description:
        "Proses belajar tidak pernah usai. Kami berkomitmen untuk saling mengangkat, membimbing adik tingkat, dan terus berkembang bersama.",
      iconName: "TrendingUp",
      badge: "Pembinaan",
    },
    {
      id: "val-impact",
      title: "Purposeful Impact",
      tagline: "Karya Berdampak Nyata",
      description:
        "Teknologi yang kami bangun diarahkan untuk memuliakan Tuhan dan memberi kemudahan nyata bagi sesama serta lingkungan sekitar.",
      iconName: "HeartHandshake",
      badge: "Pengabdian",
    },
  ],
  activities: [
    {
      id: "act-mentoring",
      title: "Competition Mentoring & Intensive Prep",
      category: "Kompetisi",
      description:
        "Pendampingan terarah dari mentor berpengalaman dan alumni juara untuk mematangkan konsep proposal, algoritma pemecahan masalah, prototipe, dan pitching.",
      schedule: "Mingguan & Menjelang Lomba",
      output: "Delegasi Tangguh & Juara Nasional",
      iconName: "Trophy",
    },
    {
      id: "act-workshops",
      title: "Tech Workshops & Hands-on Lab",
      category: "Pelatihan",
      description:
        "Sesi praktis mengupas framework web modern, distributed systems, arsitektur cloud, dan machine learning praktis yang relevan dengan standar industri.",
      schedule: "Dwi-Mingguan",
      output: "Penguasaan Tech Stack Modern",
      iconName: "BookOpen",
    },
    {
      id: "act-incubation",
      title: "Software Incubation & Internal Hackathons",
      category: "Inovasi",
      description:
        "Ajang kolaborasi intensif merancang perangkat lunak dari awal hingga siap demo dalam hitungan hari untuk melatih kecepatan eksekusi dan komunikasi tim.",
      schedule: "Semesteran",
      output: "Prototipe Produk Siap Rilis",
      iconName: "Cpu",
    },
    {
      id: "act-sharing",
      title: "Knowledge Sharing & Tech Talks",
      category: "Komunitas",
      description:
        "Webinar dan diskusi terbuka bersama pakar industri, alumni yang bekerja di unicorn/multinasional, serta sesi diseminasi hasil lomba bagi publik.",
      schedule: "Bulanan",
      output: "Wawasan Industri Terkini",
      iconName: "Share2",
    },
  ],
  milestones: [
    {
      year: "2021",
      period: "Chapter I: Genesis",
      title: "Pondasi Awal & Pembentukan Komunitas",
      tagline: "Lahirnya Komunitas Inovator Muda UNKLAB",
      description:
        "Didirikan oleh 12 mahasiswa perintis di Fakultas Ilmu Komputer yang berkomitmen menciptakan wadah latihan algoritma dan persiapan kompetisi terstruktur.",
      achievements: [
        "Inisiasi kelompok belajar intensif algoritma & pemrograman",
        "Penyusunan blueprint kurikulum internal angkatan pertama",
        "Partisipasi perdana delegasi pada hackathon regional",
      ],
      image: "/images/img/foto-1.webp",
      badge: "Pendirian",
    },
    {
      year: "2022",
      period: "Chapter II: Trailblazers",
      title: "Debut Nasional & Prestasi Pertama",
      tagline: "Menembus Panggung Nasional GEMASTIK",
      description:
        "Tahun bersejarah di mana delegasi UVICS berhasil menembus babak finalis nasional GEMASTIK dan meraih juara di berbagai kompetisi inovasi perangkat lunak.",
      achievements: [
        "Finalis Nasional GEMASTIK Divisi Pengembangan Perangkat Lunak",
        "Juara 1 Hackathon Teknologi Kampus Regional",
        "Perekrutan terbuka Batch 2022 dengan peminat meningkat 300%",
      ],
      image: "/images/img/foto-2.webp",
      badge: "Pencapaian Pertama",
    },
    {
      year: "2023",
      period: "Chapter III: Innovators",
      title: "Ekspansi Divisi & Rekor Juara",
      tagline: "Pertumbuhan Pesat Menjangkau Lintas Fakultas",
      description:
        "Formalisasi struktur departemen (Web Dev, Internal Dev, Editor, Competition Handler, PR) dan perolehan 15+ piala kompetisi sepanjang tahun.",
      achievements: [
        "15+ Penghargaan Kompetisi Nasional & Regional",
        "Peluncuran 8 prototipe sistem terapan kampus",
        "Penyelenggaraan workshop teknologi dengan 250+ partisipan",
      ],
      image: "/images/img/foto-10.webp",
      badge: "Tahun Ekspansi",
    },
    {
      year: "2024",
      period: "Chapter IV: Vanguard",
      title: "Penguatan Riset AI & Kemitraan Eksternal",
      tagline: "Mengadopsi AI, Cloud, dan Kolaborasi Industri",
      description:
        "Integrasi fokus baru pada artificial intelligence, cloud architecture, dan pembentukan jejaring kemitraan dengan alumni industri teknologi ternama.",
      achievements: [
        "Juara 2 Nasional Kategori Data Mining & AI Solution",
        "Kemitraan strategis dengan beberapa komunitas developer",
        "Inkubasi portal web resmi dan sistem organisasi terpadu",
      ],
      image: "/images/img/foto-14.webp",
      badge: "Akselerasi AI",
    },
    {
      year: "2025/2026",
      period: "Chapter V: Sinergi Virtu",
      title: "Era Baru: Platform Terpadu & Standar Global",
      tagline: "Menuju Reputasi Internasional yang Berkelanjutan",
      description:
        "Di bawah Kabinet Sinergi Virtu, UVICS memantapkan tata kelola organisasi modern, peluncuran web platform terintegrasi, dan persiapan delegasi internasional.",
      achievements: [
        "Pembangunan UVICS Digital Platform (CMS, Registrasi, Direktori)",
        "Target ekspansi delegasi kompetisi ICPC Asia Regional",
        "Ekosistem inkubasi proyek berkelanjutan berbasis open-source",
      ],
      image: "/images/img/foto-16.webp",
      badge: "Masa Kini & Masa Depan",
    },
  ],
  principles: [
    {
      id: "pr-1",
      title: "Virtue Before Algorithm",
      description:
        "Keahlian teknis adalah alat, namun karakter kebajikan adalah kompas yang menentukan apakah alat tersebut membawa kebaikan atau kehancuran.",
      quote: "Bukan hanya menjadi programmer yang mahir, tetapi menjadi insan komputasi yang berakhlak mulia.",
    },
    {
      id: "pr-2",
      title: "Relentless Preparation",
      description:
        "Kemenangan di atas panggung adalah hasil dari ratusan jam pemecahan masalah dalam hening, iterasi tanpa henti, dan kedisiplinan diri.",
      quote: "Keberuntungan dalam kompetisi hanyalah ketika persiapan matang bertemu dengan peluang yang terbuka.",
    },
    {
      id: "pr-3",
      title: "Servant Leadership in Tech",
      description:
        "Semakin tinggi ilmu dan kemampuan teknis yang diraih, semakin besar tanggung jawab kami untuk melayani kampus dan masyarakat.",
      quote: "Karya terbesar kami adalah karya yang meringankan beban orang lain.",
    },
  ],
  cta: {
    title: "Siap Menjadi Bagian dari Perjalanan Juara UVICS?",
    description:
      "Temukan potensi terbaikmu dalam rekayasa komputasi, asah mentalitas juara, dan bergabunglah bersama komunitas mahasiswa paling berdedikasi di Universitas Klabat.",
    primaryBtnText: "Daftar Anggota Baru",
    primaryBtnLink: "/join",
    secondaryBtnText: "Lihat Departemen Kami",
    secondaryBtnLink: "/departments",
  },
};
