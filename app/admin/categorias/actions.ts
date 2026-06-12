"use server";

import { revalidatePath } from "next/cache";
import { createCategory, deleteCategory, updateCategory } from "@/lib/categories";
import { slugify } from "@/lib/slugify";

export type CategoryActionState = {
  error?: string;
  success?: string;
};

export async function saveCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  try {
    const id = getString(formData, "id");
    const name = getString(formData, "name");
    const slug = slugify(getString(formData, "slug") || name);

    if (id) {
      await updateCategory(id, { name, slug });
    } else {
      await createCategory({ name, slug });
    }

    revalidateCategoryPaths();
    return { success: id ? "Categoria atualizada." : "Categoria criada." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar a categoria." };
  }
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);
  revalidateCategoryPaths();
}

function revalidateCategoryPaths() {
  revalidatePath("/catalogo");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/categorias");
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
