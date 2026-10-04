import Image from "next/image";
import { Trophy, Sparkles, Users, Award } from "lucide-react";

export function CompetitionHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[460px] md:min-h-[520px] flex items-center justify-center">
      {/* 1. Gambar Latar Belakang UVICS dengan Overlay Gelap Transparan */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/img/foto-1.webp"
          alt="Anggota UVICS berkolaborasi di ajang kompetisi teknologi"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Background Gelap (Transparan agar gambar UVICS tetap terlihat jelas) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
      </div>

      {/* 2. Grid Kotak-Kotak (Hanya Setengah Bagian: dari Atas ke Bawah) */}
      <div
        className="absolute top-0 inset-x-0 h-1/2 pointer-events-none z-[1]
        bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)]
        bg-[size:4rem_4rem] sm:bg-[size:5rem_5rem]
        [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_0%,rgba(0,0,0,0.85)_40%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* 3. Konten Teks di Tengah */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6 py-20 md:py-24 w-full">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white shadow-sm mb-5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary/25 text-secondary">
            <Trophy className="w-3.5 h-3.5" />
          </span>
          <span>Ajang Prestasi & Kejuaraan Teknologi</span>
        </div>

        {/* Heading Utama */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight sm:leading-tight drop-shadow-md">
          Kompetisi <span className="text-secondary drop-shadow-[0_2px_14px_rgba(255,208,0,0.45)]">UVICS</span>
        </h1>

        {/* Deskripsi Subtitle */}
        <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-gray-100 leading-relaxed font-sans drop-shadow-sm">
          Temukan kurasi kompetisi teknologi bergengsi tingkat nasional, internasional, dan internal untuk menguji inovasi, mengasah kemampuan, serta mengharumkan nama Universitas Klabat.
        </p>

        {/* Mini Feature Badges */}
        <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs font-medium text-white">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            Tingkat Nasional & Global
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 shadow-sm">
            <Users className="w-3.5 h-3.5 text-accent" />
            Fasilitasi Tim & Kolaborasi
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 shadow-sm">
            <Award className="w-3.5 h-3.5 text-secondary" />
            Bimbingan Mentor UVICS
          </span>
        </div>
      </div>
    </section>
  );
}
