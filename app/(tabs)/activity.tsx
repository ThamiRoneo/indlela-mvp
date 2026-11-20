import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { viewActivity } from '../../lib/api/activity';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Button } from '../../components/Button';
import { Banner } from '../../components/Banner';

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const activityIcon = (type: string) => {
  switch (type) {
    case 'fare_report':
      return { bg: '#e8f5e9', color: '#2e7d32', glyph: '\u2713' };
    case 'alert_received':
      return { bg: '#fff8e1', color: '#f57f17', glyph: '!' };
    case 'comment_received':
      return { bg: '#e3f2fd', color: '#1565c0', glyph: '\u270D' };
    case 'follow':
      return { bg: '#f3e5f5', color: '#7b1fa2', glyph: '+' };
    case 'unlike':
      return { bg: '#ffebee', color: '#c62828', glyph: '\u2716' };
    default:
      return { bg: '#eceff1', color: '#546e7a', glyph: '\u2022' };
  }
};

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
  }, [load]);

  const renderActivityItem = (activity: any) => {
    const { bg, color, glyph } = activityIcon(activity.type);
    return (
      <View style={styles.activityItem}>
        <View style={[styles.icon, { backgroundColor: bg }]}>
          <Text style={[styles.iconGlyph, { color }]}>{glyph}</Text>
        </View>
        <View style={styles.itemBody}>
          <Text style={styles.itemLabel}>{activity.description}</Text>
          <Text style={styles.itemTime}>{formatTimestamp(activity.created_at)}</Text>
        </View>
      </View>
    );
  };

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
        <TopAppBar title="Activity" actionLabel="U" />
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
        <TopAppBar title="Activity" actionLabel="U" />
        <Banner variant="alert">{messages.activity.offlineCached}</Banner>
        {activities.length > 0 ? (
          <>
            <View style={styles.recentContainer}>
              <Text style={styles.recentTitle}>Recent activity</Text>
              <Text style={styles.recentCount}>{activities.length} entries</Text>
            </View>
            {activities.map((activity) => (
              <View key={activity.id} style={styles.listItem}>
                <View style={styles.activityItem}>
                  <View style={[styles.icon, { backgroundColor: activityIcon(activity.type).bg }]}>
                    <Text style={[styles.iconGlyph, { color: activityIcon(activity.type).color }]}>
                      {activityIcon(activity.type).glyph}
                    </Text>
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemLabel}>{activity.description}</Text>
                    <Text style={styles.itemTime}>{formatTimestamp(activity.created_at)}</Text>
                  </View>
                </View>
              </View>
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
        <TopAppBar title="Activity" actionLabel="U" />
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
        <TopAppBar title="Activity" actionLabel="U" />
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Activity" actionLabel="U" />
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recent activity</Text>
        <Text style={styles.recentCount}>{activities.length} entries</Text>
      </View>
      {activities.map((activity) => renderActivityItem(activity))}
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#dadce0',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  iconGlyph: { fontSize: tokens.font.caption.size, fontWeight: '700' },
  itemBody: { flex: 1 },
  itemLabel: { fontSize: tokens.font.body.size, color: tokens.color.text },
  itemTime: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.xs },
  listItem: {
    paddingHorizontal: tokens.space.md,
    marginBottom: tokens.space.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.color.primary,
    color: '#ffffff',
    textAlign: 'center',
    fontSize: tokens.font.caption.size,
    fontWeight: '600',
  },
});
