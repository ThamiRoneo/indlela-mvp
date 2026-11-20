import React from 'react';
import { TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { tokens } from '../theme/tokens';

type TextInputProps = {
  value?: string;
  error?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  onTogglePassword?: () => void;
  placeholder?: string;
  label?: string;
  accessibilityLabel?: string;
};

export const TextInput = ({ value, error, editable = true, secureTextEntry, onChangeText, onTogglePassword, placeholder, label, accessibilityLabel }: TextInputProps) => {
  const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
  return (
    <>
      {label && <Text style={styles.label} accessibilityLabel={`${label} label`}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.error]}
        value={value || ''}
        onChangeText={onChangeText}
        secureTextEntry={showPassword ? false : secureTextEntry || false}
        placeholder={placeholder}
        editable={editable}
        accessibilityLabel={accessibilityLabel || label || placeholder}
      />
    </>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: tokens.font.body.size, color: tokens.color.text, marginBottom: tokens.space.xs },
  input: { minHeight: tokens.size.touchMin, height: tokens.size.touchMin, borderColor: '#dadce0', borderWidth: 1, borderRadius: 8, padding: 12 },
  error: { borderColor: '#ea4335' },
});
