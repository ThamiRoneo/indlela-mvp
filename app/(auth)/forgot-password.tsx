import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { isValidPassword } from '../../lib/rules/password';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';

type PasswordResetProps = {
  navigation?: { navigate: (screen: string) => void; goBack?: () => void };
  mode?: 'request' | 'reset';
};

export default function PasswordReset({ navigation, mode = 'request' }: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setOffline(!state.isConnected);
    };
    checkConnection();
  }, []);

  const handleReset = useCallback(async () => {
    setError(null);
    if (!email.trim()) {
      setError(messages.passwordReset.submitError);
      return;
    }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'indlelamvp://reset-password',
      });
      setLoading(false);
      if (resetError) {
        setError(messages.passwordReset.submitError);
        return;
      }
      setSuccess(true);
    } catch {
      setLoading(false);
      setError(messages.passwordReset.submitError);
    }
  }, [email]);

  const handleNewPassword = useCallback(async () => {
    setError(null);
    if (!isValidPassword(newPassword)) {
      setError(messages.auth.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      setLoading(false);
      if (updateError) {
        setError(messages.passwordReset.submitError);
        return;
      }
      navigation?.navigate('(auth)/log-in');
    } catch {
      setLoading(false);
      setError(messages.passwordReset.submitError);
    }
  }, [newPassword, confirmPassword, navigation]);

  const handleBackToLogin = () => {
    navigation?.navigate('(auth)/log-in');
  };

  if (mode === 'reset') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TopAppBar title="Set new password" onBack={handleBackToLogin} />
          <View style={styles.form}>
            <TextInput
              label="New password"
              placeholder="New password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              error={error ? error : undefined}
            />
            <TextInput
              label="Confirm password"
              placeholder="Confirm password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={error ? error : undefined}
            />
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Button
              variant="primary"
              disabled={loading}
              loading={loading}
              onPress={handleNewPassword}
            >
              Set password
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar
          title="Reset password"
          onBack={handleBackToLogin}
        />

        {offline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>⚠ No connection. Please check your internet.</Text>
          </View>
        )}

        {success ? (
          <View style={styles.successWrapper}>
            <View style={styles.mailIconCircle}>
              <Text style={styles.mailIcon}>✉</Text>
            </View>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>LINK DISPATCHED</Text>
            </View>

            <View style={styles.successCard}>
              <Text style={styles.successTitle}>{messages.passwordReset.success}</Text>
              <Text style={styles.successDescription}>
                We&apos;ve sent reset instructions to <Text style={styles.boldText}>{email}</Text>. Please check your inbox and return here to sign in.
              </Text>
            </View>

            <Text style={styles.expiryNote}>
              Link valid for 15 minutes. If you do not see the email shortly, check your spam folder.
            </Text>

            <View style={styles.buttonWrapper}>
              <Button variant="primary" onPress={handleBackToLogin}>
                Return to log in
              </Button>
            </View>

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backLink}
              accessibilityRole="button"
            >
              <Text style={styles.backLinkText}>Back to log in (S3)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Account Recovery • F1 Identity</Text>
            </View>

            <Text style={styles.heading}>Enter your email to receive a password reset link.</Text>
            <Text style={styles.subtitle}>
              We&apos;ll send secure verification instructions to your registered Indlela address.
            </Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>(!) {error}</Text>
              </View>
            )}

            <TextInput
              label="Email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              editable={!offline && !loading}
              error={error ? error : undefined}
            />

            <Button
              variant="primary"
              disabled={loading || offline}
              loading={loading}
              onPress={handleReset}
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </Button>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>🛡️</Text>
              <Text style={styles.infoText}>
                Your taxi rank and daily commute route preferences remain protected and will be available once logged in.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backLink}
              accessibilityRole="button"
            >
              <Text style={styles.backLinkText}>← Back to log in</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.md, paddingBottom: tokens.space.xl },
  form: { gap: tokens.space.md },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    borderColor: '#d2e3fc',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: tokens.space.xs,
  },
  badgeText: { fontSize: tokens.font.caption.size, color: tokens.color.primary, fontWeight: '600' },
  heading: {
    fontSize: tokens.font.h2.size,
    fontWeight: '700',
    color: tokens.color.text,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: tokens.font.body.size,
    color: tokens.color.textSecondary,
    lineHeight: 20,
    marginBottom: tokens.space.xs,
  },
  offlineBanner: {
    padding: tokens.space.md,
    backgroundColor: '#fef7e0',
    borderColor: '#f9ab00',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: tokens.space.md,
  },
  offlineText: { fontSize: tokens.font.body.size, color: '#b06000', fontWeight: '500' },
  errorBanner: { padding: tokens.space.md, backgroundColor: '#fce8e6', borderRadius: 8 },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: tokens.space.md,
    gap: tokens.space.sm,
    marginTop: tokens.space.sm,
  },
  infoIcon: { fontSize: 20 },
  infoText: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, flex: 1, lineHeight: 18 },
  backLink: { marginTop: tokens.space.md, alignItems: 'center', paddingVertical: tokens.space.sm },
  backLinkText: { fontSize: tokens.font.body.size, color: tokens.color.primary, fontWeight: '500' },
  successWrapper: { alignItems: 'center', paddingHorizontal: tokens.space.sm, gap: tokens.space.md },
  mailIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.space.md,
  },
  mailIcon: { fontSize: 28, color: '#137333' },
  badgeSuccess: {
    backgroundColor: '#e6f4ea',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeSuccessText: { fontSize: 11, fontWeight: '700', color: '#137333', letterSpacing: 0.5 },
  successCard: {
    backgroundColor: '#e6f4ea',
    borderColor: '#ceead6',
    borderWidth: 1,
    borderRadius: 8,
    padding: tokens.space.md,
    width: '100%',
    alignItems: 'center',
  },
  successTitle: { fontSize: tokens.font.body.size, fontWeight: '700', color: '#137333', marginBottom: 4, textAlign: 'center' },
  successDescription: { fontSize: tokens.font.caption.size, color: '#137333', textAlign: 'center', lineHeight: 18 },
  boldText: { fontWeight: '700' },
  expiryNote: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, textAlign: 'center', marginVertical: tokens.space.xs },
  buttonWrapper: { width: '100%' },
});
