import React from 'react';
import { TouchableOpacity, ActivityIndicator, Text, StyleSheet } from 'react-native';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
};

const wrapChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return <Text>{child}</Text>;
    }
    return child;
  });
};

export const Button = ({ variant = 'primary', disabled = false, loading = false, onPress, children }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled]}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator size="small" color="#fff" /> : wrapChildren(children)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#1a73e8' },
  secondary: { backgroundColor: '#34a853' },
  text: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5, backgroundColor: '#bdc1c6' },
});
