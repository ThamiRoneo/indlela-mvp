import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CardProps = {
  type?: 'job' | 'fare';
  title?: string;
  company?: string;
  wage?: number;
  transportCost?: number;
  netGain?: number;
  route?: string;
  amount?: number;
  staleness?: string;
};

export const Card = ({ type = 'job', title, company, wage, transportCost, netGain, route, amount, staleness }: CardProps) => {
  if (type === 'job') {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.company}>{company}</Text>
        <Text style={styles.wage}>R{wage}</Text>
        <Text style={styles.transport}>Transport: R{transportCost}</Text>
        <Text style={styles.netGain}>Net Gain: R{netGain}</Text>
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
  card: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  company: { fontSize: 14, color: '#5f6368' },
  wage: { fontSize: 14, fontWeight: '600' },
  transport: { fontSize: 12, color: '#5f6368' },
  netGain: { fontSize: 14, fontWeight: '600' },
  staleness: { fontSize: 12, color: '#fbbc04' },
});
