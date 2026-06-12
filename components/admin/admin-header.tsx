import type { ReactNode } from "react";

type AdminHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-horebe-gold">
          Área administrativa
        </p>
        <h1 className="mt-2 font-display text-4xl text-horebe-soft md:text-5xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-horebe-gray">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
