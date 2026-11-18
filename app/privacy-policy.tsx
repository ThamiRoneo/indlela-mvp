import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { tokens } from '../theme/tokens';
import { TopAppBar } from '../components/TopAppBar';
import { Spinner } from '../components/Spinner';

const POLICY_CONTENT = `# Privacy Policy

Indlela helps unemployed youth in Rustenburg, North West find affordable job opportunities.

Data we collect: your email address, nearest taxi rank, and weekly transport budget. This is stored to show you jobs you can afford to reach and to let you report taxi fares.

Your email is never shared with other users. You can delete your account and all your data at any time from Profile & Settings.

You must be 18 or older to create an account.`;

export default function PrivacyPolicy() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPolicy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Static content: no network call required.
      await Promise.resolve();
      setLoading(false);
    } catch {
      setError('Could not load policy. Try again.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicy();
  }, []);

  if (loading) return (
    <View style={styles.loadingContainer}><Spinner size="large" /></View>
  );

  if (error) return (
    <View style={styles.container}>
      <TopAppBar title="Privacy Policy" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopAppBar title="Privacy Policy" />
      <View style={styles.scrollContent}>
        <Text style={styles.policyText}>{POLICY_CONTENT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: tokens.space.xl },
  policyText: { fontSize: tokens.font.body.size, lineHeight: tokens.font.body.lineHeight, color: tokens.color.text },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error, textAlign: 'center', marginTop: tokens.space.lg },
});
