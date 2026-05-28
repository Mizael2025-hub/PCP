-- Soft delete para cadastros base (master data)
-- Objetivo: evitar quebra histórica e reduzir risco de FK/orfãos via DELETE físico.

alter table public.battery_models
  add column if not exists is_active boolean default true not null;

alter table public.lead_alloys
  add column if not exists is_active boolean default true not null;

alter table public.shifts
  add column if not exists is_active boolean default true not null;

