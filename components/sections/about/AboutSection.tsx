import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Trophy, Users, ArrowRight } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full overflow-x-clip bg-white text-gray-900 scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Column: Text */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight font-heading">
            Unklab Virtue In{" "}
            <span className="text-primary">Computer Science</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            UVICS adalah platform pengembangan talenta mahasiswa yang menghimpun
            mahasiswa berprestasi dari seluruh program studi di <strong>Universitas Klabat</strong>.
            Tujuan utama kami adalah berkolaborasi, berinovasi, dan mempersiapkan
            talenta terbaik kampus untuk berkompetisi di berbagai ajang bergengsi
            skala <strong>Nasional</strong> maupun <strong>Internasional</strong>.
          </p>
          <ul className="space-y-4 text-gray-700 py-2">
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1 shrink-0">
                <Trophy size={20} />
              </span>
              <span className="text-sm sm:text-base">
                <strong>Mentalitas Juara:</strong> Pembinaan terstruktur dan intensif untuk
                mencetak prestasi di kompetisi teknologi nasional dan internasional.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3 mt-1 shrink-0">
                <Users size={20} />
              </span>
              <span className="text-sm sm:text-base">
                <strong>Kolaborasi Lintas Disiplin:</strong> Menyatukan ragam keahlian komputasi,
                desain, dan logika analitis guna menghasilkan solusi digital yang berdampak nyata.
              </span>
            </li>
          </ul>
          <div className="pt-2">
            <Button variant="primary" size="lg" href="/achievements" className="shadow-primary font-bold">
              <span>Lihat Prestasi Kami</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Right Column: Images */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-2.webp"
                alt="Uvics team collaboration"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-5.webp"
                alt="Uvics project"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="space-y-4">
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-1.webp"
                alt="Uvics meeting"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
              />
              <Image
                width={640}
                height={640}
                sizes="(min-width: 1024px) 25vw, 50vw"
                src="/images/img/foto-10.webp"
                alt="Uvics event"
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
          {/* Decorative blur */}
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-100 rounded-full blur-[100px] opacity-50" />
        </div>
      </div>
    </section>
  );
}
