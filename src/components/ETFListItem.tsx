import { Text, View } from './Themed';
import { StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export type ETF = {
  symbol: string;
  name: string;
};

export default function ETFListItem({ etf }: { etf: ETF }) {
  return (
    <Link href={`/etf/${etf.symbol}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.leftContainer}>
          <Text style={styles.symbol}>{etf.symbol}</Text>
          <Text style={styles.name}>{etf.name}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#c3dcc6',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#b3ccb6',
  },
  leftContainer: {
    flex: 1,
    gap: 5,
    backgroundColor: '#c3dcc6',
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#017560',
  },
  name: {
    color: 'gray',
    fontSize: 15,
  },
});
