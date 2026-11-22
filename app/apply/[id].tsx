import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { submitApplication } from '../../lib/api/jobs';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';
import { Banner } from '../../components/Banner';

type ApplicationFlowProps = {
  jobId?: string;
  navigation?: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack?: () => void;
  };
};

type JobSummary = {
  title?: string;
  company?: string;
  wage_zar?: number;
};

export default function ApplicationFlow({ jobId: jobIdProp, navigation }: ApplicationFlowProps) {
  const [job, setJob] = useState<JobSummary | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((state: { isConnected: boolean | null }) => {
      if (mounted && !state.isConnected) {
        setOffline(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (jobIdProp) {
      supabase
        .from('jobs')
        .select('title, company, wage_zar')
        .eq('id', jobIdProp)
        .single()
        .then(({ data }) => {
          if (data) setJob(data);
        });
    }
  }, [jobIdProp]);

  const handleSubmit = useCallback(async () => {
    if (!jobIdProp) return;
    setError(null);
    setSuccess(false);
    setLoading(true);
    const connected = await NetInfo.fetch();
    if (!connected.isConnected) {
      setOffline(true);
      setLoading(false);
      return;
    }
    setOffline(false);
    const { error: submitError } = await submitApplication(jobIdProp, name, phone, email);
    setLoading(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setSuccess(true);
  }, [jobIdProp, name, phone, email]);

  const jobTitle = job?.title || 'Retail Assistant';
  const companyName = job?.company || 'Shoprite Rustenburg';
  const wageDisplay = job?.wage_zar ? `R${job.wage_zar}/day` : 'R150/day';

  if (success) {
    return (
      <View style={styles.container}>
        <TopAppBar
          title={`Apply for ${jobTitle}`}
          onBack={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
          actionLabel="✓"
        />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.successContent}>
          <View style={styles.successBadgeWrap}>
            <View style={styles.successCheckBadge}>
              <Text style={styles.successCheckmark}>✓</Text>
            </View>
          </View>

          <View style={styles.dispatchedPill}>
            <Text style={styles.dispatchedPillText}>APPLICATION DISPATCHED</Text>
          </View>

          <Text style={styles.successTitle}>{messages.jobs.submitSuccess}</Text>
          <Text style={styles.successSubtext}>
            Your profile has been forwarded to {companyName} along with your commute cost estimate.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Position</Text>
              <Text style={styles.summaryValue}>{jobTitle}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Employer</Text>
              <Text style={styles.summaryValue}>{companyName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wage Rate</Text>
              <Text style={styles.summaryValue}>{wageDisplay}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Applicant</Text>
              <Text style={styles.summaryValue}>{name || 'Lerato Mokoena'}</Text>
            </View>
          </View>

          <View style={styles.activityNoteCard}>
            <Text style={styles.activityNoteText}>
              ℹ We will log this application under your Indlela Activity tab (S10).
            </Text>
          </View>

          <Button
            variant="primary"
            onPress={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
          >
            ← Back to Job Details (S8)
          </Button>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar
        title={`Apply for ${jobTitle}`}
        onBack={() => navigation?.goBack?.() || navigation?.navigate?.('index')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {offline && (
          <Banner
            variant="error"
            icon="🛜"
            title={messages.jobs.offlineSubmit}
          >
            Network Required for Submission: Applications cannot be queued without a verified carrier connection.
          </Banner>
        )}

        {error && (
          <Banner
            variant="error"
            icon="!"
            title={messages.jobs.submitError}
          >
            Application payload timed out. Your information has been preserved.
          </Banner>
        )}

        {/* Position Selected Card */}
        <View style={styles.positionCard}>
          <Text style={styles.positionIcon}>🏪</Text>
          <View style={styles.positionTextWrap}>
            <Text style={styles.positionTag}>POSITION SELECTED</Text>
            <Text style={styles.positionTitle}>
              {companyName} — {wageDisplay}
            </Text>
          </View>
        </View>

        <Text style={styles.instructions}>
          Complete your contact details below to send your application directly to the hiring manager.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Lerato Mokoena"
            editable={!loading && !offline}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="071 234 5678"
            editable={!loading && !offline}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="lerato.mokoena@gmail.com"
            editable={!loading && !offline}
          />

          {/* Commute route attachment note */}
          <View style={styles.commuteNoticeCard}>
            <Text style={styles.commuteNoticeIcon}>🛡</Text>
            <Text style={styles.commuteNoticeText}>
              Your verified Rustenburg commute route and weekly fare budget will be attached.
            </Text>
          </View>

          <Button
            variant="primary"
            disabled={loading || offline}
            loading={loading}
            onPress={handleSubmit}
          >
            {loading ? 'Submitting application...' : error ? 'Retry' : 'Apply'}
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
  successContent: { padding: tokens.space.md, paddingBottom: 40, alignItems: 'center' },
  instructions: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginVertical: tokens.space.sm,
    lineHeight: 18,
  },
  positionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderWidth: 1,
    borderColor: '#d2e3fc',
    borderRadius: 8,
    padding: tokens.space.sm,
    marginVertical: tokens.space.xs,
  },
  positionIcon: { fontSize: 20, marginRight: 10 },
  positionTextWrap: { flex: 1 },
  positionTag: { fontSize: 10, fontWeight: '700', color: '#174ea6', marginBottom: 2 },
  positionTitle: { fontSize: tokens.font.body.size, fontWeight: '700', color: tokens.color.text },
  form: { marginTop: tokens.space.xs, gap: tokens.space.xs },
  label: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  commuteNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 6,
    padding: 10,
    marginVertical: tokens.space.sm,
  },
  commuteNoticeIcon: { fontSize: 16, marginRight: 8 },
  commuteNoticeText: {
    fontSize: 12,
    color: tokens.color.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  successBadgeWrap: { marginVertical: tokens.space.md, alignItems: 'center' },
  successCheckBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ceead6',
  },
  successCheckmark: { fontSize: 32, color: '#137333', fontWeight: '700' },
  dispatchedPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#e6f4ea',
    borderRadius: 12,
    marginBottom: tokens.space.sm,
  },
  dispatchedPillText: { fontSize: 10, fontWeight: '700', color: '#137333' },
  successTitle: {
    fontSize: tokens.font.h2.size,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 13,
    color: tokens.color.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: tokens.space.md,
    paddingHorizontal: 12,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: tokens.color.surface,
    borderWidth: 1,
    borderColor: tokens.color.border,
    borderRadius: 8,
    padding: tokens.space.md,
    marginBottom: tokens.space.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  summaryLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  summaryValue: { fontSize: tokens.font.caption.size, fontWeight: '600', color: tokens.color.text },
  activityNoteCard: {
    width: '100%',
    backgroundColor: '#e8f0fe',
    borderRadius: 6,
    padding: 10,
    marginBottom: tokens.space.lg,
  },
  activityNoteText: { fontSize: 12, color: '#174ea6', textAlign: 'center' },
});
