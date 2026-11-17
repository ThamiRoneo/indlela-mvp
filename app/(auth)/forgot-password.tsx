import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';

type PasswordResetProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function PasswordReset({ navigation }: PasswordResetProps = {}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleNewPassword = useCallback(async (newPassword: string) => {
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setError(messages.passwordReset.submitError);
      return;
    }
    navigation?.navigate('(auth)/log-in');
  }, [navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar title="Reset password" />
        <View style={styles.form}>
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{messages.passwordReset.success}</Text>
              <Button variant="primary" onPress={() => navigation?.navigate('(auth)/log-in')}>
                Log in
              </Button>
            </View>
          ) : (
            <>
              <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              <Button variant="primary" disabled={loading} loading={loading} onPress={handleReset}>
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
