import { netGain, transportCostRoundTrip } from '../../lib/rules/netgain';

describe('T-BR4-1 Net Gain = Wage - (to-and-fro transport cost)', () => {
  it('calculates net gain from wage minus round-trip transport', () => {
    expect(netGain(250, 90)).toBe(160);
    expect(netGain(150, 90)).toBe(60);
    expect(netGain(180, 90)).toBe(90);
  });

  it('uses round-trip (to-and-fro) transport cost', () => {
    const cost = transportCostRoundTrip(45);
    expect(cost).toBe(90);
    expect(netGain(250, cost)).toBe(160);
  });

  it('returns null when wage is missing', () => {
    expect(netGain(null, 90)).toBeNull();
  });

  it('returns null when transport cost is missing', () => {
    expect(netGain(250, null)).toBeNull();
  });
});

describe('T-BR4-2 Transport cost unknown when no fare data', () => {
  it('returns null net gain when transport cost is unknown', () => {
    expect(netGain(250, null)).toBeNull();
  });
});
