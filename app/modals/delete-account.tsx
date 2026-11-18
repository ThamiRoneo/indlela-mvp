import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';
import { tokens } from '../../theme/tokens';
import { Modal } from '../../components/Modal';
import { Spinner } from '../../components/Spinner';

type DeleteAccountProps = {
  onDismiss: () => void;
};

export default function DeleteAccount({ onDismiss }: DeleteAccountProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDelete = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('delete-account', {});
      setLoading(false);
      if (fnError) {
        setError(messages.deleteAccount.deleteError);
        return;
      }
      setSuccess(true);
    } catch {
      setLoading(false);
      setError(messages.deleteAccount.deleteError);
    }
  }, []);

  if (success) return (
    <Modal
      title="Account deleted"
      text={messages.deleteAccount.success}
      buttons={[{ label: 'OK', onPress: onDismiss }]}
    />
  );

  if (loading) return (
    <Modal title="Deleting..." text="Please wait..." buttons={[]}>
      <Spinner size="small" />
    </Modal>
  );

  return (
    <Modal
      title="Delete account"
      text={error ? `${messages.deleteAccount.confirm}\n${error}` : messages.deleteAccount.confirm}
      buttons={[
        { label: 'Cancel', onPress: onDismiss },
        { label: error ? 'Retry' : 'Delete', onPress: handleDelete, style: error ? undefined : { backgroundColor: tokens.color.error } },
      ]}
    />
  );
}
