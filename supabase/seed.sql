-- Seed básico coerente para testes locais
-- Pode ser executado múltiplas vezes (idempotente via ON CONFLICT).

-- Setores
insert into public.sectors (name, is_active)
values
  ('Fundição', true),
  ('Mistura', true),
  ('Montagem', true),
  ('Qualidade', true)
on conflict (name) do nothing;

-- Turnos
insert into public.shifts (name, start_time, end_time, is_active)
values
  ('Turno A', '06:00', '14:00', true),
  ('Turno B', '14:00', '22:00', true),
  ('Turno C', '22:00', '06:00', true)
on conflict (name) do nothing;

-- Máquinas (vinculadas por nome do setor)
insert into public.machines (name, sector_id, is_active)
values
  ('Fundidora 01', (select id from public.sectors where name='Fundição' limit 1), true),
  ('Misturador 01', (select id from public.sectors where name='Mistura' limit 1), true),
  ('Montagem 01', (select id from public.sectors where name='Montagem' limit 1), true)
on conflict (name) do nothing;

-- Funcionários
insert into public.employees (name, registration_code, sector_id, is_active)
values
  ('Operador 001', 'OP001', (select id from public.sectors where name='Fundição' limit 1), true),
  ('Operador 002', 'OP002', (select id from public.sectors where name='Mistura' limit 1), true),
  ('Operador 003', 'OP003', (select id from public.sectors where name='Montagem' limit 1), true)
on conflict (registration_code) do nothing;

-- Modelos de bateria
insert into public.battery_models (code, name, weight_specification, is_active)
values
  ('BAT12V5', 'Bateria 12V 5Ah', 1.850, true),
  ('BAT12V7', 'Bateria 12V 7Ah', 2.100, true)
on conflict (code) do nothing;

-- Ligas
insert into public.lead_alloys (code, description, is_active)
values
  ('PB_CA', 'Liga chumbo cálcio', true),
  ('PB_SB', 'Liga chumbo antimônio', true)
on conflict (code) do nothing;

-- Produção exemplo (grid casting)
insert into public.grid_casting_production (
  date,
  shift_id,
  machine_id,
  operator_id,
  alloy_id,
  battery_model_id,
  gross_weight,
  net_weight,
  produced_qty
)
select
  current_date,
  (select id from public.shifts where name='Turno A' limit 1),
  (select id from public.machines where name='Fundidora 01' limit 1),
  (select id from public.employees where registration_code='OP001' limit 1),
  (select id from public.lead_alloys where code='PB_CA' limit 1),
  (select id from public.battery_models where code='BAT12V5' limit 1),
  120.500,
  118.100,
  250
where not exists (
  select 1
  from public.grid_casting_production
  where date = current_date
    and machine_id = (select id from public.machines where name='Fundidora 01' limit 1)
);

