alter table public.products
add column if not exists stock_quantity integer not null default 0;

alter table public.products
add column if not exists min_stock integer not null default 0;

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  unit_price numeric,
  total_value numeric not null,
  sales_channel text,
  customer_name text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  type text not null,
  quantity integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  reason text,
  notes text,
  sale_id uuid references public.sales(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

create index if not exists sales_created_at_idx on public.sales(created_at);
create index if not exists sales_product_id_idx on public.sales(product_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements(created_at);
create index if not exists stock_movements_product_id_idx on public.stock_movements(product_id);

alter table public.sales enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "Authenticated users can view sales" on public.sales;
create policy "Authenticated users can view sales"
on public.sales for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert sales" on public.sales;
create policy "Authenticated users can insert sales"
on public.sales for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update sales" on public.sales;
create policy "Authenticated users can update sales"
on public.sales for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete sales" on public.sales;
create policy "Authenticated users can delete sales"
on public.sales for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can view stock movements" on public.stock_movements;
create policy "Authenticated users can view stock movements"
on public.stock_movements for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert stock movements" on public.stock_movements;
create policy "Authenticated users can insert stock movements"
on public.stock_movements for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update stock movements" on public.stock_movements;
create policy "Authenticated users can update stock movements"
on public.stock_movements for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete stock movements" on public.stock_movements;
create policy "Authenticated users can delete stock movements"
on public.stock_movements for delete
to authenticated
using (true);

drop policy if exists "Authenticated users can update product stock" on public.products;
create policy "Authenticated users can update product stock"
on public.products for update
to authenticated
using (true)
with check (true);
