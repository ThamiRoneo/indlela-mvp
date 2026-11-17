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
  const [confirmed, setConfirmed] = useState(false);
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

  const handleConfirmDelete = () => setConfirmed(true);

  if (success) return (
    <Modal
      title="Account deleted"
      text={messages.deleteAccount.success}
      buttons={[{ label: 'OK', onPress: onDismiss }]}
    />
  );

  if (!confirmed) return (
    <Modal
      title="Delete account"
      text={messages.deleteAccount.confirm}
      buttons={[
        { label: 'Cancel', onPress: onDismiss },
        { label: 'Delete', onPress: handleConfirmDelete, style: { backgroundColor: tokens.color.error } },
      ]}
    />
  );

  return (
    <Modal
      title="Deleting..."
      text={loading ? 'Please wait...' : error || messages.deleteAccount.deleteError}
      buttons={loading ? [] : [{ label: 'Retry', onPress: handleDelete }]}
    >
      {loading && <Spinner size="small" />}
    </Modal>
  );
}
