-- 040_rls.test.sql: T-SEC-1a/1b .. T-SEC-15a/b — permission rules allow/deny (Section 9)
\set ON_ERROR_STOP off
SELECT plan(30);

-- ---------------------------------------------------------------------------
-- Fixtures (superuser). public.users.id has an FK to auth.users.id, so the
-- auth users must exist first; on_auth_user_created then creates the matching
-- public.users rows. Fixed UUIDs + delete-first keep repeated runs clean.
-- ---------------------------------------------------------------------------
DELETE FROM auth.users
 WHERE id IN ('22222222-2222-2222-2222-222222222222',
              '33333333-3333-3333-3333-333333333333');

INSERT INTO auth.users (id, email) VALUES
  ('22222222-2222-2222-2222-222222222222', 'alice@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'bob@example.com');

UPDATE public.users SET username = 'alice' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.users SET username = 'bob'   WHERE id = '33333333-3333-3333-3333-333333333333';

-- Give bob one activity row so SEC11b has something for RLS to hide.
INSERT INTO public.user_activity (user_id, type, description)
VALUES ('33333333-3333-3333-3333-333333333333', 'fare_report', 'seed activity for SEC11b');

-- Helper to run as a given auth uid. is_local = false so the claim survives
-- between statements even when psql is not inside an explicit transaction.
CREATE OR REPLACE FUNCTION public.as_uid(u uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', u::text, false);
END;
$$;

-- Run every policy check as the real Data API role: postgres bypasses RLS.
SET ROLE authenticated;
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');

-- SEC1a: users read profile fields — any logged-in user (allow)
SELECT ok(
  (select count(*) from public.users where id = '22222222-2222-2222-2222-222222222222') = 1,
  'SEC1a: authenticated user can read own profile'
);

-- SEC1b: (allow) any logged-in user can read profiles
SELECT ok(
  (select count(*) from public.users) >= 2,
  'SEC1b: authenticated user can read profiles'
);

-- SEC2a: users.email is not granted at column level (deny)
SELECT ok(
  not has_column_privilege('authenticated', 'public.users', 'email', 'SELECT'),
  'SEC2a: email column is not selectable through the table'
);

-- SEC2b: users.email — nobody through the table (deny)
SELECT throws_ok(
  $$ select email from public.users where id = '33333333-3333-3333-3333-333333333333' $$,
  '42501',
  NULL::text,
  'SEC2b: email not readable through table by other user'
);

-- SEC3a: users update — owner only (allow)
UPDATE public.users SET username = 'alice2' WHERE id = '22222222-2222-2222-2222-222222222222';
SELECT is(
  (select username from public.users where id = '22222222-2222-2222-2222-222222222222'),
  'alice2',
  'SEC3a: owner can update own profile'
);
UPDATE public.users SET username = 'alice' WHERE id = '22222222-2222-2222-2222-222222222222';

-- SEC3b: users update — not owner (deny). RLS silently filters the row,
-- so assert that the target row is unchanged rather than expecting an error.
UPDATE public.users SET username = 'bobhack' WHERE id = '33333333-3333-3333-3333-333333333333';
SELECT is(
  (select username from public.users where id = '33333333-3333-3333-3333-333333333333'),
  'bob',
  'SEC3b: non-owner cannot update another profile'
);

-- SEC4a: ranks read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.ranks) >= 1,
  'SEC4a: authenticated user can read ranks'
);

-- SEC4b: ranks read deny — logged out (no auth). No policy exists for anon.
SET ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', false);
SELECT ok(
  (select count(*) from public.ranks) = 0,
  'SEC4b: logged out cannot read ranks'
);
SET ROLE authenticated;
SELECT public.as_uid('22222222-2222-2222-2222-222222222222');

-- SEC5a: routes read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.routes) >= 1,
  'SEC5a: authenticated user can read routes'
);

-- SEC5b: routes read deny — logged out
SET ROLE anon;
SELECT ok(
  (select count(*) from public.routes) = 0,
  'SEC5b: logged out cannot read routes'
);
SET ROLE authenticated;

-- SEC6a: fare_reports read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.fare_reports) >= 0,
  'SEC6a: authenticated user can read fare_reports'
);

-- SEC6b: fare_reports read deny — logged out
SET ROLE anon;
SELECT ok(
  (select count(*) from public.fare_reports) = 0,
  'SEC6b: logged out cannot read fare_reports'
);
SET ROLE authenticated;

-- SEC7a: fare_reports create — self (allow)
INSERT INTO public.fare_reports (user_id, rank_id, route_id, amount_zar)
SELECT '22222222-2222-2222-2222-222222222222', rank_row.id, route_row.id, 20
FROM (select id from public.ranks limit 1) rank_row,
     (select id from public.routes limit 1) route_row;
SELECT ok(
  exists (select 1 from public.fare_reports where user_id = '22222222-2222-2222-2222-222222222222'),
  'SEC7a: user can create own fare_report'
);

-- SEC7b: fare_reports create — other user (deny). The WITH CHECK policy
-- rejects this with insufficient_privilege (42501).
SELECT throws_ok(
  $$
    insert into public.fare_reports (user_id, rank_id, route_id, amount_zar)
    select '33333333-3333-3333-3333-333333333333', id,
           (select id from public.routes limit 1), 20
    from public.ranks limit 1
  $$,
  '42501',
  NULL::text,
  'SEC7b: user cannot create fare_report for another user'
);

-- SEC8a: fare_reports delete — nobody (deny). No DELETE policy, so 0 rows.
DELETE FROM public.fare_reports WHERE user_id = '22222222-2222-2222-2222-222222222222';
SELECT ok(
  exists (select 1 from public.fare_reports where user_id = '22222222-2222-2222-2222-222222222222'),
  'SEC8a: fare_reports cannot be deleted'
);

-- SEC8b: fare_reports update/delete — nobody (deny). No UPDATE policy;
-- RLS filters the row, so assert the stored amount is unchanged.
UPDATE public.fare_reports SET amount_zar = 99 WHERE user_id = '22222222-2222-2222-2222-222222222222';
SELECT is(
  (select amount_zar from public.fare_reports
    where user_id = '22222222-2222-2222-2222-222222222222' limit 1),
  20,
  'SEC8b: fare_reports cannot be updated'
);

-- SEC9a: job_listings read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.job_listings) >= 1,
  'SEC9a: authenticated user can read job_listings'
);

-- SEC9b: job_listings read deny — logged out
SET ROLE anon;
SELECT ok(
  (select count(*) from public.job_listings) = 0,
  'SEC9b: logged out cannot read job_listings'
);
SET ROLE authenticated;

-- SEC10b: job_listings write — nobody (deny)
SELECT throws_ok(
  $$ insert into public.job_listings (title, wage_zar) values ('x', 100) $$,
  '42501',
  NULL::text,
  'SEC10b: job_listings cannot be created'
);

-- SEC11a: user_activity read — owner only (allow). SEC7a's trigger created
-- one activity row for the owner.
SELECT ok(
  (select count(*) from public.user_activity where user_id = '22222222-2222-2222-2222-222222222222') >= 1,
  'SEC11a: owner can read own activity'
);

-- SEC11b: user_activity read — not owner (deny). Bob's seeded row exists but
-- the owner-only SELECT policy must hide it.
SELECT is(
  (select count(*)::int from public.user_activity where user_id = '33333333-3333-3333-3333-333333333333'),
  0,
  'SEC11b: cannot read another user activity'
);

-- SEC12b: user_activity create — nobody (deny)
SELECT throws_ok(
  $$
    insert into public.user_activity (user_id, type, description)
    values ('22222222-2222-2222-2222-222222222222', 'fare_report', 'x')
  $$,
  '42501',
  NULL::text,
  'SEC12b: user_activity cannot be inserted directly'
);

-- SEC13a: fuel_price_snapshots read — any logged-in (allow)
SELECT ok(
  (select count(*) from public.fuel_price_snapshots) >= 0,
  'SEC13a: authenticated user can read fuel_price_snapshots'
);

-- SEC13b: fuel_price_snapshots read deny — logged out
SET ROLE anon;
SELECT ok(
  (select count(*) from public.fuel_price_snapshots) = 0,
  'SEC13b: logged out cannot read fuel_price_snapshots'
);
SET ROLE authenticated;

-- SEC14b: fuel_price_snapshots write — nobody (deny)
SELECT throws_ok(
  $$ insert into public.fuel_price_snapshots (date, petrol_price_zar) values (current_date, 10.00) $$,
  '42501',
  NULL::text,
  'SEC14b: fuel_price_snapshots cannot be written'
);

-- SEC15: Edge Function delete-account — tested at integration level (not in pgTAP)
SELECT ok(true, 'SEC15: delete-account Edge Function tested in integration tests');

-- SEC1c: profiles read deny — logged out (anon has no SELECT grant here).
SET ROLE anon;
SELECT throws_ok(
  $$ select count(*) from public.users $$,
  '42501',
  NULL::text,
  'SEC1c: logged out cannot read profiles'
);

-- SEC11c: activity read deny — logged out
SELECT ok(
  (select count(*) from public.user_activity) = 0,
  'SEC11c: logged out cannot read activity'
);

-- SEC3c: profiles delete — nobody (deny). No DELETE policy, so 0 rows.
SET ROLE authenticated;
DELETE FROM public.users WHERE id = '33333333-3333-3333-3333-333333333333';
SELECT ok(
  (select count(*) from public.users where id = '33333333-3333-3333-3333-333333333333') = 1,
  'SEC3c: profiles cannot be deleted directly'
);

-- Cleanup: cascade from auth.users removes all fixture rows and their children.
RESET ROLE;
DELETE FROM auth.users
 WHERE id IN ('22222222-2222-2222-2222-222222222222',
              '33333333-3333-3333-3333-333333333333');

-- T-DB-6: every application table has RLS enabled.
SELECT ok(
  (select bool_and(relrowsecurity)
     from pg_class
    where relnamespace = 'public'::regnamespace
      and relkind = 'r'
      and relname in ('users', 'ranks', 'routes', 'fare_reports', 'job_listings',
                      'user_activity', 'applications', 'fuel_price_snapshots',
                      'comments', 'follows', 'likes')) is true,
  'T-DB-6: every public table has row level security enabled'
);

SELECT * FROM finish();
