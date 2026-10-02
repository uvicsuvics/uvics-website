"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ABOUT_DATA } from "@/data/mock/about";
import { Eye, CheckCircle2 } from "lucide-react";

export default function VisionMissionPage() {
  const { vision, missions, principles, cta } = ABOUT_DATA;

  return (
    <div className="space-y-24 py-12">
      {/* Section 1: Hero */}
      <motion.section 
        className="relative max-w-6xl mx-auto px-6 text-center space-y-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } } }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary-50 text-primary text-xs font-semibold uppercase tracking-wider"
        >
          <span>Arsitektur Moral & Arah Organisasi</span>
        </motion.div>
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" } } }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 font-heading leading-tight"
        >
          Visi & Misi <span className="text-primary">UVICS</span>
        </motion.h1>
        <motion.p
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
        >
          Pedoman filosofis dan komitmen jangka panjang kami dalam mencetak insan komputasi berdaya saing global yang senantiasa mengakar pada kebajikan.
        </motion.p>
      </motion.section>

      {/* Section 2: Vision Detail */}
      <motion.section 
        className="max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.7, staggerChildren: 0.1 } }
        }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary transition-all duration-500 group-hover:w-3" />
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 rounded-lg bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Eye className="w-6 h-6" />
            </span>
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-gray-500">Pernyataan Resmi</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">Visi Kami</h2>
            </div>
          </div>
          <blockquote className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed italic border-l-4 border-secondary pl-6 mb-8">
            &ldquo;{vision.statement}&rdquo;
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            {vision.elaboration.map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-sm md:text-base">
                {para}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {vision.pillars.map((pillar, idx) => (
              <motion.div 
                key={idx} 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" } } }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-white transition-all shadow-sm"
              >
                <h4 className="font-semibold text-primary text-sm mb-1">{pillar.title}</h4>
                <p className="text-xs text-gray-600 leading-normal">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Section 3: Missions Detail */}
      <motion.section 
        className="max-w-6xl mx-auto px-6 space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-primary">Langkah Konkret</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">Lima Pilar Misi Organisasi</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Agenda terstruktur yang kami jalankan secara berkelanjutan di setiap masa kepengurusan.
          </p>
        </motion.div>
        <div className="space-y-6">
          {missions.map((mission, idx) => (
            <motion.div
              key={mission.number}
              variants={{ 
                hidden: { opacity: 0, x: idx % 2 === 0 ? -40 : 40 }, 
                visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.3 } } 
              }}
              whileHover={{ scale: 1.01, x: 5 }}
              className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 hover:shadow-lg transition-all hover:border-primary-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <span className="text-3xl md:text-4xl font-bold text-primary/40 font-mono tracking-tighter">
                  {mission.number}
                </span>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900 font-heading">{mission.title}</h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary">
                      {mission.tagline}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{mission.description}</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    {mission.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 4: Core Principles */}
      <motion.section 
        className="max-w-6xl mx-auto px-6 space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-primary">Prinsip & Nilai</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">Prinsip Penopang Kebajikan</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Fondasi moral yang menjaga setiap program kerja tetap bernilai dan bermakna.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {principles.map((pr) => (
            <motion.div 
              key={pr.id} 
              variants={{ hidden: { opacity: 0, y: 30, rotateX: 20 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 100 } } }}
              whileHover={{ scale: 1.03, y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              style={{ perspective: 1000 }}
              className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between hover:border-primary-300 transition-colors"
            >
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-gray-900 font-heading">{pr.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{pr.description}</p>
              </div>
              <blockquote className="mt-6 pt-4 border-t border-gray-100 text-xs italic text-primary font-medium">
                &ldquo;{pr.quote}&rdquo;
              </blockquote>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Section 5: Closing CTA */}
      <motion.section 
        className="max-w-6xl mx-auto px-6"
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      >
        <div className="bg-primary text-white rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          <h3 className="text-2xl md:text-3xl font-bold font-heading relative z-10">{cta.title}</h3>
          <p className="text-primary-100 max-w-2xl mx-auto text-sm md:text-base leading-relaxed relative z-10">
            {cta.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
            <Button variant="secondary" size="lg" href={cta.primaryBtnLink}>
              {cta.primaryBtnText}
            </Button>
            <Button variant="outline" size="lg" href="/about" className="text-white border-white hover:bg-white/10">
              Kembali ke Profil UVICS
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
