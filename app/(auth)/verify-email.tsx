import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { tokens } from '../../theme/tokens';
import { TopAppBar } from '../../components/TopAppBar';
import { Button } from '../../components/Button';

type VerifyEmailProps = {
  email: string;
  navigation?: { navigate: (screen: string) => void };
};

export default function VerifyEmail({ email, navigation }: VerifyEmailProps) {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleOpenEmailApp = () => {
    navigation?.navigate('(auth)/log-in');
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setResendStatus(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        setResendStatus('Could not resend email. Please try again.');
      } else {
        setResendStatus('Verification email resent.');
      }
    } catch {
      setResendStatus('Could not resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TopAppBar
        title="Verify Email"
        onBack={() => navigation?.navigate('(auth)/sign-up')}
      />

      <View style={styles.successBanner}>
        <Text style={styles.successBannerIcon}>✓</Text>
        <Text style={styles.successBannerText}>Account created. Please verify your email.</Text>
      </View>

      <View style={styles.centerHero}>
        <View style={styles.mailIconCircle}>
          <Text style={styles.mailIcon}>✉</Text>
        </View>

        <Text style={styles.heading}>Check your inbox</Text>

        <Text style={styles.description}>
          We sent a verification link to{'\n'}
          <Text style={styles.emailText}>{email}</Text>.{'\n'}
          Click the link in the message to activate your Indlela account.
        </Text>

        {resendStatus && (
          <Text style={styles.resendStatusText}>{resendStatus}</Text>
        )}
      </View>

      <View style={styles.bottomActions}>
        <Button
          variant="primary"
          onPress={handleOpenEmailApp}
        >
          Open email app
        </Button>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          style={styles.resendButton}
          accessibilityRole="button"
        >
          <Text style={styles.resendButtonText}>
            {resending ? 'Sending...' : 'Resend verification email'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.background,
    paddingHorizontal: tokens.space.md,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.xl,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    borderColor: '#ceead6',
    borderWidth: 1,
    borderRadius: 8,
    padding: tokens.space.md,
    marginVertical: tokens.space.md,
    gap: tokens.space.sm,
  },
  successBannerIcon: {
    color: '#137333',
    fontSize: 16,
    fontWeight: '700',
  },
  successBannerText: {
    color: '#137333',
    fontSize: tokens.font.body.size,
    fontWeight: '500',
    flex: 1,
  },
  centerHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.space.md,
  },
  mailIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.lg,
  },
  mailIcon: {
    fontSize: 32,
    color: '#137333',
  },
  heading: {
    fontSize: tokens.font.h1.size,
    lineHeight: tokens.font.h1.lineHeight,
    fontWeight: '700',
    color: tokens.color.text,
    marginBottom: tokens.space.md,
    textAlign: 'center',
  },
  description: {
    fontSize: tokens.font.body.size,
    lineHeight: 22,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '600',
    color: tokens.color.text,
  },
  resendStatusText: {
    marginTop: tokens.space.md,
    fontSize: tokens.font.caption.size,
    color: tokens.color.primary,
    textAlign: 'center',
  },
  bottomActions: {
    width: '100%',
    gap: tokens.space.sm,
    paddingBottom: tokens.space.sm,
  },
  resendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tokens.size.touchMin,
  },
  resendButtonText: {
    fontSize: tokens.font.body.size,
    color: tokens.color.primary,
    fontWeight: '500',
  },
});
