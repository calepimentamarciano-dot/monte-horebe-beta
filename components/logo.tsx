import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
};

const sizeMap = {
  sm: 36,
  md: 44,
  lg: 56
};

export function Logo({ size = "md", showText = true, className, textClassName }: LogoProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <span
        className="relative shrink-0 overflow-hidden rounded-full border border-horebe-gold/35 bg-horebe-green shadow-glow"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <Image
          src="/images/logo-monte-horebe.png"
          alt=""
          fill
          sizes={`${pixelSize}px`}
          className="object-cover"
          priority={pixelSize > 44}
        />
      </span>
      {showText ? (
        <span className={cn("truncate font-display text-horebe-soft", textClassName)}>
          Monte Horebe
        </span>
      ) : null}
    </span>
  );
}
