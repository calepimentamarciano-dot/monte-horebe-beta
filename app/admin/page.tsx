import { BadgeDollarSign, Boxes, Eye, FolderTree, PackageCheck, Plus, ReceiptText, Star } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { getBillingSummary } from "@/lib/billing";
import { getAdminCategories } from "@/lib/categories";
import { getAdminProducts } from "@/lib/products";
import { getStockProducts, isLowStockProduct } from "@/lib/stock";
import { formatCurrency } from "@/lib/utils";

const shortcuts = [
  { href: "/admin/produtos/novo", label: "Adicionar produto", icon: Plus },
  { href: "/admin/produtos", label: "Gerenciar produtos", icon: Boxes },
  { href: "/admin/categorias", label: "Gerenciar categorias", icon: FolderTree },
  { href: "/admin/vendas/nova", label: "Registrar venda", icon: ReceiptText },
  { href: "/admin/faturamento", label: "Ver faturamento", icon: BadgeDollarSign },
  { href: "/admin/estoque", label: "Controlar estoque", icon: PackageCheck },
  { href: "/catalogo", label: "Ver catálogo público", icon: Eye }
];

export default async function AdminPage() {
  const [products, categories, stockProducts, billingSummary] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getStockProducts(),
    getBillingSummary()
  ]);
  const activeProducts = products.filter((product) => product.is_active).length;
  const featuredProducts = products.filter((product) => product.is_featured).length;
  const lowStockProducts = stockProducts.filter(isLowStockProduct).length;

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Acompanhe o catálogo, vendas, estoque e principais ações administrativas."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de produtos" value={products.length} icon={Boxes} />
        <StatCard label="Produtos ativos" value={activeProducts} icon={Eye} />
        <StatCard label="Em destaque" value={featuredProducts} icon={Star} />
        <StatCard label="Categorias" value={categories.length} icon={FolderTree} />
        <StatCard label="Receita hoje" value={formatCurrency(billingSummary.todayRevenue) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Lucro hoje" value={formatCurrency(billingSummary.todayProfit) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Receita do mês" value={formatCurrency(billingSummary.monthRevenue) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Lucro do mês" value={formatCurrency(billingSummary.monthProfit) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Estoque baixo" value={lowStockProducts} icon={PackageCheck} />
        <StatCard label="Total de vendas" value={billingSummary.totalSales} icon={ReceiptText} />
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
