import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { Text } from '../../components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Colors from '../../constants/Colors';
import { History } from '../../components/History';
import MoneyModal from '../../components/MoneyModal';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import stocksData from '../../../assets/data/stocks.json';

export default function TabFourScreen() {
  const { user, updateUserData } = useAuth();
  const [isMoneyModalVisible, setIsMoneyModalVisible] = useState(false);
  const [moneyOperationType, setMoneyOperationType] = useState<'add' | 'withdraw'>('add');
  const [historyItems, setHistoryItems] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [purchasedStocks, setPurchasedStocks] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
      const userData = doc.data();
      if (userData?.transactionHistory) {
        setHistoryItems(userData.transactionHistory);
      }
      if (userData?.purchasedStocks) {
        setPurchasedStocks(userData.purchasedStocks);
        
        // Calculate total portfolio value considering buy/sell transactions
        interface PurchasedStock {
          symbol: string;
          amount: number;
          type?: 'purchase' | 'sell';
        }
        
        interface AggregatedStock {
          symbol: string;
          totalAmount: number;
        }

        const aggregatedStocks = userData.purchasedStocks.reduce((acc: AggregatedStock[], stock: PurchasedStock) => {
          const existingStock = acc.find(s => s.symbol === stock.symbol);
          if (existingStock) {
            existingStock.totalAmount += stock.type === 'sell' ? -stock.amount : stock.amount;
            // Remove stock if total amount is 0 or less
            if (existingStock.totalAmount <= 0) {
              return acc.filter(s => s.symbol !== stock.symbol);
            }
          } else if (stock.type !== 'sell') {
            // Only add new stocks if it's a purchase
            acc.push({ symbol: stock.symbol, totalAmount: stock.amount });
          }
          return acc;
        }, []);

        const total = aggregatedStocks.reduce((sum: number, stock: AggregatedStock) => sum + stock.totalAmount, 0);
        setPortfolioValue(total);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSeeAllPress = () => {
    // Handle see all press - Keeping this in case we need it later
  };

  const handleMoneyOperation = (type: 'add' | 'withdraw') => {
    setMoneyOperationType(type);
    setIsMoneyModalVisible(true);
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleConfirmOperation = async (amount: number) => {
    if (!user?.uid) return;

    if (moneyOperationType === 'add') {
      try {
        const userRef = doc(firestore, "users", user.uid);
        const newBalance = (user.cash_money || 0) + amount;
        await updateDoc(userRef, { cash_money: newBalance });
        await updateUserData(user.uid);
        Alert.alert(
          'Success',
          `Successfully added $${formatMoney(amount)} to your account.`
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to add money to your account.');
      }
    } else {
      const currentBalance = user.cash_money || 0;
      if (amount > currentBalance) {
        Alert.alert(
          'Insufficient Funds',
          `You don't have enough funds available. Your current balance is $${formatMoney(currentBalance)}.`
        );
        setIsMoneyModalVisible(false); // Close the modal
        return;
      }
      
      try {
        const userRef = doc(firestore, "users", user.uid);
        const newBalance = currentBalance - amount;
        await updateDoc(userRef, { cash_money: newBalance });
        await updateUserData(user.uid);
        Alert.alert(
          'Success',
          `Successfully withdrew $${formatMoney(amount)} from your account.`
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to withdraw money from your account.');
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStockPrice = (symbol: string) => {
    const stock = stocksData.quotes.find(q => q.value.symbol === symbol);
    return stock ? Number.parseFloat(stock.value.close) : 0;
  };

  const calculateShares = (amount: number, symbol: string) => {
    const currentPrice = getStockPrice(symbol);
    return currentPrice > 0 ? (amount / currentPrice).toFixed(2) : '0.00';
  };

  // Sort purchased stocks by date first, then map to transaction items
  const stockTransactions = [...purchasedStocks]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(stock => ({
      amount: stock.amount,
      description: `${stock.symbol} - ${calculateShares(stock.amount, stock.symbol)} shares`,
      date: formatDate(stock.date)
    }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Welcome Section */}
        <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'} !</Text>

        {/* Available Money Card with Action Buttons */}
        <View style={styles.moneyCard}>
          <Text style={styles.moneyLabel}>Your total available money:</Text>
          <Text style={styles.moneyAmount}>$ {formatMoney(user?.cash_money || 0)}</Text>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleMoneyOperation('add')}
            >
              <View style={styles.actionButtonIcon}>
                <Ionicons name="add" size={24} color="white" />
              </View>
              <Text style={styles.actionButtonText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleMoneyOperation('withdraw')}
            >
              <View style={styles.actionButtonIcon}>
                <Ionicons name="remove" size={24} color="white" />
              </View>
              <Text style={styles.actionButtonText}>Withdraw Money</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Value Card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.moneyLabel}>Your total portfolio:</Text>
          <View style={styles.portfolioRow}>
            <Text style={styles.moneyAmount}>$ {formatMoney(portfolioValue)}</Text>
            <Link href="/portfolio" asChild>
              <TouchableOpacity style={styles.seeStocksButton}>
                <Text style={styles.seeStocksText}>See Stocks</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Current Plan Section - Commented out
        <CurrentPlan onSeeAllPress={handleSeeAllPress} />
        */}

        {/* Stock Transactions Section */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Transactions History</Text>
          <ScrollView 
            style={styles.historyScroll} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <History items={stockTransactions} />
          </ScrollView>
        </View>

        {/* Money Modal */}
        <MoneyModal
          isVisible={isMoneyModalVisible}
          onClose={() => setIsMoneyModalVisible(false)}
          type={moneyOperationType}
          onConfirm={handleConfirmOperation}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A3C9A8',
  },
  content: {
    padding: 16,
    backgroundColor: '#A3C9A8',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 24,
    color: '#1a1a1a',
  },
  moneyCard: {
    backgroundColor: '#c3dcc6',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moneyLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  moneyAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    backgroundColor: '#c3dcc6',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#c3dcc6',
    padding: 16,
    borderRadius: 20,
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  portfolioCard: {
    backgroundColor: '#c3dcc6',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portfolioLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  seeStocksButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeStocksText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  historyContainer: {
    marginTop: 24,
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 300,
  },
  historyScroll: {
    flex: 1,
    backgroundColor: '#c3dcc6',
  },
});
