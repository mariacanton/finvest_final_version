import { Text, View } from './Themed';
import { MonoText } from './StyledText';
import { StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from '../config/firebase';

type Stock = {
  name: string;
  symbol: string;
  close: string;
  percent_change: string;
};

type StockListItem = {
  stock: Stock;
  hideStarIcon?: boolean;
};

export default function StockListItem({ stock, hideStarIcon }: StockListItem) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const change = Number.parseFloat(stock.percent_change);

  // Load favorite status on component mount
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user?.uid) return;
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();
      setIsFavorite(userData?.favoriteStocks?.includes(stock.symbol) || false);
    };
    loadFavoriteStatus();
  }, [user, stock.symbol]);

  const toggleFavorite = async (e: any) => {
    e.preventDefault(); // Prevent link navigation
    if (!user?.uid) return;

    const userRef = doc(firestore, "users", user.uid);
    try {
      if (isFavorite) {
        await updateDoc(userRef, {
          favoriteStocks: arrayRemove(stock.symbol)
        });
      } else {
        await updateDoc(userRef, {
          favoriteStocks: arrayUnion(stock.symbol)
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <Link href={`/stocks/${stock.symbol}`} asChild>
      <Pressable style={styles.container}>
        {/* Left container */}
        <View style={styles.leftContainer}>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{stock.symbol}</Text>
            {!hideStarIcon && (
              <TouchableOpacity onPress={toggleFavorite}>
                <AntDesign 
                  name={isFavorite ? "star" : "staro"} 
                  size={18} 
                  color={isFavorite ? "#FFD700" : "gray"} 
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.name}>{stock.name}</Text>
        </View>
        {/* Right container */}
        <View style={styles.rightContainer}>
          <MonoText style={styles.price}>${Number.parseFloat(stock.close).toFixed(1)}</MonoText>
          <MonoText style={[styles.change, { color: change > 0 ? 'green' : 'red' }]}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </MonoText>
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
    borderBottomColor: '#b3ccb6',  // slightly darker than the background for subtle separation
  },
  leftContainer: {
    flex: 1,
    gap: 5,
    backgroundColor: '#c3dcc6',
  },
  rightContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#c3dcc6',
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c3dcc6',
    gap: 5,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  name: {
    color: 'gray'
  },
  price: {
    backgroundColor: '#c3dcc6',
  },
  change: {
    backgroundColor: '#c3dcc6',
  }
});
