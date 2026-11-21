import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { messages } from '../messages';
import { isStale, daysAgo } from '../rules/fare';

export interface JobFeedItem {
  id: string;
  title: string;
  company: string | null;
  wage_zar: number | null;
  location: string | null;
  description: string | null;
  source_url: string | null;
  rank_id: string | null;
  route_id: string | null;
  transportCost: number | null;
  netGain: number | null;
  fareSource?: string;
  stale?: boolean;
  daysAgo?: number;
}

type FareInfo = { amount: number; created_at: string; source: string };

async function jobToFeedItem(j: any, fareMap: Record<string, FareInfo>): Promise<JobFeedItem> {
  const fare = j.route_id ? fareMap[j.route_id] : undefined;
  const transportCost = fare != null ? fare.amount * 2 : null;
  const wage = j.wage_zar ?? null;
  const netGain = wage != null && transportCost != null ? wage - transportCost : null;
  return {
    id: j.id,
    title: j.title,
    company: j.company,
    wage_zar: j.wage_zar,
    location: j.location,
    description: j.description,
    source_url: j.source_url,
    rank_id: j.rank_id,
    route_id: j.route_id,
    transportCost,
    netGain,
    ...(fare != null
      ? {
          fareSource: fare.source,
          stale: isStale(fare.created_at),
          daysAgo: daysAgo(fare.created_at),
        }
      : {}),
  };
}

function sortByNetGain(jobs: JobFeedItem[]): JobFeedItem[] {
  return jobs.sort((a, b) => {
    if (a.netGain == null && b.netGain == null) return 0;
    if (a.netGain == null) return 1;
    if (b.netGain == null) return 1;
    return b.netGain - a.netGain;
  });
}

export async function viewJobFeed(): Promise<{ data: JobFeedItem[] | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: messages.jobs.loadError };

  const { data: profile } = await supabase
    .from('users')
    .select('nearest_rank_id')
    .eq('id', user.id)
    .single();
  const rankId = profile?.nearest_rank_id;

  const { data: jobsData, error } = await supabase
    .from('job_listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: messages.jobs.loadError };

  let fareMap: Record<string, FareInfo> = {};
  if (rankId) {
    const { data: fares } = await supabase
      .from('fare_reports')
      .select('route_id, amount_zar, created_at, ranks (name)')
      .eq('rank_id', rankId)
      .order('created_at', { ascending: false });
    if (fares) {
      for (const f of fares) {
        if (!(f.route_id in fareMap)) {
          const ranks = Array.isArray(f.ranks) ? f.ranks[0] : f.ranks;
          fareMap[f.route_id] = {
            amount: f.amount_zar,
            created_at: f.created_at,
            source: ranks?.name || 'Taxi rank',
          };
        }
      }
    }
  }

  const jobs: JobFeedItem[] = [];
  for (const j of (jobsData || [])) {
    jobs.push(await jobToFeedItem(j, fareMap));
  }

  return { data: sortByNetGain(jobs), error: null };
}

export async function viewJobDetails(jobId: string): Promise<{ data: JobFeedItem | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: messages.jobs.detailsError };

  const { data: profile } = await supabase
    .from('users')
    .select('nearest_rank_id')
    .eq('id', user.id)
    .single();
  const rankId = profile?.nearest_rank_id;

  const { data, error } = await supabase
    .from('job_listings')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) return { data: null, error: messages.jobs.detailsError };

  let fareMap: Record<string, FareInfo> = {};
  if (rankId && data?.route_id) {
    const { data: fares } = await supabase
      .from('fare_reports')
      .select('amount_zar, created_at, ranks (name)')
      .eq('rank_id', rankId)
      .eq('route_id', data.route_id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (fares && fares.length > 0) {
      const f = fares[0];
      const ranks = Array.isArray(f.ranks) ? f.ranks[0] : f.ranks;
      fareMap[data.route_id] = {
        amount: f.amount_zar,
        created_at: f.created_at,
        source: ranks?.name || 'Taxi rank',
      };
    }
  }

  const item = await jobToFeedItem(data, fareMap);
  return { data: item, error: null };
}

export async function submitApplication(
  jobId: string,
  name: string,
  phone: string,
  email: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('applications').insert({
    job_listing_id: jobId,
    name,
    phone,
    email,
  });
  if (error) return { error: messages.jobs.submitError };
  return { error: null };
}

const JOBS_CACHE_KEY = 'indlela:jobs';
const JOBS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // BR8

export async function cacheJobs(jobs: JobFeedItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(JOBS_CACHE_KEY, JSON.stringify({ jobs, cachedAt: Date.now() }));
  } catch {
    // cache write failure is non-fatal
  }
}

export async function getCachedJobs(): Promise<JobFeedItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(JOBS_CACHE_KEY);
    if (!raw) return null;
    const { jobs, cachedAt } = JSON.parse(raw);
    if (Date.now() - (cachedAt || 0) > JOBS_CACHE_TTL_MS) return null;
    return jobs;
  } catch {
    return null;
  }
}
