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
  navigation?: { navigate: (screen: string) => void };
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

  const handleReset = useCallback(async () => {
    setError(null);
    if (!email.trim()) { setError(messages.passwordReset.submitError); return; }
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
    if (!isValidPassword(newPassword)) { setError(messages.auth.passwordTooShort); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
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

  useEffect(() => {
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setOffline(!state.isConnected);
    };
    checkConnection();
  }, []);

  if (mode === 'reset') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TopAppBar title="Set new password" />
          <View style={styles.form}>
            <TextInput placeholder="New password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
            <TextInput placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Button variant="primary" disabled={loading} loading={loading} onPress={handleNewPassword}>
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
        <TopAppBar title="Reset password" />
        <View style={styles.form}>
          {offline && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>No connection. Please check your internet.</Text>
            </View>
          )}
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{messages.passwordReset.success}</Text>
              <Button variant="primary" onPress={() => navigation?.navigate('(auth)/log-in')}>
                Log in
              </Button>
            </View>
          ) : (
            <>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} editable={!offline && !loading} />
              {error && !offline && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              <Button variant="primary" disabled={loading || offline} loading={loading} onPress={handleReset}>
                Send reset link
              </Button>
            </>
          )}
          <TouchableOpacity onPress={() => navigation?.navigate('(auth)/log-in')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Remember your password? Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.xl },
  form: { gap: tokens.space.md },
  errorBanner: { marginTop: tokens.space.sm },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error, textAlign: 'center' },
  successContainer: { alignItems: 'center', padding: tokens.space.lg },
  successText: { fontSize: tokens.font.body.size, color: tokens.color.text, textAlign: 'center', marginBottom: tokens.space.lg },
  loginLink: { marginTop: tokens.space.lg, alignItems: 'center' },
  loginLinkText: { fontSize: tokens.font.body.size, color: tokens.color.primary },
});
