import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

describe('T-REL-4 .env.example completeness and secret scan', () => {
  it('.env.example lists every variable used by the app, tests and scripts', () => {
    const envExample = readFileSync(join(ROOT, '.env.example'), 'utf8');
    const required = [
      'EXPO_PUBLIC_SUPABASE_URL',
      'SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'SEED_TEST_PASSWORD',
    ];
    for (const v of required) {
      expect(envExample).toContain(v);
    }
  });

  it('npx secretlint "**/*" finds no keys in the repository', () => {
    let exitCode = 0;
    try {
      execSync('npx secretlint "**/*"', { cwd: ROOT, maxBuffer: 50 * 1024 * 1024 });
    } catch (error: any) {
      exitCode = error.status ?? 1;
    }
    expect(exitCode).toBe(0);
  });

  it('README.md exists and documents setup commands', () => {
    const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
    expect(readme.length).toBeGreaterThan(100);
    expect(readme).toContain('npm install');
    expect(readme).toContain('npm test');
  });
});

describe('T-REL-1 full check on clean install (manual)', () => {
  it('placeholder — requires fresh clone and npx supabase start', () => {
    // Manual: fresh clone → npm install → npx supabase start → npx supabase db reset → npm run check
    // Cannot be automated in this environment (no Docker).
    expect(true).toBe(true);
  });
});

describe('T-REL-2 release build on real Android device (manual)', () => {
  it('placeholder — requires EAS Build and a physical device', () => {
    // Manual: npx eas-cli build -p android --profile preview → install APK → verify all screens
    expect(true).toBe(true);
  });
});

describe('T-REL-3 demo script runs end to end (manual)', () => {
  it('placeholder — requires a real device and seed data', () => {
    // Manual: run the demo flow from start to finish without errors
    expect(true).toBe(true);
  });
});