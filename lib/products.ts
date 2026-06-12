import { mockProducts } from "@/lib/mock-products";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const productSelect = `
  *,
  category:categories(id, name, slug)
`;

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseServerEnv()) {
    return mockProducts;
  }

  const supabase = await createClient();
  if (!supabase) return mockProducts;

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return mockProducts;
  }

  return data as Product[];
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((product) => product.is_featured);

  return (featured.length ? featured : products).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseServerEnv()) {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return mockProducts.find((product) => product.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }

  return data as Product;
}
