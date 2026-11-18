import React from 'react';
import { View } from 'react-native';
import { Modal } from '../../components/Modal';
import { messages } from '../../lib/messages';

type ReportSuccessProps = {
  route: string;
  onDismiss: () => void;
};

export default function ReportSuccess({ route, onDismiss }: ReportSuccessProps) {
  return (
    <View>
      <Modal
        title="Report success"
        text={messages.fares.reportSuccess(route)}
        buttons={[{ label: 'OK', onPress: onDismiss }]}
      />
    </View>
  );
}
