import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Iconify } from "react-native-iconify";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { BRAND_COLORS, ThemeColors } from "../constants/theme";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface PayFooterProps {
    amount: string;
    isProcessing: boolean;
    selectedAppName?: string;
    colors: ThemeColors;
    animatedButtonStyle: any;
    onPay: () => void;
}

export const PayFooter: React.FC<PayFooterProps> = ({
                                                        amount,
                                                        isProcessing,
                                                        selectedAppName,
                                                        colors,
                                                        animatedButtonStyle,
                                                        onPay,
                                                    }) => {
    const styles = createStyles(colors);
    const isDark = themeStore((state) => state.theme === 'dark');
    const palette = isDark ? COLORS.dark : COLORS.light;
    const formattedAmount = parseFloat(amount || "0").toFixed(2);

    return (
        <View style={styles.footerContainer}>
            <BlurView intensity={40} tint={colors.blurTint} style={styles.footerBlur}>
                <View style={styles.securityRow}>
                    <Iconify icon="heroicons:shield-check" size={14} color={BRAND_COLORS.greenIncrease} />
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
                                    ? [palette.icon.darker, palette.bg.lighter]
                                    : [BRAND_COLORS.primaryGreen, BRAND_COLORS.primaryGreenDark]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.payBtnGradient}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color={palette.text.contrast} />
                            ) : (
                                <View style={styles.payBtnTextWrapper}>
                                    <Text style={styles.payBtnText}>
                                        PAY ₹{formattedAmount} {selectedAppName ? `VIA ${selectedAppName.toUpperCase()}` : ""}
                                    </Text>
                                    <Iconify icon="heroicons:arrow-right" size={18} color={palette.text.contrast} style={{ marginLeft: 6 }} />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </BlurView>
        </View>
    );
};