import Image from "next/image";

export function CompetitionHero() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[380px] md:min-h-[440px] flex items-center justify-center">
      {/* 1. Gambar Latar Belakang UVICS dengan Overlay Gelap Transparan */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/img/foto-1.webp"
          alt="Anggota UVICS berkolaborasi dalam persiapan kompetisi dan delegasi mahasiswa"
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
        {/* Heading Utama */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight sm:leading-tight drop-shadow-md">
          Kompetisi & Kejuaraan <span className="text-blue-400 drop-shadow-[0_2px_16px_rgba(0,102,255,0.45)]">UVICS</span>
        </h1>

        {/* Deskripsi Subtitle yang Inklusif (Teknologi & Bisnis) */}
        <p className="mt-4 sm:mt-5 max-w-3xl text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-sans drop-shadow-sm">
          Wadah akselerasi talenta Universitas Klabat untuk menguji kapabilitas inovasi, membangun sinergi tim delegasi, dan menorehkan prestasi kompetitif pada berbagai ajang bereputasi nasional hingga internasional.
        </p>
      </div>
    </section>
  );
}
