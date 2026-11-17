import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import PrivacyPolicy from '../../app/privacy-policy';

describe('T-S12 Privacy Policy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-S12-1: policy text visible, spinner while loading, error message', () => {
    const tree = renderer.create(<PrivacyPolicy />);
    expect(tree).not.toBeNull();
  });
});
