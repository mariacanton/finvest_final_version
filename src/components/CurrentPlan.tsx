import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';

interface CurrentPlanProps {
  onSeeAllPress: () => void;
}

export const CurrentPlan: React.FC<CurrentPlanProps> = ({ onSeeAllPress }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Current Plan</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllButton}>See All →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Gold</Text>
        <Text style={styles.planReturn}>30% return</Text>
        <View style={styles.planIcon}>
          <Text style={styles.planIconText}>$</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllButton: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 16,
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  planReturn: {
    fontSize: 16,
    color: '#000',
    opacity: 0.8,
  },
  planIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIconText: {
    fontSize: 40,
    color: 'rgba(0,0,0,0.2)',
    fontWeight: 'bold',
  },
}); 