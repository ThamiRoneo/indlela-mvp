import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

let serviceSupabase: SupabaseClient;
const createdUserIds: string[] = [];

beforeAll(async () => {
  serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
});

afterEach(async () => {
  for (const id of createdUserIds) {
    await serviceSupabase.auth.admin.deleteUser(id).catch(() => {});
  }
  createdUserIds.length = 0;
});

async function signUpAndSignIn(email: string) {
  const password = 'Password1' + Date.now();
  const { data } = await serviceSupabase.auth.admin.createUser({ email, password, email_confirm: true });
  const userId = data!.user!.id;
  createdUserIds.push(userId);

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  await userClient.auth.signInWithPassword({ email, password });
  return { userId, userClient };
}

async function seedJob() {
  const { data: jobs } = await serviceSupabase.from('job_listings').select('id').limit(1);
  return jobs![0].id;
}

describe('T-SEC-9 job_listings read', () => {
  it('T-SEC-9a: any logged-in user can read job_listings', async () => {
    const { userClient } = await signUpAndSignIn(`sec9a-${Date.now()}@example.com`);
    const { data, error } = await userClient.from('job_listings').select('id');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('T-SEC-9b: logged out cannot read job_listings', async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await client.from('job_listings').select('id');
    expect(error).not.toBeNull();
  });
});

describe('T-SEC-10 job_listings write denied', () => {
  it('T-SEC-10b: job_listings cannot be created, updated or deleted by anyone', async () => {
    const { userClient } = await signUpAndSignIn(`sec10-${Date.now()}@example.com`);
    const jobId = await seedJob();

    const { error: insErr } = await userClient.from('job_listings').insert({
      title: 'Test Job', company: 'Test Co', wage_zar: 100,
    });
    expect(insErr).not.toBeNull();

    const { error: updErr } = await userClient.from('job_listings').update({ wage_zar: 200 }).eq('id', jobId);
    expect(updErr).not.toBeNull();

    const { error: delErr } = await userClient.from('job_listings').delete().eq('id', jobId);
    expect(delErr).not.toBeNull();
  });
});

describe('T-INT-4 Submit application', () => {
  it('submits an in-app application for a job', async () => {
    const { userId, userClient } = await signUpAndSignIn(`int4-${Date.now()}@example.com`);
    const jobId = await seedJob();

    const { error } = await userClient.from('applications').insert({
      job_listing_id: jobId,
      user_id: userId,
      name: 'Lerato Mokoena',
      phone: '0820000000',
      email: 'lerato@example.com',
    });
    expect(error).toBeNull();

    const { data } = await userClient.from('applications').select('*').eq('job_listing_id', jobId).single();
    expect(data!.name).toBe('Lerato Mokoena');
    expect(data!.email).toBe('lerato@example.com');
  });
});

describe('T-US6-1 Job feed integration', () => {
  it('returns seeded job listings', async () => {
    const { userClient } = await signUpAndSignIn(`us6-${Date.now()}@example.com`);
    const { data, error } = await userClient.from('job_listings').select('*').order('created_at', { ascending: false });
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });
});
