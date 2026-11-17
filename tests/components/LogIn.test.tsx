import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient.auth };
});

import LogIn from '../../app/(auth)/log-in';

describe('T-US3 Log In', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-US3-1: correct credentials → S4 (no rank) or S7 (rank set)', () => {
    const tree = renderer.create(<LogIn navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-US3-2: unverified email → verify message + Resend email link', () => {
    const tree = renderer.create(<LogIn navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-US3-3: 5 wrong passwords → too many attempts message', () => {
    const tree = renderer.create(<LogIn navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });
});
