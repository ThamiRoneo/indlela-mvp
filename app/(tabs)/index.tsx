import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { viewJobFeed, cacheJobs, getCachedJobs, type JobFeedItem } from '../../lib/api/jobs';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Banner } from '../../components/Banner';
import { Toggle } from '../../components/Toggle';
import { FilterChip } from '../../components/FilterChip';

type ChipFilter = 'all' | 'affordable' | 'high';

export default function HomeFeed() {
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [chipFilter, setChipFilter] = useState<ChipFilter>('all');
  const [budget, setBudget] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from('users')
        .select('weekly_transport_budget')
        .eq('id', user.id)
        .single();
      setBudget(profile?.weekly_transport_budget ?? null);

      const connected = await NetInfo.fetch();
      if (!connected.isConnected) {
        const cached = await getCachedJobs();
        setJobs(cached || []);
        setOffline(!!cached);
        setLoading(false);
        return;
      }

      setOffline(false);
      const { data, error: jobsError } = await viewJobFeed();
      if (jobsError) {
        setError(jobsError);
        setLoading(false);
        return;
      }
      const sorted = (data || []).slice().sort((a, b) => {
        if (a.netGain == null && b.netGain == null) return 0;
        if (a.netGain == null) return 1;
        if (b.netGain == null) return 1;
        return b.netGain - a.netGain;
      });
      setJobs(sorted);
      try {
        await cacheJobs(sorted);
      } catch {
        // cache write failure is non-fatal
      }
      setLoading(false);
    } catch {
      setError(messages.jobs.loadError);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  const isAffordable = (job: JobFeedItem) =>
    job.netGain != null &&
    job.netGain >= 0 &&
    (budget == null || (job.transportCost ?? 0) <= budget);

  const displayJobs = jobs.filter((job) => {
    if ((affordableOnly || chipFilter === 'affordable') && !isAffordable(job)) return false;
    if (chipFilter === 'high' && (job.netGain == null || job.netGain <= 0)) return false;
    return true;
  });

  const emptyMessage = (affordableOnly || chipFilter === 'affordable') && jobs.length > 0
    ? messages.jobs.emptyAffordable
    : messages.jobs.empty;

  return (
    <View style={styles.container}>
      <TopAppBar title="Home" />
      {error ? (
        <EmptyState text={error} actionLabel="Retry" onAction={load} />
      ) : (
        <>
          <View style={styles.controls}>
            <Toggle
              value={affordableOnly}
              onChange={setAffordableOnly}
              label={messages.jobs.affordabilityToggle}
            />
            <View style={styles.chips}>
              <FilterChip
                selected={chipFilter === 'all'}
                label={messages.jobs.filterAll}
                onPress={() => setChipFilter('all')}
              />
              <FilterChip
                selected={chipFilter === 'affordable'}
                label={messages.jobs.filterAffordable}
                onPress={() => setChipFilter('affordable')}
              />
              <FilterChip
                selected={chipFilter === 'high'}
                label={messages.jobs.filterHighNetGain}
                onPress={() => setChipFilter('high')}
              />
            </View>
          </View>
          <Text style={styles.sectionHeader}>{messages.jobs.sortedByNetGain}</Text>
          {offline && <Banner variant="info">{messages.jobs.offlineCached}</Banner>}
          {displayJobs.length === 0 ? (
            <EmptyState text={emptyMessage} />
          ) : (
            <FlatList
              data={displayJobs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card
                  type="job"
                  title={item.title}
                  company={item.company || ''}
                  wage={item.wage_zar ?? undefined}
                  transportCost={item.transportCost ?? undefined}
                  netGain={item.netGain ?? undefined}
                />
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: { paddingHorizontal: tokens.space.md },
  chips: { flexDirection: 'row', marginTop: tokens.space.sm },
  sectionHeader: {
    fontSize: tokens.font.h2.size,
    fontWeight: '600',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
  },
});
