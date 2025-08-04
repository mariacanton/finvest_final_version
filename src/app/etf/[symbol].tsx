import { View, Text } from '../../components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import etfsData from '../../../assets/data/etfs.json';
import { StyleSheet, ScrollView } from 'react-native';

export default function EtfDetails() {
  const { symbol } = useLocalSearchParams();
  const symbolString = Array.isArray(symbol) ? symbol[0] : symbol;
  const etf = etfsData[symbolString];

  if (!etf) {
    return <Text>ETF with symbol {symbolString} could not be found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: symbolString, headerBackTitle: 'ETFs' }} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{etf.name}</Text>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Price</Text>
            <Text style={styles.value}>${Number(etf.price).toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Change</Text>
            <Text style={[styles.value, { color: Number(etf.percent_change) > 0 ? 'green' : 'red' }]}>
              {Number(etf.percent_change) > 0 ? '+' : ''}{etf.percent_change}%
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{etf.category}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Market Cap</Text>
            <Text style={styles.value}>{etf.market_cap}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Volume</Text>
            <Text style={styles.value}>{etf.volume.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Expense Ratio</Text>
            <Text style={styles.value}>{etf.expense_ratio}%</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Yield</Text>
            <Text style={styles.value}>{etf.yield}%</Text>
          </View>
        </View>
        <View style={styles.holdingsContainer}>
          <Text style={styles.label}>Top Holdings</Text>
          {etf.holdings.map((holding: string, idx: number) => (
            <Text key={idx} style={styles.holdingItem}>• {holding}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  detailsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#c3dcc6',
    marginHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#017560',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  holdingsContainer: {
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  holdingItem: {
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
  },
});
