const SupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
    update: jest.fn(() => Promise.resolve({ data: [], error: null })),
    delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
    eq: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  })),
  auth: {
    signUp: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
    exchangeCodeForSession: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    updateUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
};

const createClient = jest.fn(() => SupabaseClient);

module.exports = { createClient, SupabaseClient };
module.exports.default = { createClient, SupabaseClient };
module.exports.createClient = createClient;
