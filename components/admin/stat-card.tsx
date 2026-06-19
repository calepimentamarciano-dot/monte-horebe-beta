import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
};

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-horebe-gray">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-horebe-gold/10 text-horebe-gold">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 break-words font-display text-3xl leading-tight text-horebe-soft md:text-4xl">{value}</p>
    </div>
  );
}
