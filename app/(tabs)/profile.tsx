import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';
import { Spinner } from '../../components/Spinner';
import { Banner } from '../../components/Banner';

export default function ProfileSettings() {
  const [email, setEmailState] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const connected = await NetInfo.fetch();
      if (!connected.isConnected) {
        setOffline(true);
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileError) {
        setError(messages.profile.saveError);
        setLoading(false);
        return;
      }
      if (data) {
        setEmailState(data.email || '');
        setUsername(data.username || '');
        setProfile(data);
        if (data.weekly_transport_budget != null) setBudget(String(data.weekly_transport_budget));
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = useCallback(async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);
    const connected = await NetInfo.fetch();
    if (!connected.isConnected) {
      setOffline(true);
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const updates: Record<string, unknown> = {};
    if (username.trim()) updates.username = username.trim();
    if (budget.trim()) updates.weekly_transport_budget = parseInt(budget, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    setLoading(false);
    if (updateError) {
      setError(messages.profile.saveError);
      return;
    }
    setSuccess(true);
  }, [username, budget]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const isSaving = loading;

  if (loading) {
    return (
      <View style={styles.loadingContainer}><Spinner size="large" /></View>
    );
  }

  if (offline) {
    return (
      <View style={styles.container}>
        <TopAppBar title="Profile & Settings" actionLabel="LM" />
        <Banner variant="error">{messages.profile.offline}</Banner>
        <View style={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Email address</Text>
              <Text style={styles.emailValue}>{email}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutRow}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Transport</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Nearest rank</Text>
              <Text style={styles.changeLink}>Change</Text>
            </View>
            <Text style={styles.rankValue}>{profile?.nearest_rank_id ? 'Rustenburg Taxi Rank' : 'Not set'}</Text>
            <Text style={styles.rankHelper}>Used for calculating daily commute routes</Text>
            <View style={styles.budgetRow}>
              <Text style={styles.label}>{messages.profile.budgetLabel}</Text>
            </View>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            editable={false}
            placeholder="R 0"
          />
            <Text style={styles.budgetHelper}>Powers affordability filters in job searches</Text>
            <Button variant="primary" disabled={true}>
              Save
            </Button>
          </View>
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger zone</Text>
            <TouchableOpacity style={styles.deleteButton} disabled={true}>
              <Text style={styles.deleteText}>Delete account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar title="Profile & Settings" actionLabel="LM" />
        {success && (
          <View style={styles.toastContainer}>
            <View style={[styles.toast, { backgroundColor: tokens.color.success }]}>
              <Text style={styles.toastText}>Saved.</Text>
            </View>
          </View>
        )}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Email address</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutRow}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Transport</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Nearest rank</Text>
            <Text style={styles.changeLink}>Change</Text>
          </View>
          <Text style={styles.rankValue}>{profile?.nearest_rank_id ? 'Rustenburg Taxi Rank' : 'Not set'}</Text>
          <Text style={styles.rankHelper}>Used for calculating daily commute routes</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.label}>{messages.profile.budgetLabel}</Text>
          </View>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            error={error ?? undefined}
            placeholder="R 0"
          />
          {error && <Text style={styles.errorInline}>{error}</Text>}
          <Text style={styles.budgetHelper}>Powers affordability filters in job searches</Text>
          <Button
            variant="primary"
            disabled={isSaving}
            loading={isSaving}
            onPress={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </View>
        <View style={styles.divider} />
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger zone</Text>
          <TouchableOpacity onPress={() => {}} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: tokens.color.surface, padding: tokens.space.md, borderRadius: 8, marginBottom: tokens.space.lg },
  sectionTitle: { fontSize: tokens.font.caption.size, fontWeight: '600', color: tokens.color.textSecondary, marginBottom: tokens.space.sm, textTransform: 'uppercase' },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: tokens.space.xs },
  label: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.xs },
  emailValue: { fontSize: tokens.font.body.size, color: tokens.color.text },
  logoutRow: { paddingVertical: tokens.space.sm },
  logoutText: { fontSize: tokens.font.body.size, color: tokens.color.primary },
  changeLink: { fontSize: tokens.font.body.size, color: tokens.color.primary, fontWeight: '500' },
  rankValue: { fontSize: tokens.font.body.size, color: tokens.color.text, marginBottom: tokens.space.xs },
  rankHelper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.md },
  budgetRow: { marginBottom: tokens.space.xs },
  input: {
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: tokens.font.input.size,
    minHeight: tokens.size.touchMin,
    color: tokens.color.text,
  },
  errorInline: { fontSize: tokens.font.caption.size, color: tokens.color.error, marginTop: tokens.space.xs, marginBottom: tokens.space.sm },
  budgetHelper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.md },
  divider: { height: 1, backgroundColor: tokens.color.border, marginVertical: tokens.space.md },
  dangerZone: { marginBottom: tokens.space.lg },
  dangerTitle: { fontSize: tokens.font.caption.size, fontWeight: '600', color: tokens.color.error, marginBottom: tokens.space.sm },
  deleteButton: { padding: tokens.space.sm, borderRadius: 8, backgroundColor: '#fdecea' },
  deleteText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  errorBanner: { marginTop: tokens.space.sm, padding: tokens.space.md, backgroundColor: '#fdecea', borderRadius: 8 },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error, marginBottom: tokens.space.sm },
  retryButton: { padding: 8, borderRadius: 4, backgroundColor: tokens.color.primary },
  retryText: { color: '#ffffff', fontSize: tokens.font.body.size },
  toastContainer: { position: 'absolute', bottom: tokens.space.xl, left: 0, right: 0, alignItems: 'center' },
  toast: { padding: tokens.space.md, borderRadius: 8, maxWidth: '80%' },
  toastText: { color: '#ffffff', fontSize: tokens.font.body.size, textAlign: 'center' },
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
