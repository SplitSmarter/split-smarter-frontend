// Location: src/screens/test/QRScannerPaymentScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppText } from '@/src/components/common/AppText';
import { expensePaymentStore } from '@/src/store/expensePaymentStore';
import * as Linking from 'expo-linking';
import { useIsFocused } from '@react-navigation/native'; // Added hook for tab navigation tracking
import qs from 'qs';

export default function QRScannerPaymentScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const isFocused = useIsFocused(); // Track if this specific tab screen is active

    // Connect directly to your persistent compliance store
    const setPendingPayment = expensePaymentStore((state) => state.setPendingPayment);

    // 1. Guard against unconfigured permissions
    if (!permission) {
        return <View className="flex-1 bg-background justify-center items-center" />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-background justify-center items-center p-6">
                <AppText variant="h2" className="text-center mb-4">Camera Permission Required</AppText>
                <AppText className="text-center opacity-60 mb-8">
                    We need access to your camera to scan UPI QR codes for instant split settlements.
                </AppText>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-blue-900 px-6 py-3 rounded-xl"
                >
                    <AppText className="text-white font-bold">Grant Camera Access</AppText>
                </TouchableOpacity>
            </View>
        );
    }

    // 2. Core Scanning Core Parser Function
    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return; // Prevent multiple rapid scanner events
        setScanned(true);

        // Verify if it contains a standard payment schema
        if (!data.startsWith('upi://pay')) {
            Alert.alert(
                "Invalid QR Code",
                "This code does not contain valid UPI payment parameters.",
                [{ text: "Scan Again", onPress: () => setScanned(false) }]
            );
            return;
        }

        try {
            // Split the text to extract everything after the '?' character
            const queryString = data.split('?')[1];

            // FIX: Using your pre-installed 'qs' package to cleanly extract properties
            const parsedParams = qs.parse(queryString);

            const upiId = parsedParams.pa as string | undefined;
            const receiverName = (parsedParams.pn as string) || 'Unknown Recipient';
            const amount = (parsedParams.am as string) || '0.00';

            if (!upiId) {
                throw new Error("Missing payee routing address (pa parameter).");
            }

            // 3. Security/Fraud Compliance Notification Check
            Alert.alert(
                "Confirm Transfer Destination",
                `You are about to settle an expense with:\n\n👤 Name: ${receiverName}\n🆔 UPI ID: ${upiId}\n💵 Amount: ₹${amount}`,
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => setScanned(false)
                    },
                    {
                        text: "Proceed to Pay",
                        onPress: () => executeExternalRedirect(data, upiId, receiverName, amount)
                    }
                ],
                { cancelable: false }
            );

        } catch (error) {
            Alert.alert("Parsing Error", "Could not interpret the payment parameters inside this layout.");
            setScanned(false);
        }
    };

    // 4. Fire the Deep Link and Activate the Global Persistent Overlay
    const executeExternalRedirect = async (fullUrl: string, upiId: string, name: string, amount: string) => {
        try {
            // Commit metadata to disk storage before shifting device focus
            setPendingPayment({
                debtId: `qr_scan_${Date.now()}`, // Generate a contextual transaction sequence ID
                amount: amount,
                recipientName: name,
                timestamp: new Date().toISOString()
            });

            // Redirect out to official banking application rails
            await Linking.openURL(fullUrl);
        } catch (err) {
            // Roll back storage flag if deep link fails
            setPendingPayment(null);
            Alert.alert(
                "No Compatible Apps Found",
                "Your mobile operating system could not locate an application configured to resolve native upi:// frameworks."
            );
        } finally {
            // Allow the viewfinder region to be reactivated when they return
            setScanned(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* CRITICAL FIX: Only mount the camera hardware view when the screen is focused */}
            {isFocused ? (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                />
            ) : (
                <View style={StyleSheet.absoluteFillObject} className="bg-black" />
            )}

            {/* Overlay Grid UI Layout */}
            <View style={styles.overlayContainer}>
                <View style={styles.targetScannerFrame} />
                <AppText className="text-white font-semibold mt-6 bg-black/40 px-4 py-2 rounded-full text-center">
                    Center any UPI standard merchant or friend QR inside the frame
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    targetScannerFrame: {
        width: 260,
        height: 260,
        borderWidth: 3,
        borderColor: '#1E3A8A',
        borderRadius: 24,
        backgroundColor: 'transparent'
    }
});
