export function netGain(wage: number | null, transportCost: number | null): number | null {
  if (wage == null || transportCost == null) return null;
  return wage - transportCost;
}

export function transportCostRoundTrip(fareAmount: number): number {
  return fareAmount * 2;
}

export function isAffordable(
  netGain: number | null,
  transportCost: number | null,
  budget: number | null,
): boolean {
  if (netGain == null || netGain < 0) return false;
  if (budget != null && transportCost != null && transportCost > budget) return false;
  return true;
}
