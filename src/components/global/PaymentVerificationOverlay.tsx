// Location: src/components/global/PaymentVerificationOverlay.tsx
import React from 'react';
// FIX: Import TouchableOpacity from 'react-native' instead of gesture-handler
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { AppText } from '../common/AppText';
import { paymentStore } from '@/src/store/paymentStore';

export const PaymentVerificationOverlay = ({ context }: { context: any }) => {
    const clearPayment = paymentStore((state) => state.setPendingPayment);

    const handleConfirmPayment = () => {
        // 1. Dispatch your FastAPI call to signal PENDING_RECEIPENT_CONFIRMATION
        console.log(`Declaring paid for debt: ${context.debtId}`);
        // 2. Wipe the persistent barrier clean
        clearPayment(null);
    };

    const handleCancelPayment = () => {
        // Mark as failed or closed
        clearPayment(null);
    };

    return (
        <Modal transparent animationType="fade" visible={true}>
            <View style={styles.container}>
                <View className="bg-white dark:bg-bg-primary p-6 rounded-3xl w-11/12 shadow-xl border border-gray-100">
                    <AppText variant="h2" className="mb-2 text-center text-black dark:text-white">Verify Settlement</AppText>
                    <AppText className="text-center opacity-70 mb-6 text-gray-600 dark:text-gray-300">
                        You left the app to pay ₹{context.amount} to {context.recipientName}. Did the transaction complete?
                    </AppText>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={handleCancelPayment}
                            className="flex-1 bg-gray-100 p-4 rounded-xl items-center"
                        >
                            <AppText className="text-black font-semibold">No, Canceled</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirmPayment}
                            className="flex-1 bg-blue-900 p-4 rounded-xl items-center"
                        >
                            <AppText className="text-white font-semibold">Yes, Sent</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }
});