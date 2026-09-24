import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { BRAND_COLORS, ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface PayFooterProps {
    amount: string;
    isProcessing: boolean;
    colors: ThemeColors;
    animatedButtonStyle: any;
    onPay: () => void;
}

export const PayFooter: React.FC<PayFooterProps> = ({
                                                        amount,
                                                        isProcessing,
                                                        colors,
                                                        animatedButtonStyle,
                                                        onPay,
                                                    }) => {
    const styles = createStyles(colors);

    return (
        <View style={styles.footerContainer}>
            <BlurView intensity={40} tint={colors.blurTint} style={styles.footerBlur}>
                <View style={styles.securityRow}>
                    <Ionicons name="shield-checkmark" size={14} color={BRAND_COLORS.greenIncrease} />
                    <Text style={styles.securityText}>256-Bit Encrypted Direct UPI Transfer</Text>
                </View>
                <Text style={styles.policyText}>
                    By tapping &#34;Pay&#34;, you agree to our Terms & Payment Policy
                </Text>

                <Animated.View style={animatedButtonStyle}>
                    <TouchableOpacity onPress={onPay} disabled={isProcessing} activeOpacity={0.9}>
                        <LinearGradient
                            colors={
                                isProcessing
                                    ? ["#4B5563", "#374151"]
                                    : [BRAND_COLORS.primaryGreen, BRAND_COLORS.primaryGreenDark]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.payBtnGradient}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <View style={styles.payBtnTextWrapper}>
                                    <Text style={styles.payBtnText}>PAY ₹{amount}</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </BlurView>
        </View>
    );
};