import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messages } from '../messages';
import { isStale, daysAgo } from '../rules/fare';

const CACHE_PREFIX = 'indlela:fares:';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // BR8: cache top ranks/routes for 7 days

export interface FareReport {
  id: string;
  route_id: string;
  destination: string;
  amount_zar: number;
  created_at: string;
  stale: boolean;
  days_ago: number;
}

export async function viewFares(rankId: string): Promise<{ data: FareReport[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('fare_reports')
    .select(`id, route_id, amount_zar, created_at, routes (id, destination)`)
    .eq('rank_id', rankId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: messages.fares.loadError };

  const reports: FareReport[] = (data || []).map((r: any) => ({
    id: r.id,
    route_id: r.route_id,
    destination: r.routes?.destination || 'Unknown route',
    amount_zar: r.amount_zar,
    created_at: r.created_at,
    stale: isStale(r.created_at),
    days_ago: daysAgo(r.created_at),
  }));

  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${rankId}`, JSON.stringify({ reports, cachedAt: Date.now() }));
  } catch {
    // cache write failure is non-fatal
  }

  return { data: reports, error: null };
}

export async function getCachedFares(rankId: string): Promise<FareReport[] | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${rankId}`);
    if (!raw) return null;
    const { reports, cachedAt } = JSON.parse(raw);
    if (Date.now() - (cachedAt || 0) > CACHE_TTL_MS) return null;
    return reports;
  } catch {
    return null;
  }
}

export async function reportFare(rankId: string, routeId: string, amountZar: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from('fare_reports').insert({
    rank_id: rankId,
    route_id: routeId,
    amount_zar: amountZar,
  });
  if (error) return { error: messages.fares.submitError };
  return { error: null };
}

export async function viewFareAlerts(): Promise<{ data: { fuelAlert: boolean } | null; error: string | null }> {
  const { data: snapshots, error } = await supabase.from('fuel_price_snapshots').select('petrol_price_zar, date').order('date', { ascending: false });
  if (error) return { data: null, error: messages.alerts.loadError };

  if (!snapshots || snapshots.length === 0) return { data: { fuelAlert: false }, error: null };

  const latest = Number(snapshots[0].petrol_price_zar);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent = snapshots.filter((s: any) => new Date(s.date) >= thirtyDaysAgo);
  if (recent.length === 0) return { data: { fuelAlert: false }, error: null };

  const avg = recent.reduce((sum: number, s: any) => sum + Number(s.petrol_price_zar), 0) / recent.length;
  const fuelAlert = latest / avg >= 1.05; // BR7: up >= 5%
  return { data: { fuelAlert }, error: null };
}
