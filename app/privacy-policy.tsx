import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';
import { TopAppBar } from '../components/TopAppBar';

type PrivacyPolicyProps = {
  navigation?: { navigate: (screen: string) => void; goBack?: () => void };
};

export default function PrivacyPolicy({ navigation }: PrivacyPolicyProps = {}) {
  const handleBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    } else {
      navigation?.navigate('(auth)/sign-up');
    }
  };

  return (
    <View style={styles.container}>
      <TopAppBar
        title="Privacy Policy"
        onBack={handleBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Indlela Privacy & Data Protection</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>@ OFFICIAL TERMS • F1 COMPLIANCE</Text>

          <Text style={styles.summaryText}>
            Indlela collects your email, nearest rank, weekly transport budget, and fare reports to provide
            affordable job matching. Your data is stored securely and you can delete your account at any time
            from Profile & Settings.
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletTitle}>Email & Rank: </Text>
                Used strictly for route calculation and commute matching.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletTitle}>Budget & Fares: </Text>
                Powers your net gain calculations and taxi fare alerts.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bulletTitle}>User Control: </Text>
                Permanent account deletion available anytime in Profile & Settings.
              </Text>
            </View>
          </View>

          <View style={styles.securityBox}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.securityText}>
              We never sell your commute data or personal information to third-party brokers.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.color.background,
  },
  scrollContent: {
    padding: tokens.space.md,
    paddingBottom: tokens.space.xl,
  },
  badgeContainer: {
    marginBottom: tokens.space.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    borderColor: '#d2e3fc',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: tokens.color.background,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: tokens.space.lg,
    marginBottom: tokens.space.lg,
  },
  cardHeader: {
    fontSize: tokens.font.caption.size,
    fontWeight: '700',
    color: tokens.color.primary,
    letterSpacing: 0.5,
    marginBottom: tokens.space.md,
  },
  summaryText: {
    fontSize: tokens.font.body.size,
    lineHeight: 22,
    color: tokens.color.text,
    marginBottom: tokens.space.lg,
  },
  bulletList: {
    gap: tokens.space.md,
    marginBottom: tokens.space.lg,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: tokens.space.sm,
  },
  checkIcon: {
    fontSize: 14,
    color: '#137333',
    fontWeight: '700',
    marginTop: 2,
  },
  bulletText: {
    fontSize: tokens.font.body.size,
    lineHeight: 20,
    color: tokens.color.text,
    flex: 1,
  },
  bulletTitle: {
    fontWeight: '600',
    color: tokens.color.text,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderColor: '#dadce0',
    borderWidth: 1,
    borderRadius: 8,
    padding: tokens.space.md,
    gap: tokens.space.sm,
  },
  lockIcon: {
    fontSize: 16,
  },
  securityText: {
    fontSize: tokens.font.caption.size,
    lineHeight: 18,
    color: tokens.color.textSecondary,
    flex: 1,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.space.md,
    minHeight: tokens.size.touchMin,
  },
  backButtonText: {
    fontSize: tokens.font.body.size,
    color: tokens.color.primary,
    fontWeight: '500',
  },
});
