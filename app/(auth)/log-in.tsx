import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { TopAppBar } from '../../components/TopAppBar';

type LogInProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function LogIn({ navigation }: LogInProps = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    NetInfo.fetch().then((state: { isConnected: boolean | null }) => {
      setOffline(!state.isConnected);
    });
  }, []);

  const handleLogIn = useCallback(async () => {
    setError(null);
    setResendStatus(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        if (signInError.message.includes('Email not confirmed') || signInError.message.includes('not confirmed')) {
          setError(messages.auth.emailUnverified);
        } else if (signInError.message.includes('Too many attempts')) {
          setError(messages.auth.tooManyAttempts);
        } else {
          setError(messages.auth.noConnection);
        }
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from('users')
        .select('nearest_rank_id, username')
        .eq('id', data.user!.id)
        .single();
      if (!profile?.nearest_rank_id || !profile?.username) {
        navigation?.navigate('/set-nearest-rank');
      } else {
        navigation?.navigate('/(tabs)/index');
      }
    } catch {
      setError(messages.auth.noConnection);
      setLoading(false);
    }
  }, [email, password, navigation]);

  const handleResendVerification = useCallback(async () => {
    if (!email) {
      navigation?.navigate('(auth)/forgot-password');
      return;
    }
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) {
        setResendStatus('Could not resend email.');
      } else {
        setResendStatus('Verification email resent.');
      }
    } catch {
      setResendStatus('Could not resend email.');
    }
  }, [email, navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar
          title="Log in"
          onBack={() => navigation?.navigate('(auth)/welcome')}
        />

        {offline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>No connection. Please check your internet.</Text>
          </View>
        )}

        {error === messages.auth.emailUnverified && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {messages.auth.emailUnverified}{' '}
              <Text onPress={handleResendVerification} style={styles.resendLinkText}>
                {messages.auth.resendEmail}
              </Text>
            </Text>
            {resendStatus && <Text style={styles.resendStatusText}>{resendStatus}</Text>}
          </View>
        )}

        {error === messages.auth.tooManyAttempts && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>{messages.auth.tooManyAttempts}</Text>
          </View>
        )}

        {error && error !== messages.auth.emailUnverified && error !== messages.auth.tooManyAttempts && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <TextInput
            label="Email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            error={error ? error : undefined}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              label="Password"
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              error={error ? error : undefined}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
            />
            <TouchableOpacity
              onPress={() => navigation?.navigate('(auth)/forgot-password')}
              style={styles.forgotPasswordButton}
              accessibilityRole="button"
              accessibilityLabel="Forgot password?"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            variant="primary"
            disabled={loading || offline}
            loading={loading}
            onPress={handleLogIn}
          >
            Log in
          </Button>

          <TouchableOpacity
            onPress={() => navigation?.navigate('(auth)/sign-up')}
            style={styles.signupLink}
            accessibilityRole="button"
          >
            <Text style={styles.signupLinkBottom}>
              Don&apos;t have an account? <Text style={styles.signupLinkHighlight}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.md },
  offlineBanner: { padding: tokens.space.md, backgroundColor: '#fce8e6', borderRadius: 8, marginVertical: tokens.space.sm },
  offlineText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  warningBanner: { padding: tokens.space.md, backgroundColor: '#fef7e0', borderColor: '#f9ab00', borderWidth: 1, borderRadius: 8, marginVertical: tokens.space.sm },
  warningText: { fontSize: tokens.font.body.size, color: '#b06000' },
  errorBanner: { padding: tokens.space.md, backgroundColor: '#fce8e6', borderRadius: 8, marginVertical: tokens.space.sm },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  resendLinkText: { fontSize: tokens.font.body.size, color: tokens.color.primary, fontWeight: '600' },
  resendStatusText: { fontSize: tokens.font.caption.size, color: tokens.color.primary, marginTop: tokens.space.xs },
  form: { gap: tokens.space.md, marginTop: tokens.space.sm },
  passwordContainer: { gap: tokens.space.xs },
  forgotPasswordButton: { alignSelf: 'flex-end', paddingVertical: tokens.space.xs },
  forgotPasswordText: { fontSize: tokens.font.body.size, color: tokens.color.primary, fontWeight: '500' },
  signupLink: { marginTop: tokens.space.lg, alignItems: 'center' },
  signupLinkBottom: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary },
  signupLinkHighlight: { color: tokens.color.primary, fontWeight: '500' },
});
