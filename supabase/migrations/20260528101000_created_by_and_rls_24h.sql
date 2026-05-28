-- created_by + RLS de edição por 24h (operador) / retroativo (manager/admin)

create or replace function public.set_created_by()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

-- 1) Colunas created_by (idempotente)
alter table public.lead_ball_production
  add column if not exists created_by uuid references public.profiles(id);

alter table public.oxide_mill_production
  add column if not exists created_by uuid references public.profiles(id);

alter table public.mixer_production
  add column if not exists created_by uuid references public.profiles(id);

alter table public.lead_consumption
  add column if not exists created_by uuid references public.profiles(id);

alter table public.pasting_production
  add column if not exists created_by uuid references public.profiles(id);

alter table public.sanding_scrap
  add column if not exists created_by uuid references public.profiles(id);

alter table public.assembly_production
  add column if not exists created_by uuid references public.profiles(id);

alter table public.lab_quality_control
  add column if not exists created_by uuid references public.profiles(id);

alter table public.formation_records
  add column if not exists created_by uuid references public.profiles(id);

alter table public.grid_casting_downtime
  add column if not exists created_by uuid references public.profiles(id);

-- grid_casting_production já tem created_by no init

-- 2) Triggers para preencher created_by automaticamente
drop trigger if exists trg_lead_ball_production_set_created_by on public.lead_ball_production;
create trigger trg_lead_ball_production_set_created_by
before insert on public.lead_ball_production
for each row
execute function public.set_created_by();

drop trigger if exists trg_oxide_mill_production_set_created_by on public.oxide_mill_production;
create trigger trg_oxide_mill_production_set_created_by
before insert on public.oxide_mill_production
for each row
execute function public.set_created_by();

drop trigger if exists trg_mixer_production_set_created_by on public.mixer_production;
create trigger trg_mixer_production_set_created_by
before insert on public.mixer_production
for each row
execute function public.set_created_by();

drop trigger if exists trg_lead_consumption_set_created_by on public.lead_consumption;
create trigger trg_lead_consumption_set_created_by
before insert on public.lead_consumption
for each row
execute function public.set_created_by();

drop trigger if exists trg_pasting_production_set_created_by on public.pasting_production;
create trigger trg_pasting_production_set_created_by
before insert on public.pasting_production
for each row
execute function public.set_created_by();

drop trigger if exists trg_sanding_scrap_set_created_by on public.sanding_scrap;
create trigger trg_sanding_scrap_set_created_by
before insert on public.sanding_scrap
for each row
execute function public.set_created_by();

drop trigger if exists trg_assembly_production_set_created_by on public.assembly_production;
create trigger trg_assembly_production_set_created_by
before insert on public.assembly_production
for each row
execute function public.set_created_by();

drop trigger if exists trg_lab_quality_control_set_created_by on public.lab_quality_control;
create trigger trg_lab_quality_control_set_created_by
before insert on public.lab_quality_control
for each row
execute function public.set_created_by();

drop trigger if exists trg_formation_records_set_created_by on public.formation_records;
create trigger trg_formation_records_set_created_by
before insert on public.formation_records
for each row
execute function public.set_created_by();

drop trigger if exists trg_grid_casting_downtime_set_created_by on public.grid_casting_downtime;
create trigger trg_grid_casting_downtime_set_created_by
before insert on public.grid_casting_downtime
for each row
execute function public.set_created_by();

drop trigger if exists trg_grid_casting_production_set_created_by on public.grid_casting_production;
create trigger trg_grid_casting_production_set_created_by
before insert on public.grid_casting_production
for each row
execute function public.set_created_by();

-- 3) Políticas de UPDATE: own(24h) OR manager/admin
-- OBS: mantemos SELECT como está. INSERT continua restrito por role, mas agora exige created_by=auth.uid()

-- Mixer
drop policy if exists "mixer_production_insert_operators" on public.mixer_production;
create policy "mixer_production_insert_operators"
  on public.mixer_production
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "mixer_production_update_managers" on public.mixer_production;
create policy "mixer_production_update_own_24h_or_manager"
  on public.mixer_production
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (
      created_by = auth.uid()
      and created_at >= timezone('utc'::text, now()) - interval '24 hours'
    )
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (
      created_by = auth.uid()
      and created_at >= timezone('utc'::text, now()) - interval '24 hours'
    )
  );

-- Lead ball
alter table public.lead_ball_production enable row level security;

drop policy if exists "lead_ball_production_insert_operators" on public.lead_ball_production;
create policy "lead_ball_production_insert_operators"
  on public.lead_ball_production
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "lead_ball_production_update_managers" on public.lead_ball_production;
create policy "lead_ball_production_update_own_24h_or_manager"
  on public.lead_ball_production
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Oxide mill
alter table public.oxide_mill_production enable row level security;

drop policy if exists "oxide_mill_production_insert_operators" on public.oxide_mill_production;
create policy "oxide_mill_production_insert_operators"
  on public.oxide_mill_production
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "oxide_mill_production_update_managers" on public.oxide_mill_production;
create policy "oxide_mill_production_update_own_24h_or_manager"
  on public.oxide_mill_production
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Lead consumption
alter table public.lead_consumption enable row level security;

drop policy if exists "lead_consumption_insert_operators" on public.lead_consumption;
create policy "lead_consumption_insert_operators"
  on public.lead_consumption
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator', 'warehouse_operator')
    and created_by = auth.uid()
  );

drop policy if exists "lead_consumption_update_managers" on public.lead_consumption;
create policy "lead_consumption_update_own_24h_or_manager"
  on public.lead_consumption
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Pasting
alter table public.pasting_production enable row level security;

drop policy if exists "pasting_production_insert_operators" on public.pasting_production;
create policy "pasting_production_insert_operators"
  on public.pasting_production
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "pasting_production_update_managers" on public.pasting_production;
create policy "pasting_production_update_own_24h_or_manager"
  on public.pasting_production
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Sanding
alter table public.sanding_scrap enable row level security;

drop policy if exists "sanding_scrap_insert_operators" on public.sanding_scrap;
create policy "sanding_scrap_insert_operators"
  on public.sanding_scrap
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "sanding_scrap_update_managers" on public.sanding_scrap;
create policy "sanding_scrap_update_own_24h_or_manager"
  on public.sanding_scrap
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Assembly
alter table public.assembly_production enable row level security;

drop policy if exists "assembly_production_insert_operators" on public.assembly_production;
create policy "assembly_production_insert_operators"
  on public.assembly_production
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "assembly_production_update_managers" on public.assembly_production;
create policy "assembly_production_update_own_24h_or_manager"
  on public.assembly_production
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Lab QC (técnicos e gestores)
alter table public.lab_quality_control enable row level security;

drop policy if exists "lab_quality_control_insert_lab" on public.lab_quality_control;
create policy "lab_quality_control_insert_lab"
  on public.lab_quality_control
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'lab_technician')
    and created_by = auth.uid()
  );

drop policy if exists "lab_quality_control_update_managers" on public.lab_quality_control;
create policy "lab_quality_control_update_own_24h_or_manager"
  on public.lab_quality_control
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Formation (operador de produção e gestores)
alter table public.formation_records enable row level security;

drop policy if exists "formation_records_insert_operators" on public.formation_records;
create policy "formation_records_insert_operators"
  on public.formation_records
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "formation_records_update_managers" on public.formation_records;
create policy "formation_records_update_own_24h_or_manager"
  on public.formation_records
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and created_at >= timezone('utc'::text, now()) - interval '24 hours')
  );

-- Downtime (produção)
alter table public.grid_casting_downtime enable row level security;

drop policy if exists "grid_casting_downtime_insert_operators" on public.grid_casting_downtime;
create policy "grid_casting_downtime_insert_operators"
  on public.grid_casting_downtime
  for insert
  to authenticated
  with check (
    public.get_user_role() in ('admin', 'manager', 'production_operator')
    and created_by = auth.uid()
  );

drop policy if exists "grid_casting_downtime_update_managers" on public.grid_casting_downtime;
create policy "grid_casting_downtime_update_own_24h_or_manager"
  on public.grid_casting_downtime
  for update
  to authenticated
  using (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and now() - start_time <= interval '24 hours')
  )
  with check (
    public.get_user_role() in ('admin','manager')
    or (created_by = auth.uid() and now() - start_time <= interval '24 hours')
  );

