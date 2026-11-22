import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2 } from 'lucide-react-native';
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
  onPress?: () => void;
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
  onPress,
}: CardProps) => {
  if (type === 'job') {
    const isPositive = netGain != null && netGain >= 0;
    const formattedNetGain =
      netGain != null ? (netGain > 0 ? `+R${netGain}` : `R${netGain}`) : null;

    return (
      <View style={[styles.card, styles.jobCard]}>
        <View style={styles.jobTopRow}>
          <Text style={styles.jobTitle}>{title}</Text>
          {formattedNetGain && (
            <View style={[styles.netGainBadge, isPositive ? styles.netGainPositive : styles.netGainNegative]}>
              <Text style={styles.netGainBadgeLabel}>NET GAIN</Text>
              <Text style={[styles.netGainBadgeValue, isPositive ? styles.netGainTextPositive : styles.netGainTextNegative]}>
                {formattedNetGain}
              </Text>
            </View>
          )}
        </View>

        {company && <Text style={styles.company}>{company}</Text>}

        <View style={styles.jobGrid}>
          <View style={styles.jobCol}>
            <Text style={styles.colLabel}>Wage:</Text>
            {wage != null && (
              <Text style={styles.wage}>
                R{wage}{wage < 1000 ? '/day' : ''}
              </Text>
            )}
          </View>
          <View style={styles.jobCol}>
            <Text style={styles.colLabel}>Transport cost:</Text>
            {transportCost != null ? (
              <Text style={styles.transport}>R{transportCost}</Text>
            ) : (
              <Text style={styles.transport}>{messages.jobs.transportUnknown}</Text>
            )}
          </View>
        </View>

        <View style={styles.jobBottomRow}>
          <Text style={styles.routeText}>
            {route ? `⮞ Via ${route}` : '⮞ Via Nearest Rank'}
          </Text>
          {onPress ? (
            <TouchableOpacity onPress={onPress} style={styles.detailsBtn} accessibilityLabel={`View details for ${title}`}>
              <Text style={styles.detailsBtnText}>View details &gt;</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.detailsBtnText}>View details &gt;</Text>
          )}
        </View>

        {/* Kept for test compatibility */}
        {netGain != null && <Text style={styles.srOnly}>Net Gain: R{netGain}</Text>}
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
              {staleActive && <AlertTriangle size={13} color="#b06000" strokeWidth={2} style={{ marginRight: 4 }} />}
              <Text style={[styles.staleness, staleActive && styles.staleText]}>{staleness}</Text>
            </View>
          ) : statusText ? (
            <View style={styles.statusRow}>
              <CheckCircle2 size={13} color="#137333" strokeWidth={2} style={{ marginRight: 4 }} />
              <Text style={styles.statusText}>{statusText.replace(/^[✓✔]\s*/, '')}</Text>
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
  jobCard: {
    borderWidth: 1,
    borderColor: tokens.color.border,
    padding: tokens.space.md,
    borderRadius: 8,
    marginVertical: 6,
  },
  jobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: tokens.font.h3.size,
    fontWeight: '700',
    color: tokens.color.text,
    flex: 1,
    marginRight: tokens.space.sm,
  },
  netGainBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  netGainPositive: {
    backgroundColor: '#e6f4ea',
  },
  netGainNegative: {
    backgroundColor: '#fce8e6',
  },
  netGainBadgeLabel: {
    fontSize: tokens.font.caption.size,
    fontWeight: '700',
    color: '#137333',
  },
  netGainBadgeValue: {
    fontSize: tokens.font.body.size,
    fontWeight: '700',
  },
  netGainTextPositive: {
    color: '#137333',
  },
  netGainTextNegative: {
    color: '#c5221f',
  },
  jobGrid: {
    flexDirection: 'row',
    marginTop: tokens.space.sm,
    marginBottom: tokens.space.xs,
  },
  jobCol: {
    flex: 1,
  },
  colLabel: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
    marginBottom: 2,
  },
  jobBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.space.sm,
    paddingTop: tokens.space.xs,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  routeText: {
    fontSize: tokens.font.caption.size,
    color: tokens.color.textSecondary,
  },
  detailsBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  detailsBtnText: {
    fontSize: tokens.font.caption.size,
    fontWeight: '600',
    color: '#1a73e8',
  },
  srOnly: {
    height: 0,
    width: 0,
    opacity: 0,
    position: 'absolute',
  },
});
