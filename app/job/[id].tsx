import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { viewJobDetails, type JobFeedItem } from '../../lib/api/jobs';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Button } from '../../components/Button';

type JobDetailsProps = {
  jobId?: string;
};

export default function JobDetails({ jobId: jobIdProp }: JobDetailsProps) {
  const [job, setJob] = useState<JobFeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!jobIdProp) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Job Details" />
        <EmptyState text={error} actionLabel="Retry" onAction={load} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Job Details" />
        <EmptyState text={messages.jobs.empty} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title={job.title} />
      <Card
        type="job"
        title={job.title}
        company={job.company || ''}
        wage={job.wage_zar ?? undefined}
        transportCost={job.transportCost ?? undefined}
        netGain={job.netGain ?? undefined}
      />
      {job.fareSource && (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Fare source:</Text>
          <Text style={styles.metaValue}>{job.fareSource}</Text>
        </View>
      )}
      {job.stale && job.daysAgo != null && (
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Staleness:</Text>
          <Text style={styles.metaStale}>{messages.fares.stale(job.daysAgo)}</Text>
        </View>
      )}
      <Button variant="primary" onPress={() => {}}>
        Apply
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  metaRow: { flexDirection: 'row', paddingHorizontal: tokens.space.md, paddingVertical: tokens.space.xs },
  metaLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, width: 80 },
  metaValue: { fontSize: tokens.font.body.size, color: tokens.color.text },
  metaStale: { fontSize: tokens.font.body.size, color: tokens.color.warning, fontWeight: '600' },
});
