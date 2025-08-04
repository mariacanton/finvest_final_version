import { firestore } from '../config/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Wallet, Transaction } from '../types';

export const createWallet = async (userId: string) => {
    try {
        const walletRef = doc(firestore, 'wallets', userId);
        const newWallet: Wallet = {
            id: userId,
            userId,
            balance: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            transactions: []
        };
        await setDoc(walletRef, {
            ...newWallet,
            createdAt: Timestamp.fromDate(newWallet.createdAt),
            updatedAt: Timestamp.fromDate(newWallet.updatedAt)
        });
        return newWallet;
    } catch (error) {
        console.error('Error creating wallet:', error);
        throw error;
    }
};

export const getWallet = async (userId: string): Promise<Wallet | null> => {
    try {
        const walletRef = doc(firestore, 'wallets', userId);
        const walletSnap = await getDoc(walletRef);
        
        if (walletSnap.exists()) {
            const data = walletSnap.data();
            return {
                ...data,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
            } as Wallet;
        }
        return null;
    } catch (error) {
        console.error('Error getting wallet:', error);
        throw error;
    }
};

export const updateWalletBalance = async (
    userId: string, 
    amount: number, 
    type: 'add' | 'withdraw'
): Promise<Wallet> => {
    try {
        const walletRef = doc(firestore, 'wallets', userId);
        const wallet = await getWallet(userId);
        
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        const newBalance = type === 'add' 
            ? wallet.balance + amount 
            : wallet.balance - amount;

        if (type === 'withdraw' && newBalance < 0) {
            throw new Error('Insufficient funds');
        }

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            amount,
            type,
            timestamp: new Date(),
            description: `${type === 'add' ? 'Added' : 'Withdrew'} $${amount}`
        };

        const updatedWallet: Wallet = {
            ...wallet,
            balance: newBalance,
            updatedAt: new Date(),
            transactions: [newTransaction, ...wallet.transactions]
        };

        await updateDoc(walletRef, {
            balance: newBalance,
            updatedAt: Timestamp.fromDate(updatedWallet.updatedAt),
            transactions: updatedWallet.transactions.map(t => ({
                ...t,
                timestamp: Timestamp.fromDate(t.timestamp)
            }))
        });

        return updatedWallet;
    } catch (error) {
        console.error('Error updating wallet:', error);
        throw error;
    }
};