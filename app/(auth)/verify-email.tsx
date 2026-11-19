import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';
import { TopAppBar } from '../../components/TopAppBar';

type VerifyEmailProps = {
  email: string;
  navigation?: { navigate: (screen: string) => void };
};

export default function VerifyEmail({ email, navigation }: VerifyEmailProps) {
  return (
    <View style={[styles.container, { backgroundColor: tokens.color.background }]}>
      <TopAppBar title="Verify Email" />
      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Account created. Please verify your email.</Text>
        <Text style={styles.body}>Check your inbox</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.hint}>
          We sent a verification link to {email}. Click the link in the message to activate your Indlela account.
        </Text>
        <TouchableOpacity onPress={() => navigation?.navigate('(auth)/log-in')} style={styles.button}>
          <Text style={styles.buttonText}>Open email app</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.linkContainer}>
          <Text style={styles.linkText}>Resend verification email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: tokens.space.xl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: tokens.space.md },
  checkmarkContainer: { alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#e8f5e9' },
  checkmark: { fontSize: 32, color: tokens.color.success },
  title: { fontSize: tokens.font.h2.size, fontWeight: '600', color: tokens.color.text },
  subtitle: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary, textAlign: 'center' },
  body: { fontSize: tokens.font.body.size, color: tokens.color.text, textAlign: 'center' },
  email: { fontSize: tokens.font.body.size, fontWeight: '600', color: tokens.color.text, textAlign: 'center' },
  hint: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, textAlign: 'center', lineHeight: tokens.font.caption.lineHeight },
  button: { width: '100%', height: tokens.size.touchMin, backgroundColor: tokens.color.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#ffffff', fontSize: tokens.font.button.size, fontWeight: '500' },
  linkContainer: { marginTop: tokens.space.md },
  linkText: { fontSize: tokens.font.caption.size, color: tokens.color.primary, textAlign: 'center' },
});
