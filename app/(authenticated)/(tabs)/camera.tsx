import React from "react";
import { View } from "react-native";
import AccountLinkingScreen from "@/src/components/payments/AccountLinkingScreen";

export default function CameraScreen() {
    return (
        <View style={{ flex: 1 }}>
            <AccountLinkingScreen />
        </View>
    );
}