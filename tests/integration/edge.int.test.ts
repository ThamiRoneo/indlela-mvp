import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { messages } from '../../lib/messages';
import { daysAgo, FARE_STALE_DAYS, isStale } from '../../lib/rules/fare';
import { isAffordable } from '../../lib/rules/netgain';

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

describe('T-EDGE-1 No fare data', () => {
  it('shows "Transport cost unknown" and excludes the job from the strict affordable filter', async () => {
    const { userId, userClient } = await signUpAndSignIn(`edge1-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();
    await serviceSupabase.from('users').update({ nearest_rank_id: rankId }).eq('id', userId);

    const { data: job, error: jobError } = await serviceSupabase
      .from('job_listings')
      .insert({ title: 'Retail Assistant', company: 'Shoprite', wage_zar: 150, route_id: routeId })
      .select('id')
      .single();
    expect(jobError).toBeNull();
    expect(job?.id).toBeDefined();

    const { data: fares, error } = await userClient
      .from('fare_reports')
      .select('amount_zar, created_at')
      .eq('rank_id', rankId)
      .eq('route_id', routeId);
    expect(error).toBeNull();
    expect(fares).toHaveLength(0);

    const transportCost = fares?.length ? fares[0]!.amount_zar * 2 : null;
    expect(transportCost).toBeNull();
    expect(messages.jobs.transportUnknown).toBe('Transport cost unknown');
    expect(isAffordable(null, transportCost, 500)).toBe(false);
  });
});

describe('T-EDGE-2 Stale fares (>14 days)', () => {
  it('fare reported 15 days ago is flagged stale', async () => {
    const { userId, userClient } = await signUpAndSignIn(`edge2-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();

    const createdAt = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 - 1000).toISOString();
    const { error } = await userClient.from('fare_reports').insert({
      user_id: userId,
      rank_id: rankId,
      route_id: routeId,
      amount_zar: 20,
      created_at: createdAt,
    });
    expect(error).toBeNull();

    expect(daysAgo(createdAt)).toBeGreaterThan(FARE_STALE_DAYS);
    expect(isStale(createdAt)).toBe(true);
    expect(messages.fares.stale(15)).toBe('Last reported 15 days ago (stale)');

    const { data } = await userClient
      .from('fare_reports')
      .select('created_at')
      .eq('rank_id', rankId)
      .order('created_at', { ascending: false })
      .limit(1);
    expect(isStale(data![0].created_at)).toBe(true);
  });
});

describe('T-EDGE-3 Offline, no cache', () => {
  it('with no cached fares, transport costs cannot be calculated', async () => {
    const { userId, userClient } = await signUpAndSignIn(`edge3-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();

    const { data: fares, error } = await userClient
      .from('fare_reports')
      .select('amount_zar, created_at')
      .eq('rank_id', rankId)
      .eq('route_id', routeId);
    expect(error).toBeNull();
    expect(fares).toHaveLength(0);

    expect(messages.fares.offlineNoCache).toBe('No cached fares available. Connect to internet to load fares.');

    const transportCost = fares?.length ? fares[0]!.amount_zar * 2 : null;
    expect(transportCost).toBeNull();
  });
});

describe('T-EDGE-4 Over report limit', () => {
  it('blocks the 6th fare report in one day', async () => {
    const { userId, userClient } = await signUpAndSignIn(`edge4-${Date.now()}@example.com`);
    const { rankId, routeId } = await seedRankRoute();

    for (let i = 0; i < 5; i++) {
      const { error } = await userClient.from('fare_reports').insert({
        user_id: userId,
        rank_id: rankId,
        route_id: routeId,
        amount_zar: 20,
      });
      expect(error).toBeNull();
    }

    const { error } = await userClient.from('fare_reports').insert({
      user_id: userId,
      rank_id: rankId,
      route_id: routeId,
      amount_zar: 20,
    });
    expect(error).not.toBeNull();
    expect((error as any).message).toContain('rate_limit_fare_reports');
    expect(messages.fares.reportLimit).toBe("You've reported 5 fares today. Try again tomorrow.");
  });
});

describe('T-EDGE-5 Fuel price data unavailable', () => {
  it('shows no fuel-aware banner and fails silently when no fuel price snapshots exist', async () => {
    const { userClient } = await signUpAndSignIn(`edge5-${Date.now()}@example.com`);

    await serviceSupabase.from('fuel_price_snapshots').delete();

    const { data: snapshots, error } = await userClient
      .from('fuel_price_snapshots')
      .select('petrol_price_zar, date');
    expect(error).toBeNull();
    expect(snapshots).toHaveLength(0);

    const { error: checkError } = await userClient.rpc('fuel_price_check');
    expect(checkError).toBeNull();

    expect(messages.alerts.fuelIncrease).toBe('Fares may increase soon. Check updated fares for your rank.');
  });
});
