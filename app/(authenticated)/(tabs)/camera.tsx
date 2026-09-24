import React, {useState, useCallback, useRef} from "react";
import {View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert} from "react-native";
import {useRouter, useFocusEffect} from "expo-router";
import {InitiateTransactionApi, GetTransactionStatusApi} from "@/src/api/user_payment/transaction";
import {RelationWithUserType} from "@/src/api/dto/constants";

export default function CameraScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Store ongoing transaction ID to fetch status when screen regains focus
    const pendingTransactionIdRef = useRef<string | null>(null);

    // Checks status whenever user returns to CameraScreen
    useFocusEffect(
        useCallback(() => {
            const checkStatusOnReturn = async () => {
                const txId = pendingTransactionIdRef.current;
                if (!txId) return;

                // Clear ref so alert doesn't trigger repeatedly on focus
                pendingTransactionIdRef.current = null;

                try {
                    const response = await GetTransactionStatusApi(txId);
                    if (response && "data" in response && response.data) {
                        const tx = response.data;
                        Alert.alert(
                            "Transaction Status",
                            `Status: ${tx.status}\nAmount: ₹${tx.amount}\nReference ID: ${tx.id}${
                                tx.failure_reason_raw ? `\nReason: ${tx.failure_reason_raw}` : ""
                            }`
                        );
                    } else {
                        Alert.alert("Status Check Failed", response?.message || "Could not retrieve transaction status.");
                    }
                } catch (error: any) {
                    Alert.alert("Error", error?.message || "An error occurred while fetching transaction status.");
                }
            };

            checkStatusOnReturn();
        }, [])
    );

    const handleInitiateAndNavigate = async () => {
        setLoading(true);
        try {
            const clientReferenceId = `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const amount = 10.00;
            const userId = 6;
            const userType = RelationWithUserType.CUSTOM;

            const response = await InitiateTransactionApi({
                client_reference_id: clientReferenceId,
                user_id: userId,
                user_type: userType,
                amount: amount,
                currency: "INR",
            });

            if (response && "data" in response && response.data) {
                const transactionId = response.data.id;

                // Keep track of transaction ID before navigating
                pendingTransactionIdRef.current = transactionId;

                router.push({
                    pathname: "/(authenticated)/payment/user/transfer",
                    params: {
                        transactionId: transactionId,
                        amount: amount.toString(),
                        userId: userId,
                        userType: userType,
                    },
                });
            } else {
                Alert.alert("Error", response?.message || "Failed to initiate transaction.");
            }
        } catch (error: any) {
            Alert.alert("Error", error?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.payButton}
                onPress={handleInitiateAndNavigate}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#FFFFFF"/>
                ) : (
                    <Text style={styles.buttonText}>Initiate & Pay ₹100.00</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
        padding: 16,
    },
    payButton: {
        backgroundColor: "#0066CC",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});