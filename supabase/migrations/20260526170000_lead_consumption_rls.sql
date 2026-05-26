-- RLS para consumo de chumbo (espelha lead_ball_production)

alter table public.lead_consumption enable row level security;

create policy "lead_consumption_select_authenticated"
  on public.lead_consumption
  for select
  to authenticated
  using (true);

create policy "lead_consumption_insert_operators"
  on public.lead_consumption
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'production_operator', 'warehouse_operator')
    )
  );

create policy "lead_consumption_update_managers"
  on public.lead_consumption
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

create index if not exists idx_lead_consumption_date
  on public.lead_consumption (date desc);

create index if not exists idx_lead_consumption_alloy_id
  on public.lead_consumption (alloy_id);

create index if not exists idx_lead_consumption_destination_sector_id
  on public.lead_consumption (destination_sector_id);
