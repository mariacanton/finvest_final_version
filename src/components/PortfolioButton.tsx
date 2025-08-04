import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Link } from 'expo-router';

interface PortfolioButtonProps {
  totalAssets: number;
  onInvestPress: () => void;
}

export const PortfolioButton: React.FC<PortfolioButtonProps> = ({ totalAssets, onInvestPress }) => {
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <Link href="/portfolio" asChild>
      <TouchableOpacity 
        style={styles.assetCard}
        activeOpacity={0.9}
      >
        <Text style={styles.assetLabel}>Your total asset portfolio</Text>
        <View style={styles.assetRow}>
          <Text style={styles.assetAmount}>{formatCurrency(totalAssets)}</Text>
          <TouchableOpacity 
            style={styles.investButton}
            onPress={onInvestPress}
            activeOpacity={0.7}
          >
            <Text style={styles.investButtonText}>Invest now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  assetCard: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  assetLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  investButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  investButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
}); 