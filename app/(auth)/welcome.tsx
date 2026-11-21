import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

type WelcomeProps = {
  navigation?: { navigate: (screen: string) => void };
};

function LogoMark({ large = false }: { large?: boolean }) {
  return (
    <View style={[styles.logoMark, large ? styles.logoMarkLarge : styles.logoMarkSmall]}>
      <View style={[styles.logoDot, large ? styles.logoDotLarge : styles.logoDotSmall]} />
      <View style={[styles.logoStem, large ? styles.logoStemLarge : styles.logoStemSmall]} />
    </View>
  );
}

export default function Welcome({ navigation }: WelcomeProps = {}) {
  const handleSignUp = () => {
    if (navigation?.navigate) {
      navigation.navigate('(auth)/sign-up');
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { router } = require('expo-router');
        router?.push?.('/(auth)/sign-up');
      } catch {}
    }
  };

  const handleLogIn = () => {
    if (navigation?.navigate) {
      navigation.navigate('(auth)/log-in');
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { router } = require('expo-router');
        router?.push?.('/(auth)/log-in');
      } catch {}
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topLogoContainer}>
        <LogoMark />
        {/* The blue dot-and-stem mark is the "i": the design word is "ndlela". */}
        <Text style={styles.topLogoText}>ndlela</Text>
      </View>

      <View style={styles.centerContent}>
        <View style={styles.middleLogoContainer}>
          <LogoMark large />
          <Text style={styles.middleLogoText}>ndlela</Text>
        </View>
        <Text style={styles.pitch}>
          Find jobs you can afford to reach. Track{'\n'}minibus taxi fares from your rank.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Sign up"
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineButton}
          accessibilityRole="button"
          accessibilityLabel="Log in"
          onPress={handleLogIn}
        >
          <Text style={styles.outlineButtonText}>Log in</Text>
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
    paddingTop: tokens.space.xl,
    paddingBottom: tokens.space.xl,
  },
  topLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.space.lg,
  },
  logoMark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkSmall: {
    marginRight: 6,
  },
  logoMarkLarge: {
    marginRight: 9,
  },
  logoDot: {
    backgroundColor: tokens.color.primary,
  },
  logoDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  logoDotLarge: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  logoStem: {
    width: 3.5,
    backgroundColor: tokens.color.primary,
    borderRadius: 1.75,
  },
  logoStemSmall: {
    height: 21,
    marginTop: 0,
  },
  logoStemLarge: {
    height: 36,
    marginTop: 0,
  },
  topLogoText: {
    fontSize: tokens.font.h2.size,
    lineHeight: tokens.font.h2.lineHeight,
    fontWeight: '600',
    color: tokens.color.text,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: tokens.space.md,
  },
  middleLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  middleLogoText: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    color: tokens.color.text,
  },
  pitch: {
    fontSize: tokens.font.body.size,
    lineHeight: tokens.font.body.lineHeight,
    textAlign: 'center',
    color: tokens.color.text,
  },
  actions: {
    width: '100%',
  },
  button: {
    backgroundColor: tokens.color.primary,
    minHeight: tokens.size.touchMin,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: tokens.color.background,
    fontSize: tokens.font.button.size,
    lineHeight: tokens.font.button.lineHeight,
    fontWeight: '500',
  },
  outlineButton: {
    minHeight: tokens.size.touchMin,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.color.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.background,
  },
  outlineButtonText: {
    color: tokens.color.primary,
    fontSize: tokens.font.button.size,
    lineHeight: tokens.font.button.lineHeight,
    fontWeight: '500',
  },
});
