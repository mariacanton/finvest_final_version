import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import StockListItem from './StockListItem';

interface StockInfoProps {
  stock: {
    name: string;
    symbol: string;
    exchange: string;
    close: string;
    percent_change: string;
    open: string;
    high: string;
    low: string;
    volume: string;
    previous_close: string;
  };
}

export default function StockInfo({ stock }: StockInfoProps) {
  return (
    <View style={styles.container}>
      <StockListItem stock={stock} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Open</Text>
            <Text style={styles.value}>${Number.parseFloat(stock.open).toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>High</Text>
            <Text style={styles.value}>${Number.parseFloat(stock.high).toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Low</Text>
            <Text style={styles.value}>${Number.parseFloat(stock.low).toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Volume</Text>
            <Text style={styles.value}>{Number(stock.volume).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Previous Close</Text>
            <Text style={styles.value}>${Number.parseFloat(stock.previous_close).toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Exchange</Text>
            <Text style={styles.value}>{stock.exchange}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  detailsContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
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
}); 