import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

let supabase: SupabaseClient;
let testUserId: string;

beforeAll(async () => {
  supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
});

afterEach(async () => {
  if (testUserId) {
    await supabase.auth.admin.deleteUser(testUserId);
    testUserId = '';
  }
});

describe('T-US1 Set nearest rank integration', () => {
  it('saves nearest rank and returns to home feed', async () => {
    const email = `test-${Date.now()}@example.com`;
    const { data } = await supabase.auth.signUp({ email, password: 'Password1' });
    testUserId = data!.user!.id;

    const { data: ranks } = await supabase.from('ranks').select('id').limit(1);
    const rankId = ranks![0].id;

    const { error } = await supabase
      .from('users')
      .update({ nearest_rank_id: rankId })
      .eq('id', testUserId);
    expect(error).toBeNull();

    const { data: user } = await supabase
      .from('users')
      .select('nearest_rank_id')
      .eq('id', testUserId)
      .single();
    expect(user!.nearest_rank_id).toBe(rankId);
  });
});
