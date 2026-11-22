import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

  if (success) {
    return (
      <Modal
        icon="✓"
        title="Account deleted."
        text={messages.deleteAccount.success}
        buttons={[
          {
            label: 'OK',
            onPress: onDismiss,
            style: { backgroundColor: tokens.color.primary },
            textStyle: { color: '#ffffff' },
          },
        ]}
      >
        <Text style={styles.purgeNotice}>
          Your profile, saved taxi rank, weekly transport budget, and fare submission records have been permanently purged.
        </Text>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal
        title="Deleting..."
        text="Please wait..."
        buttons={[]}
      >
        <View style={styles.loadingWrapper}>
          <Spinner size="small" />
        </View>
      </Modal>
    );
  }

  if (offline) {
    return (
      <Modal
        icon="⚠"
        title="Delete account?"
        text="No connection. Try again when online."
        reverseButtons
        buttons={[
          {
            label: 'Cancel',
            onPress: onDismiss,
            style: styles.cancelButton,
            textStyle: styles.cancelButtonText,
          },
          {
            label: 'Delete',
            onPress: handleDelete,
            disabled: true,
            style: styles.disabledButton,
          },
        ]}
      />
    );
  }

  return (
    <Modal
      icon="⚠"
      title="Delete account?"
      text={messages.deleteAccount.confirm}
      reverseButtons
      buttons={[
        {
          label: 'Cancel',
          onPress: onDismiss,
          style: styles.cancelButton,
          textStyle: styles.cancelButtonText,
        },
        {
          label: error ? 'Retry' : 'Delete',
          onPress: handleDelete,
          style: styles.deleteButton,
          textStyle: styles.deleteButtonText,
        },
      ]}
    >
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Couldn&apos;t delete account. Try again.</Text>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    alignItems: 'center',
    paddingVertical: tokens.space.md,
  },
  purgeNotice: {
    fontSize: tokens.font.caption.size,
    lineHeight: 18,
    color: tokens.color.textSecondary,
    marginBottom: tokens.space.md,
  },
  errorBox: {
    backgroundColor: '#fce8e6',
    padding: tokens.space.sm,
    borderRadius: 8,
    marginBottom: tokens.space.md,
  },
  errorText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.error,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: tokens.color.error,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#bdc1c6',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderColor: tokens.color.border,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: tokens.color.text,
    fontWeight: '500',
  },
});
