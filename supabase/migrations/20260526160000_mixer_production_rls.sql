-- RLS para produção do misturador (espelha lead_ball_production)

alter table public.mixer_production enable row level security;

create policy "mixer_production_select_authenticated"
  on public.mixer_production
  for select
  to authenticated
  using (true);

create policy "mixer_production_insert_operators"
  on public.mixer_production
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

create policy "mixer_production_update_managers"
  on public.mixer_production
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

create index if not exists idx_mixer_production_date
  on public.mixer_production (date desc);

create index if not exists idx_mixer_production_batch_number
  on public.mixer_production (batch_number);

create index if not exists idx_mixer_production_shift_id
  on public.mixer_production (shift_id);
