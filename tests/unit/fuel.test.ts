import { fuelPriceChangePct, shouldFuelAlert } from '../../lib/rules/fare';

describe('T-BR7-2 Fuel price check', () => {
  it('compares latest price to 30-day average', () => {
    expect(fuelPriceChangePct(26.25, 25.00)).toBeCloseTo(5, 4);
    expect(fuelPriceChangePct(25.00, 25.00)).toBeCloseTo(0, 4);
  });

  it('flags an alert when fuel price is up >= 5%', () => {
    expect(shouldFuelAlert(fuelPriceChangePct(26.25, 25.00))).toBe(true);
    expect(shouldFuelAlert(fuelPriceChangePct(30.00, 25.00))).toBe(true);
  });

  it('does not flag when fuel price is up less than 5%', () => {
    expect(shouldFuelAlert(fuelPriceChangePct(26.00, 25.00))).toBe(false);
    expect(shouldFuelAlert(fuelPriceChangePct(25.00, 26.00))).toBe(false);
  });
});
