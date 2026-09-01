// Location: src/screens/test/PhoneNumberPaymentScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { expensePaymentStore } from '@/src/store/expensePaymentStore';
import * as Linking from 'expo-linking';
import qs from 'qs';

// Popular UPI networks mapped to handles
const UPI_NETWORKS = [
    { label: 'PhonePe (@ybl)', handle: 'ybl' },
    { label: 'PhonePe (@ibl)', handle: 'ibl' },
    { label: 'Paytm (@paytm)', handle: 'paytm' },
    { label: 'Google Pay (@oksbi)', handle: 'oksbi' },
    { label: 'Generic/Other (@upi.ts)', handle: 'upi' }
];

export default function PhoneNumberPaymentScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [receiverName, setReceiverName] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedHandle, setSelectedHandle] = useState('ybl'); // Defaulting to India's largest handle

    const setPendingPayment = expensePaymentStore((state) => state.setPendingPayment);

    const validateInputs = () => {
        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        if (cleanedPhone.length !== 10) {
            Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit mobile number.");
            return false;
        }
        if (!receiverName.trim()) {
            Alert.alert("Missing Name", "Please enter the recipient's name.");
            return false;
        }
        if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
            Alert.alert("Invalid Amount", "Please enter an amount greater than ₹0.");
            return false;
        }
        return true;
    };

    const handleInitiatePayment = async () => {
        if (!validateInputs()) return;

        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        const finalName = receiverName.trim();
        const finalAmount = parseFloat(amount).toFixed(2);

        // DYNAMIC OVERRIDE: Combines phone number with selected network handle
        const dynamicVpa = `${cleanedPhone}@${selectedHandle}`;

        const queryParams = qs.stringify({
            pa: dynamicVpa,
            pn: finalName,
            am: finalAmount,
            cu: 'INR',
        });

        const fullDeepLinkUrl = `upi://pay?${queryParams}`;

        Alert.alert(
            "Confirm Transfer Destination",
            `You are about to settle an expense with:\n\n👤 Name: ${finalName}\n🆔 Resolved VPA: ${dynamicVpa}\n💵 Amount: ₹${finalAmount}`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Proceed to Pay",
                    onPress: () => executeExternalRedirect(fullDeepLinkUrl, finalName, finalAmount)
                }
            ]
        );
    };

    const executeExternalRedirect = async (fullUrl: string, name: string, amountStr: string) => {
        try {
            setPendingPayment({
                debtId: `phone_pay_${Date.now()}`,
                amount: amountStr,
                recipientName: name,
                timestamp: new Date().toISOString()
            });
            await Linking.openURL(fullUrl);
        } catch (err) {
            setPendingPayment(null);
            Alert.alert("Error", "Could not open any UPI payment application.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <AppText variant="h2" className="mb-4">Pay via Phone Number</AppText>

            <View style={styles.formGroup}>
                <AppText className="font-semibold mb-2 text-sm opacity-80">Recipients Mobile Number</AppText>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />
            </View>

            {/* DYNAMIC HANDLE SELECTOR GRID */}
            <View style={styles.formGroup}>
                <AppText className="font-semibold mb-2 text-sm opacity-80">Select Recipient's Main App Network</AppText>
                <View style={styles.chipContainer}>
                    {UPI_NETWORKS.map((network) => (
                        <TouchableOpacity
                            key={network.handle}
                            onPress={() => setSelectedHandle(network.handle)}
                            style={[
                                styles.chip,
                                selectedHandle === network.handle && styles.activeChip
                            ]}
                        >
                            <AppText style={[
                                styles.chipText,
                                selectedHandle === network.handle && styles.activeChipText
                            ]}>
                                {network.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <AppText className="font-semibold mb-2 text-sm opacity-80">Recipient Full Name</AppText>
                <TextInput
                    style={styles.input}
                    placeholder="Enter recipient's name"
                    autoCapitalize="words"
                    value={receiverName}
                    onChangeText={setReceiverName}
                />
            </View>

            <View style={styles.formGroup}>
                <AppText className="font-semibold mb-2 text-sm opacity-80">Settlement Amount (₹)</AppText>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
            </View>

            <TouchableOpacity onPress={handleInitiatePayment} className="mt-4 w-full py-4 rounded-xl bg-blue-900">
                <AppText className="text-white font-bold text-center text-base">Verify & Send Intent</AppText>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#FFFFFF', padding: 24, justifyContent: 'center' },
    formGroup: { marginBottom: 18 },
    input: {
        borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
        color: '#1E293B', backgroundColor: '#F8FAFC',
    },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF'
    },
    activeChip: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
    chipText: { fontSize: 13, color: '#475569' },
    activeChipText: { color: '#FFFFFF', fontWeight: '600' }
});
