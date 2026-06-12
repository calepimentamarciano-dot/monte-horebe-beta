import { mockCategories } from "@/lib/mock-products";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  if (!hasSupabaseServerEnv()) {
    return mockCategories;
  }

  const supabase = await createClient();
  if (!supabase) return mockCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error || !data?.length) {
    return mockCategories;
  }

  return data as Category[];
}
