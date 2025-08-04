import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from '../constants/Colors';

interface SellModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (amount: number, type: 'shares' | 'money') => void;
  symbol: string;
  sharesOwned: number;
  currentPrice: number;
}

export default function SellModal({ isVisible, onClose, onConfirm, symbol, sharesOwned, currentPrice }: SellModalProps) {
  const [amount, setAmount] = useState('');
  const [sellType, setSellType] = useState<'shares' | 'money'>('shares');
  const totalValue = sharesOwned * currentPrice;

  const handleConfirm = () => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    if (sellType === 'shares') {
      if (numAmount > sharesOwned) {
        Alert.alert('Insufficient Shares', `You only own ${sharesOwned} shares.`);
        return;
      }
    } else {
      const shares = numAmount / currentPrice;
      if (shares > sharesOwned) {
        Alert.alert('Insufficient Value', `You only own ${sharesOwned} shares (${totalValue.toFixed(2)} USD).`);
        return;
      }
    }

    onConfirm(numAmount, sellType);
    setAmount('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Sell {symbol}</Text>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>Shares owned: {sharesOwned}</Text>
            <Text style={styles.infoText}>Current price: ${currentPrice.toFixed(2)}</Text>
            <Text style={styles.infoText}>Total value: ${totalValue.toFixed(2)}</Text>
          </View>

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, sellType === 'shares' && styles.selectedType]}
              onPress={() => setSellType('shares')}
            >
              <Text style={[styles.typeText, sellType === 'shares' && styles.selectedTypeText]}>Shares</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, sellType === 'money' && styles.selectedType]}
              onPress={() => setSellType('money')}
            >
              <Text style={[styles.typeText, sellType === 'money' && styles.selectedTypeText]}>Money</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={sellType === 'shares' ? "Number of shares" : "Amount in USD"}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#c3dcc6',
    borderRadius: 20,
    padding: 20,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.tint,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#A3C9A8',
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: Colors.light.tint,
  },
  typeText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  selectedTypeText: {
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#A3C9A8',
  },
  confirmButton: {
    backgroundColor: Colors.light.tint,
  },
  cancelButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});