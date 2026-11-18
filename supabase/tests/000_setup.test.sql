-- T-SETUP-2: pgTAP runs: select has_schema('public') passes
SELECT plan(1);
SELECT has_schema('public') AS "public schema exists";
SELECT * FROM finish();
