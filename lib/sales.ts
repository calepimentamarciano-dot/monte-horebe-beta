import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Sale, SaleInput } from "@/lib/types";

const saleFriendlyError = "Nao foi possivel registrar a venda. Tente novamente.";
const saleSelect = "*, items:sale_items(*)";

export async function getSales(limit = 80): Promise<Sale[]> {
  if (!hasSupabaseServerEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select(saleSelect)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[sales:getSales]", error);
    return [];
  }

  return data as Sale[];
}

export async function getActiveSales(limit = 2000): Promise<Sale[]> {
  if (!hasSupabaseServerEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select(saleSelect)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[sales:getActiveSales]", error);
    return [];
  }

  return data as Sale[];
}

export async function getSalesByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
  if (!hasSupabaseServerEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select(saleSelect)
    .gte("created_at", startDate.toISOString())
    .lt("created_at", endDate.toISOString())
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[sales:getSalesByDateRange]", error);
    return [];
  }

  return data as Sale[];
}

export async function createSale(input: SaleInput) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase nao esta configurado.");
  }

  try {
    const items = input.items.map((item) => ({
      product_id: cleanText(item.product_id),
      quantity: toPositiveInteger(item.quantity),
      unit_price: normalizeMoney(item.unit_price ?? null)
    }));

    if (!items.length || items.some((item) => !item.product_id || !item.quantity)) {
      throw new Error("Informe ao menos um produto com quantidade valida para a venda.");
    }

    const discountPercent = normalizePercent(input.discount_percent ?? 0);

    const { data: saleId, error } = await supabase.rpc("create_multi_item_sale", {
      p_items: items,
      p_sales_channel: cleanText(input.sales_channel),
      p_customer_name: cleanText(input.customer_name),
      p_notes: cleanText(input.notes),
      p_discount_percent: discountPercent
    });

    if (error || !saleId) {
      console.error("[sales:createSale:rpc]", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      throw new Error(error?.message || saleFriendlyError);
    }

    return saleId as string;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    console.error("[sales:createSale:unknown]", error);
    throw new Error(saleFriendlyError);
  }
}

export async function cancelSale(saleId: string, reason?: string) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase nao esta configurado.");
  }

  try {
    const { error } = await supabase.rpc("cancel_sale", {
      p_sale_id: saleId,
      p_reason: cleanText(reason)
    });

    if (error) {
      console.error("[sales:cancelSale:rpc]", {
        saleId,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(error.message || "Nao foi possivel cancelar a venda.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    console.error("[sales:cancelSale:unknown]", error);
    throw new Error("Nao foi possivel cancelar a venda. Tente novamente.");
  }
}

function normalizeMoney(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.round(Number(value) * 100) / 100;
}

function toPositiveInteger(value: number) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizePercent(value: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Desconto invalido.");
  }

  if (parsed > 100) {
    throw new Error("O desconto nao pode ser maior que 100%.");
  }

  return Math.round(parsed * 100) / 100;
}

function cleanText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}
