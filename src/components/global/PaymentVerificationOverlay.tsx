// Location: src/components/global/PaymentVerificationOverlay.tsx
import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { AppText } from '../common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { expensePaymentStore } from '@/src/store/expensePaymentStore';

export const PaymentVerificationOverlay = ({ context }: { context: any }) => {
    const clearPayment = expensePaymentStore((state) => state.setPendingPayment);

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
                <View className="bg-bg-canvas p-6 rounded-3xl w-11/12 shadow-xl border border-border-input">
                    <AppText variant="h2" className="mb-2 text-center text-text-primary">Verify Settlement</AppText>
                    <AppText className="text-center opacity-70 mb-6 text-text-primary-lighter">
                        You left the app to pay ₹{context.amount} to {context.recipientName}. Did the transaction complete?
                    </AppText>

                    <View className="flex-row gap-4">
                        <AppButton
                            variant="secondary"
                            className="flex-1 rounded-xl"
                            onPress={handleCancelPayment}
                        >
                            No, Canceled
                        </AppButton>

                        <AppButton
                            variant="primary"
                            className="flex-1 rounded-xl"
                            onPress={handleConfirmPayment}
                        >
                            Yes, Sent
                        </AppButton>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }
});
