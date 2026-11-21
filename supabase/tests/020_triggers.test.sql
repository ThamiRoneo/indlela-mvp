-- 020_triggers.test.sql: T-DB-2, T-DB-3 — limit_fare_reports and activity triggers
\set ON_ERROR_STOP off

-- Keep every fixture in this file local: all writes are rolled back at the end,
-- so repeated runs (and other test files) are unaffected.
BEGIN;

SELECT plan(10);

-- Fixed UUIDs for self-contained fixtures.
-- users.id has an FK to auth.users(id); the on_auth_user_created trigger creates
-- the matching public.users row, so insert the auth parent first.
INSERT INTO auth.users (id, email, aud, role, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111',
        'testuser_020@example.com', 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Idempotent in case an auth row already existed without its public counterpart.
INSERT INTO public.users (id, email, username)
VALUES ('11111111-1111-1111-1111-111111111111', 'testuser_020@example.com', 'testuser')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ranks (id, name, city, province)
VALUES ('22222222-2222-2222-2222-222222222222',
        '__020_triggers_test_rank__', 'Rustenburg', 'North West')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.routes (id, rank_id, destination)
VALUES ('33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222', 'Johannesburg Park Station')
ON CONFLICT (id) DO NOTHING;

-- Start from a clean slate for this user (safe because the transaction rolls back).
DELETE FROM public.user_activity WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.fare_reports WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Set up auth context
SELECT ok(set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true) IS NOT NULL, 'auth uid set');

SELECT ok(
  EXISTS (SELECT 1 FROM public.ranks WHERE id = '22222222-2222-2222-2222-222222222222'),
  'test rank exists'
);
SELECT ok(
  EXISTS (SELECT 1 FROM public.routes WHERE id = '33333333-3333-3333-3333-333333333333'),
  'test route exists'
);

-- BR3: five fare reports for the user today are allowed.
INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
SELECT '11111111-1111-1111-1111-111111111111',
       '22222222-2222-2222-2222-222222222222',
       '33333333-3333-3333-3333-333333333333', 20
FROM generate_series(1, 5);

SELECT ok(
  (SELECT count(*) FROM public.fare_reports
   WHERE user_id = '11111111-1111-1111-1111-111111111111'
     AND created_at >= date_trunc('day', now())) = 5,
  '5 fare reports inserted for user today'
);

-- The 6th report must be rejected by rate_limit_fare_reports (P0001).
SELECT throws_ok(
  $$INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
    VALUES ('11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
            '33333333-3333-3333-3333-333333333333', 20)$$,
  'P0001',
  'rate_limit_fare_reports',
  '6th fare report raises rate_limit_fare_reports (BR3)'
);

SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'limit_fare_reports'
      AND p.prosecdef
  ),
  'limit_fare_reports trigger function exists and is security definer'
);

-- T-DB-3: activity_on_fare_report creates a user_activity row.
-- Reset the user's reports first so this insert is not itself rate-limited.
DELETE FROM public.user_activity WHERE user_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.fare_reports WHERE user_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
VALUES ('11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333', 15);

SELECT ok(
  (SELECT count(*) FROM public.user_activity
   WHERE user_id = '11111111-1111-1111-1111-111111111111' AND type = 'fare_report') = 1,
  'activity_on_fare_report creates fare_report activity'
);

-- BR7: with no fuel price data the function must fail silently.
-- NOTE: a void function returns type void, not SQL NULL, so `IS NULL` is false;
-- `lives_ok` is the correct assertion for "does not raise".
DELETE FROM public.user_activity WHERE type = 'alert_received';
DELETE FROM public.fuel_price_snapshots;

SELECT lives_ok(
  $$SELECT public.fuel_price_check()$$,
  'fuel_price_check fails silently with no data'
);
SELECT ok(
  (SELECT count(*) FROM public.user_activity WHERE type = 'alert_received') = 0,
  'fuel_price_check with no data creates no alert_received activity'
);

-- activity triggers exist and are security definers
SELECT ok(
  EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'activity_on_fare_report'
      AND p.prosecdef
  ),
  'activity_on_fare_report exists and is security definer'
);

SELECT * FROM finish();

ROLLBACK;
