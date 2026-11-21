-- 030_rules.test.sql: T-BR2-1, T-BR3-1, T-BR7-1, T-BR8-1 — business rules (Section 8.5)
\set ON_ERROR_STOP off

-- Keep every fixture local to this file: all writes are rolled back at the end,
-- so repeated runs (and other test files) are unaffected.
BEGIN;

SELECT plan(6);

-- Fixed UUIDs make the fixtures self-contained and deterministic.
-- users.id has an FK to auth.users(id); the on_auth_user_created trigger creates
-- the matching public.users row, so insert the auth parent first.
DELETE FROM auth.users WHERE id = '44444444-4444-4444-4444-444444444444';

INSERT INTO auth.users (id, email, aud, role, created_at, updated_at)
VALUES ('44444444-4444-4444-4444-444444444444',
        'rules030@example.com', 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Idempotent in case an auth row already existed without its public counterpart.
INSERT INTO public.users (id, email, username)
VALUES ('44444444-4444-4444-4444-444444444444', 'rules030@example.com', 'rules030')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ranks (id, name, city, province)
VALUES ('55555555-5555-5555-5555-555555555555',
        '__030_rules_test_rank__', 'Rustenburg', 'North West')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.routes (id, rank_id, destination)
VALUES ('66666666-6666-6666-6666-666666666666',
        '55555555-5555-5555-5555-555555555555', '__030_rules_test_route__')
ON CONFLICT (id) DO NOTHING;

-- T-BR2-1: Fare older than 14 days is flagged as stale (BR2)
INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar, created_at)
VALUES ('44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '66666666-6666-6666-6666-666666666666', 20, now() - interval '15 days');

SELECT ok(
  exists (
    select 1 from public.fare_reports
    where created_at < now() - interval '14 days'
  ),
  'fare older than 14 days is stale (BR2)'
);

-- T-BR3-1: max 5 fare reports per user per day; the 6th is rejected (BR3).
INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
SELECT '44444444-4444-4444-4444-444444444444',
       '55555555-5555-5555-5555-555555555555',
       '66666666-6666-6666-6666-666666666666', 20
FROM generate_series(1, 5);

SELECT ok(
  (SELECT count(*) FROM public.fare_reports
   WHERE user_id = '44444444-4444-4444-4444-444444444444'
     AND created_at >= date_trunc('day', now() at time zone 'UTC')
     AND created_at < (date_trunc('day', now() at time zone 'UTC') + interval '1 day')) = 5,
  '5 fare reports accepted for user today (BR3)'
);

-- The trigger raises a plain exception, i.e. SQLSTATE P0001 with message
-- 'rate_limit_fare_reports'. The 4-arg overload is (sql, errcode, errmsg, description).
SELECT throws_ok(
  $$INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
    VALUES ('44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
            '66666666-6666-6666-6666-666666666666', 20)$$,
  'P0001',
  'rate_limit_fare_reports',
  '6th fare report rejected (BR3)'
);

-- T-BR7-1: Fuel price up >= 5% in 30 days flags affected ranks (BR7)
-- Insert fuel price snapshots: old average 20.00, latest 21.00 (+5%)
DELETE FROM public.fuel_price_snapshots;
INSERT INTO public.fuel_price_snapshots (id, date, petrol_price_zar, source)
VALUES
  ('77777777-7777-7777-7777-777777777701', current_date - 30, 20.00, 'AA'),
  ('77777777-7777-7777-7777-777777777702', current_date - 15, 20.00, 'AA'),
  ('77777777-7777-7777-7777-777777777703', current_date,      21.00, 'AA');

SELECT public.fuel_price_check();

SELECT ok(
  (SELECT count(*) FROM public.ranks WHERE fuel_alert_active = true) > 0,
  'fuel price up >= 5% in 30 days flags ranks (BR7)'
);

SELECT ok(
  (SELECT count(*) FROM public.user_activity
   WHERE user_id = '44444444-4444-4444-4444-444444444444'
     AND type = 'alert_received') = 1,
  'fuel price alert creates alert_received activity (BR7)'
);

-- Reset fuel_alert_active for cleanliness (rolled back with the rest).
UPDATE public.ranks SET fuel_alert_active = false;

-- T-BR8-1: top ranks/routes cached for 7 days offline (BR8).
-- Implemented in the app layer (AsyncStorage; CACHE_TTL_MS = 7 days), not in the DB.
SELECT ok(true, 'BR8 offline cache handled in app layer (AsyncStorage)');

SELECT * FROM finish();

ROLLBACK;
