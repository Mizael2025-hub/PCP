-- RLS para produção de bola de chumbo (espelha grid_casting_production)

alter table public.lead_ball_production enable row level security;

create policy "lead_ball_production_select_authenticated"
  on public.lead_ball_production
  for select
  to authenticated
  using (true);

create policy "lead_ball_production_insert_operators"
  on public.lead_ball_production
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

create policy "lead_ball_production_update_managers"
  on public.lead_ball_production
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

create index if not exists idx_lead_ball_production_date
  on public.lead_ball_production (date desc);

create index if not exists idx_lead_ball_production_silo_number
  on public.lead_ball_production (silo_number);
