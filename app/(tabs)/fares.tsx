import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
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

export default function Fares() {
  const [reports, setReports] = useState<FareReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [hasCache, setHasCache] = useState(false);
  const [fuelAlert, setFuelAlert] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

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
      .select('fuel_alert_active')
      .eq('id', rankId)
      .single();
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
  }, []);

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
        <TopAppBar title="Fares" />
        <EmptyState text={error} actionLabel="Retry" onAction={load} />
      </View>
    );
  }

  const fuelBanner = fuelAlert ? <Banner variant="alert">{messages.alerts.fuelIncrease}</Banner> : null;

  const list = (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card
          type="fare"
          route={item.destination}
          amount={item.amount_zar}
          staleness={item.stale ? messages.fares.stale(item.days_ago) : undefined}
        />
      )}
    />
  );

  if (offline && !hasCache) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" />
        <EmptyState text={messages.fares.offlineNoCache} />
      </View>
    );
  }

  if (offline && hasCache) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" />
        <Banner variant="info">{messages.fares.offlineCached}</Banner>
        {list}
      </View>
    );
  }

  if (reports.length === 0) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fares" />
        {fuelBanner}
        <EmptyState text={messages.fares.empty} actionLabel="Report fare" onAction={() => {}} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Fares" />
      {fuelBanner}
      {list}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
