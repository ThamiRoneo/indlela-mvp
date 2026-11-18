import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BannerProps = {
  variant?: 'alert' | 'info' | 'error' | 'success';
  children: React.ReactNode;
};

const variantColors: Record<string, string> = {
  alert: '#fbbc04',
  info: '#1a73e8',
  error: '#ea4335',
  success: '#34a853',
};

export const Banner = ({ variant = 'info', children }: BannerProps) => {
  return (
    <View style={[styles.banner, { backgroundColor: variantColors[variant] }]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { padding: 16, borderRadius: 8 },
  text: { color: '#ffffff', fontSize: 14 },
});
