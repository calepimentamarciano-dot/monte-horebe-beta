import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Product, StockMovement, StockMovementInput, StockMovementType } from "@/lib/types";

const stockProductSelect = `
  *,
  category:categories(id, name, slug)
`;

export async function getStockProducts(): Promise<Product[]> {
  if (!hasSupabaseServerEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("products").select(stockProductSelect).order("name");

  if (error || !data) {
    console.error("[stock:getStockProducts]", error);
    return [];
  }

  return data as Product[];
}

export async function updateProductStock(productId: string, quantity: number, minStock: number) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const stockQuantity = toNonNegativeInteger(quantity, "Informe um estoque atual válido.");
  const minimumStock = toNonNegativeInteger(minStock, "Informe um estoque mínimo válido.");

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, stock_quantity")
    .eq("id", productId)
    .maybeSingle();

  if (productError) {
    console.error("[stock:updateProductStock:product]", productError);
    throw new Error("Não foi possível localizar o produto.");
  }

  if (!product) {
    throw new Error("Produto não encontrado.");
  }

  const currentProduct = product as Pick<Product, "id" | "name" | "stock_quantity">;
  const previousStock = Number(currentProduct.stock_quantity ?? 0);

  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: stockQuantity, min_stock: minimumStock })
    .eq("id", productId);

  if (error) {
    console.error("[stock:updateProductStock:update]", error);
    throw new Error("Não foi possível atualizar o estoque.");
  }

  if (previousStock !== stockQuantity) {
    const { data: userData } = await supabase.auth.getUser();
    await createStockMovement({
      product_id: currentProduct.id,
      product_name: currentProduct.name,
      type: "ajuste",
      quantity: stockQuantity,
      previous_stock: previousStock,
      new_stock: stockQuantity,
      reason: "Atualização direta do estoque",
      notes: `Estoque mínimo definido como ${minimumStock}.`,
      sale_id: null,
      created_by: userData.user?.id ?? null
    });
  }
}

export async function createStockMovement(data: Omit<StockMovement, "id" | "created_at">) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("stock_movements").insert(data);

  if (error) {
    console.error("[stock:createStockMovement]", error);
    throw new Error("Não foi possível registrar a movimentação de estoque.");
  }
}

export async function adjustStock(input: StockMovementInput) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const quantity = toNonNegativeInteger(input.quantity, "Informe uma quantidade válida.");
  if (quantity === 0) {
    throw new Error("Informe uma quantidade maior que zero.");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, stock_quantity")
    .eq("id", input.product_id)
    .maybeSingle();

  if (productError) {
    console.error("[stock:adjustStock:product]", productError);
    throw new Error("Não foi possível localizar o produto.");
  }

  if (!product) {
    throw new Error("Produto não encontrado.");
  }

  const stockProduct = product as Pick<Product, "id" | "name" | "stock_quantity">;
  const previousStock = Number(stockProduct.stock_quantity ?? 0);
  const newStock = calculateNewStock(input.type, previousStock, quantity);

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock_quantity: newStock })
    .eq("id", stockProduct.id);

  if (updateError) {
    console.error("[stock:adjustStock:update]", updateError);
    throw new Error("Não foi possível atualizar o estoque.");
  }

  const { data: userData } = await supabase.auth.getUser();

  await createStockMovement({
    product_id: stockProduct.id,
    product_name: stockProduct.name,
    type: input.type,
    quantity,
    previous_stock: previousStock,
    new_stock: newStock,
    reason: cleanText(input.reason) ?? movementLabel(input.type),
    notes: cleanText(input.notes),
    sale_id: null,
    created_by: userData.user?.id ?? null
  });
}

export async function getStockMovements(limit = 80): Promise<StockMovement[]> {
  if (!hasSupabaseServerEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("[stock:getStockMovements]", error);
    return [];
  }

  return data as StockMovement[];
}

function calculateNewStock(
  type: Exclude<StockMovementType, "venda" | "cancelamento">,
  previousStock: number,
  quantity: number
) {
  if (type === "entrada") {
    return previousStock + quantity;
  }

  if (type === "saida") {
    const nextStock = previousStock - quantity;
    if (nextStock < 0) {
      throw new Error("Estoque insuficiente para esta saída.");
    }

    return nextStock;
  }

  if (type === "ajuste") {
    return quantity;
  }

  throw new Error("Tipo de movimentação inválido.");
}

function toNonNegativeInteger(value: number, message: string) {
  const parsed = Math.floor(Number(value));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(message);
  }

  return parsed;
}

function movementLabel(type: StockMovementType) {
  const labels: Record<StockMovementType, string> = {
    entrada: "Entrada manual",
    saida: "Saída manual",
    venda: "Venda registrada",
    ajuste: "Ajuste manual",
    cancelamento: "Cancelamento de venda"
  };

  return labels[type];
}

function cleanText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}
