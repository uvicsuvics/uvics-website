"use client";

import React from "react";
import { MotionConfig, motion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Scroll reveal standar proyek: fade dan naik 24px selama 0,6 detik, sekali saat terlihat.
 * Pengguna dengan prefers-reduced-motion hanya mendapat fade tanpa pergeseran.
 * @param className - CSS class untuk elemen pembungkus (opsional)
 */
export function Reveal({ children, className }: RevealProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
