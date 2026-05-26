# DOCUMENTO DE ARQUITETURA DE BANCO DE DADOS (SUPABASE SQL)

Este arquivo contém o schema completo do banco de dados, relacionamentos, restrições e políticas de segurança (RLS) baseadas em RBAC.

---

## 1. Estrutura de Tabelas (DDL)

```sql
-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. AUTENTICAÇÃO E PERFIS (RBAC)
-- ==========================================

-- Tabela de Perfis/Roles
create table public.roles (
    id uuid default uuid_generate_v4() primary key,
    name varchar(50) not null unique, -- 'admin', 'manager', 'lab_technician', 'production_operator', 'warehouse_operator'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Permissões
create table public.permissions (
    id uuid default uuid_generate_v4() primary key,
    slug varchar(100) not null unique, -- ex: 'production:create', 'config:manage'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela Pivot de Permissões por Role
create table public.role_permissions (
    role_id uuid references public.roles(id) on delete cascade,
    permission_id uuid references public.permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- Tabela de Usuários/Perfis (Vinculado ao auth.users do Supabase)
create table public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    role_id uuid references public.roles(id) on delete set null,
    full_name varchar(255) not null,
    registration_number varchar(50) unique, -- Matrícula do funcionário
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. DADOS MESTRES (MASTER DATA / CONFIGURAÇÕES)
-- ==========================================

create table public.sectors (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null unique,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.shifts (
    id uuid default uuid_generate_v4() primary key,
    name varchar(50) not null unique, -- 'Turno A', 'Turno B', etc.
    start_time time not null,
    end_time time not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.employees (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    registration_code varchar(50) not null unique,
    sector_id uuid references public.sectors(id) on delete set null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.machines (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null unique,
    sector_id uuid references public.sectors(id) on delete set null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.battery_models (
    id uuid default uuid_generate_v4() primary key,
    code varchar(50) not null unique, -- ex: 'MBS12V5AH'
    name varchar(100) not null,
    weight_specification numeric(10,3) not null, -- Peso padrão nominal
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.lead_alloys (
    id uuid default uuid_generate_v4() primary key,
    code varchar(50) not null unique, -- ex: 'LIGA_CA_CA'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. MÓDULO DE PRODUÇÃO (APONTAMENTOS POR PESO)
-- ==========================================

-- Fundição de Grades (Grid Casting)
create table public.grid_casting_production (
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

-- Paradas de Máquina (Downtime)
create table public.grid_casting_downtime (
    id uuid default uuid_generate_v4() primary key,
    production_id uuid references public.grid_casting_production(id) on delete cascade,
    reason text not null,
    duration_minutes integer not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null
);

-- Produção de Bola de Chumbo (Lead Ball)
create table public.lead_ball_production (
    id uuid default uuid_generate_v4() primary key,
    date date default current_date not null,
    shift_id uuid references public.shifts(id) not null,
    operator_id uuid references public.employees(id) not null,
    weight_produced numeric(10,3) not null,
    silo_number integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Moinho de Óxido (Oxide Mill)
create table public.oxide_mill_production (
    id uuid default uuid_generate_v4() primary key,
    date date default current_date not null,
    shift_id uuid references public.shifts(id) not null,
    operator_id uuid references public.employees(id) not null,
    oxide_weight numeric(10,3) not null,
    oxidation_degree numeric(5,2) not null, -- Percentual de oxidação
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Misturador (Mixer)
create table public.mixer_production (
    id uuid default uuid_generate_v4() primary key,
    date date default current_date not null,
    shift_id uuid references public.shifts(id) not null,
    operator_id uuid references public.employees(id) not null,
    batch_number varchar(50) not null, -- Número da massa/batelada
    lead_ball_weight numeric(10,3) not null,
    oxide_weight numeric(10,3) not null,
    water_volume numeric(10,2) not null,
    acid_volume numeric(10,2) not null,
    density numeric(5,3) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Consumo Geral de Chumbo (Matéria-Prima)
create table public.lead_consumption (
    id uuid default uuid_generate_v4() primary key,
    date date default current_date not null,
    alloy_id uuid references public.lead_alloys(id) not null,
    weight_consumed numeric(10,3) not null,
    destination_sector_id uuid references public.sectors(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. MÓDULO DE RASTREABILIDADE (UNIDADE)
-- ==========================================

-- Empastadeira (Pasting)
create table public.pasting_production (
    id uuid default uuid_generate_v4() primary key,
    ep_code varchar(100) not null unique, -- Código Único (EP Code)
    date date default current_date not null,
    shift_id uuid references public.shifts(id) not null,
    machine_id uuid references public.machines(id) not null,
    operator_id uuid references public.employees(id) not null,
    battery_model_id uuid references public.battery_models(id) not null,
    plates_qty integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Refugo de Lixação (Sanding Scrap)
create table public.sanding_scrap (
    id uuid default uuid_generate_v4() primary key,
    date date default current_date not null,
    operator_id uuid references public.employees(id) not null,
    scrap_weight numeric(10,3) not null,
    plates_qty_lost integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Linha de Montagem (Assembly)
create table public.assembly_production (
    id uuid default uuid_generate_v4() primary key,
    battery_lot_code varchar(100) not null unique, -- Lote final da bateria
    pasting_production_id uuid references public.pasting_production(id) not null,
    date date default current_date not null,
    shift_id uuid references public.shifts(id) not null,
    machine_id uuid references public.machines(id) not null,
    operator_id uuid references public.employees(id) not null,
    produced_qty integer not null,
    lot_characteristics jsonb default '{}'::jsonb not null, -- Características extras do lote
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 5. MÓDULO DE QUALIDADE E FORMAÇÃO
-- ==========================================

-- Controle de Qualidade Laboratorial
create table public.lab_quality_control (
    id uuid default uuid_generate_v4() primary key,
    date date default current_date not null,
    technician_id uuid references public.profiles(id) not null,
    sample_source tableoid,
    source_id uuid not null,
    acid_concentration numeric(5,2),
    mass_density numeric(5,3) generated always as (case when acid_concentration is not null then (1.000 + (acid_concentration / 100.000)) else null end) stored,
    temperature numeric(5,2),
    status varchar(50) default 'PENDING' not null, -- 'APPROVED', 'REJECTED', 'PENDING'
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Registro de Formação (Master)
create table public.formation_records (
    id uuid default uuid_generate_v4() primary key,
    formation_lot_code varchar(100) not null unique,
    start_date timestamp with time zone not null,
    end_date timestamp with time zone,
    operator_id uuid references public.employees(id) not null,
    status varchar(50) default 'IN_PROGRESS' not null, -- 'IN_PROGRESS', 'COMPLETED'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Detalhes da Formação / Mesas-Linhas (Detail)
create table public.formation_details (
    id uuid default uuid_generate_v4() primary key,
    formation_id uuid references public.formation_records(id) on delete cascade not null,
    circuit_number integer not null,
    battery_lot_code varchar(100) references public.assembly_production(battery_lot_code) not null,
    initial_voltage numeric(4,2) not null,
    final_voltage numeric(4,2),
    current_ampere numeric(5,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 2. Row Level Security (RLS) e Políticas

```sql

-- Habilitar RLS em todas as tabelas principais
alter table public.profiles enable row level security;
alter table public.grid_casting_production enable row level security;
alter table public.pasting_production enable row level security;
alter table public.assembly_production enable row level security;
alter table public.lab_quality_control enable row level security;

-- Função auxiliar para extrair o role do usuário logado
create or replace function public.get_user_role()
returns text as $$
  select r.name from public.roles r
  join public.profiles p on p.role_id = r.id
  where p.id = auth.uid();
$$ language sql security definer;

-- Política de visualização para Profiles
create policy "Perfis visíveis para usuários autenticados"
on public.profiles for select
using (auth.role() = 'authenticated');

-- Políticas para Produção (Grid Casting)
create policy "Operadores inserem dados de produção"
on public.grid_casting_production for insert
with check (public.get_user_role() in ('admin', 'manager', 'production_operator'));

create policy "Todos os autenticados leem a produção"
on public.grid_casting_production for select
using (auth.role() = 'authenticated');

create policy "Apenas admin e manager alteram produção"
on public.grid_casting_production for update
using (public.get_user_role() in ('admin', 'manager'));
```

## 3. Índices de Performance Otimizados

```sql
-- Índices para busca por data e turnos (Filtros comuns de PCP)
create index idx_grid_casting_date on public.grid_casting_production(date);
create index idx_pasting_date on public.pasting_production(date);
create index idx_assembly_date on public.assembly_production(date);

-- Índices de Rastreabilidade (Códigos Únicos)
create index idx_pasting_ep_code on public.pasting_production(ep_code);
create index idx_assembly_lot_code on public.assembly_production(battery_lot_code);
create index idx_formation_lot_code on public.formation_records(formation_lot_code);

-- Índices JSONB para características de lote
create index idx_assembly_characteristics on public.assembly_production using gin (lot_characteristics);
```
