import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Product, Sale, SaleInput } from "@/lib/types";

const saleFriendlyError = "Não foi possível registrar a venda. Tente novamente.";

export async function getSales(limit = 80): Promise<Sale[]> {
  if (!hasSupabaseServerEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("*")
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
    .select("*")
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
    .select("*")
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
    throw new Error("Supabase não está configurado.");
  }

  try {
    const quantity = toPositiveInteger(input.quantity);
    if (!quantity) {
      throw new Error("Informe uma quantidade válida para a venda.");
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity")
      .eq("id", input.product_id)
      .maybeSingle();

    if (productError) {
      console.error("[sales:createSale:product]", productError);
      throw new Error(saleFriendlyError);
    }

    if (!product) {
      throw new Error("Produto não encontrado.");
    }

    const stockProduct = product as Pick<Product, "id" | "name" | "price" | "stock_quantity">;
    const previousStock = Number(stockProduct.stock_quantity ?? 0);

    if (previousStock < quantity) {
      throw new Error("Estoque insuficiente para esta venda.");
    }

    const unitPrice = normalizeMoney(input.unit_price ?? stockProduct.price ?? null);
    const totalValue = normalizeMoney(input.total_value ?? (unitPrice !== null ? unitPrice * quantity : null));

    if (totalValue === null || totalValue < 0) {
      throw new Error("Informe o valor total da venda.");
    }

    const { data: userData } = await supabase.auth.getUser();
    const createdBy = userData.user?.id ?? null;
    const newStock = previousStock - quantity;

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        product_id: stockProduct.id,
        product_name: stockProduct.name,
        quantity,
        unit_price: unitPrice,
        total_value: totalValue,
        sales_channel: cleanText(input.sales_channel),
        customer_name: cleanText(input.customer_name),
        notes: cleanText(input.notes),
        status: "active",
        created_by: createdBy
      })
      .select("*")
      .single();

    if (saleError || !sale) {
      console.error("[sales:createSale:sale]", saleError);
      throw new Error(saleFriendlyError);
    }

    const { error: stockError } = await supabase
      .from("products")
      .update({ stock_quantity: newStock })
      .eq("id", stockProduct.id);

    if (stockError) {
      console.error("[sales:createSale:stock]", stockError);
      throw new Error("A venda foi criada, mas não foi possível atualizar o estoque.");
    }

    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: stockProduct.id,
      product_name: stockProduct.name,
      type: "venda",
      quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reason: "Venda registrada",
      notes: cleanText(input.notes),
      sale_id: (sale as Sale).id,
      created_by: createdBy
    });

    if (movementError) {
      console.error("[sales:createSale:movement]", movementError);
      throw new Error("A venda foi criada, mas não foi possível registrar a movimentação de estoque.");
    }

    return sale as Sale;
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
    throw new Error("Supabase não está configurado.");
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
      throw new Error(error.message || "Não foi possível cancelar a venda.");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    console.error("[sales:cancelSale:unknown]", error);
    throw new Error("Não foi possível cancelar a venda. Tente novamente.");
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

function cleanText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}
