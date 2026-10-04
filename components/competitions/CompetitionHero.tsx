import { Trophy } from 'lucide-react';

export function CompetitionHero() {
  return (
    <section className="bg-primary text-white">
      <div className="flex flex-col items-center gap-4 max-w-7xl mx-auto w-full px-6 md:px-8 py-16 md:py-20 text-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10">
          <Trophy className="w-7 h-7 text-secondary" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Kompetisi UVICS
        </h1>
        <p className="max-w-2xl text-base md:text-lg text-primary-100">
          Temukan berbagai lomba nasional, internasional, dan internal yang
          dapat diikuti oleh anggota UVICS untuk mengasah kemampuan dan
          mengharumkan nama Universitas Klabat.
        </p>
      </div>
    </section>
  );
}
