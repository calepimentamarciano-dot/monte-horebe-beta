"use client";

import { Boxes, FolderTree, LayoutDashboard, LogOut } from "lucide-react";

type SidebarProps = {
  onSignOut: () => void;
};

export function Sidebar({ onSignOut }: SidebarProps) {
  return (
    <aside className="glass-panel rounded-[1.5rem] p-4 lg:min-h-[calc(100vh-10rem)]">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-horebe-gold text-sm font-bold text-horebe-black">
          MH
        </span>
        <div>
          <p className="font-display text-xl text-horebe-soft">Admin</p>
          <p className="text-xs text-horebe-gray">Monte Horebe</p>
        </div>
      </div>

      <nav className="grid gap-2" aria-label="Administração">
        {[
          { icon: LayoutDashboard, label: "Visão geral" },
          { icon: Boxes, label: "Produtos" },
          { icon: FolderTree, label: "Categorias" }
        ].map((item) => (
          <a
            key={item.label}
            href={`#${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-horebe-gray transition hover:bg-white/5 hover:text-horebe-gold"
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        onClick={onSignOut}
        className="focus-ring mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-horebe-soft transition hover:border-horebe-gold hover:text-horebe-gold"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sair
      </button>
    </aside>
  );
}
