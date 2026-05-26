-- RLS para refugo de lixação (sanding_scrap)

alter table public.sanding_scrap enable row level security;

create policy "sanding_scrap_select_authenticated"
  on public.sanding_scrap
  for select
  to authenticated
  using (true);

create policy "sanding_scrap_insert_operators"
  on public.sanding_scrap
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'production_operator')
    )
  );

create policy "sanding_scrap_update_managers"
  on public.sanding_scrap
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager')
    )
  );

create index if not exists idx_sanding_scrap_date
  on public.sanding_scrap (date desc);

create index if not exists idx_sanding_scrap_operator_id
  on public.sanding_scrap (operator_id);
