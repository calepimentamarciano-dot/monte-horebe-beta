import { getActiveSales } from "@/lib/sales";
import type { BestSellingProduct, BillingSummary, RevenueByChannel, Sale, SaleItem } from "@/lib/types";

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
  const totalCost = sumCost(sales);
  const grossProfit = sumProfit(sales);
  const totalSales = sales.length;
  const todaySales = filterSalesByRange(sales, todayStart, tomorrowStart);
  const last7DaysSales = filterSalesByRange(sales, last7DaysStart, tomorrowStart);
  const monthSales = filterSalesByRange(sales, monthStart, nextMonthStart);

  return {
    todayRevenue: sumRevenue(todaySales),
    last7DaysRevenue: sumRevenue(last7DaysSales),
    monthRevenue: sumRevenue(monthSales),
    todayProfit: sumProfit(todaySales),
    last7DaysProfit: sumProfit(last7DaysSales),
    monthProfit: sumProfit(monthSales),
    totalCost,
    grossProfit,
    totalSales,
    averageTicket: totalSales ? totalRevenue / totalSales : 0,
    averageMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
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
    getSaleItems(sale).forEach((item) => {
      const key = item.product_id ?? item.product_name;
      const current =
        grouped.get(key) ??
        ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: 0,
          revenue: 0
        } satisfies BestSellingProduct);

      current.quantity += item.quantity;
      current.revenue += toNumber(item.subtotal);
      grouped.set(key, current);
    });
  });

  return [...grouped.values()].sort((a, b) => b.quantity - a.quantity);
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
      unit_cost: null,
      total_cost: sale.total_cost ?? 0,
      gross_profit: sale.gross_profit ?? 0,
      created_at: sale.created_at
    }
  ];
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

function sumCost(sales: Sale[]) {
  return sales.reduce((total, sale) => total + getSaleCost(sale), 0);
}

function sumProfit(sales: Sale[]) {
  return sales.reduce((total, sale) => total + getSaleProfit(sale), 0);
}

function getSaleCost(sale: Sale) {
  if (sale.total_cost !== null && sale.total_cost !== undefined) {
    return toNumber(sale.total_cost);
  }

  return getSaleItems(sale).reduce((total, item) => total + toNumber(item.total_cost), 0);
}

function getSaleProfit(sale: Sale) {
  if (sale.gross_profit !== null && sale.gross_profit !== undefined) {
    return toNumber(sale.gross_profit);
  }

  return getSaleItems(sale).reduce((total, item) => total + toNumber(item.gross_profit), 0);
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
