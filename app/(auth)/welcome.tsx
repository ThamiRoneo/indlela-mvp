import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '../../theme/tokens';

export default function Welcome() {
  return (
    <View style={[styles.container, { backgroundColor: tokens.color.background }]}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Indlela</Text>
      </View>
      <Text style={styles.pitch}>
        Find jobs you can afford to reach. Track minibus taxi fares from your rank.
      </Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: tokens.color.primary }]}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.outlineButton]}>
        <Text style={styles.outlineButtonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: tokens.space.xl, flex: 1 },
  logoContainer: { alignItems: 'center', marginTop: tokens.space.xl },
  logoText: { fontSize: tokens.font.h1.size, fontWeight: '700', color: tokens.color.text },
  pitch: {
    fontSize: tokens.font.body.size,
    lineHeight: tokens.font.body.lineHeight,
    textAlign: 'center',
    color: tokens.color.text,
    marginVertical: tokens.space.lg,
  },
  button: {
    padding: tokens.space.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: tokens.space.sm,
  },
  buttonText: { color: '#ffffff', fontSize: tokens.font.button.size, fontWeight: '500' },
  outlineButton: {
    padding: tokens.space.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.color.border,
    alignItems: 'center',
  },
  outlineButtonText: { color: tokens.color.primary, fontSize: tokens.font.button.size, fontWeight: '500' },
});
