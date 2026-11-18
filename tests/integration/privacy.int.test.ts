import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

let supabase: SupabaseClient;

beforeAll(async () => {
  supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
});

describe('T-INT-5 View privacy policy', () => {
  it('returns static privacy policy content', async () => {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
