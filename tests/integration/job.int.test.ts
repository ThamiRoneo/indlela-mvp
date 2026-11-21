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
    const { data, error } = await client.from('job_listings').select('id');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe('T-SEC-10 job_listings write denied', () => {
  it('T-SEC-10b: job_listings cannot be created, updated or deleted by anyone', async () => {
    const { userClient } = await signUpAndSignIn(`sec10-${Date.now()}@example.com`);
    const jobId = await seedJob();

    const { data: seededJob } = await serviceSupabase
      .from('job_listings')
      .select('id, wage_zar')
      .eq('id', jobId)
      .single();
    const originalWage = seededJob!.wage_zar;

    const { error: insErr } = await userClient.from('job_listings').insert({
      title: 'Test Job', company: 'Test Co', wage_zar: 100,
    });
    // INSERT is blocked by the WITH CHECK policy (42501); UPDATE/DELETE are silent RLS no-ops.
    if (insErr) {
      expect(insErr.code).toBe('42501');
    }

    const { error: updErr } = await userClient.from('job_listings').update({ wage_zar: 200 }).eq('id', jobId);
    expect(updErr).toBeNull();

    const { error: delErr } = await userClient.from('job_listings').delete().eq('id', jobId);
    expect(delErr).toBeNull();

    const { data: after, error: selectErr } = await serviceSupabase
      .from('job_listings')
      .select('id, wage_zar')
      .eq('id', jobId)
      .single();
    expect(selectErr).toBeNull();
    expect(after!.id).toBe(jobId);
    expect(after!.wage_zar).toBe(originalWage);

    const { data: newJobs, error: newJobsErr } = await serviceSupabase
      .from('job_listings')
      .select('id')
      .eq('title', 'Test Job');
    expect(newJobsErr).toBeNull();
    expect(newJobs).toEqual([]);
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

    // applications has an INSERT policy but no SELECT policy, so read back as admin.
    const { data } = await serviceSupabase
      .from('applications')
      .select('name, email')
      .eq('job_listing_id', jobId)
      .eq('user_id', userId)
      .single();
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
