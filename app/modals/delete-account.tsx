import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
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
  const [offline, setOffline] = useState(false);

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

  useEffect(() => {
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setOffline(!state.isConnected);
    };
    checkConnection();
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

  if (offline) return (
    <Modal
      title="Delete account"
      text="No connection. Try again when online."
      buttons={[
        { label: 'Cancel', onPress: onDismiss },
        { label: 'Delete', onPress: handleDelete, disabled: true },
      ]}
    />
  );

  return (
    <Modal
      title="Delete account"
      text={error ? `${messages.deleteAccount.confirm}\n${error}` : messages.deleteAccount.confirm}
      buttons={[
        { label: 'Cancel', onPress: onDismiss },
        { label: error ? 'Retry' : 'Delete', onPress: handleDelete, disabled: offline, style: offline ? undefined : { backgroundColor: tokens.color.error } },
      ]}
    />
  );
}
