alter table public.sales
add column if not exists subtotal_value numeric default 0;

alter table public.sales
add column if not exists discount_percent numeric default 0;

alter table public.sales
add column if not exists discount_value numeric default 0;

update public.sales
set
  subtotal_value = coalesce(nullif(subtotal_value, 0), total_value, 0),
  discount_percent = coalesce(discount_percent, 0),
  discount_value = coalesce(discount_value, 0),
  total_cost = coalesce(total_cost, 0),
  gross_profit = coalesce(gross_profit, coalesce(total_value, 0) - coalesce(total_cost, 0));

drop function if exists public.create_multi_item_sale(jsonb, text, text, text);

create or replace function public.create_multi_item_sale(
  p_items jsonb,
  p_sales_channel text default null,
  p_customer_name text default null,
  p_notes text default null,
  p_discount_percent numeric default 0
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
  v_unit_cost numeric(10, 2);
  v_subtotal numeric(10, 2);
  v_item_total_cost numeric(10, 2);
  v_item_gross_profit numeric(10, 2);
  v_subtotal_value numeric(10, 2) := 0;
  v_discount_percent numeric(6, 2) := 0;
  v_discount_value numeric(10, 2) := 0;
  v_total_value numeric(10, 2) := 0;
  v_total_cost numeric(10, 2) := 0;
  v_gross_profit numeric(10, 2) := 0;
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
    raise exception 'Sessao invalida para registrar venda.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Informe ao menos um produto para a venda.';
  end if;

  v_discount_percent := round(coalesce(p_discount_percent, 0), 2);

  if v_discount_percent < 0 then
    raise exception 'Desconto invalido.';
  end if;

  if v_discount_percent > 100 then
    raise exception 'O desconto nao pode ser maior que 100%%.';
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
      raise exception 'Produto da venda nao encontrado.';
    end if;

    if coalesce(v_product.stock_quantity, 0) < v_required.required_quantity then
      raise exception 'Estoque insuficiente para %. Disponivel: %, solicitado: %.',
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
      raise exception 'Produto da venda nao encontrado.';
    end if;

    v_unit_price := round(coalesce(nullif(v_item->>'unit_price', '')::numeric, v_product.price, 0), 2);
    v_unit_cost := round(coalesce(v_product.cost_price, 0), 2);
    v_subtotal := round(v_unit_price * v_quantity, 2);
    v_item_total_cost := round(v_unit_cost * v_quantity, 2);
    v_item_gross_profit := round(v_subtotal - v_item_total_cost, 2);

    if v_quantity <= 0 or v_unit_price < 0 or v_unit_cost < 0 then
      raise exception 'Revise os produtos, quantidades e valores da venda.';
    end if;

    v_item_count := v_item_count + 1;
    v_total_quantity := v_total_quantity + v_quantity;
    v_subtotal_value := v_subtotal_value + v_subtotal;
    v_total_cost := v_total_cost + v_item_total_cost;

    if v_item_count = 1 then
      v_first_product_name := v_product.name;
      v_summary_product_id := v_product.id;
      v_summary_unit_price := v_unit_price;
    else
      v_summary_product_id := null;
      v_summary_unit_price := null;
    end if;
  end loop;

  v_discount_value := round(v_subtotal_value * v_discount_percent / 100, 2);
  v_total_value := greatest(round(v_subtotal_value - v_discount_value, 2), 0);
  v_gross_profit := round(v_total_value - v_total_cost, 2);

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
    subtotal_value,
    discount_percent,
    discount_value,
    total_value,
    total_cost,
    gross_profit,
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
    v_subtotal_value,
    v_discount_percent,
    v_discount_value,
    v_total_value,
    v_total_cost,
    v_gross_profit,
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
    v_unit_cost := round(coalesce(v_product.cost_price, 0), 2);
    v_subtotal := round(v_unit_price * v_quantity, 2);
    v_item_total_cost := round(v_unit_cost * v_quantity, 2);
    v_item_gross_profit := round(v_subtotal - v_item_total_cost, 2);
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
      unit_cost,
      subtotal,
      total_cost,
      gross_profit
    )
    values (
      v_sale_id,
      v_product.id,
      v_product.name,
      v_quantity,
      v_unit_price,
      v_unit_cost,
      v_subtotal,
      v_item_total_cost,
      v_item_gross_profit
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

grant execute on function public.create_multi_item_sale(jsonb, text, text, text, numeric) to authenticated;
