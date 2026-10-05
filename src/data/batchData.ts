export interface BatchMember {
  id: string;
  name: string;
  role: string;
  specialization: "AI/ML" | "Fullstack" | "Mobile" | "UI/UX" | "Cloud & DevOps" | "Cybersecurity";
  batchYear: string;
  image: string;
  quote: string;
  achievements: string[];
  skills: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  isLead?: boolean;
}

export interface BatchInfo {
  year: string;
  codeName: string;
  title: string;
  tagline: string;
  description: string;
  lead: string;
  totalMembers: number;
  trophiesCount: number;
  projectsBuilt: number;
  highlightImage: string;
  milestones: {
    title: string;
    event: string;
    award: string;
    year: string;
  }[];
  specializations: {
    name: string;
    percentage: number;
    color: string;
  }[];
}

export const BATCH_INFO_DATA: Record<string, BatchInfo> = {
  "2024": {
    year: "2024",
    codeName: "Vanguard",
    title: "Batch 2024: The Vanguard Generation",
    tagline: "Bridging Artificial Intelligence and Scalable Distributed Systems",
    description: "Generasi talenta muda UVICS yang memfokuskan riset dan karya pada akselerasi teknologi AI generatif, arsitektur microservices, dan kompetisi open innovation nasional.",
    lead: "Jonathan R. Rumagit",
    totalMembers: 48,
    trophiesCount: 16,
    projectsBuilt: 24,
    highlightImage: "/images/img/foto-1.webp",
    milestones: [
      {
        title: "Juara 1 National AI Hackathon 2024",
        event: "Indonesia Tech Summit 2024",
        award: "1st Place & Best Innovation",
        year: "2024"
      },
      {
        title: "Finalis GEMASTIK XVII Bidang Software Development",
        event: "Puspresnas Kemdikbudristek",
        award: "Top 5 Finalist",
        year: "2024"
      },
      {
        title: "Best Open Source Contributor Community",
        event: "DevFest Manado 2024",
        award: "Community Excellence Award",
        year: "2024"
      }
    ],
    specializations: [
      { name: "Fullstack Engineering", percentage: 40, color: "#0230a7" },
      { name: "AI / Machine Learning", percentage: 35, color: "#0066ff" },
      { name: "UI/UX & Product", percentage: 15, color: "#ffd000" },
      { name: "Cyber & Cloud", percentage: 10, color: "#16a34a" }
    ]
  },
  "2023": {
    year: "2023",
    codeName: "Innovators",
    title: "Batch 2023: The Innovators",
    tagline: "Engineering Impactful Solutions for Enterprise and Community",
    description: "Generasi pencetak rekor kompetisi berturut-turut di ajang nasional. Dikenal dengan dedikasi riset mendalam di bidang web performa tinggi dan mobile native ecosystem.",
    lead: "Clarissa M. Pangkey",
    totalMembers: 42,
    trophiesCount: 22,
    projectsBuilt: 31,
    highlightImage: "/images/img/foto-10.webp",
    milestones: [
      {
        title: "Juara 2 Hackathon Merdeka 2023",
        event: "Kemkominfo RI",
        award: "2nd Runner Up",
        year: "2023"
      },
      {
        title: "Juara 1 UI/UX Design Competition Klabat Tech Fair",
        event: "UNKLAB Annual Event",
        award: "1st Winner",
        year: "2023"
      },
      {
        title: "Medali Perunggu Competitive Programming Regional",
        event: "ICPC Asia Regional",
        award: "Bronze Medal",
        year: "2023"
      }
    ],
    specializations: [
      { name: "Fullstack Engineering", percentage: 45, color: "#0230a7" },
      { name: "Mobile Development", percentage: 25, color: "#0066ff" },
      { name: "UI/UX & Product", percentage: 20, color: "#ffd000" },
      { name: "Data Science", percentage: 10, color: "#16a34a" }
    ]
  },
  "2022": {
    year: "2022",
    codeName: "Trailblazers",
    title: "Batch 2022: The Trailblazers",
    tagline: "Setting The Standards of Excellence and Technical Rigor",
    description: "Angkatan yang meletakkan standard kurikulum kompetisi UVICS modern. Sebagian besar alumni batch ini kini bekerja di tech-unicorns dan research labs terkemuka.",
    lead: "Kevin A. Waworuntu",
    totalMembers: 36,
    trophiesCount: 19,
    projectsBuilt: 28,
    highlightImage: "/images/img/foto-14.webp",
    milestones: [
      {
        title: "Juara 1 Web Application Challenge 2022",
        event: "National IT League",
        award: "Gold Champion",
        year: "2022"
      },
      {
        title: "Top 3 Imagine Cup Southeast Asia",
        event: "Microsoft Student Summit",
        award: "Regional Top 3",
        year: "2022"
      }
    ],
    specializations: [
      { name: "Fullstack & Cloud", percentage: 50, color: "#0230a7" },
      { name: "Competitive Programming", percentage: 25, color: "#0066ff" },
      { name: "Cybersecurity", percentage: 15, color: "#dc2626" },
      { name: "Product Design", percentage: 10, color: "#ffd000" }
    ]
  },
  "2021": {
    year: "2021",
    codeName: "Genesis",
    title: "Batch 2021: The Genesis Founders",
    tagline: "Where Passion Ignited The Flame of Computer Science Virtues",
    description: "Pendiri komunitas UVICS. Memulai wadah belajar kompetisi mahasiswa Ilmu Komputer di Universitas Klabat hingga berkembang menjadi organisasi unggulan kampus.",
    lead: "Dave S. Tambuwun",
    totalMembers: 28,
    trophiesCount: 14,
    projectsBuilt: 20,
    highlightImage: "/images/img/foto-16.webp",
    milestones: [
      {
        title: "Pondasi Berdirinya UVICS",
        event: "Universitas Klabat",
        award: "Organization Charter",
        year: "2021"
      },
      {
        title: "Juara 1 Software Expo Regional Sulut",
        event: "Inkubator Bisnis Daerah",
        award: "First Winner",
        year: "2021"
      }
    ],
    specializations: [
      { name: "Software Engineering", percentage: 60, color: "#0230a7" },
      { name: "System Administration", percentage: 20, color: "#0066ff" },
      { name: "Graphic & UI Design", percentage: 20, color: "#ffd000" }
    ]
  }
};

export const BATCH_MEMBERS_DATA: BatchMember[] = [
  // 2024 Vanguard
  {
    id: "m-2024-1",
    name: "Jonathan R. Rumagit",
    role: "Lead Batch 2024 & AI Engineer",
    specialization: "AI/ML",
    batchYear: "2024",
    image: "/images/img/foto-1.webp",
    quote: "Code is not just logic, it is architecture for empowering humans.",
    achievements: ["Juara 1 National AI Hackathon 2024", "Dean's List FIK UNKLAB"],
    skills: ["Python", "PyTorch", "Next.js", "LangChain", "FastAPI"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    isLead: true
  },
  {
    id: "m-2024-2",
    name: "Grace E. Sondakh",
    role: "Vice Lead & Fullstack Architect",
    specialization: "Fullstack",
    batchYear: "2024",
    image: "/images/img/foto-2.webp",
    quote: "Clean abstractions today prevent catastrophic bugs tomorrow.",
    achievements: ["Finalis GEMASTIK XVII", "Certified Cloud Practitioner"],
    skills: ["TypeScript", "Next.js", "PostgreSQL", "Docker", "Go"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2024-3",
    name: "Michael V. Tumbelaka",
    role: "Head of UI/UX & Design Systems",
    specialization: "UI/UX",
    batchYear: "2024",
    image: "/images/img/foto-3.webp",
    quote: "Design with purpose, refine with empathy.",
    achievements: ["Best Design Award TechFair 2024", "Lead Designer UVICS UI Kit"],
    skills: ["Figma", "Design Tokens", "Tailwind CSS", "User Research", "Prototyping"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2024-4",
    name: "Bryan K. Lumempouw",
    role: "Machine Learning Researcher",
    specialization: "AI/ML",
    batchYear: "2024",
    image: "/images/img/foto-4.webp",
    quote: "Democratizing computer vision for agricultural surveillance.",
    achievements: ["Paper Published at IEEE Student Conf", "Kaggle Bronze Medalist"],
    skills: ["TensorFlow", "OpenCV", "Python", "Data Wrangling"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2024-5",
    name: "Jessica A. Mandagi",
    role: "Cloud & DevOps Specialist",
    specialization: "Cloud & DevOps",
    batchYear: "2024",
    image: "/images/img/foto-5.webp",
    quote: "Zero downtime is not a luxury, it's an engineering standard.",
    achievements: ["AWS Community Champion", "Runner-Up Cloud Olympiad"],
    skills: ["Kubernetes", "Terraform", "GitHub Actions", "AWS", "Grafana"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2024-6",
    name: "Samuel T. Paat",
    role: "Mobile App Engineer",
    specialization: "Mobile",
    batchYear: "2024",
    image: "/images/img/foto-7.webp",
    quote: "Responsive, offline-first apps designed for real people.",
    achievements: ["Published 3 Apps on Play Store", "Hackathon Top 10"],
    skills: ["Flutter", "Kotlin", "Dart", "Firebase", "State Management"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },

  // 2023 Innovators
  {
    id: "m-2023-1",
    name: "Clarissa M. Pangkey",
    role: "Lead Batch 2023 & Fullstack Specialist",
    specialization: "Fullstack",
    batchYear: "2023",
    image: "/images/img/foto-8.webp",
    quote: "Precision in execution turns wild ideas into reality.",
    achievements: ["Juara 2 Hackathon Merdeka 2023", "Ketua Himpunan FIK"],
    skills: ["React", "NestJS", "Tailwind CSS", "Redis", "Supabase"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    isLead: true
  },
  {
    id: "m-2023-2",
    name: "Gabriel P. Rantung",
    role: "Competitive Programming Lead",
    specialization: "Fullstack",
    batchYear: "2023",
    image: "/images/img/foto-9.webp",
    quote: "Algorithms teach us to solve problems under strict constraints.",
    achievements: ["ICPC Asia Bronze Medalist", "Codeforces Candidate Master"],
    skills: ["C++", "Algorithms", "Graph Theory", "Dynamic Programming"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2023-3",
    name: "Nathania L. Wowor",
    role: "Product Designer & UX Strategist",
    specialization: "UI/UX",
    batchYear: "2023",
    image: "/images/img/foto-10.webp",
    quote: "A great interface feels invisible when everything just works.",
    achievements: ["Juara 1 UI/UX Klabat Tech Fair", "Design Mentor UVICS"],
    skills: ["Figma", "Design Systems", "Usability Testing", "Wireframing"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2023-4",
    name: "Daniel H. Supit",
    role: "Mobile Application Developer",
    specialization: "Mobile",
    batchYear: "2023",
    image: "/images/img/foto-11.webp",
    quote: "Crafting fluid 120Hz experiences on iOS and Android.",
    achievements: ["Apple Developer Academy Alumni", "Top 5 Mobile Challenge"],
    skills: ["SwiftUI", "React Native", "Expo", "GraphQL"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2023-5",
    name: "Priscilla E. Lasut",
    role: "Data Analyst & NLP Specialist",
    specialization: "AI/ML",
    batchYear: "2023",
    image: "/images/img/foto-12.webp",
    quote: "Transforming raw noise into strategic business insights.",
    achievements: ["Best Paper Award Data Science Summit", "Kaggle Silver"],
    skills: ["Python", "Pandas", "Scikit-Learn", "Tableau", "SQL"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },

  // 2022 Trailblazers
  {
    id: "m-2022-1",
    name: "Kevin A. Waworuntu",
    role: "Lead Batch 2022 & Senior Engineer at Unicorn",
    specialization: "Fullstack",
    batchYear: "2022",
    image: "/images/img/foto-13.webp",
    quote: "Ship early, measure meticulously, iterate relentlessly.",
    achievements: ["Imagine Cup Regional Top 3", "Lulusan Terbaik FIK 2023"],
    skills: ["Go", "Kubernetes", "Kafka", "Distributed Systems"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    isLead: true
  },
  {
    id: "m-2022-2",
    name: "Amanda K. Polii",
    role: "Cybersecurity Analyst",
    specialization: "Cybersecurity",
    batchYear: "2022",
    image: "/images/img/foto-14.webp",
    quote: "Security is not an afterthought; it is built into the architecture.",
    achievements: ["CTF National Finalist", "Certified Ethical Hacker (CEH)"],
    skills: ["Penetration Testing", "Wireshark", "Linux Hardening", "Reverse Eng"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },
  {
    id: "m-2022-3",
    name: "Steven C. Mogot",
    role: "Backend Infrastructure Lead",
    specialization: "Cloud & DevOps",
    batchYear: "2022",
    image: "/images/img/foto15.webp",
    quote: "Building distributed systems that survive the unexpected.",
    achievements: ["National Web App Champion 2022", "Open Source Maintainer"],
    skills: ["Rust", "PostgreSQL", "Docker", "Prometheus", "Nginx"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  },

  // 2021 Genesis
  {
    id: "m-2021-1",
    name: "Dave S. Tambuwun",
    role: "Founding Lead Batch 2021 & Tech Founder",
    specialization: "Fullstack",
    batchYear: "2021",
    image: "/images/img/foto-16.webp",
    quote: "The best way to predict the future is to assemble the team that builds it.",
    achievements: ["Co-Founder UVICS Community", "CEO of Early-Stage Startup"],
    skills: ["System Architecture", "Leadership", "Fullstack", "Venture Building"],
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    isLead: true
  },
  {
    id: "m-2021-2",
    name: "Rachel T. Wantah",
    role: "Founding Designer & Brand Strategist",
    specialization: "UI/UX",
    batchYear: "2021",
    image: "/images/img/foto-17.webp",
    quote: "Every memorable community starts with an unshakeable identity.",
    achievements: ["Creator of UVICS Visual Identity", "Senior Product Designer"],
    skills: ["Brand Strategy", "Design Systems", "UI Design", "Visual Arts"],
    github: "https://github.com",
    linkedin: "https://linkedin.com"
  }
];
