import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export function FeatureCard({ icon: Icon, title, text }: FeatureCardProps) {
  return (
    <article className="group rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-horebe-gold/40">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-horebe-gold/25 bg-horebe-gold/10 text-horebe-gold transition group-hover:bg-horebe-gold group-hover:text-horebe-black">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="font-display text-2xl text-horebe-soft">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-horebe-gray">{text}</p>
    </article>
  );
}
