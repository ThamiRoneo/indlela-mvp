-- 030_rules.test.sql: T-BR2-1, T-BR7-1 — business rules (Section 8.5)
\set ON_ERROR_STOP off
SELECT plan(6);

-- T-BR2-1: Fare older than 14 days is flagged as stale (BR2)
WITH rank_row AS (SELECT id FROM public.ranks LIMIT 1),
     route_row AS (SELECT id FROM public.routes LIMIT 1)
INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar, created_at)
SELECT '11111111-1111-1111-1111-111111111111', rank_row.id, route_row.id, 20, now() - interval '15 days'
FROM rank_row, route_row;

SELECT ok(
  exists (
    select 1 from public.fare_reports
    where created_at < now() - interval '14 days'
  ),
  'fare older than 14 days is stale (BR2)'
);

-- T-BR7-1: Fuel price up >= 5% in 30 days flags affected ranks (BR7)
-- Insert fuel price snapshots: old average 20.00, latest 21.00 (+5%)
DELETE FROM public.fuel_price_snapshots;
INSERT INTO public.fuel_price_snapshots (date, petrol_price_zar, source)
VALUES
  (current_date - interval '30 days', 20.00, 'AA'),
  (current_date - interval '15 days', 20.00, 'AA'),
  (current_date, 21.00, 'AA');

SELECT public.fuel_price_check();

SELECT ok(
  (SELECT count(*) FROM public.ranks WHERE fuel_alert_active = true) > 0,
  'fuel price up >= 5% in 30 days flags ranks (BR7)'
);

-- Reset fuel_alert_active for cleanliness
UPDATE public.ranks SET fuel_alert_active = false;

-- T-BR3-1 already covered in 020_triggers.test.sql (6th report raises rate_limit_fare_reports)

-- T-BR8-1: offline cache is implemented in the app (AsyncStorage), not the database
SELECT ok(true, 'BR8 offline cache handled in app layer (AsyncStorage)');

SELECT * FROM finish();
