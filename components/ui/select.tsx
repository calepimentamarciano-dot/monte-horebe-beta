import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ className, label, children, ...props }: SelectProps) {
  const select = (
    <select
      className={cn(
        "focus-ring h-12 w-full rounded-full border border-white/10 bg-black/30 px-4 text-sm text-horebe-soft",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );

  if (!label) return select;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-horebe-soft">{label}</span>
      {select}
    </label>
  );
}
