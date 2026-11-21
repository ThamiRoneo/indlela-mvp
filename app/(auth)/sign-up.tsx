import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
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

  const isValidEmail = useCallback((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e), []);
  const isFormValid = useCallback(() => isValidEmail(email) && isValidPassword(password) && is18 && agreedPrivacy, [email, password, is18, agreedPrivacy, isValidEmail]);

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
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
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
          <TouchableOpacity onPress={() => navigation?.navigate('(auth)/welcome')} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Signup</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailInvalid || isDuplicateEmail ? messages.auth.passwordTooShort : undefined}
          />
          {emailInvalid && <Text style={styles.fieldError}>{messages.auth.passwordTooShort}</Text>}
          <TextInput
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={passwordInvalid ? messages.auth.passwordTooShort : undefined}
            onTogglePassword={() => {}}
          />
          <Text style={styles.passwordHelper}>{messages.auth.passwordTooShort}</Text>
          {passwordInvalid && <Text style={styles.fieldError}>{messages.auth.passwordTooShort}</Text>}
          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setIs18(!is18)} style={[styles.checkbox, is18 && styles.checkboxChecked]}>
              {is18 && <Text style={styles.checkboxCheck}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>I am 18 years or older</Text>
          </View>
          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => setAgreedPrivacy(!agreedPrivacy)} style={[styles.checkbox, agreedPrivacy && styles.checkboxChecked]}>
              {agreedPrivacy && <Text style={styles.checkboxCheck}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>I agree to the privacy policy</Text>
          </View>
          {isDuplicateEmail && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{messages.auth.duplicateEmail}</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('(auth)/log-in')} style={styles.loginLinkInline}>
                <Text style={styles.loginLinkText}>Log in instead?</Text>
              </TouchableOpacity>
            </View>
          )}
          {error && !isDuplicateEmail && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <View style={styles.buttonWrapper}>
            <Button
              variant="primary"
              disabled={!isFormValid() || loading}
              loading={loading}
              onPress={handleSignUp}
            >
              Sign up
            </Button>
          </View>
          <TouchableOpacity onPress={() => navigation?.navigate('(auth)/log-in')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: tokens.space.lg },
  backButton: { marginRight: tokens.space.sm },
  backArrow: { fontSize: 28, fontWeight: '300', color: tokens.color.text, lineHeight: 28 },
  headerTitle: { fontSize: tokens.font.h3.size, fontWeight: '600', color: tokens.color.text },
  form: { gap: tokens.space.md, marginTop: tokens.space.lg },
  fieldError: { fontSize: tokens.font.caption.size, color: tokens.color.error, marginBottom: tokens.space.sm },
  passwordHelper: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginBottom: 2 },
  buttonWrapper: { marginTop: tokens.space.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: tokens.color.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  checkboxCheck: { color: '#ffffff', fontSize: 12 },
  checkboxLabel: { fontSize: tokens.font.body.size, color: tokens.color.text },
  errorBanner: { marginTop: tokens.space.sm, padding: tokens.space.md, backgroundColor: '#fdecea', borderRadius: 8 },
  errorText: { fontSize: tokens.font.body.size, color: tokens.color.error },
  loginLinkInline: { marginLeft: tokens.space.sm },
  loginLinkText: { fontSize: tokens.font.body.size, color: tokens.color.primary },
  loginLink: { marginTop: 22, alignItems: 'center' },
});
