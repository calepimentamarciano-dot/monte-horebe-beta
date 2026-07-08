import { AlertTriangle, Archive, Boxes, Clock } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { StockManager } from "@/components/admin/stock-manager";
import { getStockMovements, getStockProducts, isLowStockProduct } from "@/lib/stock";

export default async function StockPage() {
  const [products, movements] = await Promise.all([getStockProducts(), getStockMovements()]);
  const lowStockProducts = products.filter(isLowStockProduct).length;
  const totalUnits = products.reduce((total, product) => total + (product.stock_quantity ?? 0), 0);
  const lastMovement = movements[0]?.created_at ? formatDate(movements[0].created_at) : "Sem registro";

  return (
    <>
      <AdminHeader
        title="Controle de Estoque"
        description="Acompanhe a quantidade disponível de cada café e receba alertas de estoque baixo."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de produtos" value={products.length} icon={Boxes} />
        <StatCard label="Estoque baixo" value={lowStockProducts} icon={AlertTriangle} />
        <StatCard label="Unidades em estoque" value={totalUnits} icon={Archive} />
        <StatCard label="Última movimentação" value={lastMovement} icon={Clock} />
      </div>

      <StockManager products={products} movements={movements} />
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}
