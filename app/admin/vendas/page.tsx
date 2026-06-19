import { Plus, Receipt, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { CancelSaleForm } from "@/components/admin/cancel-sale-form";
import { StatCard } from "@/components/admin/stat-card";
import { getBillingSummary } from "@/lib/billing";
import { getSales } from "@/lib/sales";
import type { Sale, SaleItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const dayInMs = 24 * 60 * 60 * 1000;

export default async function SalesPage() {
  const [sales, summary] = await Promise.all([getSales(), getBillingSummary()]);
  const activeSales = sales.filter((sale) => !isCanceledSale(sale));
  const todaySales = countSalesInRange(activeSales, startOfSaoPauloDay(new Date()), addDays(startOfSaoPauloDay(new Date()), 1));
  const last7DaysSales = countSalesInRange(activeSales, addDays(startOfSaoPauloDay(new Date()), -6), addDays(startOfSaoPauloDay(new Date()), 1));

  return (
    <>
      <AdminHeader
        title="Vendas"
        description="Acompanhe as vendas lançadas e o impacto no estoque."
        action={
          <Link
            href="/admin/vendas/nova"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-horebe-gold px-5 py-3 text-sm font-semibold text-horebe-black"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nova venda
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vendas hoje" value={todaySales} icon={Receipt} />
        <StatCard label="Receita hoje" value={formatCurrency(summary.todayRevenue) ?? "R$ 0,00"} icon={TrendingUp} />
        <StatCard label="Vendas nos últimos 7 dias" value={last7DaysSales} icon={Receipt} />
        <StatCard label="Receita no mês" value={formatCurrency(summary.monthRevenue) ?? "R$ 0,00"} icon={TrendingUp} />
      </div>

      <section className="glass-panel overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 p-5">
          <h2 className="font-display text-3xl text-horebe-soft">Histórico de vendas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-horebe-gray">
              <tr>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4">Itens</th>
                <th className="px-5 py-4">Quantidade total</th>
                <th className="px-5 py-4">Valor total</th>
                <th className="px-5 py-4">Canal</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Observação</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sales.map((sale) => {
                const isCanceled = isCanceledSale(sale);
                const saleItems = getSaleItems(sale);

                return (
                  <tr key={sale.id} className={isCanceled ? "opacity-55" : undefined}>
                    <td className="px-5 py-4 text-horebe-gray">{formatDate(sale.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-horebe-soft">{formatItemsSummary(saleItems)}</div>
                      <details className="mt-2 text-xs text-horebe-gray">
                        <summary className="cursor-pointer text-horebe-gold hover:text-horebe-soft">
                          Ver itens
                        </summary>
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                          <table className="w-full text-left">
                            <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.12em]">
                              <tr>
                                <th className="px-3 py-2">Produto</th>
                                <th className="px-3 py-2">Qtd.</th>
                                <th className="px-3 py-2">Unit.</th>
                                <th className="px-3 py-2">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {saleItems.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2 text-horebe-soft">{item.product_name}</td>
                                  <td className="px-3 py-2">{item.quantity}</td>
                                  <td className="px-3 py-2">{formatCurrency(item.unit_price) ?? "R$ 0,00"}</td>
                                  <td className="px-3 py-2">{formatCurrency(item.subtotal) ?? "R$ 0,00"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </td>
                    <td className="px-5 py-4 text-horebe-gray">{getTotalQuantity(saleItems)}</td>
                    <td className="px-5 py-4 text-horebe-soft">
                      <span className={isCanceled ? "line-through" : undefined}>
                        {formatCurrency(sale.total_value) ?? "R$ 0,00"}
                      </span>
                      {isCanceled ? <span className="ml-2 text-xs text-red-100">Cancelada</span> : null}
                    </td>
                    <td className="px-5 py-4 text-horebe-gray">{sale.sales_channel ?? "Outro"}</td>
                    <td className="px-5 py-4 text-horebe-gray">{sale.customer_name ?? "Não informado"}</td>
                    <td className="px-5 py-4 text-horebe-gray">
                      {isCanceled ? sale.cancel_reason ?? sale.notes ?? "Venda cancelada" : sale.notes ?? "Sem observação"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge canceled={isCanceled} />
                    </td>
                    <td className="px-5 py-4">
                      {isCanceled ? (
                        <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100">
                          Cancelada
                        </span>
                      ) : (
                        <CancelSaleForm saleId={sale.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sales.length === 0 ? (
            <p className="p-5 text-sm text-horebe-gray">Nenhuma venda registrada ainda.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}

function StatusBadge({ canceled }: { canceled: boolean }) {
  return canceled ? (
    <span className="rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100">
      Cancelada
    </span>
  ) : (
    <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
      Ativa
    </span>
  );
}

function isCanceledSale(sale: Sale) {
  return sale.status === "canceled";
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
      subtotal: sale.total_value,
      created_at: sale.created_at
    }
  ];
}

function formatItemsSummary(items: SaleItem[]) {
  if (items.length === 0) {
    return "Sem itens";
  }

  if (items.length === 1) {
    return items[0].product_name;
  }

  return `${items[0].product_name} + ${items.length - 1} item(ns)`;
}

function getTotalQuantity(items: SaleItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function countSalesInRange(sales: { created_at: string }[], startDate: Date, endDate: Date) {
  return sales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    return saleDate >= startDate && saleDate < endDate;
  }).length;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo"
  }).format(new Date(value));
}

function startOfSaoPauloDay(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 3));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * dayInMs);
}
