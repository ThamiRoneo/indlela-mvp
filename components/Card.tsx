import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { messages } from '../lib/messages';
import { tokens } from '../theme/tokens';

type CardProps = {
  type?: 'job' | 'fare';
  title?: string;
  company?: string;
  wage?: number | null;
  transportCost?: number | null;
  netGain?: number | null;
  route?: string;
  origin?: string;
  amount?: number;
  perSeat?: boolean;
  staleness?: string;
  isStale?: boolean;
  statusText?: string;
  onVerify?: () => void;
};

export const Card = ({
  type = 'job',
  title,
  company,
  wage,
  transportCost,
  netGain,
  route,
  origin,
  amount,
  perSeat,
  staleness,
  isStale,
  statusText,
  onVerify,
}: CardProps) => {
  if (type === 'job') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {company && <Text style={styles.company}>{company}</Text>}
        {wage != null && <Text style={styles.wage}>R{wage}</Text>}
        {transportCost != null ? (
          <Text style={styles.transport}>Transport: R{transportCost}</Text>
        ) : (
          <Text style={styles.transport}>{messages.jobs.transportUnknown}</Text>
        )}
        {netGain != null && <Text style={styles.netGain}>Net Gain: R{netGain}</Text>}
      </View>
    );
  }

  const staleActive = isStale || (staleness && staleness.toLowerCase().includes('stale'));
  const displayRoute = origin && route ? `${origin} → ${route}` : route;

  return (
    <View style={[styles.card, styles.fareCard, staleActive && styles.staleCard]}>
      <View style={styles.fareHeader}>
        <View style={styles.fareRouteWrap}>
          <Text style={styles.fareRoute}>{displayRoute}</Text>
          {staleness ? (
            <View style={styles.statusRow}>
              {staleActive && <Text style={styles.staleIcon}>⚠ </Text>}
              <Text style={[styles.staleness, staleActive && styles.staleText]}>{staleness}</Text>
            </View>
          ) : statusText ? (
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.fareAmountWrap}>
          <Text style={styles.fareAmount}>R{amount}</Text>
          {perSeat && <Text style={styles.farePerSeat}>per seat</Text>}
          {staleActive && onVerify && (
            <TouchableOpacity onPress={onVerify} style={styles.verifyButton} accessibilityLabel="Verify fare">
              <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.color.surface,
    padding: tokens.space.md,
    borderRadius: 8,
    marginVertical: 4,
  },
  fareCard: {
    borderWidth: 1,
    borderColor: tokens.color.border,
  },
  staleCard: {
    backgroundColor: '#fffdf5',
    borderColor: '#f9ab00',
  },
  title: { fontSize: tokens.font.h3.size, fontWeight: '600' },
  company: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary },
  wage: { fontSize: tokens.font.body.size, fontWeight: '600' },
  transport: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  netGain: { fontSize: tokens.font.body.size, fontWeight: '600' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  staleIcon: { fontSize: 12, color: '#b06000' },
  staleness: { fontSize: tokens.font.caption.size, color: tokens.color.warning },
  staleText: { color: '#b06000', fontWeight: '500' },
  statusText: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  fareHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fareRouteWrap: { flex: 1, marginRight: tokens.space.sm },
  fareRoute: { fontSize: tokens.font.body.size, fontWeight: '600', color: tokens.color.text },
  fareAmountWrap: { alignItems: 'flex-end' },
  fareAmount: { fontSize: tokens.font.body.size, fontWeight: '700', color: tokens.color.text },
  farePerSeat: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary, marginTop: 2 },
  verifyButton: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f9ab00',
    backgroundColor: '#fff',
  },
  verifyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b06000',
  },
});
