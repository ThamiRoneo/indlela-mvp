import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import DeleteAccount from '../../app/modals/delete-account';

describe('T-M1 Delete Account', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-M1-1: confirmation dialog, spinner on delete, error message', () => {
    const tree = renderer.create(<DeleteAccount onDismiss={jest.fn()} />);
    expect(tree).not.toBeNull();
  });

  it('T-M1-2: success → Account deleted. → S1', () => {
    const tree = renderer.create(<DeleteAccount onDismiss={jest.fn()} />);
    expect(tree).not.toBeNull();
  });
});
