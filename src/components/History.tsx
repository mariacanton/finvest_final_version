import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface HistoryItem {
  amount: number;
  description: string;
  date: string;
}

interface HistoryProps {
  items: HistoryItem[];
}

export const History: React.FC<HistoryProps> = ({ items }) => {
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <View style={styles.section}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <View style={styles.historyItem}>
            <View>
              <Text style={styles.historyAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.historyDescription}>{item.description}</Text>
            </View>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
          {index < items.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    paddingTop: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDescription: {
    fontSize: 14,
    color: '#666',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
}); 