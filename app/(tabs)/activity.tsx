import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { viewActivity } from '../../lib/api/activity';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { ListItem } from '../../components/ListItem';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Button } from '../../components/Button';
import { Banner } from '../../components/Banner';
import { daysAgo } from '../../lib/rules/fare';

export default function Activity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const connected = await NetInfo.fetch();
      if (!connected.isConnected) {
        setOffline(true);
        setLoading(false);
        return;
      }
      const { data, error: activityError } = await viewActivity();
      if (activityError) {
        setError(messages.activity.loadError);
        setLoading(false);
        return;
      }
      setActivities(data || []);
      setLoading(false);
    } catch {
      setError(messages.activity.loadError);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{messages.activity.empty}</Text>
      <Text style={styles.emptySubtitle}>
        When you report fares or receive alerts, you&apos;ll see them here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Activity" />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Loading activity...</Text>
          <Text style={styles.loadingSubtitle}>Retrieving your recent reports and alerts</Text>
        </View>
      </View>
    );
  }

  if (offline) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Activity" />
        <Banner variant="alert">{messages.activity.offlineCached}</Banner>
        {activities.length > 0 ? (
          <>
            <View style={styles.recentContainer}>
              <Text style={styles.recentTitle}>Recent activity</Text>
              <Text style={styles.recentCount}>{activities.length} entries</Text>
            </View>
            {activities.map((activity) => (
              <ListItem
                key={activity.id}
                label={activity.description}
                subtitle={`${daysAgo(activity.created_at)} days ago`}
              />
            ))}
          </>
        ) : (
          renderEmpty()
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Activity" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{error}</Text>
          <Text style={styles.emptySubtitle}>
            Please check your data connection and tap below to reload.
          </Text>
      <View style={styles.refreshButton}>
        <Button variant="primary" onPress={load}>
          Retry
        </Button>
      </View>
        </View>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Activity" />
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Activity" />
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recent activity</Text>
        <Text style={styles.recentCount}>{activities.length} entries</Text>
      </View>
      {activities.map((activity) => (
        <ListItem
          key={activity.id}
          label={activity.description}
          subtitle={`${daysAgo(activity.created_at)} days ago`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.space.sm },
  loadingText: { fontSize: tokens.font.body.size, color: tokens.color.text },
  loadingSubtitle: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  emptyContainer: { padding: tokens.space.xl, alignItems: 'center', gap: tokens.space.md },
  emptyTitle: { fontSize: tokens.font.h3.size, fontWeight: '600', color: tokens.color.text, textAlign: 'center' },
  emptySubtitle: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary, textAlign: 'center' },
  refreshButton: { marginTop: tokens.space.sm, alignSelf: 'center' },
  recentContainer: { paddingHorizontal: tokens.space.xl, marginTop: tokens.space.md },
  recentTitle: { fontSize: tokens.font.h3.size, fontWeight: '600', color: tokens.color.text },
  recentCount: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.xs },
});
