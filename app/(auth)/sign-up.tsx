import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { ArrowLeft, Check } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { isValidPassword } from '../../lib/rules/password';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';

type SignUpProps = {
  navigation?: { navigate: (screen: string) => void };
};

export default function SignUp({ navigation }: SignUpProps = {}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [is18, setIs18] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    NetInfo.fetch().then((state: { isConnected: boolean | null }) => {
      setOffline(!state.isConnected);
    });
  }, []);

  const isValidEmail = useCallback((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), []);
  const isFormValid = useCallback(
    () => isValidEmail(email) && isValidPassword(password) && is18 && agreedPrivacy,
    [email, password, is18, agreedPrivacy, isValidEmail]
  );

  const emailInvalid = email && !isValidEmail(email);
  const passwordInvalid = password && !isValidPassword(password);
  const isDuplicateEmail = error === messages.auth.duplicateEmail;

  const handleSignUp = useCallback(async () => {
    setError(null);
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        if (
          signUpError.message.includes('already registered') ||
          signUpError.message.includes('User already registered')
        ) {
          setError(messages.auth.duplicateEmail);
        } else {
          setError(messages.auth.noConnection);
        }
        setLoading(false);
        return;
      }
      navigation?.navigate('/verify-email');
    } catch {
      setError(messages.auth.noConnection);
      setLoading(false);
    }
  }, [email, password, isFormValid, navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.navigate('(auth)/welcome')}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to welcome"
          >
            <ArrowLeft size={24} color={tokens.color.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign up</Text>
        </View>

        {offline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>No connection. Please check your internet.</Text>
          </View>
        )}

        {isDuplicateEmail && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              {messages.auth.duplicateEmail}{' '}
              <Text
                onPress={() => navigation?.navigate('(auth)/log-in')}
                style={styles.loginLinkText}
              >
                Log in instead?
              </Text>
            </Text>
          </View>
        )}

        {error && !isDuplicateEmail && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              error={emailInvalid ? 'Please enter a valid email address.' : isDuplicateEmail ? messages.auth.duplicateEmail : undefined}
            />
            {emailInvalid && <Text style={styles.fieldError}>Please enter a valid email address.</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <TextInput
              label="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              error={passwordInvalid ? messages.auth.passwordTooShort : undefined}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
            />
            <Text style={styles.passwordHelper}>{messages.auth.passwordTooShort}</Text>
            {passwordInvalid && <Text style={styles.fieldError}>{messages.auth.passwordTooShort}</Text>}
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              onPress={() => setIs18(!is18)}
              style={[styles.checkbox, is18 && styles.checkboxChecked]}
              accessibilityRole="checkbox"
              accessibilityLabel="I confirm I am 18 years or older"
            >
              {is18 && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>I confirm I am 18 years or older</Text>
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              onPress={() => setAgreedPrivacy(!agreedPrivacy)}
              style={[styles.checkbox, agreedPrivacy && styles.checkboxChecked]}
              accessibilityRole="checkbox"
              accessibilityLabel="I agree to the privacy policy"
            >
              {agreedPrivacy && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text
                onPress={() => navigation?.navigate('/privacy-policy')}
                style={styles.privacyLinkText}
              >
                privacy policy
              </Text>
            </Text>
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              variant="primary"
              disabled={!isFormValid() || loading || offline}
              loading={loading}
              onPress={handleSignUp}
            >
              Sign up
            </Button>
          </View>

          <TouchableOpacity
            onPress={() => navigation?.navigate('(auth)/log-in')}
            style={styles.loginLink}
            accessibilityRole="button"
          >
            <Text style={styles.loginLinkBottom}>
              Already have an account? <Text style={styles.loginLinkHighlight}>Log in</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: tokens.space.lg },
  backButton: { marginRight: tokens.space.sm, minWidth: tokens.size.touchMin, minHeight: tokens.size.touchMin, justifyContent: 'center' },
  backArrow: { fontSize: 24, fontWeight: '400', color: tokens.color.text },
  headerTitle: { fontSize: tokens.font.h1.size, fontWeight: '700', color: tokens.color.text },
  offlineBanner: { padding: tokens.space.md, backgroundColor: '#fce8e6', borderRadius: 8, marginBottom: tokens.space.md },
  offlineText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  errorBanner: { padding: tokens.space.md, backgroundColor: '#fce8e6', borderRadius: 8, marginBottom: tokens.space.md },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  form: { gap: tokens.space.md },
  fieldGroup: { gap: 2 },
  fieldError: { fontSize: tokens.font.caption.size, color: tokens.color.error, marginTop: tokens.space.xs },
  passwordHelper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: tokens.space.xs },
  buttonWrapper: { marginTop: tokens.space.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm, minHeight: 32 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: tokens.color.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  checkboxCheck: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  checkboxLabel: { fontSize: tokens.font.body.size, color: tokens.color.text },
  privacyLinkText: { color: tokens.color.primary, textDecorationLine: 'underline' },
  loginLinkText: { color: tokens.color.primary, fontWeight: '600' },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginLinkBottom: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary },
  loginLinkHighlight: { color: tokens.color.primary, fontWeight: '500' },
});
