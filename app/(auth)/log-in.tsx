import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
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

  const handleLogIn = useCallback(async () => {
    setError(null);
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TopAppBar title="Log in" />
        <View style={styles.form}>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {error === messages.auth.emailUnverified && (
            <TouchableOpacity onPress={() => navigation?.navigate('(auth)/forgot-password')} style={styles.resendLink}>
              <Text style={styles.resendLinkText}>{messages.auth.resendEmail}</Text>
            </TouchableOpacity>
          )}
          <Button
            variant="primary"
            disabled={loading}
            loading={loading}
            onPress={handleLogIn}
          >
            Log in
          </Button>
          <TouchableOpacity onPress={() => navigation?.navigate('(auth)/welcome')} style={styles.welcomeLink}>
            <Text style={styles.welcomeLinkText}>Don't have an account? Sign up</Text>
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
  resendLink: { marginTop: tokens.space.sm, alignItems: 'center' },
  resendLinkText: { fontSize: tokens.font.caption.size, color: tokens.color.primary },
  welcomeLink: { marginTop: tokens.space.lg, alignItems: 'center' },
  welcomeLinkText: { fontSize: tokens.font.body.size, color: tokens.color.primary },
});
