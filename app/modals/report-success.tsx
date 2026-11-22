import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { Modal } from '../../components/Modal';
import { messages } from '../../lib/messages';

type ReportSuccessProps = {
  route: string;
  onDismiss: () => void;
};

export default function ReportSuccess({ route, onDismiss }: ReportSuccessProps) {
  return (
    <View style={styles.overlay}>
      <Modal
        title="Report received"
        text={messages.fares.reportSuccess(route)}
        buttons={[{ label: 'OK', onPress: onDismiss }]}
      >
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkBadge}>
            <CheckCircle2 size={32} color="#137333" strokeWidth={2.5} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  checkmarkContainer: { marginVertical: 12, alignItems: 'center' },
  checkmarkBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 28, color: '#34a853', fontWeight: '700' },
});
