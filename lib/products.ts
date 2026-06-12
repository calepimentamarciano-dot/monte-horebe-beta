import { mockProducts } from "@/lib/mock-products";
import { createPublicClient, hasSupabasePublicEnv } from "@/lib/supabase/public";
import { createClient, hasSupabaseServerEnv } from "@/lib/supabase/server";
import type { Product, ProductMutationInput } from "@/lib/types";

const productSelect = `
  *,
  category:categories(id, name, slug)
`;

export async function getProducts(): Promise<Product[]> {
  return getActiveProducts();
}

export async function getActiveProducts(): Promise<Product[]> {
  if (!hasSupabasePublicEnv()) {
    return mockProducts;
  }

  const supabase = createPublicClient();
  if (!supabase) return mockProducts;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return mockProducts;
    }

    return data as Product[];
  } catch {
    return mockProducts;
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  if (!hasSupabaseServerEnv()) {
    return [];
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as Product[];
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const products = await getProducts();
  const featured = products.filter((product) => product.is_featured);

  return (featured.length ? featured : products).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const fallback = mockProducts.find((product) => product.slug === slug) ?? null;

  if (!hasSupabasePublicEnv()) {
    return fallback;
  }

  const supabase = createPublicClient();
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(productSelect)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return fallback;
    }

    return data as Product;
  } catch {
    return fallback;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!hasSupabaseServerEnv()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

export async function createProduct(data: ProductMutationInput) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("products").insert(data);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProduct(id: string, data: ProductMutationInput) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleProductActive(id: string, value: boolean) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("products").update({ is_active: value }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleProductFeatured(id: string, value: boolean) {
  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("products").update({ is_featured: value }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
