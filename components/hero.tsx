"use client";

import { motion } from "framer-motion";
import { ArrowRight, Coffee } from "lucide-react";
import Link from "next/link";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { fadeIn, fadeUp, staggerContainer } from "@/components/motion-wrapper";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-horebe-radial px-4 pb-24 pt-32">
      <motion.div
        aria-hidden
        animate={{ y: [0, 18, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[22%] h-28 w-20 rounded-full border border-horebe-gold/20 bg-horebe-coffee/40 blur-[1px]"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, -16, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[16%] right-[10%] h-32 w-24 rounded-full border border-horebe-gold/20 bg-horebe-green/55 blur-[1px]"
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-horebe-black to-transparent" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl text-center"
      >
        <motion.div
          variants={fadeIn}
          className="mx-auto mb-7 inline-flex items-center gap-3 rounded-full border border-horebe-gold/20 bg-white/[0.055] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-horebe-gold backdrop-blur-xl"
        >
          <Coffee className="h-4 w-4" aria-hidden />
          Cafés especiais Monte Horebe
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-display text-5xl leading-[0.98] text-horebe-soft sm:text-6xl md:text-8xl"
        >
          Cafés especiais para experiências memoráveis
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-7 max-w-2xl text-base leading-8 text-horebe-gray md:text-xl"
        >
          Da origem à xícara, selecionamos cafés com qualidade, aroma e identidade para
          quem valoriza uma experiência premium.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/catalogo"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-horebe-gold px-6 py-3.5 text-sm font-semibold text-horebe-black shadow-glow transition hover:bg-[#d2ab5c]"
          >
            Conhecer produtos
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <WhatsAppButton className="border border-white/10 bg-white/5 text-horebe-soft hover:bg-white/10 hover:text-horebe-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}
