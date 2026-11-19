import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from '../../components/Modal';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';

type ReportSuccessProps = {
  route: string;
  onDismiss: () => void;
};

export default function ReportSuccess({ route, onDismiss }: ReportSuccessProps) {
  return (
    <View>
      <Modal
        title="Report received"
        text={messages.fares.reportSuccess(route)}
        buttons={[{ label: 'OK', onPress: onDismiss }]}
      >
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkBadge}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  checkmarkContainer: { marginVertical: 12, alignItems: 'center' },
  checkmarkBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 24, color: tokens.color.success, fontWeight: '700' },
});
