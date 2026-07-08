import { BadgeDollarSign, BarChart3, Receipt, ShoppingBag, Star, Wallet } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { getBestSellingProducts, getBillingSummary, getRecentSales, getRevenueByChannel } from "@/lib/billing";
import type { Sale, SaleItem } from "@/lib/types";
import { formatCurrency, formatMargin } from "@/lib/utils";

export default async function BillingPage() {
  const [summary, recentSales, bestSellingProducts, revenueByChannel] = await Promise.all([
    getBillingSummary(),
    getRecentSales(10),
    getBestSellingProducts(),
    getRevenueByChannel()
  ]);

  return (
    <>
      <AdminHeader
        title="Faturamento"
        description="Veja o desempenho das vendas por periodo, produto e canal."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Faturamento bruto hoje" value={formatCurrency(summary.todayRevenue) ?? "R$ 0,00"} icon={Wallet} />
        <StatCard label="Lucro estimado hoje" value={formatCurrency(summary.todayProfit) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Faturamento ultimos 7 dias" value={formatCurrency(summary.last7DaysRevenue) ?? "R$ 0,00"} icon={BarChart3} />
        <StatCard label="Lucro ultimos 7 dias" value={formatCurrency(summary.last7DaysProfit) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Receita antes desconto" value={formatCurrency(summary.totalSubtotal) ?? "R$ 0,00"} icon={Wallet} />
        <StatCard label="Descontos concedidos" value={formatCurrency(summary.totalDiscount) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Receita do mes" value={formatCurrency(summary.monthRevenue) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Lucro do mes" value={formatCurrency(summary.monthProfit) ?? "R$ 0,00"} icon={BadgeDollarSign} />
        <StatCard label="Ticket medio" value={formatCurrency(summary.averageTicket) ?? "R$ 0,00"} icon={ShoppingBag} />
        <StatCard label="Margem media" value={formatMargin(summary.averageMargin)} icon={Receipt} />
        <StatCard label="Produto mais vendido" value={summary.bestSellingProduct ?? "Sem vendas"} icon={Star} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel overflow-hidden rounded-2xl">
          <TableTitle title="Vendas recentes" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-horebe-gray">
                <tr>
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Produto</th>
                  <th className="px-5 py-4">Quantidade</th>
                  <th className="px-5 py-4">Subtotal</th>
                  <th className="px-5 py-4">Desconto</th>
                  <th className="px-5 py-4">Total final</th>
                  <th className="px-5 py-4">Custo</th>
                  <th className="px-5 py-4">Lucro</th>
                  <th className="px-5 py-4">Margem</th>
                  <th className="px-5 py-4">Canal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {recentSales.map((sale) => {
                  const saleItems = getSaleItems(sale);

                  return (
                    <tr key={sale.id}>
                      <td className="px-5 py-4 text-horebe-gray">{formatDate(sale.created_at)}</td>
                      <td className="px-5 py-4 font-semibold text-horebe-soft">{formatItemsSummary(saleItems)}</td>
                      <td className="px-5 py-4 text-horebe-gray">{getTotalQuantity(saleItems)}</td>
                      <td className="px-5 py-4 text-horebe-gray">{formatCurrency(getSaleSubtotal(sale)) ?? "R$ 0,00"}</td>
                      <td className="px-5 py-4 text-horebe-gray">
                        {formatCurrency(getSaleDiscount(sale)) ?? "R$ 0,00"}
                        {getSaleDiscountPercent(sale) > 0 ? (
                          <span className="ml-1 text-xs">({formatMargin(getSaleDiscountPercent(sale))})</span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-horebe-soft">{formatCurrency(sale.total_value) ?? "R$ 0,00"}</td>
                      <td className="px-5 py-4 text-horebe-gray">{formatCurrency(getSaleCost(sale)) ?? "R$ 0,00"}</td>
                      <td className="px-5 py-4 text-horebe-soft">{formatCurrency(getSaleProfit(sale)) ?? "R$ 0,00"}</td>
                      <td className="px-5 py-4 text-horebe-gray">{formatMargin(getSaleMargin(sale))}</td>
                      <td className="px-5 py-4 text-horebe-gray">{sale.sales_channel ?? "Outro"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {recentSales.length === 0 ? <EmptyState text="Nenhuma venda registrada ainda." /> : null}
          </div>
        </section>

        <section className="glass-panel overflow-hidden rounded-2xl">
          <TableTitle title="Produtos mais vendidos" />
          <div className="grid divide-y divide-white/10">
            {bestSellingProducts.slice(0, 6).map((product) => (
              <div key={`${product.product_id}-${product.product_name}`} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold text-horebe-soft">{product.product_name}</p>
                  <p className="mt-1 text-sm text-horebe-gray">{product.quantity} unidades vendidas</p>
                </div>
                <p className="text-sm font-semibold text-horebe-gold">{formatCurrency(product.revenue) ?? "R$ 0,00"}</p>
              </div>
            ))}
            {bestSellingProducts.length === 0 ? <EmptyState text="Sem produtos vendidos ainda." /> : null}
          </div>
        </section>
      </div>

      <section className="glass-panel mt-6 overflow-hidden rounded-2xl">
        <TableTitle title="Receita por canal" />
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
          {revenueByChannel.map((item) => (
            <div key={item.channel} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-horebe-gray">{item.channel}</p>
              <p className="mt-3 font-display text-3xl text-horebe-soft">{formatCurrency(item.revenue) ?? "R$ 0,00"}</p>
              <p className="mt-2 text-xs text-horebe-gray">{item.salesCount} venda(s)</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function TableTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-white/10 p-5">
      <h2 className="font-display text-3xl text-horebe-soft">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="p-5 text-sm text-horebe-gray">{text}</p>;
}

function getSaleItems(sale: Sale): SaleItem[] {
  if (sale.items?.length) {
    return sale.items;
  }

  return [
    {
      id: sale.id,
      sale_id: sale.id,
      product_id: sale.product_id,
      product_name: sale.product_name,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      unit_cost: null,
      subtotal: sale.total_value,
      total_cost: sale.total_cost ?? 0,
      gross_profit: sale.gross_profit ?? 0,
      created_at: sale.created_at
    }
  ];
}

function formatItemsSummary(items: SaleItem[]) {
  if (items.length === 0) return "Sem itens";
  if (items.length === 1) return items[0].product_name;

  return `${items[0].product_name} + ${items.length - 1} item(ns)`;
}

function getTotalQuantity(items: SaleItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function getSaleCost(sale: Sale) {
  if (sale.total_cost !== null && sale.total_cost !== undefined) {
    return Number(sale.total_cost) || 0;
  }

  return getSaleItems(sale).reduce((total, item) => total + (Number(item.total_cost) || 0), 0);
}

function getSaleProfit(sale: Sale) {
  if (sale.gross_profit !== null && sale.gross_profit !== undefined) {
    return Number(sale.gross_profit) || 0;
  }

  return getSaleItems(sale).reduce((total, item) => total + (Number(item.gross_profit) || 0), 0);
}

function getSaleSubtotal(sale: Sale) {
  if (sale.subtotal_value !== null && sale.subtotal_value !== undefined) {
    return Number(sale.subtotal_value) || 0;
  }

  return Number(sale.total_value ?? 0) + getSaleDiscount(sale);
}

function getSaleDiscount(sale: Sale) {
  return Number(sale.discount_value ?? 0) || 0;
}

function getSaleDiscountPercent(sale: Sale) {
  return Number(sale.discount_percent ?? 0) || 0;
}

function getSaleMargin(sale: Sale) {
  const revenue = Number(sale.total_value ?? 0);
  if (revenue <= 0) return 0;

  return (getSaleProfit(sale) / revenue) * 100;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}
