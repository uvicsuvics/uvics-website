"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
  ImageStreamHero,
  StreamImage,
} from "@/src/components/sections/ImageStreamHero";

interface HeroProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const IMAGES: StreamImage[] = [
  { src: "/images/img/foto-1.webp" },
  { src: "/images/img/foto-2.webp" },
  { src: "/images/img/foto-3.webp" },
  { src: "/images/img/foto-4.webp" },
  { src: "/images/img/foto-5.webp" },
  { src: "/images/img/foto-7.webp" },
  { src: "/images/img/foto-8.webp" },
  { src: "/images/img/foto-9.webp" },
  { src: "/images/img/foto-10.webp" },
  { src: "/images/img/foto-11.webp" },
  { src: "/images/img/foto-12.webp" },
  { src: "/images/img/foto-13.webp" },
  { src: "/images/img/foto-14.webp" },
  { src: "/images/img/foto15.webp" },
  { src: "/images/img/foto-16.webp" },
  { src: "/images/img/foto-17.webp" },
];

const ROTATING_PHRASES = [
  { prefix: "Welcome to ", highlight: "UVICS Community" },
  { prefix: "Where Innovation Meets ", highlight: "Character" },
  { prefix: "Virtue in Logic, Excellence in ", highlight: "Action" },
  { prefix: "Empowering Tomorrow's ", highlight: "Tech Leaders" },
];

export function Hero({
  ctaLabel = "Jelajahi Profil Kami",
  ctaHref = "#about",
}: HeroProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = ROTATING_PHRASES[phraseIndex];
    const fullText = currentPhrase.prefix + currentPhrase.highlight;

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (charIndex < fullText.length) {
        // Kecepatan mengetik huruf per huruf (sekitar 55ms)
        timer = setTimeout(() => {
          setCharIndex((prev) => prev + 1);
        }, 55);
      } else {
        // Teks selesai diketik: Tahan selama sekitar 5 - 6 detik sebelum mulai dihapus
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 5500);
      }
    } else {
      if (charIndex > 0) {
        // Kecepatan menghapus huruf (sekitar 28ms)
        timer = setTimeout(() => {
          setCharIndex((prev) => prev - 1);
        }, 28);
      } else {
        // Selesai dihapus: Beri jeda singkat, lalu ganti ke teks berikutnya
        timer = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        }, 400);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex]);

  const currentPhrase = ROTATING_PHRASES[phraseIndex];
  const prefixLength = currentPhrase.prefix.length;
  const renderedPrefix = currentPhrase.prefix.slice(0, charIndex);
  const renderedHighlight =
    charIndex > prefixLength
      ? currentPhrase.highlight.slice(0, charIndex - prefixLength)
      : "";

  return (
    <section className="relative mx-auto w-full min-h-[calc(100vh-40px)] rounded-b-xl overflow-hidden">
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: cursorBlink 0.8s infinite;
        }
      `}</style>

      {/* Background Gradient (Paling Belakang) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,#ffffff,#ffffff_50%,var(--color-primary-50)_100%)]" />

      {/* Grid BG (Di atas gradient, di bawah foto) */}
      <div
        className="absolute inset-0 z-[1] h-[600px] w-full 
        bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] 
        bg-[size:6rem_5rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Animated Image Stream (Koridor tengah yang mengalir ke samping kiri dan kanan) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <ImageStreamHero
          images={IMAGES}
          cards={8}
          speed={20}
          axis={50}
          className="w-full h-full"
        />
      </div>

      {/* Bottom Fade (Paling Depan untuk memudarkan bawah) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none
        bg-gradient-to-t from-white to-transparent"
      />

      {/* Sleek Upper Floating Island (Animasi mengetik dinamis) */}
      <div className="absolute top-24 sm:top-28 inset-x-0 z-30 flex flex-col items-center text-center px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-3xl mx-auto space-y-3 animate-fadeIn">
          {/* Main Headline with Typewriter Animation */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center flex-wrap">
            <span>{renderedPrefix}</span>
            {renderedHighlight && (
              <span className="text-[#0230a7] ml-1">{renderedHighlight}</span>
            )}
            <span className="inline-block w-[3px] sm:w-[4px] h-[0.85em] bg-[#0230a7] ml-1.5 align-middle animate-cursor-blink rounded-sm" />
          </h1>
        </div>
      </div>

      {/* Action Button (Di bagian bawah foto) */}
      <div className="absolute bottom-8 sm:bottom-12 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
        <a
          href={ctaHref}
          className="pointer-events-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#0230a7] text-white shadow-lg shadow-[#0230a7]/25 hover:bg-[#022890] hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
        >
          <span>{ctaLabel}</span>
          <ChevronRight size={15} />
        </a>
      </div>
    </section>
  );
}
