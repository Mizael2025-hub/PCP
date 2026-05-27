-- RLS para paradas da fundidora de grades (espelha grid_casting_production)

alter table public.grid_casting_downtime enable row level security;

create policy "grid_casting_downtime_select_authenticated"
  on public.grid_casting_downtime
  for select
  to authenticated
  using (true);

create policy "grid_casting_downtime_insert_operators"
  on public.grid_casting_downtime
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
  );

create policy "grid_casting_downtime_update_managers"
  on public.grid_casting_downtime
  for update
  to authenticated
  using (public.get_user_role() in ('admin', 'manager'))
  with check (public.get_user_role() in ('admin', 'manager'));

create index if not exists idx_grid_casting_downtime_production_id
  on public.grid_casting_downtime (production_id);

create index if not exists idx_grid_casting_downtime_start_time
  on public.grid_casting_downtime (start_time desc);
