/**
 * seed-storage.ts — upload seed photos to the private Storage buckets.
 *
 * Uses the service-role key, which bypasses RLS (SEC17). The app never calls
 * this; it only reads the uploaded objects through signed URLs (SEC16). Keep
 * the service-role key out of the app bundle and out of logs.
 *
 * Run with Node 24's native TypeScript support:
 *   node scripts/seed-storage.ts
 *
 * Required env (loaded from .env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SEED_TEST_PASSWORD. The seed account email matches the Maestro flows.
 */
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createClient } = require('@supabase/supabase-js');
type SupabaseClient = ReturnType<typeof createClient>;

// Load .env explicitly — this script runs outside Expo.
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || line.trim().startsWith('#')) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedPassword = process.env.SEED_TEST_PASSWORD;
const seedEmail = 'e2e-test@example.com';

// A valid 16x16 JPEG (291 bytes), well under both bucket limits.
const JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAAQABADAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAYI/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Ag6cZ0AAAf//Z';
const jpegBytes = Buffer.from(JPEG_BASE64, 'base64');

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env before running seed-storage.`);
  }
  return value;
}

async function findOrCreateSeedUser(admin: SupabaseClient): Promise<string> {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: seedEmail,
    password: requireEnv('SEED_TEST_PASSWORD', seedPassword),
    email_confirm: true,
  });
  if (!createError && created.user) {
    return created.user.id;
  }

  // "Already registered" is expected on repeat runs — resolve the existing id.
  const { data: listed, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }
  const existing = listed.users.find((u: { id: string; email?: string }) => u.email === seedEmail);
  if (!existing) {
    throw new Error(`Could not create or find seed account ${seedEmail}: ${createError?.message ?? 'unknown error'}`);
  }
  return existing.id;
}

async function main(): Promise<void> {
  const url = requireEnv('SUPABASE_URL', supabaseUrl);
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);
  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await findOrCreateSeedUser(admin);

  const uploads = [
    { bucket: 'avatars', path: `${userId}/avatar.jpg` },
    { bucket: 'posts', path: 'seed/job-1.jpg' },
  ];

  for (const { bucket, path } of uploads) {
    const { error } = await admin.storage.from(bucket).upload(path, jpegBytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) {
      throw new Error(`Upload to ${bucket}/${path} failed: ${error.message}`);
    }
    console.log(`Seeded ${bucket}/${path}`);
  }

  console.log('Storage seed complete.');
}

main().catch((error: unknown) => {
  console.error('seed-storage failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
