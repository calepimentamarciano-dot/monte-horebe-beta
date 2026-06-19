alter table public.sales
add column if not exists status text default 'active';

alter table public.sales
add column if not exists canceled_at timestamp with time zone;

alter table public.sales
add column if not exists canceled_by uuid references auth.users(id);

alter table public.sales
add column if not exists cancel_reason text;

update public.sales
set status = 'active'
where status is null;

alter table public.sales
alter column status set default 'active';

alter table public.sales
alter column status set not null;

alter table public.sales
drop constraint if exists sales_status_check;

alter table public.sales
add constraint sales_status_check
check (status in ('active', 'canceled'));

create index if not exists sales_status_idx on public.sales(status);

drop policy if exists "Authenticated users can update sales" on public.sales;
create policy "Authenticated users can update sales"
on public.sales for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can insert stock movements" on public.stock_movements;
create policy "Authenticated users can insert stock movements"
on public.stock_movements for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
on public.products for update
to authenticated
using (true)
with check (true);

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

  if v_sale.product_id is not null then
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
