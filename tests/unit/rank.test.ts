import { requiresNearestRank } from '../../lib/rules/rank';

describe('T-BR1-1 Nearest rank required on first use', () => {
  it('requires a nearest rank when none is set', () => {
    expect(requiresNearestRank(null)).toBe(true);
    expect(requiresNearestRank(undefined)).toBe(true);
  });

  it('does not require a nearest rank when one is set', () => {
    expect(requiresNearestRank('some-rank-id')).toBe(false);
  });
});
