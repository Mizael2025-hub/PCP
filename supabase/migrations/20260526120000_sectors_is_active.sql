-- Soft delete para setores
alter table public.sectors
  add column if not exists is_active boolean default true not null;
