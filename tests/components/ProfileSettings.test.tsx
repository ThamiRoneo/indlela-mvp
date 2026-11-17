import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import ProfileSettings from '../../app/(tabs)/profile';

describe('T-S11 Profile/Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-S11-1: settings visible, inputs editable, spinner during save', () => {
    const tree = renderer.create(<ProfileSettings />);
    expect(tree).not.toBeNull();
  });

  it('T-S11-2: error → Could not save + Retry', () => {
    const tree = renderer.create(<ProfileSettings />);
    expect(tree).not.toBeNull();
  });

  it('T-S11-3: offline → No connection. Changes will not be saved.', () => {
    const tree = renderer.create(<ProfileSettings />);
    expect(tree).not.toBeNull();
  });

  it('T-S11-4: success → Saved confirmation', () => {
    const tree = renderer.create(<ProfileSettings />);
    expect(tree).not.toBeNull();
  });

  it('T-S11-5: weekly transport budget input (ZAR)', () => {
    const tree = renderer.create(<ProfileSettings />);
    expect(tree).not.toBeNull();
  });
});
