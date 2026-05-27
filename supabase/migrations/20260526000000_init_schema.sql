-- Inicialização do schema do PCP (Supabase/Postgres)
-- Deve rodar antes das migrations de RLS/índices.

create extension if not exists "uuid-ossp";

-- ==========================================
-- 1) RBAC / Perfis
-- ==========================================

create table if not exists public.roles (
  id uuid default uuid_generate_v4() primary key,
  name varchar(50) not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.permissions (
  id uuid default uuid_generate_v4() primary key,
  slug varchar(100) not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role_id uuid references public.roles(id) on delete set null,
  full_name varchar(255) not null,
  registration_number varchar(50) unique,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2) Master Data
-- ==========================================

create table if not exists public.sectors (
  id uuid default uuid_generate_v4() primary key,
  name varchar(100) not null unique,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.shifts (
  id uuid default uuid_generate_v4() primary key,
  name varchar(50) not null unique,
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.employees (
  id uuid default uuid_generate_v4() primary key,
  name varchar(255) not null,
  registration_code varchar(50) not null unique,
  sector_id uuid references public.sectors(id) on delete set null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.machines (
  id uuid default uuid_generate_v4() primary key,
  name varchar(100) not null unique,
  sector_id uuid references public.sectors(id) on delete set null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.battery_models (
  id uuid default uuid_generate_v4() primary key,
  code varchar(50) not null unique,
  name varchar(100) not null,
  weight_specification numeric(10,3) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.lead_alloys (
  id uuid default uuid_generate_v4() primary key,
  code varchar(50) not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3) Produção (peso)
-- ==========================================

create table if not exists public.grid_casting_production (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  shift_id uuid references public.shifts(id) not null,
  machine_id uuid references public.machines(id) not null,
  operator_id uuid references public.employees(id) not null,
  alloy_id uuid references public.lead_alloys(id) not null,
  battery_model_id uuid references public.battery_models(id) not null,
  gross_weight numeric(10,3) not null,
  net_weight numeric(10,3) not null,
  produced_qty integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id)
);

create table if not exists public.grid_casting_downtime (
  id uuid default uuid_generate_v4() primary key,
  production_id uuid references public.grid_casting_production(id) on delete cascade,
  reason text not null,
  duration_minutes integer not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null
);

create table if not exists public.lead_ball_production (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  shift_id uuid references public.shifts(id) not null,
  operator_id uuid references public.employees(id) not null,
  weight_produced numeric(10,3) not null,
  silo_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.oxide_mill_production (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  shift_id uuid references public.shifts(id) not null,
  operator_id uuid references public.employees(id) not null,
  oxide_weight numeric(10,3) not null,
  oxidation_degree numeric(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.mixer_production (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  shift_id uuid references public.shifts(id) not null,
  operator_id uuid references public.employees(id) not null,
  batch_number varchar(50) not null,
  lead_ball_weight numeric(10,3) not null,
  oxide_weight numeric(10,3) not null,
  water_volume numeric(10,2) not null,
  acid_volume numeric(10,2) not null,
  density numeric(5,3) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.lead_consumption (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  alloy_id uuid references public.lead_alloys(id) not null,
  weight_consumed numeric(10,3) not null,
  destination_sector_id uuid references public.sectors(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4) Rastreabilidade (unidade)
-- ==========================================

create table if not exists public.pasting_production (
  id uuid default uuid_generate_v4() primary key,
  ep_code varchar(100) not null unique,
  date date default current_date not null,
  shift_id uuid references public.shifts(id) not null,
  machine_id uuid references public.machines(id) not null,
  operator_id uuid references public.employees(id) not null,
  battery_model_id uuid references public.battery_models(id) not null,
  plates_qty integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.sanding_scrap (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  operator_id uuid references public.employees(id) not null,
  scrap_weight numeric(10,3) not null,
  plates_qty_lost integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.assembly_production (
  id uuid default uuid_generate_v4() primary key,
  battery_lot_code varchar(100) not null unique,
  pasting_production_id uuid references public.pasting_production(id) not null,
  date date default current_date not null,
  shift_id uuid references public.shifts(id) not null,
  machine_id uuid references public.machines(id) not null,
  operator_id uuid references public.employees(id) not null,
  produced_qty integer not null,
  lot_characteristics jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 5) Qualidade / Formação
-- ==========================================

create table if not exists public.lab_quality_control (
  id uuid default uuid_generate_v4() primary key,
  date date default current_date not null,
  technician_id uuid references public.profiles(id) not null,
  sample_source regclass,
  source_id uuid not null,
  acid_concentration numeric(5,2),
  mass_density numeric(5,3) generated always as (
    case
      when acid_concentration is not null
        then (1.000 + (acid_concentration / 100.000))
      else null
    end
  ) stored,
  temperature numeric(5,2),
  status varchar(50) default 'PENDING' not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.formation_records (
  id uuid default uuid_generate_v4() primary key,
  formation_lot_code varchar(100) not null unique,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone,
  operator_id uuid references public.employees(id) not null,
  status varchar(50) default 'IN_PROGRESS' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.formation_details (
  id uuid default uuid_generate_v4() primary key,
  formation_id uuid references public.formation_records(id) on delete cascade not null,
  circuit_number integer not null,
  battery_lot_code varchar(100) references public.assembly_production(battery_lot_code) not null,
  initial_voltage numeric(4,2) not null,
  final_voltage numeric(4,2),
  current_ampere numeric(5,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- Helpers RBAC / updated_at
-- ==========================================

create or replace function public.get_user_role()
returns text
language sql
security definer
as $$
  select r.name
  from public.roles r
  join public.profiles p on p.role_id = r.id
  where p.id = auth.uid();
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ==========================================
-- Seed mínimo de roles (necessário para RBAC)
-- ==========================================

insert into public.roles (name, description)
values
  ('admin', 'Acesso total ao sistema'),
  ('manager', 'Gestão e supervisão'),
  ('lab_technician', 'Técnico de laboratório'),
  ('production_operator', 'Operador de produção'),
  ('warehouse_operator', 'Operador de estoque/armazém')
on conflict (name) do nothing;

