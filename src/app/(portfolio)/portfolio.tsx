import { View, Text } from '../../components/Themed';
import { Stack } from 'expo-router';
import { StyleSheet, ScrollView, Pressable, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/authContext';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import Colors from '../../constants/Colors';
import StockListItem from '../../components/StockListItem';
import { Link } from 'expo-router';
import SellModal from '../../components/SellModal';
import { useQuery, gql } from '@apollo/client';

const GET_STOCK_PRICES = gql`
  query GetStockPrices($symbols: String!) {
    quotes(symbol: $symbols) {
      value {
        symbol
        name
        close
        percent_change
      }
    }
  }
`;

interface PurchasedStock {
  symbol: string;
  amount: number;
  shares: number;
  price: number;
  date: string;
  type: 'purchase' | 'sell';
}

interface AggregatedStock {
  symbol: string;
  totalAmount: number;
  totalShares: number;
}

interface QueryResponse {
  quotes: {
    value: {
      symbol: string;
      name: string;
      close: string;
      percent_change: string;
    };
  }[];
}

export default function PortfolioScreen() {
  const { user, updateUserData } = useAuth();
  const [purchasedStocks, setPurchasedStocks] = useState<PurchasedStock[]>([]);
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Get all unique stock symbols from purchased stocks
  const uniqueSymbols = [...new Set(purchasedStocks.map(stock => stock.symbol))];
  const symbolsString = uniqueSymbols.join(',');

  const { data: stockPrices } = useQuery<QueryResponse>(GET_STOCK_PRICES, {
    variables: { symbols: symbolsString },
    skip: !symbolsString, // Skip query if there are no symbols
  });

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
      const userData = doc.data();
      if (userData?.purchasedStocks) {
        setPurchasedStocks(userData.purchasedStocks);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    });
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const getStockPrice = (symbol: string) => {
    const stock = stockPrices?.quotes.find(q => q.value.symbol === symbol);
    return stock ? Number.parseFloat(stock.value.close) : 0;
  };

  const getOwnedShares = (symbol: string) => {
    const stockData = aggregatedStocks.find(s => s.symbol === symbol);
    return stockData ? stockData.totalShares.toFixed(2) : '0.00';
  };

  const getStockData = (symbol: string) => {
    const stock = stockPrices?.quotes.find(q => q.value.symbol === symbol);
    return stock?.value || null;
  };

  const handleSellPress = (symbol: string) => {
    setSelectedStock(symbol);
    setIsSellModalVisible(true);
  };

  const handleSellConfirm = async (amount: number, type: 'shares' | 'money') => {
    if (!user?.uid || !selectedStock) return;

    const currentPrice = getStockPrice(selectedStock);
    
    // Calculate total shares owned for this stock
    const stockTransactions = purchasedStocks.filter(s => s.symbol === selectedStock);
    const totalShares = stockTransactions.reduce((total, transaction) => {
      if (transaction.type === 'purchase') {
        return total + transaction.shares;
      } else {
        return total - transaction.shares;
      }
    }, 0);

    // Calculate shares to sell based on input type
    let sharesToSell = type === 'shares' ? amount : amount / currentPrice;

    if (sharesToSell > totalShares) {
      Alert.alert('Error', `Insufficient shares. You only own ${totalShares.toFixed(2)} shares.`);
      return;
    }

    const moneyToReceive = sharesToSell * currentPrice;

    try {
      const userRef = doc(firestore, "users", user.uid);
      const newBalance = (user.cash_money || 0) + moneyToReceive;
      const currentDate = new Date().toISOString();

      // Create transaction record
      const transaction = {
        amount: moneyToReceive,
        description: `Sell "${selectedStock}" Stock (${sharesToSell.toFixed(2)} shares)`,
        date: currentDate,
      };

      // Create sell record
      const sellRecord = {
        symbol: selectedStock,
        amount: moneyToReceive,
        shares: sharesToSell,
        price: currentPrice,
        date: currentDate,
        type: 'sell'
      };

      await updateDoc(userRef, {
        cash_money: newBalance,
        transactionHistory: arrayUnion(transaction),
        purchasedStocks: arrayUnion(sellRecord)
      });

      await updateUserData(user.uid);
      setIsSellModalVisible(false);
      Alert.alert('Success', 'Stock sold successfully!');
    } catch (error) {
      console.error('Error selling stock:', error);
      Alert.alert('Error', 'Failed to sell stock. Please try again.');
    }
  };

  const aggregatedStocks = purchasedStocks.reduce((acc: AggregatedStock[], stock) => {
    const existingStock = acc.find(s => s.symbol === stock.symbol);
    if (existingStock) {
      if (stock.type === 'sell') {
        existingStock.totalAmount -= stock.amount;
        existingStock.totalShares -= stock.shares;
      } else {
        existingStock.totalAmount += stock.amount;
        existingStock.totalShares += stock.shares;
      }
      // Remove stock from aggregated list if total shares is 0 or less
      if (existingStock.totalShares <= 0) {
        return acc.filter(s => s.symbol !== stock.symbol);
      }
    } else if (stock.type !== 'sell') {
      // Only add new stocks if it's a purchase
      acc.push({ 
        symbol: stock.symbol, 
        totalAmount: stock.amount,
        totalShares: stock.shares 
      });
    }
    return acc;
  }, []);

  const sortedAggregatedStocks = [...aggregatedStocks].sort((a, b) => 
    a.symbol.localeCompare(b.symbol)
  );

  const sortedStocks = [...purchasedStocks].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderStockCard = (stock: any) => {
    const change = Number.parseFloat(stock.percent_change);
    const price = Number.parseFloat(stock.close);
    
    return (
      <Link href={`/stocks/${stock.symbol}`} asChild>
        <Pressable>
          <View style={styles.stockCard}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockPrice}>${price.toFixed(2)}</Text>
            <Text style={[
              styles.stockChange,
              { color: change >= 0 ? 'green' : 'red' }
            ]}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Portfolio', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.title}>Your Owned Stocks</Text>
          
          <View style={styles.stockCardsGrid}>
            {sortedAggregatedStocks.map((aggregatedStock) => {
              const stockData = getStockData(aggregatedStock.symbol);
              if (!stockData) return null;
              return (
                <View key={aggregatedStock.symbol} style={styles.stockCardContainer}>
                  {renderStockCard(stockData)}
                </View>
              );
            })}
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 1 }]}>Symbol</Text>
              <Text style={[styles.headerCell, { flex: 2 }]}>Total Amount</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Shares</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Action</Text>
            </View>

            <ScrollView style={styles.tableContent}>
              {sortedAggregatedStocks.length > 0 ? (
                sortedAggregatedStocks.map((stock) => (
                  <View 
                    key={stock.symbol}
                    style={styles.tableRow}
                  >
                    <Text style={[styles.cell, { flex: 1, fontWeight: 'bold' }]}>{stock.symbol}</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{formatMoney(stock.totalAmount)}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{stock.totalShares.toFixed(2)}</Text>
                    <View style={[styles.actionCell, { flex: 1 }]}>
                      <TouchableOpacity 
                        style={styles.sellButton}
                        onPress={() => handleSellPress(stock.symbol)}
                      >
                        <Text style={styles.sellButtonText}>Sell</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No stocks purchased yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        <View style={[styles.section, styles.historySection]}>
          <Text style={styles.title}>Detailed Transactions</Text>
          
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Symbol</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Amount</Text>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Shares</Text>
              <Text style={[styles.headerCell, { flex: 0.8 }]}>Type</Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>Date</Text>
            </View>

            <ScrollView style={styles.tableContent}>
              {sortedStocks.length > 0 ? (
                sortedStocks.map((stock, index) => (
                  <Pressable 
                    key={`${stock.symbol}-${index}`}
                    style={({ pressed }) => [
                      styles.tableRow,
                      { opacity: pressed ? 0.7 : 1 }
                    ]}
                  >
                    <Text style={[styles.cell, { flex: 0.8, fontWeight: 'bold'}]}>{stock.symbol}</Text>
                    <Text style={[styles.cell, { flex: 1.2 }]}>{formatMoney(stock.amount)}</Text>
                    <Text style={[styles.cell, { flex: 0.8 }]}>{stock.shares.toFixed(2)}</Text>
                    <Text style={[styles.cell, { flex: 0.8 }, stock.type === 'sell' ? styles.sellText : styles.purchaseText]}>
                      {stock.type === 'sell' ? 'SL' : 'PC'}
                    </Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{formatDate(stock.date)}</Text>
                  </Pressable>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {selectedStock && (
        <SellModal
          isVisible={isSellModalVisible}
          onClose={() => {
            setIsSellModalVisible(false);
            setSelectedStock(null);
          }}
          onConfirm={handleSellConfirm}
          symbol={selectedStock}
          sharesOwned={Number(getOwnedShares(selectedStock))}
          currentPrice={getStockPrice(selectedStock)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1a1a1a',
    paddingHorizontal: 4,
  },
  stockCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  stockCardContainer: {
    width: '32%',
    marginBottom: 12,
  },
  stockCard: {
    backgroundColor: '#c3dcc6',
    width: 105,
    height: 105,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  historySection: {
    marginTop: 8,
  },
  tableContainer: {
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#3A7D63',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerCell: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    paddingHorizontal: 4,
    textAlign: 'center'
  },
  tableContent: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#c3dcc6',
    minHeight: 50,
    paddingHorizontal: 8,
  },
  cell: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    color: '#1a1a1a',
    textAlign: 'center'
  },
  actionCell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c3dcc6',
    paddingVertical: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  sellButton: {
    backgroundColor: '#3A7D63',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sellButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sellText: {
    color: '#e74c3c',
    fontWeight: '600',
    textAlign: 'center'
  },
  purchaseText: {
    color: '#27ae60',
    fontWeight: '600',
    textAlign: 'center'
  },
});
