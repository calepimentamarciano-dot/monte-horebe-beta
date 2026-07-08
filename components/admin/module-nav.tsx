import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ModuleNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type ModuleNavProps = {
  items: ModuleNavItem[];
};

export function ModuleNav({ items }: ModuleNavProps) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/15 p-2" aria-label="Subnavegacao do modulo">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
              item.active
                ? "bg-horebe-gold text-horebe-black"
                : "text-horebe-gray hover:bg-white/5 hover:text-horebe-gold"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
