import { mockCategories } from "@/lib/mock-products";
import { createPublicClient, hasSupabasePublicEnv } from "@/lib/supabase/public";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Category, CategoryMutationInput } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabasePublicEnv()) {
    return mockCategories;
  }

  const supabase = createPublicClient();
  if (!supabase) return mockCategories;

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data?.length) {
      return mockCategories;
    }

    return data as Category[];
  } catch {
    return mockCategories;
  }
}

export async function getAdminCategories(): Promise<Category[]> {
  if (!hasSupabaseServerEnv()) {
    return [];
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Category[];
}

export async function createCategory(data: CategoryMutationInput) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("categories").insert(data);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCategory(id: string, data: CategoryMutationInput) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
