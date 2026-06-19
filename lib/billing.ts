import { getActiveSales } from "@/lib/sales";
import type { BestSellingProduct, BillingSummary, RevenueByChannel, Sale } from "@/lib/types";

const dayInMs = 24 * 60 * 60 * 1000;
const channels = ["WhatsApp", "Instagram", "Loja física", "Revendedor", "Outro"];

export async function getBillingSummary(): Promise<BillingSummary> {
  const sales = await getActiveSales(2000);
  const now = new Date();
  const todayStart = startOfSaoPauloDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const last7DaysStart = addDays(todayStart, -6);
  const monthStart = startOfSaoPauloMonth(now);
  const nextMonthStart = nextSaoPauloMonth(now);
  const bestSellingProducts = groupSalesByProduct(sales);

  const totalRevenue = sumRevenue(sales);
  const totalSales = sales.length;

  return {
    todayRevenue: sumRevenue(filterSalesByRange(sales, todayStart, tomorrowStart)),
    last7DaysRevenue: sumRevenue(filterSalesByRange(sales, last7DaysStart, tomorrowStart)),
    monthRevenue: sumRevenue(filterSalesByRange(sales, monthStart, nextMonthStart)),
    totalSales,
    averageTicket: totalSales ? totalRevenue / totalSales : 0,
    bestSellingProduct: bestSellingProducts[0]?.product_name ?? null
  };
}

export async function getBestSellingProducts(): Promise<BestSellingProduct[]> {
  return groupSalesByProduct(await getActiveSales(2000));
}

export async function getRevenueByChannel(): Promise<RevenueByChannel[]> {
  const grouped = new Map<string, RevenueByChannel>();

  channels.forEach((channel) => {
    grouped.set(channel, { channel, revenue: 0, salesCount: 0 });
  });

  (await getActiveSales(2000)).forEach((sale) => {
    const channel = sale.sales_channel?.trim() || "Outro";
    const item = grouped.get(channel) ?? { channel, revenue: 0, salesCount: 0 };

    item.revenue += toNumber(sale.total_value);
    item.salesCount += 1;
    grouped.set(channel, item);
  });

  return [...grouped.values()].sort((a, b) => b.revenue - a.revenue);
}

export async function getRecentSales(limit = 10): Promise<Sale[]> {
  return getActiveSales(limit);
}

function groupSalesByProduct(sales: Sale[]): BestSellingProduct[] {
  const grouped = new Map<string, BestSellingProduct>();

  sales.forEach((sale) => {
    const key = sale.product_id ?? sale.product_name;
    const current =
      grouped.get(key) ??
      ({
        product_id: sale.product_id,
        product_name: sale.product_name,
        quantity: 0,
        revenue: 0
      } satisfies BestSellingProduct);

    current.quantity += sale.quantity;
    current.revenue += toNumber(sale.total_value);
    grouped.set(key, current);
  });

  return [...grouped.values()].sort((a, b) => b.quantity - a.quantity);
}

function filterSalesByRange(sales: Sale[], startDate: Date, endDate: Date) {
  return sales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    return saleDate >= startDate && saleDate < endDate;
  });
}

function sumRevenue(sales: Sale[]) {
  return sales.reduce((total, sale) => total + toNumber(sale.total_value), 0);
}

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function startOfSaoPauloDay(date: Date) {
  const parts = getSaoPauloParts(date);
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 3));
}

function startOfSaoPauloMonth(date: Date) {
  const parts = getSaoPauloParts(date);
  return new Date(Date.UTC(parts.year, parts.month - 1, 1, 3));
}

function nextSaoPauloMonth(date: Date) {
  const parts = getSaoPauloParts(date);
  return new Date(Date.UTC(parts.year, parts.month, 1, 3));
}

function getSaoPauloParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day)
  };
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * dayInMs);
}
