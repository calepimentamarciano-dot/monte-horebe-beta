export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  gallery: string[] | null;
  category_id: string | null;
  category?: Category | null;
  origin: string | null;
  altitude: string | null;
  variety: string | null;
  roast_level: string | null;
  score_sca: number | null;
  sensory_notes: string[] | null;
  recommended_methods: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at" | "category"> & {
  id?: string;
};

export type ProductMutationInput = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "category"
>;

export type CategoryMutationInput = Pick<Category, "name" | "slug">;
