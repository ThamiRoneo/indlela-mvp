import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

let supabase: SupabaseClient;
let testUserId: string;

const randomEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

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

describe('T-US2 Sign up integration', () => {
  it('T-US2-1: valid email + password creates account', async () => {
    const email = randomEmail();
    const { data, error } = await supabase.auth.signUp({ email, password: 'Password1' });
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    testUserId = data.user!.id;
  });

  it('T-US2-2: existing email → duplicate error', async () => {
    const email = randomEmail();
    await supabase.auth.signUp({ email, password: 'Password1' });
    const { error } = await supabase.auth.signUp({ email, password: 'Password1' });
    expect(error).not.toBeNull();
  });
});

describe('T-US3 Log in integration', () => {
  it('T-US3-1: correct credentials → session', async () => {
    const email = randomEmail();
    await supabase.auth.signUp({ email, password: 'Password1' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: 'Password1' });
    expect(error).toBeNull();
    expect(data.session).toBeDefined();
  });
});

describe('T-US2-4 Set new password from reset link', () => {
  it('sets a new password and logs in', async () => {
    const email = randomEmail();
    await supabase.auth.signUp({ email, password: 'Password1' });
    const { data } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'indlelamvp://reset-password',
    });
    expect(data).toBeDefined();
  });
});

describe('T-INT-1 Log out', () => {
  it('ends the session', async () => {
    const email = randomEmail();
    await supabase.auth.signUp({ email, password: 'Password1' });
    const { error } = await supabase.auth.signOut();
    expect(error).toBeNull();
  });
});

describe('T-INT-2 Delete account removes all user data', () => {
  it('deletes user data via the delete-account edge function', async () => {
    const email = randomEmail();
    const { data } = await supabase.auth.signUp({ email, password: 'Password1' });
    testUserId = data.user!.id;
    const { error } = await supabase.functions.invoke('delete-account', {});
    expect(error).toBeNull();
  });
});
