import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value));
}

export function formatCurrencyBRL(value?: number | string | null) {
  return formatCurrency(toMoneyNumber(value));
}

export function parseMoneyValue(value?: number | string | null) {
  const parsed = toMoneyNumber(value);
  return parsed === null ? null : Math.round(parsed * 100) / 100;
}

export function calculateProfit(salePrice?: number | string | null, costPrice?: number | string | null) {
  const price = toMoneyNumber(salePrice) ?? 0;
  const cost = toMoneyNumber(costPrice) ?? 0;

  return Math.round((price - cost) * 100) / 100;
}

export function calculateMargin(salePrice?: number | string | null, costPrice?: number | string | null) {
  const price = toMoneyNumber(salePrice) ?? 0;
  if (price <= 0) return 0;

  return (calculateProfit(price, costPrice) / price) * 100;
}

export function formatMargin(value?: number | null) {
  const parsed = Number(value ?? 0);

  return `${(Number.isFinite(parsed) ? parsed : 0).toFixed(2).replace(".", ",")}%`;
}

function toMoneyNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getWhatsAppUrl(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const encodedMessage = encodeURIComponent(message);

  if (!number) {
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${number}?text=${encodedMessage}`;
}

export const defaultWhatsAppMessage =
  "Olá! Gostaria de conhecer os cafés especiais da Monte Horebe.";

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
