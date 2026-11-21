import React from 'react';
import { TextInput as RNTextInput, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
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

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <View style={styles.eyeIcon}>
      <View style={styles.eyeOuter}>
        <View style={styles.eyePupil} />
      </View>
      {!visible && <View style={styles.eyeSlash} />}
    </View>
  );
}

export const TextInput = ({ value, error, editable = true, secureTextEntry, onChangeText, onTogglePassword, placeholder, label, accessibilityLabel }: TextInputProps) => {
  const [showPassword, setShowPassword] = React.useState(!secureTextEntry);
  const isPassword = secureTextEntry && onTogglePassword;
  return (
    <>
      {label && <Text style={styles.label} accessibilityLabel={`${label} label`}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.error]}>
        <RNTextInput
          style={[styles.input]}
          value={value || ''}
          onChangeText={onChangeText}
          secureTextEntry={isPassword ? !showPassword : (secureTextEntry || false)}
          placeholder={placeholder}
          editable={editable}
          accessibilityLabel={accessibilityLabel || label || placeholder}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => { setShowPassword(!showPassword); onTogglePassword(); }} style={styles.passwordToggle}>
            <EyeIcon visible={showPassword} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: tokens.font.body.size, color: tokens.color.text, marginBottom: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderColor: '#dadce0', borderWidth: 1, borderRadius: 8, minHeight: tokens.size.touchMin, height: tokens.size.touchMin },
  input: { flex: 1, borderWidth: 0, padding: 12 },
  error: { borderColor: '#ea4335' },
  passwordToggle: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  eyeIcon: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  eyeOuter: { width: 22, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#5f6368', justifyContent: 'center', alignItems: 'center' },
  eyePupil: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#5f6368' },
  eyeSlash: { position: 'absolute', width: 26, height: 1.5, backgroundColor: '#5f6368', transform: [{ rotate: '-45deg' }] },
});