import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard } from "./GlassCard";
import { BRAND_COLORS, ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface RecipientHeaderProps {
    recipientName: string;
    amount: string;
    colors: ThemeColors;
}

export const RecipientHeader: React.FC<RecipientHeaderProps> = ({
                                                                    recipientName,
                                                                    amount,
                                                                    colors,
                                                                }) => {
    const styles = createStyles(colors);
    const initials = recipientName.split(" ").map((n) => n[0]).join("");

    return (
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
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={[BRAND_COLORS.primaryGreen, BRAND_COLORS.primaryGreenDark]}
                    style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <Text style={styles.recipientNameText}>{recipientName}</Text>

            <View style={styles.amountBadge}>
                <Text style={styles.amountLabel}>PAYABLE AMOUNT</Text>
                <Text style={styles.amountValue}>₹{amount}</Text>
            </View>
        </GlassCard>
    );
};