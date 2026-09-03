"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BATCH_INFO_DATA, BATCH_MEMBERS_DATA, BatchMember } from "@/data/batchData";
import { 
  Trophy, 
  Award, 
  Calendar, 
  Quote, 
  ChevronRight, 
  GraduationCap, 
  Briefcase, 
  Star, 
  Sparkles, 
  Users, 
  Code2, 
  ExternalLink,
  X,
  Compass,
  ArrowRight
} from "lucide-react";
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";

function BatchContent() {
  const searchParams = useSearchParams();
  const queryYear = searchParams.get("year");

  const [activeYear, setActiveYear] = useState<string>(
    queryYear && BATCH_INFO_DATA[queryYear] ? queryYear : "2024"
  );
  const [activeSpecialization, setActiveSpecialization] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<BatchMember | null>(null);

  // Sync state if query param changes
  useEffect(() => {
    if (queryYear && BATCH_INFO_DATA[queryYear]) {
      setActiveYear(queryYear);
      setActiveSpecialization("all");
    }
  }, [queryYear]);

  const batch = BATCH_INFO_DATA[activeYear] || BATCH_INFO_DATA["2024"];
  const allYearMembers = useMemo(() => {
    return BATCH_MEMBERS_DATA.filter((m) => m.batchYear === activeYear);
  }, [activeYear]);

  const leadMember = allYearMembers.find((m) => m.isLead) || allYearMembers[0];

  // Filtered members for yearbook roster
  const filteredMembers = useMemo(() => {
    if (activeSpecialization === "all") return allYearMembers;
    return allYearMembers.filter((m) => m.specialization === activeSpecialization);
  }, [allYearMembers, activeSpecialization]);

  // Available specializations for the active year
  const availableSpecializations = useMemo(() => {
    const set = new Set(allYearMembers.map((m) => m.specialization));
    return ["all", ...Array.from(set)];
  }, [allYearMembers]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-28">
      
      {/* Editorial Magazine Cover Hero */}
      <section className="relative bg-gradient-to-b from-gray-950 via-[#011554] to-[#0230a7] text-white pt-28 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Ambient color blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0066ff]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#ffd000]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
              The Hall of Fame & <span className="text-[#ffd000] italic font-serif">Living Legacies</span>
            </h1>

            <p className="text-base sm:text-xl text-gray-200 max-w-2xl font-light leading-relaxed">
              Merekam jejak dedikasi, rekayasa teknologi, dan standar keunggulan yang diwariskan dari satu generasi ke generasi mahasiswa Ilmu Komputer Universitas Klabat.
            </p>
          </div>

        </div>
      </section>

      {/* Cohort Valedictorian & Editorial Story Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-300/40 border border-gray-200/90 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Big Editorial Portrait */}
            <div className="lg:col-span-5 relative min-h-[440px] bg-gray-100 group">
              <img
                src={leadMember?.image || batch.highlightImage}
                alt={leadMember?.name || batch.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ffd000] flex items-center gap-1.5">
                  <Star size={14} className="fill-[#ffd000]" />
                  Cohort Valedictorian & Lead
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {leadMember?.name}
                </h3>
                <p className="text-sm text-gray-300 mt-0.5">
                  {leadMember?.role} • Batch {batch.year}
                </p>
                {leadMember && (
                  <button
                    onClick={() => setSelectedMember(leadMember)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#ffd000] hover:underline cursor-pointer"
                  >
                    Buka Profil Lengkap →
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Editorial Narrative */}
            <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#fffbe6] text-[#806700] border border-[#ffd000]/60">
                    Chapter {batch.year} • {batch.codeName}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {batch.totalMembers} Member Roster
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {batch.title}
                </h2>

                <p className="text-lg text-[#0230a7] font-medium italic font-serif">
                  "{batch.tagline}"
                </p>

                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {batch.description}
                </p>

                {/* Valedictorian Quote Callout */}
                {leadMember?.quote && (
                  <div className="p-4 rounded-2xl bg-gray-50 border-l-4 border-[#0230a7] space-y-2">
                    <Quote size={20} className="text-[#0230a7]" />
                    <p className="text-sm font-serif italic text-gray-800">
                      "{leadMember.quote}"
                    </p>
                    <span className="text-xs font-bold text-gray-500 block">
                      — {leadMember.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Metrics Ribbon */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
                <div className="p-2 rounded-xl bg-gray-50/80">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0230a7] block">{batch.totalMembers}+</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Alumni & Member</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50/80">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#d97706] block">{batch.trophiesCount}</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Medali & Prestasi</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50/80">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0066ff] block">{batch.projectsBuilt}</span>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Inovasi Rilis</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Hall of Trophies & Victories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="border-b border-gray-200 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#0230a7] bg-[#e6eaf9] px-3 py-1 rounded-full mb-2">
              <Award size={14} className="text-[#0230a7]" />
              Hall of Honors
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Kemenangan Bergengsi Batch {batch.year}
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            {batch.milestones.length} Prestasi Terverifikasi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {batch.milestones.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#ffd000] hover:shadow-xl hover:-translate-y-1 transition-all duration-250 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffd000]/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#fffbe6] text-[#806700] border border-[#ffd000]/40 flex items-center justify-center mb-4">
                  <Trophy size={18} />
                </div>

                <span className="text-xs font-bold text-[#0066ff] uppercase tracking-wider block">
                  {item.event}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 leading-snug">
                  {item.title}
                </h3>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#16a34a] bg-[#dcfce7] px-2.5 py-1 rounded-md">
                  {item.award}
                </span>
                <span className="text-xs text-gray-400 font-mono">{item.year}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cohort Yearbook Gallery */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="border-b border-gray-200 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0230a7] block mb-1">
              Yearbook Roster
            </span>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Jajaran Tokoh Batch {batch.year}
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              Para pembelajar tangguh yang mendefinisikan standar keilmuan komputer di angkatan ini. Klik profil untuk melihat detail lengkap.
            </p>
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-end">
            {availableSpecializations.map((spec) => {
              const isSelected = activeSpecialization === spec;
              return (
                <button
                  key={spec}
                  onClick={() => setActiveSpecialization(spec)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0230a7] text-white shadow-sm font-bold"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {spec === "all" ? "Semua Bidang" : spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:border-[#0230a7] hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col cursor-pointer group"
            >
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#0230a7] text-xs font-bold px-2.5 py-1 rounded-md shadow">
                  {member.specialization}
                </span>
                {member.isLead && (
                  <span className="absolute top-3 right-3 bg-[#ffd000] text-[#18181b] text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Batch Lead
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#0230a7] transition-colors leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    {member.role}
                  </p>
                  <p className="text-xs text-gray-600 font-serif italic mt-3 line-clamp-2">
                    "{member.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 2).map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-[#0066ff] font-bold group-hover:translate-x-0.5 transition-transform">
                    Detail →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cohort Memory Mosaic */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#0230a7] block mb-1">
                Visual Archives
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dokumentasi Kebersamaan Angkatan
              </h3>
            </div>
            <Link
              href="/media"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0230a7] hover:underline"
            >
              Lihat Galeri Lengkap Media UVICS →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src="/images/img/foto-1.webp" alt="UVICS Moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src="/images/img/foto-5.webp" alt="UVICS Moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src="/images/img/foto-10.webp" alt="UVICS Moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img src="/images/img/foto-14.webp" alt="UVICS Moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Member Detail Spotlight Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 bg-gradient-to-r from-[#0230a7] to-[#0066ff]">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="absolute -bottom-10 left-6">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              </div>
            </div>

            <div className="pt-12 p-6 space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{selectedMember.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e6eaf9] text-[#0230a7]">
                    Batch {selectedMember.batchYear}
                  </span>
                  {selectedMember.isLead && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#ffd000] text-[#18181b]">
                      Lead
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium mt-0.5">{selectedMember.role}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs italic font-serif text-gray-700">
                "{selectedMember.quote}"
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Prestasi & Kontribusi
                </span>
                <div className="space-y-1.5">
                  {selectedMember.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                      <Trophy size={14} className="text-[#d97706] flex-shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Tech Stack & Keahlian
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMember.skills.map((skill, idx) => (
                    <span key={idx} className="text-xs font-mono bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <a
                    href={selectedMember.github || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    title="GitHub Profile"
                  >
                    <IconBrandGithub size={18} />
                  </a>
                  <a
                    href={selectedMember.linkedin || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 hover:text-[#0066ff] transition-colors"
                    title="LinkedIn Profile"
                  >
                    <IconBrandLinkedin size={18} />
                  </a>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0230a7] text-white hover:bg-[#022890] transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa]" />}>
      <BatchContent />
    </Suspense>
  );
}
