import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

function LogoMark({ large = false }: { large?: boolean }) {
  return (
    <View style={[styles.logoMark, large ? styles.logoMarkLarge : styles.logoMarkSmall]}>
      <View style={[styles.logoDot, large ? styles.logoDotLarge : styles.logoDotSmall]} />
      <View style={[styles.logoStem, large ? styles.logoStemLarge : styles.logoStemSmall]} />
    </View>
  );
}

export default function Welcome() {
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
        <TouchableOpacity style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton} accessibilityRole="button">
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
    paddingHorizontal: tokens.space.xl,
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
  // Mark geometry follows Stitch S1. No right margin: the dot-and-stem mark is
  // the "i", so it sits flush against "ndlela" to read as one word.
  logoMarkSmall: { marginRight: 0 },
  logoMarkLarge: { marginRight: 0 },
  logoDot: {
    backgroundColor: tokens.color.primary,
  },
  logoDotSmall: { width: 5, height: 5, borderRadius: 2.5 },
  logoDotLarge: { width: 6, height: 6, borderRadius: 3 },
  logoStem: {
    width: 2,
    backgroundColor: tokens.color.primary,
    borderRadius: 1,
  },
  logoStemSmall: { height: 20, marginTop: 2 },
  logoStemLarge: { height: 35, marginTop: 1 },
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
    marginBottom: tokens.space.md,
  },
  middleLogoText: {
    fontSize: tokens.font.h1.size,
    lineHeight: tokens.font.h1.lineHeight,
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
    paddingBottom: tokens.space.lg,
  },
  button: {
    backgroundColor: tokens.color.primary,
    minHeight: tokens.size.touchMin,
    paddingVertical: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.sm,
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
    borderRadius: 24,
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
