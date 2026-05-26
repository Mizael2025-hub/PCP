-- RLS para produção de montagem (assembly_production)

alter table public.assembly_production enable row level security;

create policy "assembly_production_select_authenticated"
  on public.assembly_production
  for select
  to authenticated
  using (true);

create policy "assembly_production_insert_operators"
  on public.assembly_production
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

create policy "assembly_production_update_managers"
  on public.assembly_production
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

create index if not exists idx_assembly_production_date
  on public.assembly_production (date desc);

create index if not exists idx_assembly_production_battery_lot_code
  on public.assembly_production (battery_lot_code);

create index if not exists idx_assembly_production_shift_id
  on public.assembly_production (shift_id);

create index if not exists idx_assembly_production_pasting_id
  on public.assembly_production (pasting_production_id);

create index if not exists idx_assembly_production_characteristics
  on public.assembly_production using gin (lot_characteristics);
