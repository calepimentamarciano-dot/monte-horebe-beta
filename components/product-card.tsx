"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import { fadeUp, scaleOnHover } from "@/components/motion-wrapper";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const price = formatCurrency(product.price);

  return (
    <motion.article
      variants={fadeUp}
      {...scaleOnHover}
      className="group min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-card backdrop-blur-xl"
    >
      <ProductVisual
        name={product.name}
        notes={product.sensory_notes}
        imageUrl={product.image_url}
        className="rounded-b-none border-x-0 border-t-0 transition duration-500 group-hover:border-horebe-gold/45"
      />
      <div className="p-4 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-horebe-gold/20 bg-horebe-gold/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-horebe-gold">
            {product.roast_level}
          </span>
          {product.score_sca ? (
            <span className="flex items-center gap-1 text-sm text-horebe-soft">
              <Star className="h-4 w-4 fill-horebe-gold text-horebe-gold" aria-hidden />
              {product.score_sca} SCA
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-2xl text-horebe-soft">{product.name}</h3>
        <p className="mt-2 min-h-[56px] text-sm leading-7 text-horebe-gray">
          {product.short_description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {product.sensory_notes?.slice(0, 3).map((note) => (
            <span key={note} className="rounded-full bg-white/5 px-3 py-1 text-xs text-horebe-gray">
              {note}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-horebe-soft">{price ?? "Sob consulta"}</span>
          <Link
            href={`/produto/${product.slug}`}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-horebe-gold/30 px-4 py-2 text-sm font-semibold text-horebe-gold transition hover:bg-horebe-gold hover:text-horebe-black"
          >
            Ver detalhes
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
