import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { viewFares, getCachedFares, type FareReport } from '../../lib/api/fares';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Banner } from '../../components/Banner';

type FaresProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function Fares({ navigation }: FaresProps = {}) {
  const [reports, setReports] = useState<FareReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [hasCache, setHasCache] = useState(false);
  const [fuelAlert, setFuelAlert] = useState(false);
  const [rankName, setRankName] = useState<string>('Rustenburg Taxi Rank');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from('users')
        .select('nearest_rank_id')
        .eq('id', user.id)
        .single();
      const rankId = profile?.nearest_rank_id;
      if (!rankId) { setLoading(false); return; }

      const { data: rank } = await supabase
        .from('ranks')
        .select('name, fuel_alert_active')
        .eq('id', rankId)
        .single();
      if (rank?.name) setRankName(rank.name);
      setFuelAlert(!!rank?.fuel_alert_active);

      const connected = await NetInfo.fetch();
      if (!connected.isConnected) {
        const cached = await getCachedFares(rankId);
        setReports(cached || []);
        setHasCache(!!cached);
        setOffline(true);
        setLoading(false);
        return;
      }

      setOffline(false);
      setHasCache(false);
      const { data, error: faresError } = await viewFares(rankId);
      if (faresError) {
        setError(faresError);
        setLoading(false);
        return;
      }
      setReports(data || []);
      setLoading(false);
    } catch {
      setError(messages.fares.loadError);
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
        <TopAppBar title="Fares" subtitle={rankName} actionLabel="👤" />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Loading fares...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" subtitle={rankName} actionLabel="👤" />
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

  const hasStale = reports.some((r) => r.stale);
  const fuelBanner = fuelAlert ? (
    <Banner variant="alert" icon="⛽">
      {messages.alerts.fuelIncrease}
    </Banner>
  ) : null;
  const staleBanner = hasStale ? (
    <Banner variant="info" icon="ℹ">
      {messages.fares.staleNotice}
    </Banner>
  ) : null;

  const renderRoutesList = (isOffline = false) => (
    <View style={styles.listContainer}>
      <View style={styles.routesHeader}>
        <Text style={styles.routesTitle}>Routes from your rank</Text>
        {isOffline ? (
          <View style={styles.cachedBadge}>
            <Text style={styles.cachedBadgeText}>Cached</Text>
          </View>
        ) : (
          <Text style={styles.routesCount}>{reports.length} routes</Text>
        )}
      </View>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            type="fare"
            route={item.destination}
            origin={rankName.replace(/ Taxi Rank/i, '')}
            amount={item.amount_zar}
            perSeat
            staleness={item.stale ? messages.fares.stale(item.days_ago) : undefined}
            isStale={item.stale}
            statusText={
              !item.stale
                ? item.days_ago === 0
                  ? '✓ Reported today'
                  : `✓ Reported ${item.days_ago} ${item.days_ago === 1 ? 'day' : 'days'} ago`
                : undefined
            }
            onVerify={() => navigation?.navigate?.('report-fare')}
          />
        )}
      />
      {isOffline ? (
        <View style={[styles.reportCta, styles.reportCtaDisabled]}>
          <Text style={styles.reportCtaDisabledText}>⃠ Reporting disabled offline</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.reportCta}
          onPress={() => navigation?.navigate?.('report-fare')}
          accessibilityLabel="Report a fare"
        >
          <Text style={styles.reportCtaText}>⊕ Report a fare</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (offline && !hasCache) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" subtitle={rankName} actionLabel="👤" />
        <EmptyState
          icon={
            <View style={styles.offlineIconBadge}>
              <Text style={styles.offlineIconText}>🛜</Text>
            </View>
          }
          text={messages.fares.offlineNoCache}
          actionLabel="↻ Check connection"
          onAction={load}
        />
      </View>
    );
  }

  if (offline && hasCache) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" subtitle={rankName} actionLabel="👤" />
        <View style={styles.content}>
          <Banner variant="alert" icon="🛜" title={messages.fares.offlineCached}>
            Last updated earlier today. Fare updates will resume once connected.
          </Banner>
          {renderRoutesList(true)}
        </View>
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" subtitle={rankName} actionLabel="👤" />
        <View style={styles.content}>
          {fuelBanner}
          {staleBanner}
          <EmptyState
            icon={
              <View style={styles.moneyIconBadge}>
                <Text style={styles.moneyIconText}>[$:]</Text>
              </View>
            }
            text={messages.fares.empty}
            actionLabel="+ Report fare"
            onAction={() => navigation?.navigate?.('report-fare')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Fares" subtitle={rankName} actionLabel="👤" />
      <View style={styles.content}>
        {fuelBanner}
        {staleBanner}
        {renderRoutesList(false)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  content: { flex: 1, paddingHorizontal: tokens.space.md },
  listContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: tokens.font.body.size, color: tokens.color.textSecondary },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: tokens.space.sm,
  },
  routesTitle: { fontSize: tokens.font.h3.size, fontWeight: '700', color: tokens.color.text },
  routesCount: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  cachedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
  },
  cachedBadgeText: { fontSize: 11, fontWeight: '600', color: tokens.color.textSecondary },
  reportCta: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.space.md,
    marginBottom: tokens.space.xl,
  },
  reportCtaText: {
    color: '#1a73e8',
    fontSize: 15,
    fontWeight: '600',
  },
  reportCtaDisabled: {
    opacity: 0.6,
  },
  reportCtaDisabledText: {
    color: tokens.color.textSecondary,
    fontSize: 14,
  },
  errorIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ea4335',
  },
  offlineIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineIconText: {
    fontSize: 24,
  },
  moneyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  moneyIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5f6368',
  },
});
