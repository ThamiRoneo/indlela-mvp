import { supabase } from '../../lib/supabase';

describe('T-SETUP-3 Integration', () => {
  it('The app\'s Supabase client connects to the local backend', async () => {
    const { data, error } = await supabase.from('ranks').select('count', { head: true });
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
