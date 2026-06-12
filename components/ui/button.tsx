import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-horebe-gold text-horebe-black hover:bg-horebe-soft",
        variant === "secondary" &&
          "border border-white/10 bg-white/[0.04] text-horebe-soft hover:border-horebe-gold hover:text-horebe-gold",
        variant === "danger" &&
          "border border-red-400/30 bg-red-500/10 text-red-200 hover:border-red-300",
        variant === "ghost" && "text-horebe-gray hover:bg-white/5 hover:text-horebe-gold",
        className
      )}
      {...props}
    />
  );
}
