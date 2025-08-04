import { StyleSheet, FlatList, ScrollView, Pressable, View as RNView } from 'react-native';
import { Text, View } from '../../components/Themed';
import { Stack } from 'expo-router';
import StockListItem from '../../components/StockListItem';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';
import stocksData from '../../../assets/data/stocks.json';
import etfsData from '../../../assets/data/etfs.json';
import { useAuth } from '../../contexts/authContext';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useQuery, gql } from '@apollo/client';

interface Quote {
  value: {
    name: string;
    symbol: string;
    percent_change: string;
    close: string;
  }
}

interface QueryResponse {
  quotes: Quote[];
}

const query = gql`
  query MyQuery($symbol: String) {
    quotes(symbol: $symbol) {
      value {
        name
        symbol
        percent_change
        close
      }
    }
  }
`;

export default function TabOneScreen() {
  const { user } = useAuth();
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>([]);
  const { data, loading, error } = useQuery<QueryResponse>(query, {
    variables: { symbol: 'AAPL,IBM,META,NVDA,TSLA,AMD' },
  });


  if (error) {
    return <Text>Failed to fetch stocks</Text>;
  }

  if (!data) {
    return <Text>Loading...</Text>;
  }

  const stocks = data.quotes.map((q) => q.value);
    // Sort stocks by close price in descending order
  const sortedStocks = [...stocks].sort((a, b) => 
    Number.parseFloat(b.close) - Number.parseFloat(a.close)
  );

  // Get top 3 stocks
  const hotStocks = sortedStocks.slice(0, 3);

  // Get favourite stocks from Firebase
  useEffect(() => {
    if (!user?.uid) return;

    // Set up real-time listener for favorites
    const unsubscribe = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
      const userData = doc.data();
      setFavoriteSymbols(userData?.favoriteStocks || []);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  // Filter stocks and ETFs to get favorites (all normalized)
  const favouriteStocks = [
    ...stocks.filter((stock) => favoriteSymbols.includes(stock.symbol)).map(s => ({ ...s, _type: 'stock' })),
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Stocks' }} />
      
      <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
        {/* Hot Stocks Section */}
        <View style={styles.hotStocksSection}>
          <Text style={styles.sectionTitle}>Hot Stocks</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotStocksContainer}
          >
            {hotStocks.map((stock) => (
              <Link href={`/stocks/${stock.symbol}`} asChild key={stock.symbol}>
                <Pressable>
                  <RNView style={[styles.hotStockCard, { marginRight: 16 }]}>
                    <Text style={styles.hotStockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.hotStockPrice}>
                      ${Number.parseFloat(stock.close).toFixed(1)}
                    </Text>
                    <Text style={[
                      styles.hotStockChange,
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

        {/* My Favourites Section */}
        <View style={styles.favouriteStocksSection}>
          <Text style={styles.sectionTitle}>My Favourites</Text>
          {favouriteStocks.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotStocksContainer}
            >
              {favouriteStocks.map((item) => (
                item._type === 'stock' ? (
                  <Link href={`/stocks/${item.symbol}`} asChild key={item.symbol}>
                    <Pressable>
                      <RNView style={[styles.hotStockCard, { marginRight: 16 }]}> 
                        <Text style={styles.hotStockSymbol}>{item.symbol}</Text>
                        <Text style={styles.hotStockPrice}>
                          ${Number.parseFloat(item.close).toFixed(1)}
                        </Text>
                        <Text style={[
                          styles.hotStockChange,
                          { color: Number.parseFloat(item.percent_change) > 0 ? 'green' : 'red' }
                        ]}>
                          {Number.parseFloat(item.percent_change) > 0 ? '+' : ''}
                          {Number.parseFloat(item.percent_change).toFixed(1)}%
                        </Text>
                      </RNView>
                    </Pressable>
                  </Link>
                ) : (
                  <Link href={`/etf/${item.symbol}`} asChild key={item.symbol}>
                    <Pressable>
                      <RNView style={[styles.hotStockCard, { marginRight: 16 }]}> 
                        <Text style={styles.hotStockSymbol}>{item.symbol}</Text>
                        <Text style={styles.hotStockPrice}>
                          ${Number.parseFloat(item.close).toFixed(1)}
                        </Text>
                        <Text style={[
                          styles.hotStockChange,
                          { color: Number.parseFloat(item.percent_change) > 0 ? 'green' : 'red' }
                        ]}>
                          {Number.parseFloat(item.percent_change) > 0 ? '+' : ''}
                          {Number.parseFloat(item.percent_change).toFixed(1)}%
                        </Text>
                      </RNView>
                    </Pressable>
                  </Link>
                )
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyFavorites}>No favourites yet. Click the star icon on any stock or crypto to add it to your favourites.</Text>
          )}
        </View>

        {/* All Stocks Section */}
        <View style={styles.allStocksSection}>
          <Text style={styles.sectionTitle}>All Stocks</Text>
          <View style={{ height: 340, backgroundColor: '#c3dcc6' }}>
            <FlatList
              data={stocks}
              renderItem={({ item }) => <StockListItem stock={item} />}
              contentContainerStyle={{ gap: 20, padding: 10, backgroundColor: '#c3dcc6' }}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#A3C9A8',
  },
  
  hotStocksSection: {
    padding: 16,
    backgroundColor: '#c3dcc6',
    marginHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  
  favouriteStocksSection: {
    padding: 16,
    backgroundColor: '#c3dcc6',
    marginHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  
  allStocksSection: {
    padding: 16,
    backgroundColor: '#c3dcc6',
    marginHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    backgroundColor: '#c3dcc6',
  },
  hotStocksContainer: {
    paddingHorizontal: 4,
    backgroundColor: '#c3dcc6',
  },
  hotStockCard: {
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 16,
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
    shadowRadius: 3,
    elevation: 3,
  },
  hotStockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 8,
    textAlign: 'center',
  },
  hotStockPrice: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  hotStockChange: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyFavorites: {
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});
