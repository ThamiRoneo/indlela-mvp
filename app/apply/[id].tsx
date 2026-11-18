import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { submitApplication } from '../../lib/api/jobs';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { EmptyState } from '../../components/EmptyState';

type ApplicationFlowProps = {
  jobId?: string;
};

export default function ApplicationFlow({ jobId: jobIdProp }: ApplicationFlowProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then((state: { isConnected: boolean }) => {
      if (mounted && !state.isConnected) {
        setOffline(true);
      }
    });
    return () => { mounted = false; };
  }, []);

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
        <TopAppBar title="Apply" />
        <EmptyState text={messages.jobs.offlineSubmit} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Apply" />
        <EmptyState text={error} actionLabel="Retry" onAction={handleSubmit} />
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Apply" />
        <EmptyState text={messages.jobs.submitSuccess} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopAppBar title="Apply" />
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} />
        <Text style={styles.label}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} />
        <Button variant="primary" disabled={loading} loading={loading} onPress={handleSubmit}>
          Apply
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background, padding: tokens.space.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  form: { gap: tokens.space.sm },
  label: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
});
