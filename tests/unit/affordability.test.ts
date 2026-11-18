import { isAffordable } from '../../lib/rules/netgain';

describe('T-BR5-1 Affordability filter: Net Gain >= 0 and within budget', () => {
  it('affordable when net gain >= 0 and no budget set', () => {
    expect(isAffordable(70, 90, null)).toBe(true);
    expect(isAffordable(0, 90, null)).toBe(true);
  });

  it('not affordable when net gain < 0', () => {
    expect(isAffordable(-10, 90, null)).toBe(false);
  });

  it('not affordable when transport cost exceeds weekly budget', () => {
    expect(isAffordable(70, 600, 500)).toBe(false);
  });

  it('affordable within budget when net gain >= 0 and cost <= budget', () => {
    expect(isAffordable(70, 400, 500)).toBe(true);
  });

  it('not affordable when net gain is null', () => {
    expect(isAffordable(null, 90, null)).toBe(false);
  });
});
