"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/slugify";
import { createProduct, deleteProduct, toggleProductActive, toggleProductFeatured, updateProduct } from "@/lib/products";
import { uploadProductImage } from "@/lib/storage";
import type { ProductMutationInput } from "@/lib/types";

export type ProductActionState = {
  error?: string;
};

export async function saveProductAction(
  _previousState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  try {
    const id = getString(formData, "id");
    const name = getString(formData, "name");
    const slug = slugify(getString(formData, "slug") || name);
    const imageFile = formData.get("image");
    let imageUrl = getString(formData, "image_url") || null;

    if (imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadProductImage(imageFile);
    }

    const payload: ProductMutationInput = {
      name,
      slug,
      short_description: getString(formData, "short_description") || null,
      description: getString(formData, "description") || null,
      price: getNonNegativeOptionalNumber(formData, "price", "O preço de venda não pode ser negativo."),
      cost_price: getNonNegativeNumber(formData, "cost_price", "O preço de custo não pode ser negativo."),
      image_url: imageUrl,
      gallery: null,
      category_id: getString(formData, "category_id") || null,
      origin: getString(formData, "origin") || null,
      altitude: getString(formData, "altitude") || null,
      variety: getString(formData, "variety") || null,
      roast_level: getString(formData, "roast_level") || null,
      score_sca: getNumber(formData, "score_sca"),
      sensory_notes: splitList(getString(formData, "sensory_notes")),
      recommended_methods: splitList(getString(formData, "recommended_methods")),
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on"
    };

    if (id) {
      await updateProduct(id, payload);
    } else {
      await createProduct(payload);
    }

    revalidateProductPaths();
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar o produto." };
  }

  redirect("/admin/produtos");
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidateProductPaths();
}

export async function toggleProductActiveAction(id: string, value: boolean) {
  await toggleProductActive(id, value);
  revalidateProductPaths();
}

export async function toggleProductFeaturedAction(id: string, value: boolean) {
  await toggleProductFeatured(id, value);
  revalidateProductPaths();
}

function revalidateProductPaths() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/vendas/nova");
  revalidatePath("/sitemap.xml");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = getString(formData, key).replace(",", ".");
  return value ? Number(value) : null;
}

function getNonNegativeNumber(formData: FormData, key: string, errorMessage: string) {
  const value = getString(formData, key).replace(",", ".");
  if (!value) return 0;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(errorMessage);
  }

  return Math.round(parsed * 100) / 100;
}

function getNonNegativeOptionalNumber(formData: FormData, key: string, errorMessage: string) {
  const value = getString(formData, key).replace(",", ".");
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(errorMessage);
  }

  return Math.round(parsed * 100) / 100;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
