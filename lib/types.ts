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
  cost_price?: number | null;
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
  stock_quantity?: number;
  min_stock?: number;
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

export type Sale = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  subtotal_value?: number | null;
  discount_percent?: number | null;
  discount_value?: number | null;
  total_value: number;
  total_cost?: number | null;
  gross_profit?: number | null;
  sales_channel: string | null;
  customer_name: string | null;
  notes: string | null;
  created_by: string | null;
  status?: "active" | "canceled";
  canceled_at?: string | null;
  canceled_by?: string | null;
  cancel_reason?: string | null;
  created_at: string;
  items?: SaleItem[];
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  unit_cost?: number | null;
  subtotal: number;
  total_cost?: number | null;
  gross_profit?: number | null;
  created_at?: string;
};

export type SaleItemInput = {
  product_id: string;
  quantity: number;
  unit_price?: number | null;
};

export type SaleInput = {
  items: SaleItemInput[];
  discount_percent?: number | null;
  sales_channel?: string | null;
  customer_name?: string | null;
  notes?: string | null;
};

export type StockMovementType = "entrada" | "saida" | "venda" | "ajuste" | "cancelamento";

export type StockMovement = {
  id: string;
  product_id: string | null;
  product_name: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string | null;
  notes: string | null;
  sale_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type StockMovementInput = {
  product_id: string;
  type: Exclude<StockMovementType, "venda" | "cancelamento">;
  quantity: number;
  reason?: string | null;
  notes?: string | null;
};

export type BillingSummary = {
  todayRevenue: number;
  last7DaysRevenue: number;
  monthRevenue: number;
  todayProfit: number;
  last7DaysProfit: number;
  monthProfit: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalCost: number;
  grossProfit: number;
  totalSales: number;
  averageTicket: number;
  averageMargin: number;
  bestSellingProduct: string | null;
};

export type BestSellingProduct = {
  product_id: string | null;
  product_name: string;
  quantity: number;
  revenue: number;
};

export type RevenueByChannel = {
  channel: string;
  revenue: number;
  salesCount: number;
};
