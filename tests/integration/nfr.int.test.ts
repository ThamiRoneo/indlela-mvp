import { execSync } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { type SupabaseClient } from '@supabase/supabase-js';

const ROOT = process.cwd();
const SOURCE_DIRS = [join(ROOT, 'app'), join(ROOT, 'components'), join(ROOT, 'lib')];
const EXCLUDED_DIRS = new Set(['node_modules', '.expo', 'tests']);
const EXCLUDED_NAMES = new Set(['package-lock.json']);
const EXCLUDED_PREFIXES = ['.env'];
const SOURCE_EXT = /\.(ts|tsx|js|jsx)$/;

function collectSourceFiles(dir: string, results: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      collectSourceFiles(full, results);
    } else if (entry.isFile() && SOURCE_EXT.test(entry.name)) {
      if (EXCLUDED_NAMES.has(entry.name)) continue;
      if (EXCLUDED_PREFIXES.some((prefix) => entry.name.startsWith(prefix))) continue;
      results.push(full);
    }
  }
  return results;
}

const sourceFiles = SOURCE_DIRS.flatMap((dir) => collectSourceFiles(dir));
const SERVICE_ROLE = /SERVICE_ROLE/i;
const LOG_SECRET = /console\.(?:log|error)\s*\([\s\S]{0,500}?(?:\bemail\b|\btoken\b|\bpassword\b|\bsecret\b)/i;

describe('T-NFR-1 secret scan', () => {
  it('npx secretlint "**/*" finds no keys', () => {
    let exitCode = 0;
    try {
      execSync('npx secretlint "**/*"', { cwd: ROOT, maxBuffer: 50 * 1024 * 1024 });
    } catch (error: any) {
      exitCode = error.status ?? 1;
    }
    expect(exitCode).toBe(0);
  });
});

describe('T-NFR-2 no SERVICE_ROLE in app/components/lib', () => {
  it('no source file references SERVICE_ROLE', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      if (SERVICE_ROLE.test(content)) violations.push(file);
    }
    expect(violations).toEqual([]);
  });
});

describe('T-NFR-3 no passwords, tokens or emails in logs', () => {
  it('no console.log/console.error references email, token, password, or secret', () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      if (LOG_SECRET.test(content)) violations.push(file);
    }
    expect(violations).toEqual([]);
  });
});

describe('T-NFR-7 rate limits enforced by database triggers', () => {
  it('limit_fare_reports trigger exists on public.fare_reports', async () => {
    const { createClient: realCreateClient } = jest.requireActual(
      '@supabase/supabase-js',
    ) as { createClient: (url: string, key: string, options?: unknown) => SupabaseClient };
    const url = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';
    const admin = realCreateClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('event_object_schema', 'public')
      .eq('event_object_table', 'fare_reports')
      .ilike('trigger_name', '%limit_fare_reports%');

    expect(error).toBeNull();
    const names = (data || []).map((row: { trigger_name: string }) => row.trigger_name);
    expect(names.some((name) => /limit_fare_reports/i.test(name))).toBe(true);
  });
});
