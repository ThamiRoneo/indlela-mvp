-- 010_tables.test.sql: T-DB-1 — every table and column in 8.1 exists with the right type, null rule and default
\set ON_ERROR_STOP off
SELECT plan(23);

-- users
SELECT has_table('public', 'users') AS 'users table exists';
SELECT col_not_null('public', 'users', 'id') AS 'users.id not null';
SELECT col_has_default('public', 'users', 'created_at') AS 'users.created_at has default';
SELECT coltype('public', 'users', 'email') IS NOT NULL AS 'users.email column exists';
SELECT coltype('public', 'users', 'username') IS NOT NULL AS 'users.username column exists';
SELECT coltype('public', 'users', 'nearest_rank_id') IS NOT NULL AS 'users.nearest_rank_id column exists';
SELECT coltype('public', 'users', 'weekly_transport_budget') IS NOT NULL AS 'users.weekly_transport_budget column exists';

-- ranks
SELECT has_table('public', 'ranks') AS 'ranks table exists';
SELECT col_not_null('public', 'ranks', 'id') AS 'ranks.id not null';
SELECT col_has_default('public', 'ranks', 'id') AS 'ranks.id has default';
SELECT col_has_default('public', 'ranks', 'fuel_alert_active') AS 'ranks.fuel_alert_active has default';

-- routes
SELECT has_table('public', 'routes') AS 'routes table exists';
SELECT col_not_null('public', 'routes', 'rank_id') AS 'routes.rank_id not null';

-- fare_reports
SELECT has_table('public', 'fare_reports') AS 'fare_reports table exists';
SELECT col_has_default('public', 'fare_reports', 'user_id') AS 'fare_reports.user_id has default';
SELECT col_not_null('public', 'fare_reports', 'amount_zar') AS 'fare_reports.amount_zar not null';

-- job_listings
SELECT has_table('public', 'job_listings') AS 'job_listings table exists';

-- user_activity
SELECT has_table('public', 'user_activity') AS 'user_activity table exists';

-- applications
SELECT has_table('public', 'applications') AS 'applications table exists';

-- fuel_price_snapshots
SELECT has_table('public', 'fuel_price_snapshots') AS 'fuel_price_snapshots table exists';

-- comments
SELECT has_table('public', 'comments') AS 'comments table exists';

-- follows
SELECT has_table('public', 'follows') AS 'follows table exists';

-- likes
SELECT has_table('public', 'likes') AS 'likes table exists';

SELECT * FROM finish();
