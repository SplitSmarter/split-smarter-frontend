// app/(authenticated)/payment/user/transfer.tsx
import React from "react";
import { View } from "react-native";
import PaymentScreen from "@/src/screens/UserPayment/payment";
import UserPaymentTransferScreen from "@/src/features/payment/UserPaymentTransferScreen";

export default function TransferScreen() {
    return (
        <View style={{ flex: 1 }}>
            <UserPaymentTransferScreen />
        </View>
    );
}