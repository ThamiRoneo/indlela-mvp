import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';
import { TopAppBar } from '../components/TopAppBar';

const POLICY_CONTENT = `# Privacy Policy

Indlela helps unemployed youth in Rustenburg, North West find affordable job opportunities.

Data we collect: your email address, nearest taxi rank, and weekly transport budget. This is stored to show you jobs you can afford to reach and to let you report taxi fares.

Your email is never shared with other users. You can delete your account and all your data at any time from Profile & Settings.

You must be 18 or older to create an account.`;

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <TopAppBar title="Privacy Policy" />
      <View style={styles.scrollContent}>
        <Text style={styles.policyText}>{POLICY_CONTENT}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: tokens.color.background },
  scrollContent: { padding: tokens.space.xl },
  policyText: { fontSize: tokens.font.body.size, lineHeight: tokens.font.body.lineHeight, color: tokens.color.text },
});
