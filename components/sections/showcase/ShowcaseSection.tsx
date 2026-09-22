import Image from "next/image";
import React from "react";
import { IconTrophy, IconStar } from "@tabler/icons-react";

export function ShowcaseSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            Hall of <span className="text-primary">Fame</span>
          </h2>
          <p className="text-lg text-gray-500">
            A glimpse into the milestones and victories achieved by our
            brilliant members across various disciplines.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Main Hero Card (Spans 2 cols, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden relative group">
            <Image
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              src="/images/img/foto-7.webp"
              alt="Main Achievement"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
              <div className="bg-primary text-white w-max px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-4">
                <IconTrophy size={16} /> 1st Place Winner
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                National Startup Pitch 2024
              </h3>
              <p className="text-gray-200 max-w-md">
                Secured top funding and recognition for building an AI-powered
                educational tool for rural areas.
              </p>
            </div>
          </div>

          {/* Secondary Card 1 */}
          <div className="rounded-[2rem] overflow-hidden relative group bg-gray-100">
            <Image
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              src="/images/img/foto-8.webp"
              alt="UI/UX Award"
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
              <p className="text-primary-100 text-sm font-bold mb-1">
                UI/UX Design
              </p>
              <h3 className="text-xl font-bold text-white">
                Best Design System
              </h3>
            </div>
          </div>

          {/* Text Card */}
          <div className="rounded-[2rem] bg-primary p-8 text-white flex flex-col justify-center relative overflow-hidden group">
            <IconStar className="absolute -right-4 -top-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
            <h3 className="text-4xl font-black mb-2">15+</h3>
            <p className="text-primary-100 text-lg font-medium">
              National Awards
            </p>
            <p className="mt-4 text-white/80 text-sm">
              Consistent excellence across multiple tech disciplines since our
              founding.
            </p>
          </div>

          {/* Secondary Card 2 (Bottom left under hero) */}
          <div className="rounded-[2rem] overflow-hidden relative group md:col-span-3 h-[200px]">
            <Image
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              src="/images/img/foto-9.webp"
              alt="Exhibition"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10">
              <p className="text-primary-100 text-sm font-bold mb-2">
                Annual Exhibition
              </p>
              <h3 className="text-2xl font-bold text-white">
                UVICS Tech Expo 2023
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
