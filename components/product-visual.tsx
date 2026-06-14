"use client";

import Image from "next/image";
import { Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ProductVisualProps = {
  name: string;
  notes?: string[] | null;
  imageUrl?: string | null;
  imageContent?: "clean" | "center-card";
  className?: string;
  size?: "card" | "large";
};

export function ProductVisual({
  name,
  notes,
  imageUrl,
  imageContent = "clean",
  className,
  size = "card"
}: ProductVisualProps) {
  const [showImage, setShowImage] = useState(Boolean(imageUrl));

  useEffect(() => {
    setShowImage(Boolean(imageUrl));
  }, [imageUrl]);

  const hasImage = Boolean(imageUrl && showImage);
  const noteText = notes?.slice(0, 2).join(" • ");

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] border border-horebe-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(182,141,64,0.34),transparent_30%),linear-gradient(145deg,#122620,#050505_58%,#2B1D12)]",
        size === "large" ? "min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]" : "h-72",
        className
      )}
      role="img"
      aria-label={`Imagem visual do produto ${name}`}
    >
      {hasImage ? (
        <>
          <Image
            src={imageUrl ?? ""}
            alt=""
            fill
            sizes={size === "large" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 86vw"}
            unoptimized
            onError={() => setShowImage(false)}
            className="h-full w-full object-cover object-center transition duration-500"
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-horebe-black/20 via-transparent to-horebe-gold/8",
              imageContent === "center-card" && "from-horebe-black/78 via-horebe-black/24 to-horebe-gold/16"
            )}
          />
          {imageContent === "center-card" ? (
            <div className="absolute left-1/2 top-1/2 grid w-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.25rem] border border-horebe-gold/30 bg-horebe-black/72 p-4 text-center shadow-card backdrop-blur-md sm:w-40 sm:p-5">
              <Coffee className="mb-3 h-8 w-8 text-horebe-gold" aria-hidden />
              <p className="font-display text-xl leading-tight text-horebe-soft sm:text-2xl">{name}</p>
              {noteText ? (
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-horebe-gray sm:text-xs">
                  {noteText}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-50" />
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-horebe-gold/20 blur-3xl" />
          <div className="absolute inset-x-10 bottom-10 top-10 rounded-[1.7rem] border border-white/10 bg-black/20 backdrop-blur-sm" />
          <div className="absolute left-1/2 top-1/2 grid w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.5rem] border border-horebe-gold/30 bg-horebe-black/76 p-6 text-center shadow-card">
            <Coffee className="mb-4 h-10 w-10 text-horebe-gold" aria-hidden />
            <p className="font-display text-2xl leading-tight text-horebe-soft">{name}</p>
            {noteText ? <p className="mt-3 text-xs uppercase tracking-[0.16em] text-horebe-gray">{noteText}</p> : null}
          </div>
        </>
      )}
    </div>
  );
}
