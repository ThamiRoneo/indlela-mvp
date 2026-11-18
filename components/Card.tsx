import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  amount?: number;
  staleness?: string;
};

export const Card = ({ type = 'job', title, company, wage, transportCost, netGain, route, amount, staleness }: CardProps) => {
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
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{route}</Text>
      <Text style={styles.wage}>R{amount}</Text>
      {staleness && <Text style={styles.staleness}>{staleness}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: tokens.color.surface, padding: tokens.space.md, borderRadius: 8 },
  title: { fontSize: tokens.font.h3.size, fontWeight: '600' },
  company: { fontSize: tokens.font.body.size, color: tokens.color.textSecondary },
  wage: { fontSize: tokens.font.body.size, fontWeight: '600' },
  transport: { fontSize: tokens.font.caption.size, color: tokens.color.textSecondary },
  netGain: { fontSize: tokens.font.body.size, fontWeight: '600' },
  staleness: { fontSize: tokens.font.caption.size, color: tokens.color.warning },
});
