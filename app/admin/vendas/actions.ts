"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cancelSale, createSale } from "@/lib/sales";

export type SaleActionState = {
  error?: string;
  success?: string;
};

export async function createSaleAction(
  _previousState: SaleActionState,
  formData: FormData
): Promise<SaleActionState> {
  try {
    await createSale({
      items: getSaleItems(formData),
      discount_percent: getDiscountPercent(formData),
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

export async function cancelSaleAction(
  _previousState: SaleActionState,
  formData: FormData
): Promise<SaleActionState> {
  try {
    await cancelSale(getString(formData, "sale_id"), getString(formData, "cancel_reason"));
    revalidateSalesPaths();
  } catch (error) {
    console.error("[actions:cancelSaleAction]", error);
    const message = error instanceof Error ? error.message : "Não foi possível cancelar a venda.";
    return { error: `Erro ao cancelar venda: ${message}` };
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

function getSaleItems(formData: FormData) {
  const productIds = getAllStrings(formData, "product_id");
  const quantities = getAllStrings(formData, "quantity");
  const unitPrices = getAllStrings(formData, "unit_price");

  return productIds
    .map((productId, index) => ({
      product_id: productId,
      quantity: toInteger(quantities[index]),
      unit_price: toOptionalNumber(unitPrices[index])
    }))
    .filter((item) => item.product_id);
}

function getAllStrings(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

function toInteger(value?: string) {
  const parsed = Math.floor(Number((value ?? "").replace(",", ".")));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOptionalNumber(value?: string) {
  const normalizedValue = (value ?? "").replace(",", ".");
  if (!normalizedValue) return null;

  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDiscountPercent(formData: FormData) {
  const parsed = toOptionalNumber(getString(formData, "discount_percent")) ?? 0;

  if (parsed < 0) {
    throw new Error("Desconto invalido.");
  }

  if (parsed > 100) {
    throw new Error("O desconto nao pode ser maior que 100%.");
  }

  return parsed;
}
