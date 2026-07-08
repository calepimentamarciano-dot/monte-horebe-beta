"use client";

import {
  Boxes,
  ExternalLink,
  FolderPlus,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ReceiptText
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const productGroupActive = pathname.startsWith("/admin/produtos") || pathname.startsWith("/admin/categorias");
  const saleGroupActive = pathname.startsWith("/admin/vendas") || pathname.startsWith("/admin/faturamento");

  async function handleSignOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="glass-panel rounded-2xl p-4 lg:sticky lg:top-28 lg:min-h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center gap-3">
        <Logo size="md" showText={false} />
        <div>
          <p className="font-display text-xl text-horebe-soft">Admin</p>
          <p className="text-xs text-horebe-gray">Monte Horebe</p>
        </div>
      </div>

      <nav className="grid gap-2" aria-label="Administracao">
        <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} active={pathname === "/admin"} />
        <NavLink href="/admin/produtos" label="Produtos" icon={Boxes} active={productGroupActive} />
        <NavLink href="/admin/estoque" label="Estoque" icon={PackageCheck} active={pathname === "/admin/estoque"} />
        <NavLink href="/admin/vendas" label="Vendas" icon={ReceiptText} active={saleGroupActive} />
        <NavLink href="/" label="Ver Site" icon={ExternalLink} active={false} />
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-horebe-soft transition hover:border-horebe-gold hover:text-horebe-gold"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Sair
      </button>

      <div className="mt-6 rounded-2xl border border-horebe-gold/20 bg-horebe-green/40 p-4">
        <FolderPlus className="mb-3 h-5 w-5 text-horebe-gold" aria-hidden />
        <p className="text-sm font-semibold text-horebe-soft">Catalogo protegido</p>
        <p className="mt-1 text-xs leading-5 text-horebe-gray">
          Clientes continuam acessando produtos sem login.
        </p>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
        active ? "bg-horebe-gold text-horebe-black" : "text-horebe-gray hover:bg-white/5 hover:text-horebe-gold"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
