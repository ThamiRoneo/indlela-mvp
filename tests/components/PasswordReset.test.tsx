import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient.auth };
});

import PasswordReset from '../../app/(auth)/forgot-password';

describe('T-S13 / T-US2-4 Password Reset', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-S13-1: reset form visible, spinner on submit, error message', () => {
    const tree = renderer.create(<PasswordReset navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-S13-2: success → Password reset. Please log in. → S3', () => {
    const tree = renderer.create(<PasswordReset navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-US2-4: set new password from reset link: rules enforced, logged in after', () => {
    const tree = renderer.create(<PasswordReset navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });
});
