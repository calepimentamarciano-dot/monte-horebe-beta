"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSale } from "@/lib/sales";

export type SaleActionState = {
  error?: string;
};

export async function createSaleAction(
  _previousState: SaleActionState,
  formData: FormData
): Promise<SaleActionState> {
  try {
    await createSale({
      product_id: getString(formData, "product_id"),
      quantity: getInteger(formData, "quantity"),
      unit_price: getOptionalNumber(formData, "unit_price"),
      total_value: getOptionalNumber(formData, "total_value"),
      sales_channel: getString(formData, "sales_channel") || null,
      customer_name: getString(formData, "customer_name") || null,
      notes: getString(formData, "notes") || null
    });

    revalidateSalesPaths();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível registrar a venda." };
  }

  redirect("/admin/vendas");
}

function revalidateSalesPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/vendas");
  revalidatePath("/admin/vendas/nova");
  revalidatePath("/admin/estoque");
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

function getOptionalNumber(formData: FormData, key: string) {
  const value = getString(formData, key).replace(",", ".");
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
