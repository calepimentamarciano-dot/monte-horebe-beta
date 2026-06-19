"use server";

import { revalidatePath } from "next/cache";
import { adjustStock, updateProductStock } from "@/lib/stock";
import type { StockMovementType } from "@/lib/types";

export type StockActionState = {
  error?: string;
  success?: string;
};

export async function updateStockAction(
  _previousState: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  try {
    await updateProductStock(
      getString(formData, "product_id"),
      getInteger(formData, "stock_quantity"),
      getInteger(formData, "min_stock")
    );

    revalidateStockPaths();
    return { success: "Estoque atualizado com sucesso." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível atualizar o estoque." };
  }
}

export async function createStockMovementAction(
  _previousState: StockActionState,
  formData: FormData
): Promise<StockActionState> {
  try {
    await adjustStock({
      product_id: getString(formData, "product_id"),
      type: getMovementType(formData),
      quantity: getInteger(formData, "quantity"),
      reason: getString(formData, "reason") || null,
      notes: getString(formData, "notes") || null
    });

    revalidateStockPaths();
    return { success: "Movimentação registrada com sucesso." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível registrar a movimentação." };
  }
}

function revalidateStockPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/estoque");
  revalidatePath("/admin/vendas/nova");
  revalidatePath("/admin/faturamento");
  revalidatePath("/catalogo");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getInteger(formData: FormData, key: string) {
  const parsed = Math.floor(Number(getString(formData, key).replace(",", ".")));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getMovementType(formData: FormData): Exclude<StockMovementType, "venda"> {
  const type = getString(formData, "type");

  if (type === "entrada" || type === "saida" || type === "ajuste") {
    return type;
  }

  return "entrada";
}
