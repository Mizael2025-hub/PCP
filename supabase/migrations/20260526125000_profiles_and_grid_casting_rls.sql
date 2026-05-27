-- RLS base para profiles e fundição de grades (grid_casting_production)
-- Necessário porque o app depende de `profiles` e o módulo de grid casting existe no código.

-- ==========================================
-- PROFILES
-- ==========================================

alter table public.profiles enable row level security;

-- Usuário autenticado pode ler o próprio profile
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- Admin/manager podem ler todos os profiles (útil para joins em relatórios)
drop policy if exists "profiles_select_admin_manager" on public.profiles;
create policy "profiles_select_admin_manager"
  on public.profiles
  for select
  to authenticated
  using (public.get_user_role() in ('admin', 'manager'));

-- ==========================================
-- GRID CASTING PRODUCTION
-- ==========================================

alter table public.grid_casting_production enable row level security;

drop policy if exists "grid_casting_production_select_authenticated" on public.grid_casting_production;
create policy "grid_casting_production_select_authenticated"
  on public.grid_casting_production
  for select
  to authenticated
  using (true);

drop policy if exists "grid_casting_production_insert_operators" on public.grid_casting_production;
create policy "grid_casting_production_insert_operators"
  on public.grid_casting_production
  for insert
  to authenticated
  with check (public.get_user_role() in ('admin', 'manager', 'production_operator'));

drop policy if exists "grid_casting_production_update_managers" on public.grid_casting_production;
create policy "grid_casting_production_update_managers"
  on public.grid_casting_production
  for update
  to authenticated
  using (public.get_user_role() in ('admin', 'manager'))
  with check (public.get_user_role() in ('admin', 'manager'));

create index if not exists idx_grid_casting_production_date
  on public.grid_casting_production (date desc);

create index if not exists idx_grid_casting_production_shift_id
  on public.grid_casting_production (shift_id);

create index if not exists idx_grid_casting_production_machine_id
  on public.grid_casting_production (machine_id);

