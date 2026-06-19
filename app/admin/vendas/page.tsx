import { Plus, Receipt, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { StatCard } from "@/components/admin/stat-card";
import { getBillingSummary } from "@/lib/billing";
import { getSales } from "@/lib/sales";
import { formatCurrency } from "@/lib/utils";

const dayInMs = 24 * 60 * 60 * 1000;

export default async function SalesPage() {
  const [sales, summary] = await Promise.all([getSales(), getBillingSummary()]);
  const todaySales = countSalesInRange(sales, startOfSaoPauloDay(new Date()), addDays(startOfSaoPauloDay(new Date()), 1));
  const last7DaysSales = countSalesInRange(sales, addDays(startOfSaoPauloDay(new Date()), -6), addDays(startOfSaoPauloDay(new Date()), 1));

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
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-white/[0.035] text-xs uppercase tracking-[0.16em] text-horebe-gray">
              <tr>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Quantidade</th>
                <th className="px-5 py-4">Valor total</th>
                <th className="px-5 py-4">Canal</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-5 py-4 text-horebe-gray">{formatDate(sale.created_at)}</td>
                  <td className="px-5 py-4 font-semibold text-horebe-soft">{sale.product_name}</td>
                  <td className="px-5 py-4 text-horebe-gray">{sale.quantity}</td>
                  <td className="px-5 py-4 text-horebe-soft">{formatCurrency(sale.total_value) ?? "R$ 0,00"}</td>
                  <td className="px-5 py-4 text-horebe-gray">{sale.sales_channel ?? "Outro"}</td>
                  <td className="px-5 py-4 text-horebe-gray">{sale.customer_name ?? "Não informado"}</td>
                  <td className="px-5 py-4 text-horebe-gray">{sale.notes ?? "Sem observação"}</td>
                </tr>
              ))}
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
