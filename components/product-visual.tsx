import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductVisualProps = {
  name: string;
  notes?: string[] | null;
  className?: string;
  size?: "card" | "large";
};

export function ProductVisual({ name, notes, className, size = "card" }: ProductVisualProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] border border-horebe-gold/20 bg-[radial-gradient(circle_at_50%_0%,rgba(182,141,64,0.34),transparent_30%),linear-gradient(145deg,#122620,#050505_58%,#2B1D12)]",
        size === "large" ? "min-h-[520px]" : "min-h-[280px]",
        className
      )}
      role="img"
      aria-label={`Imagem visual do produto ${name}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-50" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-horebe-gold/20 blur-3xl" />
      <div className="absolute inset-x-10 bottom-10 top-10 rounded-[1.7rem] border border-white/10 bg-black/20 backdrop-blur-sm" />
      <div className="absolute left-1/2 top-1/2 grid w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.5rem] border border-horebe-gold/30 bg-horebe-black/76 p-6 text-center shadow-card">
        <Coffee className="mb-4 h-10 w-10 text-horebe-gold" aria-hidden />
        <p className="font-display text-2xl leading-tight text-horebe-soft">{name}</p>
        {notes?.length ? (
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-horebe-gray">
            {notes.slice(0, 2).join(" • ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
