import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bus, ChevronDown } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { reportFare } from '../../lib/api/fares';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { ListItem } from '../../components/ListItem';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Banner } from '../../components/Banner';
import ReportSuccess from '../modals/report-success';

type Rank = { id: string; name: string };
type Route = { id: string; destination: string };

type ReportFareProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function ReportFare({ navigation }: ReportFareProps = {}) {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [amount, setAmount] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [success, setSuccess] = useState<{ route: string } | null>(null);
  const [dailyLimit, setDailyLimit] = useState(false);

  const loadRanks = useCallback(async () => {
    try {
      const connected = await NetInfo.fetch();
      setOffline(!connected.isConnected);
      const { data } = await supabase.from('ranks').select('id, name').order('name');
      setRanks(data || []);
    } finally {
      setInitialLoading(false);
    }
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
    setSubmitting(true);
    const { error: submitErr } = await reportFare(selectedRank.id, selectedRoute.id, parseInt(amount, 10));
    setSubmitting(false);
    if (submitErr) {
      if ((submitErr as string).includes('rate_limit')) {
        setDailyLimit(true);
        return;
      }
      setError(submitErr);
      return;
    }
    setSuccess({ route: selectedRoute.destination });
  }, [selectedRank, selectedRoute, amount]);

  useEffect(() => {
    loadRanks();
  }, [loadRanks]);

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  const dailyLimitBanner = dailyLimit ? (
    <Banner
      variant="alert"
      icon="⚠"
      title={messages.fares.reportLimit}
    >
      Daily limit of 5 reports reached to ensure community data integrity (BR3).
    </Banner>
  ) : null;

  const errorBanner = error ? (
    <Banner
      variant="error"
      icon="!"
      title={error}
    >
      Server did not acknowledge your fare submission. Your entries were saved.
    </Banner>
  ) : null;

  const offlineBanner = offline ? (
    <Banner
      variant="error"
      icon="🛜"
      title={messages.fares.offlineSubmit}
    >
      Submissions require an active data connection to verify with the commuter network.
    </Banner>
  ) : null;

  return (
    <View style={styles.container}>
      <TopAppBar
        title="Report a fare"
        onBack={() => navigation?.navigate?.('fares')}
        actionLabel="👤"
      />

      <View style={styles.content}>
        {offlineBanner}
        {dailyLimitBanner}
        {errorBanner}

        {selectedRank && (
          <View style={styles.rankCard}>
            <Bus size={20} color="#1a73e8" strokeWidth={2} style={styles.rankIcon} />
            <View style={styles.rankCardTextWrap}>
              <Text style={styles.rankCardLabel}>Rank:</Text>
              <Text style={styles.rankCardName}>{selectedRank.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedRank(null);
                setSelectedRoute(null);
              }}
              style={styles.changeRankBtn}
            >
              <Text style={styles.changeRankText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.instructions}>Report the current fare for a route from your rank.</Text>

        {!selectedRank && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Select your rank</Text>
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
          </View>
        )}

        {selectedRank && !selectedRoute && (
          <View style={styles.stepContainer}>
            <Text style={styles.label}>Route</Text>
            <FlatList
              data={routes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ListItem
                  label={item.destination}
                  onPress={() => setSelectedRoute(item)}
                />
              )}
            />
            <Text style={styles.helper}>Tap to select from verified rank routes</Text>
          </View>
        )}

        {selectedRank && selectedRoute && (
          <View style={styles.formContainer}>
            <Text style={styles.label}>Route</Text>
            <TouchableOpacity
              style={styles.selectedRouteBox}
              onPress={() => setSelectedRoute(null)}
              accessibilityLabel="Change route"
            >
              <Text style={styles.selectedRouteName}>
                {selectedRank.name.replace(/ Taxi Rank/i, '')} → {selectedRoute.destination}
              </Text>
              <ChevronDown size={18} color="#5f6368" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.helper}>Tap to select from verified rank routes</Text>

            <Text style={styles.label}>Fare amount (ZAR)</Text>
            <View style={[styles.inputWrap, offline && styles.inputDisabled]}>
              <Text style={styles.currencyPrefix}>R</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
                placeholder="180"
                keyboardType="numeric"
                editable={!submitting && !offline && !dailyLimit}
              />
            </View>
            <Text style={styles.helper}>{messages.fares.amountHelper}</Text>

            <View style={styles.buttonWrap}>
              <Button
                variant="primary"
                disabled={!amount || submitting || offline || dailyLimit}
                loading={submitting}
                onPress={handleSubmit}
              >
                {submitting ? 'Submitting report...' : 'Submit report'}
              </Button>
            </View>

            <Text style={styles.footer}>
              {dailyLimit
                ? 'Daily quota: 5/5 reports completed today.'
                : offline
                ? 'Reporting disabled while offline.'
                : messages.fares.dailyLimitFooter}
            </Text>
          </View>
        )}
      </View>

      {success && (
        <ReportSuccess
          route={success.route}
          onDismiss={() => {
            setSuccess(null);
            navigation?.navigate?.('fares');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  content: { flex: 1, padding: tokens.space.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  instructions: {
    fontSize: tokens.font.body.size,
    color: tokens.color.textSecondary,
    marginVertical: tokens.space.sm,
  },
  label: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    fontWeight: '600',
    marginBottom: tokens.space.xs,
    marginTop: tokens.space.sm,
  },
  helper: {
    fontSize: 12,
    color: tokens.color.textSecondary,
    marginTop: 4,
    marginBottom: tokens.space.md,
  },
  footer: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    marginTop: tokens.space.md,
  },
  stepContainer: { flex: 1 },
  formContainer: { marginTop: tokens.space.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: tokens.color.surface,
    paddingHorizontal: 12,
    minHeight: tokens.size.touchMin,
  },
  inputDisabled: {
    backgroundColor: '#f1f3f4',
    opacity: 0.7,
  },
  currencyPrefix: {
    fontSize: tokens.font.input.size,
    fontWeight: '600',
    color: tokens.color.text,
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: tokens.font.input.size,
    color: tokens.color.text,
  },
  rankCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e8eaed',
    padding: tokens.space.sm,
    borderRadius: 8,
    marginVertical: tokens.space.xs,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  rankCardTextWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankCardLabel: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginRight: 4,
  },
  rankCardName: {
    fontSize: tokens.font.body.size,
    fontWeight: '700',
    color: tokens.color.text,
  },
  changeRankBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeRankText: {
    fontSize: 12,
    color: '#1a73e8',
    fontWeight: '600',
  },
  selectedRouteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: tokens.color.surface,
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: tokens.size.touchMin,
  },
  selectedRouteName: {
    fontSize: tokens.font.body.size,
    fontWeight: '500',
    color: tokens.color.text,
  },
  chevron: {
    fontSize: 14,
    color: tokens.color.textSecondary,
  },
  buttonWrap: {
    marginTop: tokens.space.md,
  },
});