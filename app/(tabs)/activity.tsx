import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  FileCheck2,
  Bell,
  MessageSquare,
  Users,
  ClipboardList,
  Clock,
  Receipt,
  WifiOff,
  AlertCircle,
} from 'lucide-react-native';
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
      return {
        bg: '#e6f4ea',
        icon: <FileCheck2 size={20} color="#137333" strokeWidth={2} />,
      };
    case 'alert_received':
      return {
        bg: '#fef7e0',
        icon: <Bell size={20} color="#b06000" strokeWidth={2} />,
      };
    case 'comment_received':
      return {
        bg: '#e8f0fe',
        icon: <MessageSquare size={20} color="#1a73e8" strokeWidth={2} />,
      };
    case 'follow':
      return {
        bg: '#f3e8fd',
        icon: <Users size={20} color="#9334e6" strokeWidth={2} />,
      };
    default:
      return {
        bg: '#f1f3f4',
        icon: <ClipboardList size={20} color="#5f6368" strokeWidth={2} />,
      };
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
      setOffline(false);
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
    const { bg, icon } = activityIcon(activity.type);
    return (
      <View key={activity.id || activity.description} style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          {icon}
        </View>
        <View style={styles.itemBody}>
          <Text style={styles.itemLabel}>{activity.description}</Text>
          <View style={styles.timeRow}>
            <Clock size={12} color={tokens.color.textSecondary} strokeWidth={2} style={{ marginRight: 4 }} />
            <Text style={styles.itemTime}>{formatTimestamp(activity.created_at)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBadge}>
        <Receipt size={28} color="#1a73e8" strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>{messages.activity.empty}</Text>
      <Text style={styles.emptySubtitle}>
        When you report fares or receive alerts, you&apos;ll see them here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Activity" actionLabel="👤" />
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
        <TopAppBar title="Activity" actionLabel="👤" />
        <View style={styles.bannerContainer}>
          <Banner
            variant="alert"
            icon={<WifiOff size={18} color="#b06000" strokeWidth={2} />}
          >
            {messages.activity.offlineCached}
          </Banner>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {activities.length > 0 ? (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent activity</Text>
                <View style={styles.cachedBadge}>
                  <Text style={styles.cachedBadgeText}>Cached ({activities.length})</Text>
                </View>
              </View>
              {activities.map((activity) => renderActivityItem(activity))}
            </>
          ) : (
            renderEmpty()
          )}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Activity" actionLabel="👤" />
        <View style={styles.emptyContainer}>
          <View style={styles.errorIconBadge}>
            <AlertCircle size={28} color="#ea4335" strokeWidth={2} />
          </View>
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
        <TopAppBar title="Activity" actionLabel="👤" />
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Activity" actionLabel="👤" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent activity</Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>{activities.length} entries</Text>
          </View>
        </View>
        {activities.map((activity) => renderActivityItem(activity))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.space.lg,
  },
  bannerContainer: {
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.md,
    marginTop: tokens.space.xs,
  },
  recentTitle: {
    fontSize: tokens.font.h3.size,
    fontWeight: '700',
    color: tokens.color.text,
  },
  pillBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
    borderRadius: 12,
  },
  pillText: {
    fontSize: tokens.font.caption.size,
    fontWeight: '600',
    color: '#1a73e8',
  },
  cachedBadge: {
    backgroundColor: '#fef7e0',
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
    borderRadius: 12,
  },
  cachedBadgeText: {
    fontSize: tokens.font.caption.size,
    fontWeight: '600',
    color: '#b06000',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 8,
    padding: tokens.space.md,
    marginBottom: tokens.space.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  iconGlyph: {
    fontSize: 18,
  },
  itemBody: {
    flex: 1,
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: tokens.font.body.size,
    fontWeight: '600',
    color: tokens.color.text,
    marginBottom: tokens.space.xs,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginRight: 4,
  },
  itemTime: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.space.sm,
  },
  loadingText: {
    fontSize: tokens.font.body.size,
    color: tokens.color.text,
  },
  loadingSubtitle: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
  emptyContainer: {
    padding: tokens.space.xl,
    alignItems: 'center',
    gap: tokens.space.md,
    marginTop: tokens.space.xl,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.sm,
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: tokens.font.h3.size,
    fontWeight: '600',
    color: tokens.color.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: tokens.font.body.size,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  errorIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.sm,
  },
  errorIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ea4335',
  },
  refreshButton: {
    marginTop: tokens.space.sm,
    alignSelf: 'center',
  },
});
