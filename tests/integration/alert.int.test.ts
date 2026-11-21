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

async function seedFuelSnapshot(price: number, date = new Date().toISOString().slice(0, 10)) {
  const { error } = await serviceSupabase
    .from('fuel_price_snapshots')
    .insert({ date, petrol_price_zar: price, source: 'AA' });
  expect(error).toBeNull();
}

// fuel_price_check averages only snapshots with date < max(date), so start from a
// clean slate with no existing same-day rows and a cleared alert flag.
async function resetFuelAlertState() {
  const { error: deleteError } = await serviceSupabase
    .from('fuel_price_snapshots')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  expect(deleteError).toBeNull();

  const { error: resetError } = await serviceSupabase
    .from('ranks')
    .update({ fuel_alert_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  expect(resetError).toBeNull();
}

async function seedRankRoute() {
  const { data: ranks } = await serviceSupabase.from('ranks').select('id').limit(1);
  const { data: routes } = await serviceSupabase.from('routes').select('id').limit(1);
  return { rankId: ranks![0].id, routeId: routes![0].id };
}

describe('T-US8-1 Fare alerts integration', () => {
  it('viewFareAlerts returns fuelAlert true when price up >= 5% (BR7)', async () => {
    const { userClient } = await signUpAndSignIn(`us8-${Date.now()}@example.com`);
    await resetFuelAlertState();
    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await seedFuelSnapshot(25.00, baselineDate);
    await seedFuelSnapshot(30.00); // 20% increase over the older baseline average

    const { error } = await userClient.rpc('fuel_price_check');
    expect(error).toBeNull();

    const { data: ranks } = await serviceSupabase.from('ranks').select('fuel_alert_active').limit(1);
    expect(ranks![0].fuel_alert_active).toBe(true);
  });

  it('viewFareAlerts does not flag when price change is below 5%', async () => {
    const { userClient } = await signUpAndSignIn(`us8b-${Date.now()}@example.com`);
    await resetFuelAlertState();
    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await seedFuelSnapshot(25.00, baselineDate);
    await seedFuelSnapshot(26.00); // 4% increase over the older baseline average

    const { error } = await userClient.rpc('fuel_price_check');
    expect(error).toBeNull();

    const { data: ranks } = await serviceSupabase.from('ranks').select('fuel_alert_active').limit(1);
    expect(ranks![0].fuel_alert_active).toBe(false);
  });
});

describe('T-US7-1 Weekly transport budget integration', () => {
  it('can set weekly transport budget on the profile (S11)', async () => {
    const { userId, userClient } = await signUpAndSignIn(`us7-${Date.now()}@example.com`);
    const { rankId } = await seedRankRoute();
    await serviceSupabase.from('users').update({ nearest_rank_id: rankId }).eq('id', userId);

    const { error } = await userClient.from('users').update({ weekly_transport_budget: 500 }).eq('id', userId);
    expect(error).toBeNull();

    const { data } = await userClient.from('users').select('weekly_transport_budget').eq('id', userId).single();
    expect(data!.weekly_transport_budget).toBe(500);
  });

  it('budget defaults to unset (null)', async () => {
    const { userId, userClient } = await signUpAndSignIn(`us7b-${Date.now()}@example.com`);
    const { data } = await userClient.from('users').select('weekly_transport_budget').eq('id', userId).single();
    expect(data!.weekly_transport_budget).toBeNull();
  });
});
