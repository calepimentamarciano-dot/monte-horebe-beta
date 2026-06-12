"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/product-card";
import { fadeUp, staggerContainer } from "@/components/motion-wrapper";
import type { Product } from "@/lib/types";

type ProductCarouselProps = {
  products: Product[];
};

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="relative"
    >
      <motion.div
        variants={fadeUp}
        className="absolute -inset-x-10 top-1/3 h-44 rounded-full bg-horebe-gold/10 blur-3xl"
      />
      <div className="hide-scrollbar relative flex snap-x gap-5 overflow-x-auto pb-6 md:grid md:grid-cols-3 md:overflow-visible">
        {products.map((product) => (
          <div key={product.id} className="w-[86vw] shrink-0 snap-center md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
