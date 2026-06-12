"use client";

import { motion } from "framer-motion";
import { MessageCircle, Star } from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { fadeUp } from "@/components/motion-wrapper";

export function ProductMockup() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="glass-panel relative overflow-hidden rounded-[2rem] p-4"
    >
      <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-horebe-gold/20 blur-2xl" />
      <ProductVisual
        name="Monte Horebe Premium"
        notes={["mel", "frutas amarelas"]}
        className="min-h-[260px]"
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-horebe-gold">
              Página de produto
            </p>
            <h3 className="mt-2 font-display text-3xl text-horebe-soft">Premium</h3>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-horebe-gold/25 px-3 py-1 text-sm text-horebe-soft">
            <Star className="h-4 w-4 fill-horebe-gold text-horebe-gold" aria-hidden />
            86
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["Origem", "Mantiqueira"],
            ["Torra", "Média clara"],
            ["Altitude", "1.250m"],
            ["Métodos", "V60, Chemex"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/22 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">{label}</p>
              <p className="mt-1 text-sm font-semibold text-horebe-soft">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["mel", "frutas amarelas", "baunilha"].map((note) => (
            <span key={note} className="rounded-full bg-white/5 px-3 py-1 text-xs text-horebe-gray">
              {note}
            </span>
          ))}
        </div>

        <button
          type="button"
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-horebe-gold px-5 py-3 text-sm font-semibold text-horebe-black"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Chamar no WhatsApp
        </button>
      </div>
    </motion.div>
  );
}
