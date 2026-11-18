import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { viewJobFeed, type JobFeedItem } from '../../lib/api/jobs';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';

export default function HomeFeed() {
  const [jobs, setJobs] = useState<JobFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affordableOnly, setAffordableOnly] = useState(false);
  const [budget, setBudget] = useState<number | null>(null);

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

  const displayJobs = affordableOnly
    ? jobs.filter((j) => j.netGain != null && j.netGain >= 0 && (budget == null || (j.transportCost ?? 0) <= budget))
    : jobs;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Home Feed" />
        <EmptyState text={error} actionLabel="Retry" onAction={load} />
      </View>
    );
  }

  const hasJobs = displayJobs.length > 0;
  const emptyMessage = affordableOnly && jobs.length > 0
    ? messages.jobs.emptyAffordable
    : messages.jobs.empty;

  if (!hasJobs) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Home Feed" />
        <EmptyState text={emptyMessage} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Home Feed" />
      <TouchableOpacity
        onPress={() => setAffordableOnly(!affordableOnly)}
        style={styles.toggle}
      >
        {String(`Jobs I can afford this week (${affordableOnly ? 'On' : 'Off'})`)}
      </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toggle: { padding: tokens.space.sm, borderRadius: 8, borderWidth: 1, borderColor: tokens.color.border, marginHorizontal: tokens.space.md },
});
