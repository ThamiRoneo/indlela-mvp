import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
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

type HomeFeedProps = {
  navigation?: { navigate: (screen: string, params?: Record<string, unknown>) => void };
};

export default function HomeFeed({ navigation }: HomeFeedProps = {}) {
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
      <View style={styles.container}>
        <TopAppBar title="Home" actionLabel="👤" />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingTitle}>Calculating commute costs & net gain...</Text>
          <Text style={styles.loadingSubtitle}>Sorting jobs by net take-home pay</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Home" actionLabel="👤" />
        <EmptyState
          icon={
            <View style={styles.errorIconBadge}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
          }
          text={error}
          actionLabel="Retry"
          onAction={load}
        />
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

  return (
    <View style={styles.container}>
      <TopAppBar title="Home" actionLabel="👤" />
      <View style={styles.content}>
        <View style={styles.controls}>
          <View style={styles.toggleCard}>
            <View style={styles.toggleIconBadge}>
              <Text style={styles.toggleIcon}>🗂</Text>
            </View>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleTitle}>{messages.jobs.affordabilityToggle}</Text>
              <Text style={styles.toggleSubtitle}>
                {budget != null
                  ? `Active filter: budget limit R${budget}`
                  : 'Matched to your commuting budget'}
              </Text>
            </View>
            <Toggle
              value={affordableOnly}
              onChange={setAffordableOnly}
              label={messages.jobs.affordabilityToggle}
            />
          </View>

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

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{messages.jobs.sortedByNetGain}</Text>
          <Text style={styles.opportunitiesCount}>{displayJobs.length} opportunities</Text>
        </View>

        {offline && (
          <Banner variant="info" icon="🛜">
            {messages.jobs.offlineCached}
          </Banner>
        )}

        {jobs.length === 0 ? (
          <EmptyState
            icon={
              <View style={styles.emptyIconBadge}>
                <Text style={styles.emptyIconText}>💼</Text>
              </View>
            }
            text={messages.jobs.empty}
            actionLabel="Refresh Feed"
            onAction={load}
          />
        ) : displayJobs.length === 0 ? (
          <View style={styles.emptyFilterContainer}>
            <View style={styles.emptyIconBadge}>
              <Text style={styles.emptyIconText}>🔍</Text>
            </View>
            <Text style={styles.emptyFilterTitle}>No affordable jobs found</Text>
            <Text style={styles.emptyFilterSubtitle}>{messages.jobs.emptyAffordable}</Text>
            <TouchableOpacity
              style={styles.adjustBudgetBtn}
              onPress={() => navigation?.navigate?.('profile')}
              accessibilityLabel="Adjust Weekly Budget"
            >
              <Text style={styles.adjustBudgetBtnText}>Adjust Weekly Budget</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportFaresBtn}
              onPress={() => navigation?.navigate?.('report-fare')}
              accessibilityLabel="Report Current Fares"
            >
              <Text style={styles.reportFaresBtnText}>Report Current Fares</Text>
            </TouchableOpacity>
          </View>
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
                onPress={() => navigation?.navigate?.('job/[id]', { id: item.id })}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  content: { flex: 1, paddingHorizontal: tokens.space.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: tokens.color.text,
  },
  loadingSubtitle: {
    marginTop: 4,
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
  controls: { marginVertical: tokens.space.xs },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    padding: tokens.space.sm,
    marginBottom: tokens.space.xs,
  },
  toggleIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  toggleIcon: {
    fontSize: 18,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: tokens.color.text,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: tokens.color.textSecondary,
    marginTop: 2,
  },
  chips: { flexDirection: 'row', marginTop: tokens.space.xs },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: tokens.space.sm,
  },
  sectionHeader: {
    fontSize: tokens.font.h3.size,
    fontWeight: '700',
    color: tokens.color.text,
  },
  opportunitiesCount: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIconText: {
    fontSize: 22,
  },
  errorIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ea4335',
  },
  emptyFilterContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFilterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: 6,
  },
  emptyFilterSubtitle: {
    fontSize: 13,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  adjustBudgetBtn: {
    width: '100%',
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    minHeight: tokens.size.touchMin,
    justifyContent: 'center',
  },
  adjustBudgetBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reportFaresBtn: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dadce0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: tokens.size.touchMin,
    justifyContent: 'center',
  },
  reportFaresBtnText: {
    color: tokens.color.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
