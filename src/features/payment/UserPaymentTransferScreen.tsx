import React, { useState } from "react";
import { View, ScrollView, SafeAreaView, Alert, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

import { THEME } from "./constants/theme";
import { VpaOption, PaymentSource } from "./types/payment";
import { createStyles } from "./styles/UserPaymentTransferScreen.styles";

import { HeaderNav } from "./components/HeaderNav";
import { RecipientHeader } from "./components/RecipientHeader";
import { VpaSelector } from "./components/VpaSelector";
import { PaymentSourceSelector } from "./components/PaymentSourceSelector";
import { PayFooter } from "./components/PayFooter";

export default function UserPaymentTransferScreen() {
    const router = useRouter();
    const systemColorScheme = useColorScheme();
    const isDark = systemColorScheme === "dark";
    const colors = isDark ? THEME.dark : THEME.light;
    const styles = createStyles(colors);

    const params = useLocalSearchParams<{
        transactionId?: string;
        amount?: string;
        userId?: string;
        userName?: string;
    }>();

    const amount = params.amount || "122.00";
    const recipientName = params.userName || "Alex Johnson";

    const recipientVpas: VpaOption[] = [
        {
            id: "1",
            vpa: "alex.johnson@okicici",
            officialName: "Alex M. Johnson",
            isVerified: true,
        },
        {
            id: "2",
            vpa: "alexj@upi",
            officialName: "Alexander Johnson",
            isVerified: true,
        },
    ];

    const paymentSources: PaymentSource[] = [
        { id: "b1", bankName: "HDFC Bank", accountMask: "•••• 4242", type: "bank", accentColor: "#004B8D" },
        { id: "b2", bankName: "State Bank of India", accountMask: "•••• 8819", type: "bank", accentColor: "#280071" },
    ];

    const [selectedVpaId, setSelectedVpaId] = useState<string>(recipientVpas[0]?.id || "");
    const [selectedSourceId, setSelectedSourceId] = useState<string>(paymentSources[0]?.id || "");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const buttonScale = useSharedValue(1);

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleSelectVpa = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedVpaId(id);
    };

    const handleSelectSource = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedSourceId(id);
    };

    const handlePay = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        buttonScale.value = withSpring(0.96, {}, () => {
            buttonScale.value = withSpring(1);
        });

        setIsProcessing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1800));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Payment Successful", `₹${amount} transferred to ${recipientName}`, [
                { text: "Done", onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Payment Failed", error?.message || "Transaction could not be processed.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={colors.bgGradient} style={styles.gradientBg} />
            <View style={styles.orbTopRight} />
            <View style={styles.orbBottomLeft} />

            <View style={{ flex: 1 }}>
                <HeaderNav colors={colors} onBack={() => router.back()} />

                <ScrollView
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <RecipientHeader
                        recipientName={recipientName}
                        amount={amount}
                        colors={colors}
                    />

                    <VpaSelector
                        vpas={recipientVpas}
                        selectedVpaId={selectedVpaId}
                        colors={colors}
                        onSelect={handleSelectVpa}
                    />

                    <PaymentSourceSelector
                        sources={paymentSources}
                        selectedSourceId={selectedSourceId}
                        colors={colors}
                        onSelect={handleSelectSource}
                    />
                </ScrollView>

                <PayFooter
                    amount={amount}
                    isProcessing={isProcessing}
                    colors={colors}
                    animatedButtonStyle={animatedButtonStyle}
                    onPay={handlePay}
                />
            </View>
        </SafeAreaView>
    );
}