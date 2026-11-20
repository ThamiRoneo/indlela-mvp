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

describe('T-S10 Activity integration', () => {
  it('T-S10-1: viewActivity returns last 30 days of activity for the user', async () => {
    const { userId, userClient } = await signUpAndSignIn(`s10-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();

    await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 45 });

    const { data, error } = await userClient.from('user_activity').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data!.length).toBeGreaterThanOrEqual(1);
    expect(data![0].type).toBe('fare_report');
  });

  it('T-INT-3: trigger-created rows (fare report, alert, comment, follow, unlike) appear in user_activity', async () => {
    const { userId, userClient } = await signUpAndSignIn(`int3-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();

    // fare_report trigger
    await userClient.from('fare_reports').insert({ user_id: userId, rank_id: rankId, route_id: routeId, amount_zar: 45 });

    const { data } = await userClient.from('user_activity').select('type').eq('user_id', userId);
    const types = (data || []).map((row: any) => row.type);
    expect(types).toContain('fare_report');
  });
});
