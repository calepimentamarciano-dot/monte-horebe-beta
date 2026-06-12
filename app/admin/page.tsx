import { Boxes, Eye, FolderTree, Plus, Star } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminCategories } from "@/lib/categories";
import { getAdminProducts } from "@/lib/products";

const shortcuts = [
  { href: "/admin/produtos/novo", label: "Adicionar produto", icon: Plus },
  { href: "/admin/produtos", label: "Gerenciar produtos", icon: Boxes },
  { href: "/admin/categorias", label: "Gerenciar categorias", icon: FolderTree },
  { href: "/catalogo", label: "Ver catálogo público", icon: Eye }
];

export default async function AdminPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  const activeProducts = products.filter((product) => product.is_active).length;
  const featuredProducts = products.filter((product) => product.is_featured).length;

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Acompanhe o catálogo e acesse rapidamente as principais ações administrativas."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de produtos" value={products.length} icon={Boxes} />
        <StatCard label="Produtos ativos" value={activeProducts} icon={Eye} />
        <StatCard label="Em destaque" value={featuredProducts} icon={Star} />
        <StatCard label="Categorias" value={categories.length} icon={FolderTree} />
      </div>

      <section className="mt-6">
        <h2 className="font-display text-3xl text-horebe-soft">Atalhos rápidos</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;

            return (
              <Link
                key={shortcut.href}
                href={shortcut.href}
                className="focus-ring glass-panel flex items-center justify-between gap-4 rounded-2xl p-5 text-horebe-soft transition hover:border-horebe-gold/40"
              >
                <span className="font-semibold">{shortcut.label}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-horebe-gold/10 text-horebe-gold">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
