"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { ProjectItem, UVICS_PROJECTS } from "@/data/mock/projects";
import { Button } from "@/components/ui/Button";

interface ProjectsSectionProps {
  projects?: ProjectItem[];
}

/**
 * Seksi 8: Featured Projects (Editorial Alternating Rows)
 * Menampilkan proyek unggulan mahasiswa dalam baris editorial bergantian (kiri-kanan) berukuran penuh.
 * Menekankan narasi karya, stack teknologi terapan, tautan demo/repo, dan studi kasus.
 */
export function ProjectsSection({
  projects = UVICS_PROJECTS,
}: ProjectsSectionProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-sm font-medium text-gray-500">
          Belum ada proyek yang dipublikasikan.
        </p>
      </div>
    );
  }

  // Tampilkan 3 proyek unggulan pertama
  const displayProjects = projects.slice(0, 3);

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Karya Teknologi yang Berdampak
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Setiap karya adalah bukti keahlian rekayasa perangkat lunak dan dedikasi
            anggota UVICS dalam menghadirkan solusi digital yang fungsional bagi kampus dan masyarakat.
          </p>
        </div>

        <div className="shrink-0">
          <Button variant="outline" size="md" href="/projects">
            <span>Lihat Semua Proyek</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Baris Bergantian (Alternating Editorial Rows) */}
      <div className="space-y-24">
        {displayProjects.map((project, index) => {
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                !isEven ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Kolom Visual Cover (6 Kolom) */}
              <div
                className={`lg:col-span-6 relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md group ${
                  !isEven ? "lg:order-2" : "lg:order-1"
                }`}
              >
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/95 text-gray-900 shadow-xs">
                    {project.category}
                  </span>
                </div>

                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold text-secondary">
                    {project.highlightStat.label}: {project.highlightStat.value}
                  </span>
                  <span className="font-mono text-[11px] bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                    Rilis {project.year}
                  </span>
                </div>
              </div>

              {/* Kolom Naratif (6 Kolom) */}
              <div
                className={`lg:col-span-6 space-y-6 ${
                  !isEven ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                    PROYEK #{String(index + 1).padStart(2, "0")} • {project.status}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">
                    {project.title}
                  </h3>
                </div>

                <p className="text-base text-gray-600 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-medium px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Aksi & Kontributor */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {project.projectUrl && (
                      <Button
                        variant="primary"
                        size="sm"
                        href={project.projectUrl}
                      >
                        <span>Live Demo</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    )}

                    {project.repositoryUrl && (
                      <Link
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:text-gray-950 transition-colors"
                      >
                        <IconBrandGithub className="w-4 h-4" />
                        <span>Source</span>
                      </Link>
                    )}
                  </div>

                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-600 transition-colors"
                  >
                    <span>Studi Kasus Lengkap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
