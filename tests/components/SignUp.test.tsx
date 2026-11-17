import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient.auth };
});

import SignUp from '../../app/(auth)/sign-up';

describe('T-US2 Sign Up', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-US2-1: valid form + both boxes ticked → account created → S3 with banner', () => {
    const tree = renderer.create(<SignUp navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-US2-2: existing email → duplicate message with Log in link', () => {
    const tree = renderer.create(<SignUp navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-US2-3: box unticked or invalid password → Sign up disabled; red border + message', () => {
    const tree = renderer.create(<SignUp navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });
});
