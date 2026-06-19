create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2),
  subtotal numeric(10, 2) not null default 0,
  created_at timestamp with time zone default now()
);

create index if not exists sale_items_sale_id_idx on public.sale_items(sale_id);
create index if not exists sale_items_product_id_idx on public.sale_items(product_id);

alter table public.sale_items enable row level security;

drop policy if exists "Authenticated users can read sale items" on public.sale_items;
create policy "Authenticated users can read sale items"
on public.sale_items for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert sale items" on public.sale_items;
create policy "Authenticated users can insert sale items"
on public.sale_items for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update sale items" on public.sale_items;
create policy "Authenticated users can update sale items"
on public.sale_items for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete sale items" on public.sale_items;
create policy "Authenticated users can delete sale items"
on public.sale_items for delete
to authenticated
using (true);

create or replace function public.create_multi_item_sale(
  p_items jsonb,
  p_sales_channel text default null,
  p_customer_name text default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10, 2);
  v_subtotal numeric(10, 2);
  v_total_value numeric(10, 2) := 0;
  v_total_quantity integer := 0;
  v_item_count integer := 0;
  v_first_product_name text := '';
  v_summary_product_name text := '';
  v_summary_product_id uuid := null;
  v_summary_unit_price numeric(10, 2) := null;
  v_product public.products%rowtype;
  v_previous_stock integer;
  v_new_stock integer;
  v_required record;
begin
  if v_user_id is null then
    raise exception 'Sessão inválida para registrar venda.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Informe ao menos um produto para a venda.';
  end if;

  for v_required in
    select
      (item->>'product_id')::uuid as product_id,
      sum(floor(coalesce(nullif(item->>'quantity', '')::numeric, 0)))::integer as required_quantity
    from jsonb_array_elements(p_items) as item
    group by (item->>'product_id')::uuid
  loop
    if v_required.product_id is null or v_required.required_quantity <= 0 then
      raise exception 'Revise os produtos e quantidades da venda.';
    end if;

    select *
    into v_product
    from public.products
    where id = v_required.product_id
    for update;

    if not found then
      raise exception 'Produto da venda não encontrado.';
    end if;

    if coalesce(v_product.stock_quantity, 0) < v_required.required_quantity then
      raise exception 'Estoque insuficiente para %. Disponível: %, solicitado: %.',
        v_product.name,
        coalesce(v_product.stock_quantity, 0),
        v_required.required_quantity;
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := floor(coalesce(nullif(v_item->>'quantity', '')::numeric, 0))::integer;

    select *
    into v_product
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Produto da venda não encontrado.';
    end if;

    v_unit_price := round(coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.price, 0), 2);
    v_subtotal := round(v_unit_price * v_quantity, 2);

    if v_quantity <= 0 or v_unit_price < 0 then
      raise exception 'Revise os produtos, quantidades e valores da venda.';
    end if;

    v_item_count := v_item_count + 1;
    v_total_quantity := v_total_quantity + v_quantity;
    v_total_value := v_total_value + v_subtotal;

    if v_item_count = 1 then
      v_first_product_name := v_product.name;
      v_summary_product_id := v_product.id;
      v_summary_unit_price := v_unit_price;
    else
      v_summary_product_id := null;
      v_summary_unit_price := null;
    end if;
  end loop;

  if v_item_count = 1 then
    v_summary_product_name := v_first_product_name;
  else
    v_summary_product_name := v_first_product_name || ' + ' || (v_item_count - 1)::text || ' item(ns)';
  end if;

  insert into public.sales (
    product_id,
    product_name,
    quantity,
    unit_price,
    total_value,
    sales_channel,
    customer_name,
    notes,
    status,
    created_by
  )
  values (
    v_summary_product_id,
    v_summary_product_name,
    v_total_quantity,
    v_summary_unit_price,
    v_total_value,
    nullif(trim(p_sales_channel), ''),
    nullif(trim(p_customer_name), ''),
    nullif(trim(p_notes), ''),
    'active',
    v_user_id
  )
  returning id into v_sale_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := floor(coalesce(nullif(v_item->>'quantity', '')::numeric, 0))::integer;

    select *
    into v_product
    from public.products
    where id = v_product_id
    for update;

    v_unit_price := round(coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.price, 0), 2);
    v_subtotal := round(v_unit_price * v_quantity, 2);
    v_previous_stock := coalesce(v_product.stock_quantity, 0);
    v_new_stock := v_previous_stock - v_quantity;

    update public.products
    set stock_quantity = v_new_stock
    where id = v_product.id;

    insert into public.sale_items (
      sale_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    )
    values (
      v_sale_id,
      v_product.id,
      v_product.name,
      v_quantity,
      v_unit_price,
      v_subtotal
    );

    insert into public.stock_movements (
      product_id,
      product_name,
      type,
      quantity,
      previous_stock,
      new_stock,
      reason,
      notes,
      sale_id,
      created_by
    )
    values (
      v_product.id,
      v_product.name,
      'venda',
      v_quantity,
      v_previous_stock,
      v_new_stock,
      'Venda registrada',
      nullif(trim(p_notes), ''),
      v_sale_id,
      v_user_id
    );
  end loop;

  return v_sale_id;
end;
$$;

grant execute on function public.create_multi_item_sale(jsonb, text, text, text) to authenticated;

create or replace function public.cancel_sale(
  p_sale_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale public.sales%rowtype;
  v_product public.products%rowtype;
  v_item public.sale_items%rowtype;
  v_item_count integer := 0;
  v_previous_stock integer := 0;
  v_new_stock integer := 0;
  v_user_id uuid := auth.uid();
  v_notes text := coalesce(nullif(trim(p_reason), ''), 'Venda cancelada');
begin
  select *
  into v_sale
  from public.sales
  where id = p_sale_id
  for update;

  if not found then
    raise exception 'Venda não encontrada.';
  end if;

  if v_sale.status = 'canceled' then
    raise exception 'Esta venda já foi cancelada.';
  end if;

  select count(*)
  into v_item_count
  from public.sale_items
  where sale_id = v_sale.id;

  if v_item_count > 0 then
    for v_item in
      select *
      from public.sale_items
      where sale_id = v_sale.id
      order by created_at, id
    loop
      if v_item.product_id is not null then
        select *
        into v_product
        from public.products
        where id = v_item.product_id
        for update;

        if not found then
          raise exception 'Produto da venda não encontrado para devolução de estoque.';
        end if;

        v_previous_stock := coalesce(v_product.stock_quantity, 0);
        v_new_stock := v_previous_stock + v_item.quantity;

        update public.products
        set stock_quantity = v_new_stock
        where id = v_product.id;

        insert into public.stock_movements (
          product_id,
          product_name,
          type,
          quantity,
          previous_stock,
          new_stock,
          reason,
          notes,
          sale_id,
          created_by
        )
        values (
          v_product.id,
          coalesce(v_product.name, v_item.product_name),
          'cancelamento',
          v_item.quantity,
          v_previous_stock,
          v_new_stock,
          'Cancelamento de venda',
          v_notes,
          v_sale.id,
          v_user_id
        );
      end if;
    end loop;
  elsif v_sale.product_id is not null then
    select *
    into v_product
    from public.products
    where id = v_sale.product_id
    for update;

    if not found then
      raise exception 'Produto da venda não encontrado para devolução de estoque.';
    end if;

    v_previous_stock := coalesce(v_product.stock_quantity, 0);
    v_new_stock := v_previous_stock + v_sale.quantity;

    update public.products
    set stock_quantity = v_new_stock
    where id = v_product.id;

    insert into public.stock_movements (
      product_id,
      product_name,
      type,
      quantity,
      previous_stock,
      new_stock,
      reason,
      notes,
      sale_id,
      created_by
    )
    values (
      v_product.id,
      coalesce(v_product.name, v_sale.product_name),
      'cancelamento',
      v_sale.quantity,
      v_previous_stock,
      v_new_stock,
      'Cancelamento de venda',
      v_notes,
      v_sale.id,
      v_user_id
    );
  end if;

  update public.sales
  set
    status = 'canceled',
    canceled_at = now(),
    canceled_by = v_user_id,
    cancel_reason = nullif(trim(p_reason), '')
  where id = v_sale.id;
end;
$$;

grant execute on function public.cancel_sale(uuid, text) to authenticated;
