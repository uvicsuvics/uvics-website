"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { ABOUT_DATA } from "@/data/mock/about";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Eye,
  Target,
  Zap,
} from "lucide-react";

export default function AboutPage() {
  const {
    identity,
    history,
    vision,
    missions,
    coreValues,
    activities,
    milestones,
    cta,
  } = ABOUT_DATA;

  return (
    <div className="space-y-24 py-12">
      {/* 1. Hero Section - Bento Matrix Header */}
      <motion.section 
        className="max-w-6xl mx-auto px-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div 
            variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.2, duration: 0.8 } } }}
            whileHover={{ scale: 1.02, rotate: -0.5 }}
            className="lg:col-span-8 bg-gray-900 text-white rounded-3xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shadow-xl"
          >
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-secondary text-xs font-semibold backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5" />
                <span>Teknologi, Prestasi & Karakter</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold font-heading leading-tight tracking-tight">
                Engineering with <span className="text-secondary">Virtue</span>.
              </h1>
              <p className="text-gray-300 text-base md:text-lg max-w-xl leading-relaxed">
                {identity.heroSubtitle}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button variant="primary" size="lg" href="/join">
                  Join The Squad
                </Button>
                <Button variant="outline" size="lg" href="/programs" className="text-white border-white/40 hover:bg-white/10">
                  Jelajahi Program
                </Button>
              </div>
            </div>
            {/* Ambient blur */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/40 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            <motion.div 
              variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.2, duration: 0.8 } } }}
              whileHover={{ scale: 1.05, rotate: 1 }}
              className="bg-primary text-white rounded-3xl p-6 flex flex-col justify-between"
            >
              <span className="text-xs uppercase tracking-wider text-primary-200 font-semibold">Tahun Berdiri</span>
              <div>
                <span className="text-4xl font-extrabold font-heading block">{identity.foundedYear}</span>
                <span className="text-xs text-primary-100">Genesis Angkatan Pertama</span>
              </div>
            </motion.div>
            <motion.div 
              variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.2, duration: 0.8 } } }}
              whileHover={{ scale: 1.05, rotate: -1 }}
              className="bg-secondary text-gray-900 rounded-3xl p-6 flex flex-col justify-between"
            >
              <span className="text-xs uppercase tracking-wider text-gray-700 font-semibold">Pencapaian Nasional</span>
              <div>
                <span className="text-4xl font-extrabold font-heading block">24+ Piala</span>
                <span className="text-xs text-gray-700 font-medium">GEMASTIK, ICPC, Hackathon</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2. Overview & Live Stats Bento */}
      <motion.section 
        className="max-w-6xl mx-auto px-6 space-y-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {identity.stats.map((st, sIdx) => (
            <motion.div 
              key={sIdx} 
              variants={{ 
                hidden: { opacity: 0, scale: 0.8, rotate: -5 }, 
                visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 15 } } 
              }}
              whileHover={{ scale: 1.05, y: -5, rotate: sIdx % 2 === 0 ? 2 : -2, boxShadow: "0 10px 25px -5px rgba(2, 48, 167, 0.15)" }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm transition-all hover:border-primary-300"
            >
              <span className="text-3xl font-extrabold text-primary font-heading block">{st.value}</span>
              <h3 className="font-bold text-gray-900 text-sm mt-1">{st.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{st.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={{ hidden: { opacity: 0, y: 30, filter: "blur(10px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7 } } }}
          className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm space-y-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          <span className="text-xs uppercase font-semibold tracking-wider text-accent">Manifesto Organisasi</span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading">
            Wadah Unggulan Mahasiswa Komputasi Universitas Klabat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-sm text-gray-600 leading-relaxed">
            {identity.overviewParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* 3. History Timeline Bento */}
      <motion.section 
        className="max-w-6xl mx-auto px-6 space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-accent">Perjalanan Kami</span>
            <h2 className="text-3xl font-bold text-gray-900 font-heading">{history.title}</h2>
          </div>
          <p className="text-sm text-gray-500 max-w-md">{history.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white border border-gray-200 rounded-3xl p-8 shadow-sm group hover:border-primary-200 transition-colors overflow-hidden relative">
          <div className="absolute -left-20 top-20 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-700" />
          <motion.div 
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6 } } }}
            className="lg:col-span-7 space-y-4 text-gray-700 text-sm md:text-base leading-relaxed relative z-10"
          >
            {history.originStory.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-start gap-3">
              <Trophy className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <span className="text-xs md:text-sm font-medium text-gray-800">{history.turningPoint}</span>
            </div>
          </motion.div>
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.9, rotate: 2 }, visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", duration: 0.8 } } }}
            whileHover={{ scale: 1.02, rotate: -1 }}
            className="lg:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden shadow-md"
          >
            <Image
              src="/images/img/foto-10.webp"
              alt="Perjalanan dan sejarah tim UVICS"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* 4 & 5. Vision & Mission Preview Bento */}
      <motion.section 
        className="max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } } }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-primary text-white rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-lg overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-secondary text-xs font-semibold">
                <Eye className="w-3.5 h-3.5" /> Visi UVICS
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-heading leading-snug">
                &ldquo;{vision.statement}&rdquo;
              </h2>
            </div>
            <Link
              href="/vision-mission"
              className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
            >
              Baca Visi & Misi Lengkap <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } } }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-lg group hover:border-primary-300 transition-colors"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary text-xs font-semibold">
                <Target className="w-3.5 h-3.5" /> Misi Inti
              </span>
              <ul className="space-y-2.5">
                {missions.slice(0, 3).map((m) => (
                  <li key={m.number} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-700">
                    <span className="font-mono font-bold text-primary">{m.number}</span>
                    <span className="font-medium">{m.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/vision-mission"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Lihat 5 Pilar Aksi <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* 6. Core Values - Bento Matrix 6 Cards */}
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
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-accent">DNA & Karakter</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">6 Pilar Nilai Unggulan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreValues.map((v, i) => (
            <motion.div
              key={v.id}
              variants={{ 
                hidden: { opacity: 0, y: 20, rotateX: -15 }, 
                visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 100 } } 
              }}
              whileHover={{ 
                scale: 1.03, 
                y: -5,
                boxShadow: "0 20px 25px -5px rgba(2, 48, 167, 0.1), 0 8px 10px -6px rgba(2, 48, 167, 0.1)"
              }}
              className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                i === 0
                  ? "bg-gradient-to-br from-primary-50 to-white border-primary-200 md:col-span-2 lg:col-span-1"
                  : "bg-white border-gray-200 hover:border-primary-300"
              }`}
              style={{ perspective: 1000 }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-white shadow-xs text-primary">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {v.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">{v.title}</h3>
                <span className="text-xs font-semibold text-primary block">{v.tagline}</span>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{v.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 7. What We Do Bento */}
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
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-accent">Aktivitas & Output</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">Program Eksekusi Nyata</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((act, i) => (
            <motion.div
              key={act.id}
              variants={{ 
                hidden: { opacity: 0, x: i % 2 === 0 ? -30 : 30 }, 
                visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.3 } } 
              }}
              whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
              className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-4 hover:border-primary-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary">
                    {act.category}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" /> {act.schedule}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-heading">{act.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{act.description}</p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Output Utama:</span>
                <span className="font-semibold text-primary">{act.output}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 8. Milestones Bento Cards */}
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
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-semibold tracking-wider text-accent">Perkembangan Bersejarah</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">Linimasa Evolusi UVICS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((ms, idx) => (
            <motion.div
              key={idx}
              variants={{ 
                hidden: { opacity: 0, y: 40, scale: 0.9 }, 
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14 } } 
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group"
            >
              <div className="relative aspect-16/9 w-full overflow-hidden">
                <Image src={ms.image} alt={ms.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-xs font-bold z-10">
                  {ms.year}
                </div>
              </div>
              <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-accent block mb-1">{ms.period}</span>
                  <h3 className="text-lg font-bold text-gray-900 font-heading mb-1">{ms.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{ms.description}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 space-y-1">
                  {ms.achievements.slice(0, 2).map((ach, aIdx) => (
                    <div key={aIdx} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      <span className="line-clamp-1">{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 9. CTA Section */}
      <motion.section 
        className="max-w-6xl mx-auto px-6"
        initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
      >
        <div className="bg-gradient-to-r from-primary-900 via-primary to-accent text-white rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-bold font-heading">{cta.title}</h2>
          <p className="text-primary-100 max-w-2xl mx-auto text-base leading-relaxed">{cta.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button variant="secondary" size="lg" href={cta.primaryBtnLink}>
              {cta.primaryBtnText}
            </Button>
            <Button variant="outline" size="lg" href={cta.secondaryBtnLink} className="text-white border-white hover:bg-white/10">
              {cta.secondaryBtnText}
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
