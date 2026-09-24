import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Alert,
    useColorScheme,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue,
} from "react-native-reanimated";

// Light & Dark Theme Mapping aligned with Tailwind Config
const THEME = {
    dark: {
        bgCanvas: "#0C0C0C",
        bgGradient: ["#1A1A1A", "#121212", "#0C0C0C"] as const,
        orbPrimary: "rgba(43, 135, 97, 0.25)",
        orbSecondary: "rgba(34, 108, 78, 0.18)",
        glassBorder: "rgba(255, 255, 255, 0.10)",
        glassBorderSelected: "#32966E",
        glassGradient: ["rgba(255, 255, 255, 0.07)", "rgba(255, 255, 255, 0.02)"] as const,
        glassGradientSelected: ["rgba(43, 135, 97, 0.28)", "rgba(34, 108, 78, 0.10)"] as const,
        navBtnBg: "rgba(255, 255, 255, 0.05)",
        amountCardBg: "rgba(0, 0, 0, 0.35)",
        amountCardBorder: "rgba(255, 255, 255, 0.12)",
        textPrimary: "#F3F4F6",
        textSecondary: "#E5E7EB",
        textMuted: "#9CA3AF",
        textSubtle: "#6B7280",
        footerBorder: "rgba(255, 255, 255, 0.08)",
        unselectedIcon: "rgba(255, 255, 255, 0.3)",
        blurTint: "dark" as const,
    },
    light: {
        bgCanvas: "#F8FAFC",
        bgGradient: ["#FFFFFF", "#F1F5F9", "#E2E8F0"] as const,
        orbPrimary: "rgba(43, 135, 97, 0.12)",
        orbSecondary: "rgba(50, 150, 110, 0.08)",
        glassBorder: "rgba(0, 0, 0, 0.06)",
        glassBorderSelected: "#2B8761",
        glassGradient: ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.60)"] as const,
        glassGradientSelected: ["rgba(43, 135, 97, 0.12)", "rgba(43, 135, 97, 0.04)"] as const,
        navBtnBg: "rgba(0, 0, 0, 0.04)",
        amountCardBg: "rgba(255, 255, 255, 0.70)",
        amountCardBorder: "rgba(0, 0, 0, 0.08)",
        textPrimary: "#0F172A",
        textSecondary: "#334155",
        textMuted: "#64748B",
        textSubtle: "#94A3B8",
        footerBorder: "rgba(0, 0, 0, 0.06)",
        unselectedIcon: "rgba(0, 0, 0, 0.25)",
        blurTint: "light" as const,
    },
};

const BRAND_COLORS = {
    primaryGreen: "#2B8761",
    primaryGreenDark: "#226C4E",
    primaryGreenLight: "#32966E",
    greenIncrease: "#289F32",
};

interface VpaOption {
    id: string;
    vpa: string;
    officialName: string;
    isVerified: boolean;
}

interface PaymentSource {
    id: string;
    bankName: string;
    accountMask: string;
    type: "bank" | "card";
    accentColor: string;
}

const GlassCard = ({
                       children,
                       style,
                       contentStyle,
                       isSelected,
                       colors,
                   }: {
    children: React.ReactNode;
    style?: any;
    contentStyle?: any;
    isSelected?: boolean;
    colors: typeof THEME.dark;
}) => {
    return (
        <View
            style={[
                {
                    borderRadius: 20,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: isSelected ? colors.glassBorderSelected : colors.glassBorder,
                    marginBottom: 12,
                },
                isSelected && {
                    shadowColor: BRAND_COLORS.primaryGreen,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                },
                style,
            ]}
        >
            <BlurView intensity={35} tint={colors.blurTint} style={{ width: "100%" }}>
                <LinearGradient
                    colors={isSelected ? colors.glassGradientSelected : colors.glassGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[{ padding: 16 }, contentStyle]}
                >
                    {children}
                </LinearGradient>
            </BlurView>
        </View>
    );
};

export default function UserPaymentTransferScreen() {
    const router = useRouter();
    const systemColorScheme = useColorScheme();
    const isDark = systemColorScheme === "dark";
    const colors = isDark ? THEME.dark : THEME.light;

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
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
            {/* Dynamic Background Canvas Gradient */}
            <LinearGradient
                colors={colors.bgGradient}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                }}
            />

            {/* Background Ambient Brand Green Orbs */}
            <View
                style={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    opacity: 0.8,
                    top: -40,
                    right: -40,
                    backgroundColor: colors.orbPrimary,
                }}
            />
            <View
                style={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    opacity: 0.8,
                    top: 220,
                    left: -60,
                    backgroundColor: colors.orbSecondary,
                }}
            />

            <View style={{ flex: 1 }}>
                {/* Header Navigation */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                        style={{ borderRadius: 20, overflow: "hidden" }}
                    >
                        <BlurView
                            intensity={30}
                            tint={colors.blurTint}
                            style={{ padding: 10, borderRadius: 20, backgroundColor: colors.navBtnBg }}
                        >
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                        </BlurView>
                    </TouchableOpacity>

                    <Text style={{ fontSize: 17, fontWeight: "700", color: colors.textPrimary, letterSpacing: 0.3 }}>
                        Send Money
                    </Text>

                    <TouchableOpacity style={{ borderRadius: 20, overflow: "hidden" }}>
                        <BlurView
                            intensity={30}
                            tint={colors.blurTint}
                            style={{ padding: 10, borderRadius: 20, backgroundColor: colors.navBtnBg }}
                        >
                            <Ionicons name="help-circle-outline" size={20} color={colors.textPrimary} />
                        </BlurView>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Recipient Profile & Total Amount Header */}
                    <GlassCard
                        colors={colors}
                        style={{ marginTop: 8, marginBottom: 20, width: "100%" }}
                        contentStyle={{
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 24,
                        }}
                    >
                        <View
                            style={{
                                width: 76,
                                height: 76,
                                borderRadius: 38,
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: 12,
                                overflow: "hidden",
                                elevation: 8,
                                shadowColor: BRAND_COLORS.primaryGreen,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 12,
                            }}
                        >
                            <LinearGradient
                                colors={[BRAND_COLORS.primaryGreen, BRAND_COLORS.primaryGreenDark]}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: 0,
                                    bottom: 0,
                                }}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <Text style={{ fontSize: 26, fontWeight: "800", color: "#FFFFFF" }}>
                                {recipientName.split(" ").map((n) => n[0]).join("")}
                            </Text>
                        </View>

                        <Text
                            style={{
                                fontSize: 21,
                                fontWeight: "700",
                                color: colors.textPrimary,
                                textAlign: "center",
                                marginBottom: 16,
                            }}
                        >
                            {recipientName}
                        </Text>

                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 28,
                                paddingVertical: 12,
                                borderRadius: 18,
                                backgroundColor: colors.amountCardBg,
                                borderWidth: 1,
                                borderColor: colors.amountCardBorder,
                                minWidth: 180,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    fontWeight: "700",
                                    color: colors.textMuted,
                                    letterSpacing: 1.2,
                                    textAlign: "center",
                                    marginBottom: 4,
                                }}
                            >
                                PAYABLE AMOUNT
                            </Text>
                            <Text style={{ fontSize: 32, fontWeight: "800", color: colors.textPrimary, textAlign: "center" }}>
                                ₹{amount}
                            </Text>
                        </View>
                    </GlassCard>

                    {/* Recipient VPA Selection */}
                    <View style={{ marginBottom: 16 }}>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: colors.textMuted,
                                letterSpacing: 1,
                                marginBottom: 10,
                                paddingLeft: 4,
                            }}
                        >
                            SELECT RECIPIENT VPA / UPI ID
                        </Text>
                        {recipientVpas.map((vpaItem) => {
                            const isSelected = selectedVpaId === vpaItem.id;
                            return (
                                <TouchableOpacity
                                    key={vpaItem.id}
                                    onPress={() => handleSelectVpa(vpaItem.id)}
                                    activeOpacity={0.9}
                                >
                                    <GlassCard
                                        colors={colors}
                                        isSelected={isSelected}
                                        style={{ marginBottom: 10 }}
                                        contentStyle={{ flexDirection: "row", alignItems: "center" }}
                                    >
                                        <View style={{ marginRight: 12, justifyContent: "center" }}>
                                            <Ionicons
                                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                                size={22}
                                                color={isSelected ? BRAND_COLORS.primaryGreen : colors.unselectedIcon}
                                            />
                                        </View>
                                        <View style={{ flex: 1, justifyContent: "center" }}>
                                            <Text
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: "600",
                                                    color: colors.textPrimary,
                                                }}
                                            >
                                                {vpaItem.vpa}
                                            </Text>
                                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                                                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                                                    Official Name: {vpaItem.officialName}
                                                </Text>
                                                {vpaItem.isVerified && (
                                                    <MaterialCommunityIcons
                                                        name="check-decagram"
                                                        size={15}
                                                        color={BRAND_COLORS.greenIncrease}
                                                        style={{ marginLeft: 4 }}
                                                    />
                                                )}
                                            </View>
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Payment Source Selection */}
                    <View style={{ marginBottom: 16 }}>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "700",
                                color: colors.textMuted,
                                letterSpacing: 1,
                                marginBottom: 10,
                                paddingLeft: 4,
                            }}
                        >
                            PAY USING
                        </Text>
                        {paymentSources.map((source) => {
                            const isSelected = selectedSourceId === source.id;
                            return (
                                <TouchableOpacity
                                    key={source.id}
                                    onPress={() => handleSelectSource(source.id)}
                                    activeOpacity={0.9}
                                >
                                    <GlassCard
                                        colors={colors}
                                        isSelected={isSelected}
                                        style={{ marginBottom: 10 }}
                                        contentStyle={{ flexDirection: "row", alignItems: "center" }}
                                    >
                                        <View style={{ marginRight: 12, justifyContent: "center" }}>
                                            <Ionicons
                                                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                                size={22}
                                                color={isSelected ? BRAND_COLORS.primaryGreen : colors.unselectedIcon}
                                            />
                                        </View>
                                        <View style={{ flex: 1, justifyContent: "center" }}>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <FontAwesome5
                                                    name="university"
                                                    size={14}
                                                    color={colors.textMuted}
                                                    style={{ marginRight: 6 }}
                                                />
                                                <Text
                                                    style={{
                                                        fontSize: 15,
                                                        fontWeight: "600",
                                                        color: colors.textPrimary,
                                                    }}
                                                >
                                                    {source.bankName}{" "}
                                                    <Text style={{ color: colors.textMuted, fontWeight: "400" }}>
                                                        {source.accountMask}
                                                    </Text>
                                                </Text>
                                            </View>
                                        </View>
                                    </GlassCard>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Add Bank Option */}
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 10,
                                paddingHorizontal: 6,
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add-circle" size={20} color={BRAND_COLORS.primaryGreenLight} />
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: BRAND_COLORS.primaryGreenLight,
                                    marginLeft: 8,
                                }}
                            >
                                Add Another Bank Account / Card
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Footer & Action Button */}
                <View style={{ borderTopWidth: 1, borderTopColor: colors.footerBorder, overflow: "hidden" }}>
                    <BlurView
                        intensity={40}
                        tint={colors.blurTint}
                        style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 4,
                            }}
                        >
                            <Ionicons name="shield-checkmark" size={14} color={BRAND_COLORS.greenIncrease} />
                            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textSecondary, marginLeft: 6 }}>
                                256-Bit Encrypted Direct UPI Transfer
                            </Text>
                        </View>
                        <Text style={{ fontSize: 10, color: colors.textSubtle, textAlign: "center", marginBottom: 14 }}>
                            By tapping "Pay", you agree to our Terms & Payment Policy
                        </Text>

                        <Animated.View style={animatedButtonStyle}>
                            <TouchableOpacity
                                onPress={handlePay}
                                disabled={isProcessing}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={isProcessing ? ["#4B5563", "#374151"] : [BRAND_COLORS.primaryGreen, BRAND_COLORS.primaryGreenDark]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        paddingVertical: 16,
                                        borderRadius: 16,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        shadowColor: BRAND_COLORS.primaryGreen,
                                        shadowOffset: { width: 0, height: 6 },
                                        shadowOpacity: 0.35,
                                        shadowRadius: 12,
                                    }}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: "#FFFFFF",
                                                    fontSize: 16,
                                                    fontWeight: "700",
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                PAY ₹{amount}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </BlurView>
                </View>
            </View>
        </SafeAreaView>
    );
}