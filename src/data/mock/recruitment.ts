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
  headline: "Siap Menjadi Bagian dari Inovasi Teknologi UVICS?",
  subheadline:
    "Buka jalan menuju podium kompetisi nasional, riset berdampak, dan jaringan profesional komputasi terdepan di Universitas Klabat.",
  targetAudience: "Terbuka bagi mahasiswa aktif Fakultas Ilmu Komputer UNKLAB",
  deadlineText: "Pendaftaran ditutup pada 15 Oktober 2026",
  registrationUrl: "/join",
  guidebookUrl: "https://uvics.org/guidebook-recruitment-2026.pdf",
  benefits: [
    "Mentoring intensif persiapan kompetisi nasional (GEMASTIK, PKM, Hackathon)",
    "Akses laboratorium riset & kolaborasi proyek riil berbasis portofolio",
    "Jaringan alumni engineer di berbagai startup & tech corporate ternama",
    "Sertifikasi dan pengakuan resmi aktivitas kemahasiswaan FIK UNKLAB",
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
