import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Fuel, CheckCircle2, AlertCircle, WifiOff } from 'lucide-react-native';
import { viewAlerts } from '../../lib/api/activity';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
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
      setOffline(false);
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

  const renderAlertCard = (alert: any, isCached = false) => (
    <View key={alert.id || alert.description} style={[styles.alertCard, isCached && styles.cachedCard]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertHeaderLeft}>
          <Fuel size={16} color="#b06000" strokeWidth={2} style={styles.fuelIcon} />
          <View style={[styles.alertPill, isCached && styles.cachedPill]}>
            <Text style={[styles.alertPillText, isCached && styles.cachedPillText]}>
              {isCached ? 'CACHED ALERT' : 'FARE ALERT • FUEL INCREASE'}
            </Text>
          </View>
        </View>
        <Text style={styles.alertMetaText}>{daysAgo(alert.created_at)} days ago</Text>
      </View>
      <Text style={styles.alertDescription}>&quot;{alert.description}&quot;</Text>
      <View style={styles.alertRoute}>
        <Text style={styles.alertRouteLabel}>→ Route:</Text>
        <Text style={styles.alertRouteValue}>{alert.route || 'Rustenburg ⮞ Johannesburg Park Station'}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBadge}>
        <CheckCircle2 size={28} color="#137333" strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>{messages.alerts.empty}</Text>
      <Text style={styles.emptySubtitle}>
        Fuel prices have not fluctuated above 5% in the last 30 days. Taxi fares for your saved routes remain unchanged.
      </Text>
      <View style={styles.refreshButton}>
        <Button variant="primary" onPress={load}>
          Refresh Alerts
        </Button>
      </View>
      <Text style={styles.disclaimerText}>&quot;Alerts shown when fuel prices rise by 5% or more in 30 days.&quot;</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fare Alerts" actionLabel="👤" />
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
        <TopAppBar title="Fare Alerts" actionLabel="👤" />
        <View style={styles.bannerContainer}>
          <Banner
            variant="alert"
            icon={<WifiOff size={18} color="#b06000" strokeWidth={2} />}
          >
            {messages.alerts.offlineCached}
          </Banner>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {alerts.length > 0 ? (
            alerts.map((alert) => renderAlertCard(alert, true))
          ) : (
            renderEmpty()
          )}
          {alerts.length > 0 && (
            <Text style={styles.disclaimerText}>&quot;Alerts shown when fuel prices rise by 5% or more in 30 days.&quot;</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Fare Alerts" actionLabel="👤" />
        <View style={styles.emptyContainer}>
          <View style={styles.errorIconBadge}>
            <AlertCircle size={24} color="#ea4335" strokeWidth={2} />
          </View>
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
        <TopAppBar title="Fare Alerts" actionLabel="👤" />
        {renderEmpty()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Fare Alerts" actionLabel="👤" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {alerts.map((alert) => renderAlertCard(alert))}
        <Text style={styles.disclaimerText}>&quot;Alerts shown when fuel prices rise by 5% or more in 30 days.&quot;</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: tokens.space.sm, paddingBottom: 40 },
  bannerContainer: { paddingHorizontal: tokens.space.md, marginBottom: tokens.space.xs },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.space.sm },
  loadingText: { fontSize: tokens.font.body.size, fontWeight: '600', color: tokens.color.text },
  loadingSubtitle: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  emptyContainer: { padding: tokens.space.xl, alignItems: 'center', gap: tokens.space.md },
  emptyIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e6f4ea',
    borderWidth: 2,
    borderColor: '#ceead6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyIconText: { fontSize: 28, color: '#137333', fontWeight: '700' },
  errorIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorIconText: { fontSize: 24, fontWeight: '700', color: '#ea4335' },
  emptyTitle: { fontSize: tokens.font.h3.size, fontWeight: '700', color: tokens.color.text, textAlign: 'center' },
  emptySubtitle: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary, textAlign: 'center', lineHeight: 20 },
  refreshButton: { marginTop: tokens.space.sm, alignSelf: 'center' },
  disclaimerText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginVertical: tokens.space.md,
    fontStyle: 'italic',
    paddingHorizontal: tokens.space.lg,
  },
  alertCard: {
    backgroundColor: '#fffdf5',
    borderRadius: 8,
    padding: tokens.space.md,
    marginHorizontal: tokens.space.md,
    marginBottom: tokens.space.sm,
    borderWidth: 1,
    borderColor: '#f9ab00',
  },
  cachedCard: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.xs,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fuelIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  alertPill: {
    backgroundColor: '#fef0c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  alertPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b06000',
  },
  cachedPill: {
    backgroundColor: '#f1f3f4',
  },
  cachedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: tokens.color.textSecondary,
  },
  alertDescription: {
    fontSize: tokens.font.body.size,
    fontWeight: '600',
    color: tokens.color.text,
    marginVertical: 4,
  },
  alertRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  alertRouteLabel: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginRight: tokens.space.xs,
    fontWeight: '500',
  },
  alertRouteValue: {
    fontSize: tokens.font.caption.size,
    fontWeight: '600',
    color: tokens.color.text,
  },
  alertMetaText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
});
