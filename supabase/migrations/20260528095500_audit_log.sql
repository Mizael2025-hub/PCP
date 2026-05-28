-- Auditoria genérica (audit_log) + triggers
-- Registra INSERT/UPDATE/DELETE com before/after em JSONB.

create table if not exists public.audit_log (
  id uuid default uuid_generate_v4() primary key,
  table_name text not null,
  record_id uuid,
  action text not null,
  changed_by uuid,
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  before jsonb,
  after jsonb
);

create index if not exists audit_log_table_name_idx on public.audit_log (table_name);
create index if not exists audit_log_record_id_idx on public.audit_log (record_id);
create index if not exists audit_log_changed_at_idx on public.audit_log (changed_at desc);
create index if not exists audit_log_changed_by_idx on public.audit_log (changed_by);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_insert_authenticated" on public.audit_log;
create policy "audit_log_insert_authenticated"
on public.audit_log
for insert
to authenticated
with check (true);

drop policy if exists "audit_log_select_admin_manager" on public.audit_log;
create policy "audit_log_select_admin_manager"
on public.audit_log
for select
to authenticated
using (public.get_user_role() in ('admin', 'manager'));

drop policy if exists "audit_log_read_service_role" on public.audit_log;
create policy "audit_log_read_service_role"
on public.audit_log
for select
to service_role
using (true);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
as $$
declare
  v_record_id uuid;
begin
  -- Tentativa de inferir o id do registro
  if (tg_op = 'DELETE') then
    v_record_id := old.id;
  else
    v_record_id := new.id;
  end if;

  insert into public.audit_log (
    table_name,
    record_id,
    action,
    changed_by,
    before,
    after
  )
  values (
    tg_table_schema || '.' || tg_table_name,
    v_record_id,
    tg_op,
    auth.uid(),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );

  if (tg_op = 'DELETE') then
    return old;
  end if;

  return new;
end;
$$;

-- Triggers (idempotentes): criar para tabelas críticas
do $$
declare
  t record;
begin
  for t in
    select unnest(array[
      'public.sectors',
      'public.shifts',
      'public.employees',
      'public.machines',
      'public.battery_models',
      'public.lead_alloys',
      'public.grid_casting_production',
      'public.grid_casting_downtime',
      'public.lead_ball_production',
      'public.oxide_mill_production',
      'public.mixer_production',
      'public.lead_consumption',
      'public.pasting_production',
      'public.sanding_scrap',
      'public.assembly_production',
      'public.lab_quality_control',
      'public.formation_records',
      'public.formation_details'
    ]) as table_name
  loop
    execute format('drop trigger if exists trg_audit_%s on %s',
      replace(t.table_name, '.', '_'),
      t.table_name
    );

    execute format(
      'create trigger trg_audit_%s after insert or update or delete on %s for each row execute function public.write_audit_log()',
      replace(t.table_name, '.', '_'),
      t.table_name
    );
  end loop;
end $$;

