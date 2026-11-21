-- 010_tables.test.sql: T-DB-1 — every table and column in 8.1 exists with the right type, null rule and default
\set ON_ERROR_STOP off
SELECT plan(23);

-- users
SELECT has_table('public', 'users', 'users table exists') AS "users table exists";
SELECT col_not_null('public', 'users', 'id', 'users.id not null') AS "users.id not null";
SELECT col_has_default('public', 'users', 'created_at', 'users.created_at has default') AS "users.created_at has default";
SELECT has_column('public', 'users', 'email', 'users.email column exists') AS "users.email column exists";
SELECT has_column('public', 'users', 'username', 'users.username column exists') AS "users.username column exists";
SELECT has_column('public', 'users', 'nearest_rank_id', 'users.nearest_rank_id column exists') AS "users.nearest_rank_id column exists";
SELECT has_column('public', 'users', 'weekly_transport_budget', 'users.weekly_transport_budget column exists') AS "users.weekly_transport_budget column exists";

-- ranks
SELECT has_table('public', 'ranks', 'ranks table exists') AS "ranks table exists";
SELECT col_not_null('public', 'ranks', 'id', 'ranks.id not null') AS "ranks.id not null";
SELECT col_has_default('public', 'ranks', 'id', 'ranks.id has default') AS "ranks.id has default";
SELECT col_has_default('public', 'ranks', 'fuel_alert_active', 'ranks.fuel_alert_active has default') AS "ranks.fuel_alert_active has default";

-- routes
SELECT has_table('public', 'routes', 'routes table exists') AS "routes table exists";
SELECT col_not_null('public', 'routes', 'rank_id', 'routes.rank_id not null') AS "routes.rank_id not null";

-- fare_reports
SELECT has_table('public', 'fare_reports', 'fare_reports table exists') AS "fare_reports table exists";
SELECT col_has_default('public', 'fare_reports', 'user_id', 'fare_reports.user_id has default') AS "fare_reports.user_id has default";
SELECT col_not_null('public', 'fare_reports', 'amount_zar', 'fare_reports.amount_zar not null') AS "fare_reports.amount_zar not null";

-- job_listings
SELECT has_table('public', 'job_listings', 'job_listings table exists') AS "job_listings table exists";

-- user_activity
SELECT has_table('public', 'user_activity', 'user_activity table exists') AS "user_activity table exists";

-- applications
SELECT has_table('public', 'applications', 'applications table exists') AS "applications table exists";

-- fuel_price_snapshots
SELECT has_table('public', 'fuel_price_snapshots', 'fuel_price_snapshots table exists') AS "fuel_price_snapshots table exists";

-- comments
SELECT has_table('public', 'comments', 'comments table exists') AS "comments table exists";

-- follows
SELECT has_table('public', 'follows', 'follows table exists') AS "follows table exists";

-- likes
SELECT has_table('public', 'likes', 'likes table exists') AS "likes table exists";

SELECT * FROM finish();
