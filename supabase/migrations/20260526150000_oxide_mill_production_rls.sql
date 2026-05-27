-- RLS para produção do moinho de óxido (espelha lead_ball_production)

alter table public.oxide_mill_production enable row level security;

create policy "oxide_mill_production_select_authenticated"
  on public.oxide_mill_production
  for select
  to authenticated
  using (true);

create policy "oxide_mill_production_insert_operators"
  on public.oxide_mill_production
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
  );

create policy "oxide_mill_production_update_managers"
  on public.oxide_mill_production
  for update
  to authenticated
  using (public.get_user_role() in ('admin', 'manager'))
  with check (public.get_user_role() in ('admin', 'manager'));

create index if not exists idx_oxide_mill_production_date
  on public.oxide_mill_production (date desc);

create index if not exists idx_oxide_mill_production_shift_id
  on public.oxide_mill_production (shift_id);
