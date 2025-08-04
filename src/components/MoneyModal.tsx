import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '../constants/Colors';

interface MoneyModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'add' | 'withdraw';
  onConfirm: (amount: number) => void;
}

const MoneyModal: React.FC<MoneyModalProps> = ({ isVisible, onClose, type, onConfirm }) => {
  const [amount, setAmount] = useState('');

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    const value = text.replace(/[^0-9.]/g, '');
    if (value === '' || !isNaN(parseFloat(value))) {
      setAmount(value);
    }
  };

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onConfirm(numAmount);
      setAmount('');
      onClose();
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
            <Text style={styles.title}>
              How much money would you like to {type}?
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleAmountChange}
              />
              <Text style={styles.label}>US $</Text>
            </View>

            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>Accept</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    padding: 8,
    minWidth: 120,
    fontSize: 20,
    textAlign: 'right',
  },
  label: {
    fontSize: 18,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
});

export default MoneyModal;