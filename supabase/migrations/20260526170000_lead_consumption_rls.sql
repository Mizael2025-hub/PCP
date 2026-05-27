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
    public.get_user_role() in ('admin', 'manager', 'production_operator', 'warehouse_operator')
  );

create policy "lead_consumption_update_managers"
  on public.lead_consumption
  for update
  to authenticated
  using (public.get_user_role() in ('admin', 'manager'))
  with check (public.get_user_role() in ('admin', 'manager'));

create index if not exists idx_lead_consumption_date
  on public.lead_consumption (date desc);

create index if not exists idx_lead_consumption_alloy_id
  on public.lead_consumption (alloy_id);

create index if not exists idx_lead_consumption_destination_sector_id
  on public.lead_consumption (destination_sector_id);
