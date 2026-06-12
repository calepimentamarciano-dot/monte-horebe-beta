import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ className, label, ...props }: TextareaProps) {
  const textarea = (
    <textarea
      className={cn(
        "focus-ring w-full rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-horebe-soft placeholder:text-horebe-gray",
        className
      )}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      {textarea}
    </label>
  );
}
