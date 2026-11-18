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

  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = useCallback(async () => {
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
      setError(error);
      return;
    }
    setSuccess({ route: selectedRoute.destination });
  }, [selectedRank, selectedRoute, amount]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  if (offline) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Report Fare" />
        <EmptyState text={messages.fares.offlineSubmit} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Report Fare" />
        <EmptyState text={error} actionLabel="Retry" onAction={handleSubmit} />
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Report Fare" />
        <ReportSuccess route={success.route} onDismiss={() => setSuccess(null)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Report Fare" />

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
          <Text style={styles.label}>Amount (ZAR)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 180"
          />
          <Button
            variant="primary"
            disabled={!amount || loading}
            loading={loading}
            onPress={handleSubmit}
          >
            Report fare
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background, padding: tokens.space.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.xs, marginTop: tokens.space.md },
  input: {
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: tokens.font.input.size,
    minHeight: tokens.size.touchMin,
  },
});
