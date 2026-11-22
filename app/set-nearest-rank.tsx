import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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
  onBack?: () => void;
};

export default function SetNearestRank({ navigation, onBack }: SetNearestRankProps = {}) {
  const [ranks, setRanks] = useState<{ id: string; name: string }[]>([]);
  const [selectedRankId, setSelectedRankId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
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
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  const loadRanks = useCallback(async () => {
    await Promise.resolve();
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
      setLoading(false);
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
        <TopAppBar title="Set your nearest rank" onBack={onBack} />
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>{messages.rank.offline}</Text>
        </View>
        <Text style={styles.instructions}>
          Choose the taxi rank closest to you so we can show fares from your rank.
        </Text>
        <EmptyState text={messages.rank.offline} actionLabel="Retry" onAction={loadRanks} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Set your nearest rank" onBack={onBack} />
        <Text style={styles.instructions}>
          Choose the taxi rank closest to you so we can show fares from your rank.
        </Text>
        <EmptyState text={error} actionLabel="Retry" onAction={loadRanks} />
      </View>
    );
  }

  if (ranks.length === 0) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Set your nearest rank" onBack={onBack} />
        <Text style={styles.instructions}>
          Choose the taxi rank closest to you so we can show fares from your rank.
        </Text>
        <EmptyState text={messages.rank.empty} actionLabel="Retry" onAction={loadRanks} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Set your nearest rank" onBack={onBack} />
      <Text style={styles.instructions}>
        Choose the taxi rank closest to you so we can show fares from your rank.
      </Text>
      <FlatList
        data={ranks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
  container: { flex: 1, backgroundColor: tokens.color.background, paddingHorizontal: tokens.space.md, paddingTop: tokens.space.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructions: {
    fontSize: tokens.font.body.size,
    lineHeight: 20,
    color: tokens.color.textSecondary,
    marginBottom: tokens.space.md,
    paddingHorizontal: tokens.space.xs,
  },
  offlineBanner: {
    padding: tokens.space.md,
    backgroundColor: '#fce8e6',
    borderRadius: 8,
    marginBottom: tokens.space.md,
  },
  offlineText: {
    fontSize: tokens.font.body.size,
    color: tokens.color.error,
  },
  listContent: {
    paddingBottom: tokens.space.md,
  },
  confirmContainer: {
    paddingVertical: tokens.space.md,
    paddingBottom: tokens.space.xl,
  },
});
