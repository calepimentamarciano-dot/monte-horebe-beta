"use client";

import Image from "next/image";
import { useState } from "react";

const seals = ["Café Especial", "Origem Selecionada", "Qualidade Premium"];

export function BrandStoryVisual() {
  const [showImage, setShowImage] = useState(true);

  return (
    <div className="glass-panel relative min-h-[520px] overflow-hidden rounded-[2rem] p-4">
      <div className="absolute inset-4 overflow-hidden rounded-[1.7rem] border border-horebe-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(182,141,64,0.3),transparent_34%),linear-gradient(145deg,#122620,#050505_62%,#2B1D12)]">
        {/* Troque a imagem em public/images/sobre-monte-horebe.jpg para atualizar este quadro. */}
        {showImage ? (
          <Image
            src="/images/sobre-monte-horebe.jpg"
            alt="Imagem institucional da Monte Horebe"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized
            onError={() => setShowImage(false)}
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.08),rgba(5,5,5,0.52)),linear-gradient(120deg,rgba(18,38,32,0.16),rgba(182,141,64,0.2))]" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-horebe-gold/20 blur-3xl" />
      </div>

      <div className="absolute left-8 top-8 grid gap-3">
        {seals.map((seal) => (
          <span
            key={seal}
            className="rounded-full border border-horebe-gold/25 bg-black/45 px-4 py-2 text-sm font-semibold text-horebe-soft backdrop-blur-xl"
          >
            {seal}
          </span>
        ))}
      </div>
    </div>
  );
}
