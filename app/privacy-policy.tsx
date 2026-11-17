import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { messages } from '../lib/messages';
import { tokens } from '../theme/tokens';
import { TopAppBar } from '../components/TopAppBar';
import { Spinner } from '../components/Spinner';

export default function PrivacyPolicy() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = useCallback(async () => {
    try {
      const { data, error: policyError } = await supabase.from('privacy_policy').select('content').single();
      if (policyError) throw policyError;
      setContent(data?.content || '# Privacy Policy\n\nIndlela is a job-seeking app for youth in Rustenburg, North West.\n\nWe collect your email, nearest rank, and transport budget to help you find affordable job opportunities.\n\nYou can delete your account and all data at any time from Profile & Settings.');
    } catch {
      setError(messages.privacy.loadError);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.policyText}>{content}</Text>
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
