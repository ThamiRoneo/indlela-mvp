import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, TextInput, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { reportFare } from '../../lib/api/fares';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { EmptyState } from '../../components/EmptyState';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Banner } from '../../components/Banner';
import ReportSuccess from '../modals/report-success';

type Rank = { id: string; name: string };
type Route = { id: string; destination: string };

export default function ReportFare() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [success, setSuccess] = useState<{ route: string } | null>(null);
  const [dailyLimit, setDailyLimit] = useState(false);

  const loadRanks = useCallback(async () => {
    const connected = await NetInfo.fetch();
    setOffline(!connected.isConnected);
    const { data } = await supabase.from('ranks').select('id, name').order('name');
    setRanks(data || []);
    setLoading(false);
  }, []);

  const loadRoutes = useCallback(async (rankId: string) => {
    const { data } = await supabase.from('routes').select('id, destination').eq('rank_id', rankId);
    setRoutes(data || []);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedRank || !selectedRoute || !amount) return;
    setError(null);
    setDailyLimit(false);
    setOffline(false);
    const connected = await NetInfo.fetch();
    if (!connected.isConnected) {
      setOffline(true);
      return;
    }
    setLoading(true);
    const { error } = await reportFare(selectedRank.id, selectedRoute.id, parseInt(amount, 10));
    setLoading(false);
    if (error) {
      if ((error as string).includes('rate_limit')) {
        setDailyLimit(true);
        return;
      }
      setError(error);
      return;
    }
    setSuccess({ route: selectedRoute.destination });
  }, [selectedRank, selectedRoute, amount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRanks();
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
        <TopAppBar title="Report a fare" onBack={() => {}} />
        <EmptyState text={error} actionLabel="Retry" onAction={handleSubmit} />
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Report a fare" />
        <ReportSuccess route={success.route} onDismiss={() => setSuccess(null)} />
      </View>
    );
  }

  const dailyLimitBanner = dailyLimit ? (
    <Banner variant="alert">{messages.fares.reportLimit}</Banner>
  ) : null;

  return (
    <View style={styles.container}>
      <TopAppBar title="Report a fare" onBack={() => {}} />
      {offline && (
        <Banner variant="error">{messages.fares.offlineSubmit}</Banner>
      )}
      {dailyLimitBanner}

      {!selectedRank && (
        <>
          <Text style={styles.label}>Rank</Text>
          <FlatList
            data={ranks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListItem
                label={item.name}
                onPress={() => {
                  setSelectedRank(item);
                  loadRoutes(item.id);
                }}
              />
            )}
          />
        </>
      )}

      {selectedRank && !selectedRoute && (
        <>
          <View style={styles.rankChip}>
            <Text style={styles.rankChipLabel}>Rank:</Text>
            <Text style={styles.rankChipName}>{selectedRank.name}</Text>
          </View>
          <Text style={styles.label}>Route</Text>
          <FlatList
            data={routes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListItem label={item.destination} onPress={() => setSelectedRoute(item)} />
            )}
          />
        </>
      )}

      {selectedRank && selectedRoute && (
        <>
          <View style={styles.rankChip}>
            <Text style={styles.rankChipLabel}>Rank:</Text>
            <Text style={styles.rankChipName}>{selectedRank.name}</Text>
          </View>
          <View style={styles.routeChip}>
            <Text style={styles.routeChipLabel}>Route:</Text>
            <Text style={styles.routeChipName}>{selectedRoute.destination}</Text>
          </View>
          <Text style={styles.label}>Fare amount (ZAR)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
            placeholder="R 0"
          />
          <Text style={styles.helper}>{messages.fares.amountHelper}</Text>
          <Button
            variant="primary"
            disabled={!amount || loading || offline}
            loading={loading}
            onPress={handleSubmit}
          >
            Submit report
          </Button>
          <Text style={styles.footer}>{messages.fares.dailyLimitFooter}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background, padding: tokens.space.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.xs, marginTop: tokens.space.md },
  helper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.md },
  footer: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.sm },
  input: {
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: tokens.font.input.size,
    minHeight: tokens.size.touchMin,
  },
  rankChip: {
    flexDirection: 'row',
    backgroundColor: tokens.color.surface,
    padding: tokens.space.sm,
    borderRadius: 8,
    marginVertical: tokens.space.sm,
    alignItems: 'center',
  },
  rankChipLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginRight: tokens.space.xs },
  rankChipName: { fontSize: tokens.font.body.size, fontWeight: '600' },
  routeChip: {
    flexDirection: 'row',
    backgroundColor: tokens.color.surface,
    padding: tokens.space.sm,
    borderRadius: 8,
    marginVertical: tokens.space.sm,
    alignItems: 'center',
  },
  routeChipLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginRight: tokens.space.xs },
  routeChipName: { fontSize: tokens.font.body.size, fontWeight: '600' },
});