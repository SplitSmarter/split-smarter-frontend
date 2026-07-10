// Location: src/store/expensePaymentStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivePaymentContext {
    debtId: string;
    amount: string;
    recipientName: string;
    timestamp: string;
}

interface PaymentState {
    pendingVerification: ActivePaymentContext | null;
    setPendingPayment: (context: ActivePaymentContext | null) => void;
}

export const expensePaymentStore = create<PaymentState>()(
    persist(
        (set) => ({
            pendingVerification: null,
            setPendingPayment: (context) => set({ pendingVerification: context }),
        }),
        {
            name: 'split-smarter-payment-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);