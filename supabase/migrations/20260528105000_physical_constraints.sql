-- Constraints físicas (CHECK) para bloquear valores absurdos no banco

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_mixer_density_range'
  ) then
    alter table public.mixer_production
      add constraint chk_mixer_density_range
      check (density >= 0.5 and density <= 2.5);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_mixer_water_volume_range'
  ) then
    alter table public.mixer_production
      add constraint chk_mixer_water_volume_range
      check (water_volume > 0 and water_volume <= 10000);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_mixer_acid_volume_range'
  ) then
    alter table public.mixer_production
      add constraint chk_mixer_acid_volume_range
      check (acid_volume > 0 and acid_volume <= 10000);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_lab_qc_acid_concentration_range'
  ) then
    alter table public.lab_quality_control
      add constraint chk_lab_qc_acid_concentration_range
      check (acid_concentration is null or (acid_concentration >= 0 and acid_concentration <= 100));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_lab_qc_temperature_range'
  ) then
    alter table public.lab_quality_control
      add constraint chk_lab_qc_temperature_range
      check (temperature is null or (temperature >= -50 and temperature <= 150));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_grid_casting_net_leq_gross'
  ) then
    alter table public.grid_casting_production
      add constraint chk_grid_casting_net_leq_gross
      check (net_weight <= gross_weight);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_oxide_mill_oxidation_degree_range'
  ) then
    alter table public.oxide_mill_production
      add constraint chk_oxide_mill_oxidation_degree_range
      check (oxidation_degree > 0 and oxidation_degree <= 100);
  end if;
end $$;

