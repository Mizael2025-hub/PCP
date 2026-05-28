-- Adiciona updated_at e triggers de atualização automática
-- Base para optimistic locking no app (evitar sobrescrita silenciosa).

-- Helper já existe no init_schema.sql:
--   public.set_updated_at()

do $$
begin
  -- Produção / qualidade / rastreabilidade
  alter table public.grid_casting_production
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.grid_casting_downtime
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.lead_ball_production
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.oxide_mill_production
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.mixer_production
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.lead_consumption
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.pasting_production
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.sanding_scrap
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.assembly_production
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.lab_quality_control
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.formation_records
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.formation_details
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  -- Master data com edição
  alter table public.battery_models
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.lead_alloys
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;

  alter table public.shifts
    add column if not exists updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;
end $$;

-- Triggers (idempotentes)
drop trigger if exists trg_grid_casting_production_set_updated_at on public.grid_casting_production;
create trigger trg_grid_casting_production_set_updated_at
before update on public.grid_casting_production
for each row
execute function public.set_updated_at();

drop trigger if exists trg_grid_casting_downtime_set_updated_at on public.grid_casting_downtime;
create trigger trg_grid_casting_downtime_set_updated_at
before update on public.grid_casting_downtime
for each row
execute function public.set_updated_at();

drop trigger if exists trg_lead_ball_production_set_updated_at on public.lead_ball_production;
create trigger trg_lead_ball_production_set_updated_at
before update on public.lead_ball_production
for each row
execute function public.set_updated_at();

drop trigger if exists trg_oxide_mill_production_set_updated_at on public.oxide_mill_production;
create trigger trg_oxide_mill_production_set_updated_at
before update on public.oxide_mill_production
for each row
execute function public.set_updated_at();

drop trigger if exists trg_mixer_production_set_updated_at on public.mixer_production;
create trigger trg_mixer_production_set_updated_at
before update on public.mixer_production
for each row
execute function public.set_updated_at();

drop trigger if exists trg_lead_consumption_set_updated_at on public.lead_consumption;
create trigger trg_lead_consumption_set_updated_at
before update on public.lead_consumption
for each row
execute function public.set_updated_at();

drop trigger if exists trg_pasting_production_set_updated_at on public.pasting_production;
create trigger trg_pasting_production_set_updated_at
before update on public.pasting_production
for each row
execute function public.set_updated_at();

drop trigger if exists trg_sanding_scrap_set_updated_at on public.sanding_scrap;
create trigger trg_sanding_scrap_set_updated_at
before update on public.sanding_scrap
for each row
execute function public.set_updated_at();

drop trigger if exists trg_assembly_production_set_updated_at on public.assembly_production;
create trigger trg_assembly_production_set_updated_at
before update on public.assembly_production
for each row
execute function public.set_updated_at();

drop trigger if exists trg_lab_quality_control_set_updated_at on public.lab_quality_control;
create trigger trg_lab_quality_control_set_updated_at
before update on public.lab_quality_control
for each row
execute function public.set_updated_at();

drop trigger if exists trg_formation_records_set_updated_at on public.formation_records;
create trigger trg_formation_records_set_updated_at
before update on public.formation_records
for each row
execute function public.set_updated_at();

drop trigger if exists trg_formation_details_set_updated_at on public.formation_details;
create trigger trg_formation_details_set_updated_at
before update on public.formation_details
for each row
execute function public.set_updated_at();

drop trigger if exists trg_battery_models_set_updated_at on public.battery_models;
create trigger trg_battery_models_set_updated_at
before update on public.battery_models
for each row
execute function public.set_updated_at();

drop trigger if exists trg_lead_alloys_set_updated_at on public.lead_alloys;
create trigger trg_lead_alloys_set_updated_at
before update on public.lead_alloys
for each row
execute function public.set_updated_at();

drop trigger if exists trg_shifts_set_updated_at on public.shifts;
create trigger trg_shifts_set_updated_at
before update on public.shifts
for each row
execute function public.set_updated_at();

