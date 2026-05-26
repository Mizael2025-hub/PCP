-- RLS para produção da empastadeira (pasting_production)

alter table public.pasting_production enable row level security;

create policy "pasting_production_select_authenticated"
  on public.pasting_production
  for select
  to authenticated
  using (true);

create policy "pasting_production_insert_operators"
  on public.pasting_production
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

create policy "pasting_production_update_managers"
  on public.pasting_production
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

create index if not exists idx_pasting_production_date
  on public.pasting_production (date desc);

create index if not exists idx_pasting_production_ep_code
  on public.pasting_production (ep_code);

create index if not exists idx_pasting_production_shift_id
  on public.pasting_production (shift_id);

create index if not exists idx_pasting_production_battery_model_id
  on public.pasting_production (battery_model_id);
