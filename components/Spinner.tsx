import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

type SpinnerProps = {
  size?: 'small' | 'large';
};

export const Spinner = ({ size = 'small' }: SpinnerProps) => {
  return (
    <View style={styles.spinner}>
      <ActivityIndicator size={size} color="#1a73e8" />
    </View>
  );
};

const styles = StyleSheet.create({
  spinner: { padding: 16 },
});
