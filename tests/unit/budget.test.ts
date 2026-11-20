import { isBudgetSet } from '../../lib/rules/budget';

describe('T-BR6-1 Weekly transport budget', () => {
  it('defaults to unset (null)', () => {
    expect(isBudgetSet(null)).toBe(false);
  });

  it('is set when a value is provided', () => {
    expect(isBudgetSet(0)).toBe(true);
    expect(isBudgetSet(500)).toBe(true);
  });
});
