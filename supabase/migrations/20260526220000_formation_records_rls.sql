-- RLS para formação (formation_records e formation_details)

alter table public.formation_records enable row level security;
alter table public.formation_details enable row level security;

create policy "formation_records_select_authenticated"
  on public.formation_records
  for select
  to authenticated
  using (true);

create policy "formation_records_insert_operators"
  on public.formation_records
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'production_operator', 'lab_technician')
    )
  );

create policy "formation_records_update_managers"
  on public.formation_records
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'lab_technician')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'lab_technician')
    )
  );

create policy "formation_details_select_authenticated"
  on public.formation_details
  for select
  to authenticated
  using (true);

create policy "formation_details_insert_operators"
  on public.formation_details
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'production_operator', 'lab_technician')
    )
  );

create policy "formation_details_update_managers"
  on public.formation_details
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'lab_technician')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'lab_technician')
    )
  );

create policy "formation_details_delete_managers"
  on public.formation_details
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'manager', 'lab_technician')
    )
  );

create index if not exists idx_formation_records_start_date
  on public.formation_records (start_date desc);

create index if not exists idx_formation_records_status
  on public.formation_records (status);

create index if not exists idx_formation_records_operator_id
  on public.formation_records (operator_id);

create index if not exists idx_formation_details_formation_id
  on public.formation_details (formation_id);
