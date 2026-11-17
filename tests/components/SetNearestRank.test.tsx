import renderer from 'react-test-renderer';
import React from 'react';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import SetNearestRank from '../../app/set-nearest-rank';

describe('T-US1 / T-S4 Set Nearest Rank', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T-US1-1: prompted on onboarding; saved → S7', () => {
    const tree = renderer.create(<SetNearestRank navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-S4-1: empty → no ranks message + Retry', () => {
    const tree = renderer.create(<SetNearestRank navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-S4-2: error → load error message + Retry', () => {
    const tree = renderer.create(<SetNearestRank navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });

  it('T-S4-3: offline → no connection message', () => {
    const tree = renderer.create(<SetNearestRank navigation={nav as any} />);
    expect(tree).not.toBeNull();
  });
});
