import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { viewAlerts } from '../../lib/api/activity';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { ListItem } from '../../components/ListItem';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Button } from '../../components/Button';
import { Banner } from '../../components/Banner';
import { daysAgo } from '../../lib/rules/fare';

export default function FareAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
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
      const { data, error: alertsError } = await viewAlerts();
      if (alertsError) {
        setError(messages.alerts.loadError);
        setLoading(false);
        return;
      }
      setAlerts(data || []);
      setLoading(false);
    } catch {
      setError(messages.alerts.loadError);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const renderAlertCard = (alert: any) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertPill}>
          <Text style={styles.alertPillText}>FARE ALERT \u2022 FUEL INCREASE</Text>
        </View>
        <View style={styles.alertIcon}>
          <Text style={styles.alertIconText}>!</Text>
        </View>
      </View>
      <Text style={styles.alertDescription}>{alert.description}</Text>
      <View style={styles.alertRoute}>
        <Text style={styles.alertRouteLabel}>\u2192 Route:</Text>
        <Text style={styles.alertRouteValue}>{alert.route || 'Your saved routes'}</Text>
      </View>
      <View style={styles.alertMeta}>
        <Text style={styles.alertMetaText}>{daysAgo(alert.created_at)} days ago</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>{messages.alerts.empty}</Text>
      <Text style={styles.emptySubtitle}>
        Fuel prices have not fluctuated above 5% in the last 30 days. Taxi fares for your saved routes remain unchanged.
      </Text>
      <View style={styles.refreshButton}>
        <Button variant="primary" onPress={load}>
          Refresh Alerts
        </Button>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fare Alerts" actionLabel="U" />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
          <Text style={styles.loadingSubtitle}>Checking latest fuel and route data</Text>
        </View>
      </View>
    );
  }

  if (offline) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fare Alerts" actionLabel="U" />
        <Banner variant="alert">{messages.alerts.offlineCached}</Banner>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <View key={alert.id} style={styles.listItem}>
              <ListItem label={alert.description} subtitle={`${daysAgo(alert.created_at)} days ago`} />
            </View>
          ))
        ) : (
          renderEmpty()
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fare Alerts" actionLabel="U" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{error}</Text>
          <Text style={styles.emptySubtitle}>
            Unable to reach Indlela alert service. Please verify your connection or try again.
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

  if (alerts.length === 0) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fare Alerts" actionLabel="U" />
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Fare Alerts" actionLabel="U" />
      {alerts.map((alert) => renderAlertCard(alert))}
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
  alertCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: tokens.space.md,
    marginHorizontal: tokens.space.md,
    marginBottom: tokens.space.sm,
    borderLeftWidth: 4,
    borderLeftColor: tokens.color.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
  },
  alertPill: {
    backgroundColor: '#ffe082',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertPillText: {
    fontSize: tokens.font.caption.size,
    fontWeight: '600',
    color: '#8d6e00',
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fbc02d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconText: {
    color: '#ffffff',
    fontSize: tokens.font.caption.size,
    fontWeight: '700',
  },
  alertDescription: {
    fontSize: tokens.font.body.size,
    color: tokens.color.text,
    marginBottom: tokens.space.xs,
  },
  alertRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.space.xs,
  },
  alertRouteLabel: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginRight: tokens.space.xs,
  },
  alertRouteValue: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertMetaText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
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
