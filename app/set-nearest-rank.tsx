import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { messages } from '../lib/messages';
import { tokens } from '../theme/tokens';
import { Button } from '../components/Button';
import { ListItem } from '../components/ListItem';
import { EmptyState } from '../components/EmptyState';
import { TopAppBar } from '../components/TopAppBar';
import { Spinner } from '../components/Spinner';

type SetNearestRankProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function SetNearestRank({ navigation }: SetNearestRankProps = {}) {
  const [ranks, setRanks] = useState<{ id: string; name: string }[]>([]);
  const [selectedRankId, setSelectedRankId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        setOffline(true);
        setLoading(false);
        return;
      }
      const { data, error: ranksError } = await supabase.from('ranks').select('id, name').order('name');
      if (ranksError) throw ranksError;
      setRanks(data || []);
    } catch {
      setError(messages.rank.loadError);
    } finally {
      if (!offline) setLoading(false);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedRankId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: updateError } = await supabase
      .from('users')
      .update({ nearest_rank_id: selectedRankId })
      .eq('id', user.id);
    if (updateError) {
      setError(messages.rank.loadError);
      return;
    }
    navigation?.navigate('/(tabs)/index');
  }, [selectedRankId, navigation]);

  if (loading) return (
    <View style={styles.loadingContainer}><Spinner size="large" /></View>
  );

  if (offline) return (
    <View style={styles.container}>
      <TopAppBar title="Set nearest rank" />
      <EmptyState text={messages.rank.offline} actionLabel="Retry" onAction={loadRanks} />
    </View>
  );

  if (error) return (
    <View style={styles.container}>
      <TopAppBar title="Set nearest rank" />
      <EmptyState text={error} actionLabel="Retry" onAction={loadRanks} />
    </View>
  );

  if (ranks.length === 0) return (
    <View style={styles.container}>
      <TopAppBar title="Set nearest rank" />
      <EmptyState text={messages.rank.empty} actionLabel="Retry" onAction={loadRanks} />
    </View>
  );

  return (
    <View style={styles.container}>
      <TopAppBar title="Set nearest rank" />
      <FlatList
        data={ranks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem
            label={item.name}
            state={selectedRankId === item.id ? 'selected' : 'default'}
            onPress={() => setSelectedRankId(item.id)}
          />
        )}
      />
      <View style={styles.confirmContainer}>
        <Button
          variant="primary"
          disabled={!selectedRankId || loading}
          onPress={handleConfirm}
        >
          Confirm
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background, padding: tokens.space.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  confirmContainer: { marginTop: tokens.space.lg, paddingBottom: tokens.space.xl },
});
