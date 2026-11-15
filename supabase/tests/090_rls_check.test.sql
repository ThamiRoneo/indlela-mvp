-- 090_rls_check.test.sql: T-DB-6 — every table in public has RLS enabled
\set ON_ERROR_STOP off
SELECT plan(11);

SELECT ok(
  (select relrowsecurity from pg_class where relname = 'users' and relnamespace = 'public'::regnamespace),
  'users has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'ranks' and relnamespace = 'public'::regnamespace),
  'ranks has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'routes' and relnamespace = 'public'::regnamespace),
  'routes has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'fare_reports' and relnamespace = 'public'::regnamespace),
  'fare_reports has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'job_listings' and relnamespace = 'public'::regnamespace),
  'job_listings has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'user_activity' and relnamespace = 'public'::regnamespace),
  'user_activity has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'applications' and relnamespace = 'public'::regnamespace),
  'applications has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'fuel_price_snapshots' and relnamespace = 'public'::regnamespace),
  'fuel_price_snapshots has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'comments' and relnamespace = 'public'::regnamespace),
  'comments has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'follows' and relnamespace = 'public'::regnamespace),
  'follows has RLS enabled'
);
SELECT ok(
  (select relrowsecurity from pg_class where relname = 'likes' and relnamespace = 'public'::regnamespace),
  'likes has RLS enabled'
);

SELECT * FROM finish();
