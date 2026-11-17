import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';

export default function ProfileSettings() {
  const [email, setEmailState] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (data) {
      setEmailState(data.email || '');
      setUsername(data.username || '');
      setProfile(data);
      if (data.weekly_transport_budget != null) setBudget(String(data.weekly_transport_budget));
    }
  }, []);

  const handleSave = useCallback(async () => {
    setError(null);
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const updates: Record<string, unknown> = {};
    if (username.trim()) updates.username = username.trim();
    if (budget.trim()) updates.weekly_transport_budget = parseInt(budget, 10);
    const { error: updateError } = await supabase.from('users').update(updates).eq('id', user.id);
    setLoading(false);
    if (updateError) {
      setError(messages.profile.saveError);
      return;
    }
    Alert.alert('Saved.', messages.profile.saveSuccess);
  }, [username, budget]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (loading) return (
    <View style={styles.card}><Spinner size="large" /></View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar title="Profile & Settings" />
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmailState} />
          <Text style={styles.label}>Username</Text>
          <TextInput value={username} onChangeText={setUsername} />
          <Text style={styles.label}>{messages.profile.budgetLabel}</Text>
          <TextInput value={budget} onChangeText={setBudget} />
        </View>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <Button variant="primary" disabled={loading} loading={loading} onPress={handleSave}>
          Save
        </Button>
        <View style={styles.divider} />
        <Button variant="text" onPress={handleLogout}>
          Log out
        </Button>
        <Button variant="text" onPress={() => {}}>
          Delete account
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.xl },
  card: { backgroundColor: tokens.color.surface, padding: tokens.space.md, borderRadius: 8, marginBottom: tokens.space.lg },
  label: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.xs },
  divider: { height: 1, backgroundColor: tokens.color.border, marginVertical: tokens.space.md },
  errorBanner: { marginTop: tokens.space.sm, padding: tokens.space.md, backgroundColor: '#fdecea', borderRadius: 8 },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error, marginBottom: tokens.space.sm },
  retryButton: { padding: 8, borderRadius: 4, backgroundColor: tokens.color.primary },
  retryText: { color: '#ffffff', fontSize: tokens.font.body.size },
  deleteButton: { marginTop: tokens.space.sm },
});
