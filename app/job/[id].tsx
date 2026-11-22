import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  AlertCircle,
  WifiOff,
  Building2,
  MapPin,
  Bus,
  CheckCircle2,
  AlertTriangle,
  CloudOff,
  ArrowRight,
} from 'lucide-react-native';
import { viewJobDetails, type JobFeedItem } from '../../lib/api/jobs';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { EmptyState } from '../../components/EmptyState';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Button } from '../../components/Button';
import { Banner } from '../../components/Banner';

type JobDetailsProps = {
  jobId?: string;
  navigation?: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack?: () => void;
  };
};

export default function JobDetails({ jobId: jobIdProp, navigation }: JobDetailsProps) {
  const [job, setJob] = useState<JobFeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    if (!jobIdProp) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const state = await NetInfo.fetch();
      setOffline(!state.isConnected);

      const { data, error: detailsError } = await viewJobDetails(jobIdProp);
      if (detailsError) {
        setError(detailsError);
        setLoading(false);
        return;
      }
      setJob(data || null);
      setLoading(false);
    } catch {
      setError(messages.jobs.detailsError);
      setLoading(false);
    }
  }, [jobIdProp]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.container}>
        <TopAppBar
          title="Job details"
          onBack={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
          actionLabel="👤"
        />
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
          <Text style={styles.loadingTitle}>Loading job details...</Text>
          <Text style={styles.loadingSubtitle}>Retrieving verified transit costs & route fares</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar
          title="Job details"
          onBack={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
          actionLabel="👤"
        />
        <EmptyState
          icon={
            <View style={styles.errorIconBadge}>
              <AlertCircle size={24} color="#ea4335" strokeWidth={2} />
            </View>
          }
          text={error}
          actionLabel="Retry"
          onAction={load}
        />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <TopAppBar
          title="Job details"
          onBack={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
          actionLabel="👤"
        />
        <EmptyState text={messages.jobs.empty} />
      </View>
    );
  }

  const isNetGainPositive = job.netGain != null && job.netGain >= 0;

  return (
    <View style={styles.container}>
      <TopAppBar
        title="Job details"
        subtitle={job.title}
        onBack={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
        actionLabel="👤"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {offline && (
          <Banner
            variant="alert"
            icon={<WifiOff size={18} color="#b06000" strokeWidth={2} />}
            title="Offline — displaying cached job details"
          >
            Fare data could not be refreshed offline. Net gain may vary once live fare is verified.
          </Banner>
        )}

        {/* Job Header Card */}
        <View style={styles.jobHeaderCard}>
          <View style={styles.jobHeaderTop}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.jobTypeBadge}>
              <Text style={styles.jobTypeBadgeText}>Full time</Text>
            </View>
          </View>

          {job.company && (
            <View style={styles.companyRow}>
              <Building2 size={16} color="#5f6368" strokeWidth={2} style={{ marginRight: 6 }} />
              <Text style={styles.companyText}>{job.company}</Text>
            </View>
          )}

          <View style={styles.headerGrid}>
            <View style={styles.headerCol}>
              <Text style={styles.colLabel}>Wage</Text>
              <Text style={styles.wageValue}>
                R{job.wage_zar != null ? job.wage_zar : '0'}
                {job.wage_zar != null && job.wage_zar < 1000 ? '/day' : '/month'}
              </Text>
            </View>
            <View style={styles.headerCol}>
              <Text style={styles.colLabel}>Location</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={14} color="#5f6368" strokeWidth={2} style={{ marginRight: 4 }} />
                <Text style={styles.locationValue}>
                  {job.location || 'Rustenburg CBD'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transport Cost Breakdown Card */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <View style={styles.breakdownHeaderLeft}>
              <Bus size={18} color="#1a73e8" strokeWidth={2} style={{ marginRight: 8 }} />
              <Text style={styles.breakdownTitle}>Transport cost breakdown</Text>
            </View>
            <View style={styles.commuteTag}>
              <Text style={styles.commuteTagText}>Commute F3</Text>
            </View>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Nearest rank</Text>
            <Text style={styles.breakdownValue}>Rustenburg Taxi Rank</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Route</Text>
            <Text style={styles.breakdownValue}>
              {job.route_id ? `Rustenburg ⮞ ${job.location || 'Rustenburg CBD (local)'}` : 'Rustenburg ⮞ Local'}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Estimated transport cost</Text>
            {job.transportCost != null ? (
              <Text style={styles.transportCostValue}>R{job.transportCost} (return)</Text>
            ) : (
              <Text style={styles.transportUnknownValue}>{messages.jobs.transportUnknown}</Text>
            )}
          </View>

          {job.fareSource && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Fare source</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CheckCircle2 size={13} color="#137333" strokeWidth={2} style={{ marginRight: 4 }} />
                <Text style={styles.fareSourceValue}>{job.fareSource}</Text>
              </View>
            </View>
          )}

          {job.stale && job.daysAgo != null && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Staleness</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AlertTriangle size={13} color="#b06000" strokeWidth={2} style={{ marginRight: 4 }} />
                <Text style={styles.staleValue}>{messages.fares.stale(job.daysAgo)}</Text>
              </View>
            </View>
          )}

          {/* Take-Home Calculation Box */}
          <View style={styles.calcBox}>
            <View style={styles.calcLeft}>
              <Text style={styles.calcLabel}>Your Take-Home Calculation</Text>
              <Text style={styles.calcFormula}>
                Wage (R{job.wage_zar || 0}) - Commute ({job.transportCost != null ? `R${job.transportCost}` : 'R0'})
              </Text>
            </View>
            <View style={styles.calcRight}>
              <Text style={styles.netGainLabel}>Net gain</Text>
              {job.netGain != null ? (
                <Text style={[styles.netGainValue, isNetGainPositive ? styles.netGainPos : styles.netGainNeg]}>
                  {job.netGain >= 0 ? `+R${job.netGain}` : `R${job.netGain}`}
                </Text>
              ) : (
                <Text style={styles.netGainValue}>—</Text>
              )}
            </View>
          </View>
        </View>

        {/* Apply CTA Section */}
        <View style={styles.applySection}>
          <Text style={styles.applyPrompt}>
            Ready to apply for this position? Submit your application directly.
          </Text>
          <Button
            variant="primary"
            onPress={() => navigation?.navigate?.('apply', { id: job.id })}
          >
            {offline ? (
              <View style={styles.buttonContentRow}>
                <CloudOff size={16} color="#ffffff" strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Apply (Queue offline)</Text>
              </View>
            ) : (
              <View style={styles.buttonContentRow}>
                <Text style={styles.buttonText}>Apply</Text>
                <ArrowRight size={16} color="#ffffff" strokeWidth={2} style={{ marginLeft: 6 }} />
              </View>
            )}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scroll: { flex: 1 },
  content: { padding: tokens.space.md, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: { marginTop: 16, fontSize: 15, fontWeight: '600', color: tokens.color.text },
  loadingSubtitle: { marginTop: 4, fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  errorIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorIconText: { fontSize: 24, fontWeight: '700', color: '#ea4335' },
  jobHeaderCard: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: 8,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  jobHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: tokens.font.h2.size,
    fontWeight: '700',
    color: tokens.color.text,
    flex: 1,
    marginRight: 8,
  },
  jobTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#e6f4ea',
    borderRadius: 6,
  },
  jobTypeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#137333',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: tokens.space.sm,
  },
  companyIcon: { fontSize: 16, marginRight: 6 },
  companyText: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary, fontWeight: '500' },
  headerGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    paddingTop: tokens.space.sm,
  },
  headerCol: { flex: 1 },
  colLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: 2 },
  wageValue: { fontSize: tokens.font.body.size, fontWeight: '700', color: '#1a73e8' },
  locationValue: { fontSize: tokens.font.body.size, color: tokens.color.text },
  breakdownCard: {
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: 8,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
    paddingBottom: tokens.space.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  breakdownHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  minibusIcon: { fontSize: 18, marginRight: 6 },
  breakdownTitle: { fontSize: tokens.font.body.size, fontWeight: '700', color: tokens.color.text },
  commuteTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
  },
  commuteTagText: { fontSize: 10, fontWeight: '600', color: tokens.color.textSecondary },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  breakdownValue: { fontSize: tokens.font.caption.size, fontWeight: '600', color: tokens.color.text },
  transportCostValue: { fontSize: tokens.font.caption.size, fontWeight: '700', color: '#d93025' },
  transportUnknownValue: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  fareSourceValue: { fontSize: tokens.font.caption.size, color: '#137333', fontWeight: '500' },
  staleValue: { fontSize: tokens.font.caption.size, color: '#b06000', fontWeight: '600' },
  calcBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    borderColor: '#ceead6',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: tokens.space.sm,
  },
  calcLeft: { flex: 1, marginRight: 8 },
  calcLabel: { fontSize: 11, color: '#137333', fontWeight: '600' },
  calcFormula: { fontSize: 11, color: tokens.color.textSecondary, marginTop: 2 },
  calcRight: { alignItems: 'flex-end' },
  netGainLabel: { fontSize: 10, color: '#137333', fontWeight: '600' },
  netGainValue: { fontSize: 16, fontWeight: '700' },
  netGainPos: { color: '#137333' },
  netGainNeg: { color: '#c5221f' },
  applySection: { marginTop: tokens.space.sm },
  applyPrompt: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginBottom: tokens.space.sm,
    textAlign: 'center',
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: tokens.font.button.size,
    fontWeight: '600',
  },
});
