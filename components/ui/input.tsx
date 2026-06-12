import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ className, label, ...props }: InputProps) {
  const input = (
    <input
      className={cn(
        "focus-ring h-12 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft placeholder:text-horebe-gray",
        className
      )}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      {input}
    </label>
  );
}
