-- RLS para controle de qualidade laboratorial (lab_quality_control)

alter table public.lab_quality_control enable row level security;

create policy "lab_quality_control_select_authenticated"
  on public.lab_quality_control
  for select
  to authenticated
  using (true);

create policy "lab_quality_control_insert_technicians"
  on public.lab_quality_control
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'lab_technician')
  );

create policy "lab_quality_control_update_technicians"
  on public.lab_quality_control
  for update
  to authenticated
  using (public.get_user_role() in ('admin', 'manager', 'lab_technician'))
  with check (public.get_user_role() in ('admin', 'manager', 'lab_technician'));

create index if not exists idx_lab_quality_control_date
  on public.lab_quality_control (date desc);

create index if not exists idx_lab_quality_control_status
  on public.lab_quality_control (status);

create index if not exists idx_lab_quality_control_technician_id
  on public.lab_quality_control (technician_id);

create index if not exists idx_lab_quality_control_source_id
  on public.lab_quality_control (source_id);
