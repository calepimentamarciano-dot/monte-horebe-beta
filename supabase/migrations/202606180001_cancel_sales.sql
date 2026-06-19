alter table public.sales
add column if not exists status text not null default 'active';

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
drop constraint if exists sales_status_check;

alter table public.sales
add constraint sales_status_check
check (status in ('active', 'canceled'));

create index if not exists sales_status_idx on public.sales(status);
