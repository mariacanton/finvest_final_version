import { View, Text } from '../../components/Themed';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, Pressable, View as RNView } from 'react-native';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';
import { ActivityIndicator } from 'react-native';

const query = gql`
  query MyQuery($symbol: String) {
    quotes(symbol: $symbol) {
      value {
        name
        symbol
        exchange
        percent_change
        close
      }
    }
  }
`;

interface Stock {
  name: string;
  symbol: string;
  exchange: string;
  percent_change: string;
  close: string;
}

export default function PortfolioScreen() {
  const { data, loading, error } = useQuery(query, {
    variables: { symbol: 'IBM,TSLA' },
  });

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Failed to fetch stocks</Text>;
  }

  const stocks = data.quotes.map((q: { value: Stock }) => q.value);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Portfolio', headerBackTitle: 'Back' }} />
      <ScrollView>
        {/* Your Stocks Section */}
        <View style={styles.yourStocksSection}>
          <Text style={styles.sectionTitle}>Your Stocks</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stocksContainer}
          >
            {stocks.map((stock: Stock) => (
              <Link href={`/(portfolio)/${stock.symbol}`} asChild key={stock.symbol}>
                <Pressable>
                  <RNView style={[styles.stockCard, { marginRight: 16 }]}>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockPrice}>
                      ${Number.parseFloat(stock.close).toFixed(1)}
                    </Text>
                    <Text style={[
                      styles.stockChange,
                      { color: Number.parseFloat(stock.percent_change) > 0 ? 'green' : 'red' }
                    ]}>
                      {Number.parseFloat(stock.percent_change) > 0 ? '+' : ''}
                      {Number.parseFloat(stock.percent_change).toFixed(1)}%
                    </Text>
                  </RNView>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  yourStocksSection: {
    padding: 16,
    backgroundColor: '#c3dcc6',
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  stocksContainer: {
    paddingHorizontal: 4,
  },
  stockCard: {
    backgroundColor: '#c3dcc6',
    padding: 16,
    borderRadius: 20,
    width: 105,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 8,
    textAlign: 'center',
  },
  stockPrice: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  stockChange: {
    fontSize: 13,
    textAlign: 'center',
  },
});
