import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { paymentStore } from '@/src/store/paymentStore';

const UPI_ID = "hello@wtf";
const RECEIVER_NAME = "Nilesh";
const DEBT_ID_EXAMPLE = "debt_abc123"; // In production, pass this as a prop to your button

export default function SettleButton() {
    // Connect to your persistent Zustand payment slice
    const setPendingPayment = paymentStore((state) => state.setPendingPayment);

    const handleUPISettle = async (amount: string) => {
        const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(RECEIVER_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Settling split bill')}`;

        try {
            // Step 1: Commit tracking details securely to persistent disk storage BEFORE redirecting
            setPendingPayment({
                debtId: DEBT_ID_EXAMPLE,
                amount: amount,
                recipientName: RECEIVER_NAME,
                timestamp: new Date().toISOString()
            });

            // Attempt to open the payment app directly
            await Linking.openURL(upiUrl);
        } catch (error) {
            // If the deep link fails immediately (e.g., on a US phone), clear the storage context
            setPendingPayment(null);

            Alert.alert(
                "No UPI Apps Found",
                "We couldn't find any UPI apps (like GPay, PhonePe, or Paytm) installed on this phone to complete the transaction."
            );
            console.log("Deep link failed:", error);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={() => handleUPISettle('2.00')}>
            <Text style={styles.text}>Settle ₹2.00 Instantly</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { backgroundColor: '#1E3A8A', padding: 15, borderRadius: 8, alignItems: 'center' },
    text: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});