import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/authContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../config/firebase';

interface PurchaseModalProps {
  isVisible: boolean;
  onClose: () => void;
  stockPrice: number;
  stockSymbol: string;
}

export default function PurchaseModal({ isVisible, onClose, stockPrice, stockSymbol }: PurchaseModalProps) {
  const { user, updateUserData } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'shares' | 'dollars'>('shares');
  const [sharesValue, setSharesValue] = useState('');
  const [dollarsValue, setDollarsValue] = useState('');

  const handleSharesChange = (text: string) => {
    const value = text.replace(/[^0-9]/g, '');
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 20)) {
      setSharesValue(value);
    }
  };

  const handleDollarsChange = (text: string) => {
    const value = text.replace(/[^0-9.]/g, '');
    if (value === '' || (parseFloat(value) >= 1 && parseFloat(value) <= 1000)) {
      setDollarsValue(value);
    }
  };

  const calculateTotal = () => {
    if (selectedOption === 'shares' && sharesValue) {
      return (parseInt(sharesValue) * stockPrice).toFixed(2);
    } else if (selectedOption === 'dollars' && dollarsValue) {
      return parseFloat(dollarsValue).toFixed(2);
    }
    return '0.00';
  };

  const calculateShares = () => {
    if (selectedOption === 'shares' && sharesValue) {
      return parseInt(sharesValue);
    } else if (selectedOption === 'dollars' && dollarsValue) {
      return parseFloat(dollarsValue) / stockPrice;
    }
    return 0;
  };

  const handlePurchase = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'You must be logged in to make a purchase');
      return;
    }

    const totalAmount = parseFloat(calculateTotal());
    const sharesCount = calculateShares();
    
    if (totalAmount > (user.cash_money || 0)) {
      Alert.alert(
        'Insufficient Funds',
        `You don't have enough funds available. Your current balance is $${user.cash_money?.toFixed(2)}.`
      );
      return;
    }

    try {
      const userRef = doc(firestore, "users", user.uid);
      const newBalance = (user.cash_money || 0) - totalAmount;
      const currentDate = new Date().toISOString();
      
      // Create transaction record
      const transaction = {
        amount: totalAmount,
        description: `Buy "${stockSymbol}" Stock (${sharesCount.toFixed(2)} shares)`,
        date: currentDate
      };

      // Create purchased stock record with shares count
      const purchasedStock = {
        symbol: stockSymbol,
        amount: totalAmount,
        shares: sharesCount,
        price: stockPrice,
        date: currentDate,
        type: 'purchase'
      };

      await updateDoc(userRef, { 
        cash_money: newBalance,
        transactionHistory: arrayUnion(transaction),
        purchasedStocks: arrayUnion(purchasedStock)
      });
      
      await updateUserData(user.uid);
      
      Alert.alert(
        'Success',
        'Purchase was successful!'
      );
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete the purchase. Please try again.');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.modalView} onPress={e => e.stopPropagation()}>
            <Text style={styles.title}>Purchase</Text>
            
            <View style={styles.optionContainer}>
              <TouchableOpacity 
                style={styles.radioContainer} 
                onPress={() => setSelectedOption('shares')}
              >
                <View style={styles.radio}>
                  {selectedOption === 'shares' && <View style={styles.radioSelected} />}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={sharesValue}
                  onChangeText={handleSharesChange}
                  onFocus={() => setSelectedOption('shares')}
                />
                <Text style={styles.label}>shares</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioContainer} 
                onPress={() => setSelectedOption('dollars')}
              >
                <View style={styles.radio}>
                  {selectedOption === 'dollars' && <View style={styles.radioSelected} />}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={dollarsValue}
                  onChangeText={handleDollarsChange}
                  onFocus={() => setSelectedOption('dollars')}
                />
                <Text style={styles.label}>US $</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>{calculateTotal()} US $</Text>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handlePurchase}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  optionContainer: {
    width: '100%',
    gap: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3A7D63',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    padding: 4,
    minWidth: 60,
    fontSize: 16,
    color: '#1a1a1a',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
    gap: 8,
  },
  totalLabel: {
    fontSize: 18,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  confirmButton: {
    backgroundColor: '#3A7D63',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});