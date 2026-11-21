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
import DeleteAccount from '../modals/delete-account';

type ProfileSettingsProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function ProfileSettings({ navigation }: ProfileSettingsProps = {}) {
  const [email, setEmailState] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    setSaving(true);
    const connected = await NetInfo.fetch();
    if (!connected.isConnected) {
      setOffline(true);
      setSaving(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const updates: Record<string, unknown> = {};
    if (username.trim()) updates.username = username.trim();
    if (budget.trim()) updates.weekly_transport_budget = parseInt(budget, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);
    setSaving(false);
    if (updateError) {
      setError(messages.profile.saveError);
      return;
    }
    setSuccess(true);
  }, [username, budget]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar title="Profile & Settings" actionLabel="LM" />

        {offline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠ {messages.profile.offline}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>(!) {error}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.retryButton} accessibilityRole="button">
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Email address</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutRow} accessibilityRole="button">
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transport</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.rankRow}>
            <View style={styles.rankInfo}>
              <Text style={styles.rankLabel}>Nearest rank</Text>
              <Text style={styles.rankValue}>
                {profile?.nearest_rank_id ? 'Rustenburg Taxi Rank' : 'Rustenburg Taxi Rank'}
              </Text>
              <Text style={styles.rankHelper}>Used for calculating daily commute routes</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation?.navigate('/set-nearest-rank')}
              style={styles.changeButton}
              accessibilityRole="button"
            >
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.budgetRow}>
            <Text style={styles.label}>{messages.profile.budgetLabel}</Text>
          </View>
          <TextInput
            value={budget}
            onChangeText={setBudget}
            editable={!offline && !saving}
            error={error ?? undefined}
            placeholder="R 500"
          />
          {error && <Text style={styles.errorInline}>{error}</Text>}
          <Text style={styles.budgetHelper}>Powers affordability filters in job searches</Text>

          <Button
            variant="primary"
            disabled={saving || offline}
            loading={saving}
            onPress={handleSave}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.dangerTitle}>Danger zone</Text>
        </View>
        <View style={styles.dangerCard}>
          <Text style={styles.dangerDescription}>
            Permanently remove saved ranks, fare history, and account profile.
          </Text>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            disabled={offline}
            style={[styles.deleteButton, offline && styles.disabledButton]}
            accessibilityRole="button"
          >
            <Text style={[styles.deleteText, offline && styles.disabledText]}>
              {offline ? 'Delete account (Unavailable offline)' : 'Delete account'}
            </Text>
          </TouchableOpacity>
        </View>

        {success && (
          <View style={styles.toastContainer}>
            <View style={styles.toast}>
              <Text style={styles.toastText}>✓ Saved.</Text>
            </View>
          </View>
        )}

        {showDeleteModal && (
          <DeleteAccount
            onDismiss={() => setShowDeleteModal(false)}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.md, paddingBottom: tokens.space.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  offlineBanner: {
    padding: tokens.space.md,
    backgroundColor: '#fef7e0',
    borderColor: '#f9ab00',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: tokens.space.sm,
  },
  offlineText: { fontSize: tokens.font.body.size, color: '#b06000', fontWeight: '500' },
  errorBanner: {
    padding: tokens.space.md,
    backgroundColor: '#fce8e6',
    borderRadius: 8,
    marginVertical: tokens.space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error, flex: 1 },
  retryButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: tokens.color.primary, marginLeft: 8 },
  retryText: { color: '#ffffff', fontSize: tokens.font.caption.size, fontWeight: '600' },
  sectionHeaderRow: { marginTop: tokens.space.md, marginBottom: tokens.space.sm },
  sectionTitle: { fontSize: tokens.font.h2.size, fontWeight: '700', color: tokens.color.text },
  dangerTitle: { fontSize: tokens.font.h2.size, fontWeight: '700', color: tokens.color.error },
  card: {
    backgroundColor: tokens.color.background,
    borderColor: tokens.color.border,
    borderWidth: 1,
    padding: tokens.space.md,
    borderRadius: 8,
    marginBottom: tokens.space.md,
  },
  fieldRow: { marginBottom: tokens.space.xs },
  label: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: tokens.space.xs },
  emailValue: { fontSize: tokens.font.body.size, fontWeight: '500', color: tokens.color.text },
  logoutRow: { paddingTop: tokens.space.md, borderTopWidth: 1, borderTopColor: '#f1f3f4', marginTop: tokens.space.sm },
  logoutText: { fontSize: tokens.font.body.size, color: tokens.color.primary, fontWeight: '500' },
  rankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rankInfo: { flex: 1 },
  rankLabel: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: 2 },
  rankValue: { fontSize: tokens.font.body.size, fontWeight: '600', color: tokens.color.text },
  rankHelper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: 2 },
  changeButton: { paddingVertical: tokens.space.xs, paddingHorizontal: tokens.space.sm },
  changeLink: { fontSize: tokens.font.body.size, color: tokens.color.primary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f1f3f4', marginVertical: tokens.space.md },
  budgetRow: { marginBottom: tokens.space.xs },
  errorInline: { fontSize: tokens.font.caption.size, color: tokens.color.error, marginTop: tokens.space.xs, marginBottom: tokens.space.sm },
  budgetHelper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.xs, marginBottom: tokens.space.md },
  dangerCard: {
    borderColor: '#fce8e6',
    borderWidth: 1,
    backgroundColor: '#fffbfa',
    padding: tokens.space.md,
    borderRadius: 8,
    marginBottom: tokens.space.lg,
  },
  dangerDescription: {
    fontSize: tokens.font.caption.size,
    lineHeight: 18,
    color: tokens.color.textSecondary,
    marginBottom: tokens.space.md,
  },
  deleteButton: {
    height: tokens.size.touchMin,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.6, borderColor: tokens.color.border },
  deleteText: { fontSize: tokens.font.body.size, color: tokens.color.error, fontWeight: '500' },
  disabledText: { color: tokens.color.textSecondary },
  toastContainer: {
    position: 'absolute',
    bottom: tokens.space.lg,
    left: tokens.space.md,
    right: tokens.space.md,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: '#202124',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: { color: '#ffffff', fontSize: tokens.font.body.size, fontWeight: '500' },
});
