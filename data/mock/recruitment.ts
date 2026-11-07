export interface RecruitmentInfo {
  status: "open" | "closed";
  batchName: string;
  headline: string;
  subheadline: string;
  targetAudience: string;
  deadlineText: string;
  registrationUrl: string;
  guidebookUrl: string;
  benefits: string[];
  steps: {
    number: string;
    title: string;
    description: string;
  }[];
}

export const CURRENT_RECRUITMENT: RecruitmentInfo = {
  status: "open",
  batchName: "Batch 2026 / 2027",
  headline: "Be an Achiever, Carve Your Future",
  subheadline:
    "Bergabung dengan mahasiswa dari berbagai jurusan untuk bertumbuh, berkolaborasi, dan berprestasi bersama di perlombaan.",
  targetAudience: "Terbuka bagi mahasiswa Universitas Klabat dari berbagai tingkat dan jurusan",
  deadlineText: "Pendaftaran ditutup pada 15 Oktober 2026",
  registrationUrl: "/join",
  guidebookUrl: "https://uvics.org/guidebook-recruitment-2026.pdf",
  // Hak anggota menurut Achievers Guidebook 2026 (spesifikasi halaman Join, PRD §9.1).
  benefits: [
    "Sertifikat keanggotaan setelah menyelesaikan minimal satu proyek bersama UVICS",
    "Prestasi lomba dapat diunggah di Instagram UVICS sebagai portofolio",
    "Pendampingan lomba (Mentor Community) dan pencarian lomba (Competition Finder)",
    "Bebas memilih ikut lomba atau tidak, dan tidak ada kegiatan organisasi pada masa ujian",
  ],
  steps: [
    {
      number: "01",
      title: "Pendaftaran Daring",
      description: "Isi formulir biodata dan pilih departemen minat peminatan Anda.",
    },
    {
      number: "02",
      title: "Technical & Design Assessment",
      description: "Tantangan mini studi kasus sesuai divisi pilihan untuk memetakan bakat.",
    },
    {
      number: "03",
      title: "Wawancara & Keselarasan Visi",
      description: "Diskusi santai bersama BPH mengenai komitmen dan aspirasi Anda.",
    },
    {
      number: "04",
      title: "Welcoming & Boot Camp",
      description: "Inisiasi resmi anggota baru ke dalam siklus riset dan proyek UVICS.",
    },
  ],
};
