"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Clock,
  MapPin,
  ArrowRight,
  User,
  Video,
  Building2,
} from "lucide-react";
import { EventItem, UVICS_EVENTS } from "@/src/data/mock/events";
import { Button } from "@/src/components/atoms/Button/Button";

export interface EventsSectionProps {
  events?: EventItem[];
}

/**
 * Seksi 7: Upcoming Events (Homepage)
 * Mengimplementasikan Konsep 1: Interactive Date-Badge Event Cards with Venue Chips.
 * Menampilkan poster visual dengan kotak tanggal kalender yang mencolok (Day & Month),
 * badge tipe venue (Hybrid/On-Campus), profil pembicara tamu, serta tombol daftar.
 */
export function EventsSection({ events = UVICS_EVENTS }: EventsSectionProps) {
  // Empty state handling
  if (!events || events.length === 0) {
    return (
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
          <p className="text-sm font-medium text-gray-500">
            Belum ada event mendatang saat ini.
          </p>
        </div>
      </section>
    );
  }

  // Tampilkan 3 event terdepan untuk pratinjau Beranda
  const displayEvents = events.slice(0, 3);

  return (
    <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Header Seksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="max-w-2xl space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 font-heading"
          >
            Event <span className="text-primary">Mendatang</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="text-base text-gray-600 leading-relaxed"
          >
            Ikuti sesi tech talk, workshop intensif, dan temu komunitas untuk
            memperluas wawasan rekayasa teknologi dan jejaring industri.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0"
        >
          <Button variant="outline" size="md" href="/events">
            <span>Lihat Semua Event</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Grid 3 Kartu Event */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Poster Image Container dengan Date Badge */}
              <div className="relative w-full h-52 overflow-hidden bg-gray-100">
                <Image
                  src={event.poster}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />

                {/* Calendar Date Badge (Kiri Atas) */}
                <div className="absolute top-4 left-4 rounded-2xl bg-white shadow-lg p-2.5 text-center min-w-[54px] border border-gray-100">
                  <span className="text-xs font-mono font-bold text-primary block leading-none">
                    {event.dateBadge.month}
                  </span>
                  <span className="text-2xl font-black text-gray-900 block leading-tight font-heading">
                    {event.dateBadge.day}
                  </span>
                </div>

                {/* Venue Chip (Kanan Atas) */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-gray-900 shadow-xs flex items-center gap-1.5">
                    {event.venueType === "Hybrid" ? (
                      <Video className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>{event.venueType}</span>
                  </span>
                </div>

                {/* Kategori Badge di Bawah Poster */}
                <div className="absolute bottom-3 left-4">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-secondary text-gray-950">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 font-heading">
                  {event.title}
                </h3>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                {/* Detail Waktu & Lokasi */}
                <div className="space-y-2 pt-2 text-xs text-gray-600 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <span>{event.timeRange}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                {/* Speaker Info jika ada */}
                {event.speaker && (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2.5 text-xs">
                    <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block truncate">
                        {event.speaker.name}
                      </span>
                      <span className="text-[11px] text-gray-500 block truncate">
                        {event.speaker.role}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 pt-0">
              <Button
                variant="primary"
                size="sm"
                href={`/events/${event.slug}`}
                className="w-full text-xs"
              >
                <span>Lihat Agenda & Daftar</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
