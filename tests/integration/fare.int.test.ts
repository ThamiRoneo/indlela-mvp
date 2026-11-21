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

async function seedRankRoute() {
  const { data: ranks } = await serviceSupabase.from('ranks').select('id').limit(1);
  const { data: routes } = await serviceSupabase.from('routes').select('id').limit(1);
  return { rankId: ranks![0].id, routeId: routes![0].id };
}

describe('T-SEC-6 fare_reports read', () => {
  it('T-SEC-6a: any logged-in user can read fare_reports', async () => {
    const { userClient } = await signUpAndSignIn(`sec6a-${Date.now()}@example.com`);
    const { data, error } = await userClient.from('fare_reports').select('id');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('T-SEC-6b: logged out cannot read fare_reports', async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await client.from('fare_reports').select('id');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe('T-SEC-7 fare_reports create', () => {
  it('T-SEC-7a: user can create own fare_report', async () => {
    const { userId, userClient } = await signUpAndSignIn(`sec7a-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();
    const { error } = await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 20 });
    expect(error).toBeNull();
  });

  it('T-SEC-7b: user cannot create fare_report for another user', async () => {
    const { userId, userClient } = await signUpAndSignIn(`sec7b-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();
    const otherId = '22222222-2222-2222-2222-222222222222';
    const { error } = await userClient.from('fare_reports').insert({ user_id: otherId, rank_id: rankId, route_id: routeId, amount_zar: 20 });
    expect(error).not.toBeNull();
  });
});

describe('T-SEC-8 fare_reports update/delete denied', () => {
  it('T-SEC-8b: fare_reports cannot be updated or deleted by anyone', async () => {
    const { userId, userClient } = await signUpAndSignIn(`sec8-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();
    const { data } = await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 20 }).select('id');
    const id = data![0].id;

    const { error: updErr } = await userClient.from('fare_reports').update({ amount_zar: 99 }).eq('id', id);
    expect(updErr).toBeNull();

    const { error: delErr } = await userClient.from('fare_reports').delete().eq('id', id);
    expect(delErr).toBeNull();

    const { data: after, error: selectErr } = await userClient
      .from('fare_reports')
      .select('id, amount_zar')
      .eq('id', id)
      .single();
    expect(selectErr).toBeNull();
    expect(after!.id).toBe(id);
    expect(after!.amount_zar).toBe(20);
  });
});

describe('T-SEC-13 fuel_price_snapshots read', () => {
  it('T-SEC-13a: any logged-in user can read fuel_price_snapshots', async () => {
    const { userClient } = await signUpAndSignIn(`sec13a-${Date.now()}@example.com`);
    const { data, error } = await userClient.from('fuel_price_snapshots').select('id');
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it('T-SEC-13b: logged out cannot read fuel_price_snapshots', async () => {
    const client = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await client.from('fuel_price_snapshots').select('id');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
});

describe('T-BR3-1 Daily fare report limit (integration)', () => {
  it('rejects the 6th fare report in one day', async () => {
    const { userId, userClient } = await signUpAndSignIn(`br3-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();

    for (let i = 0; i < 5; i++) {
      await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 20 });
    }

    const { error } = await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 20 });
    expect(error).not.toBeNull();
    expect((error as any).message).toContain('rate_limit_fare_reports');
  });
});

describe('T-US4-1 / T-US5-1 Fares integration', () => {
  it('T-US4-1: view fares for a rank returns reports with routes', async () => {
    const { userId, userClient } = await signUpAndSignIn(`us4-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();
    await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 180 });

    const { data, error } = await userClient
      .from('fare_reports')
      .select(`id, amount_zar, created_at, routes (destination)`)
      .eq('rank_id', rankId)
      .order('created_at', { ascending: false });
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  it('T-US5-1: report a fare succeeds and shows success', async () => {
    const { userId, userClient } = await signUpAndSignIn(`us5-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();
    const { error } = await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 45 });
    expect(error).toBeNull();
  });
});
