"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock, ArrowRight, ChevronRight } from "lucide-react";
import { NewsItem, UVICS_NEWS } from "@/src/data/mock/news";
import { Button } from "@/src/components/atoms/Button/Button";

interface NewsSectionProps {
  news?: NewsItem[];
}

/**
 * Seksi 10: Latest News (Editorial Lead Headline + Compact News Feed)
 * Menampilkan artikel utama berukuran besar di sisi kiri dengan foto & metadata lengkap,
 * didampingi deretan berita terkini vertikal di sisi kanan.
 */
export function NewsSection({ news = UVICS_NEWS }: NewsSectionProps) {
  if (!news || news.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
        <p className="text-sm font-medium text-gray-500">
          Belum ada berita yang dipublikasikan saat ini.
        </p>
      </div>
    );
  }

  const featuredArticle = news[0];
  const sideArticles = news.slice(1, 4);

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading">
            Kabar Terkini dari{" "}
            <span className="text-primary">Komunitas UVICS</span>
          </h2>
          <p className="text-base text-gray-600 leading-relaxed">
            Ikuti dinamika kegiatan, pencapaian kompetisi, workshop teknologi,
            dan siaran pers resmi seputar aktivitas kemahasiswaan FIK UNKLAB.
          </p>
        </div>

        <div className="shrink-0">
          <Button variant="outline" size="md" href="/news">
            <span>Lihat Semua Berita</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Grid Editorial (7 Kolom Kiri, 5 Kolom Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Kolom Kiri: Featured Lead Article (7 Kolom) */}
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="lg:col-span-7 rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
        >
          {/* Cover Gambar Besar */}
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-gray-100">
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-gray-950 shadow-xs">
                {featuredArticle.category}
              </span>
            </div>
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {featuredArticle.author.name}
                </span>
                <span>•</span>
                <span className="text-gray-300">{featuredArticle.date}</span>
              </div>
              <span className="text-gray-300 flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                {featuredArticle.readingTime}
              </span>
            </div>
          </div>

          {/* Rincian Artikel */}
          <div className="p-6 sm:p-8 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors font-heading leading-tight">
              {featuredArticle.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3">
              {featuredArticle.excerpt}
            </p>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href={`/news/${featuredArticle.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform"
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-gray-400 font-mono">
                {featuredArticle.author.role}
              </span>
            </div>
          </div>
        </motion.article>

        {/* Kolom Kanan: Compact News Feed (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
              Rilis Berita Lainnya
            </h4>
            <span className="text-xs text-primary font-semibold">Terbaru</span>
          </div>

          {sideArticles.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-250 flex gap-4 items-start group"
            >
              {/* Thumbnail Kecil */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="120px"
                />
              </div>

              {/* Konten Ringkas */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary-50">
                    {item.category}
                  </span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>

                <h5 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug font-heading">
                  <Link href={`/news/${item.slug}`}>{item.title}</Link>
                </h5>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>

                <div className="pt-1">
                  <Link
                    href={`/news/${item.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>Baca Rilis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
