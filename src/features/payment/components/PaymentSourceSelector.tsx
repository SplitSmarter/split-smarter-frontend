import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { PaymentSource } from "../types/payment";
import { BRAND_COLORS, ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface PaymentSourceSelectorProps {
    sources: PaymentSource[];
    selectedSourceId: string;
    colors: ThemeColors;
    onSelect: (id: string) => void;
}

export const PaymentSourceSelector: React.FC<PaymentSourceSelectorProps> = ({
                                                                                sources,
                                                                                selectedSourceId,
                                                                                colors,
                                                                                onSelect,
                                                                            }) => {
    const styles = createStyles(colors);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>PAY USING</Text>
            {sources.map((source) => {
                const isSelected = selectedSourceId === source.id;
                return (
                    <TouchableOpacity
                        key={source.id}
                        onPress={() => onSelect(source.id)}
                        activeOpacity={0.9}
                    >
                        <GlassCard
                            colors={colors}
                            isSelected={isSelected}
                            style={{ marginBottom: 10 }}
                            contentStyle={styles.cardRow}
                        >
                            <View style={styles.iconCheckWrapper}>
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
                                    <Text style={styles.primaryCardText}>
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

            <TouchableOpacity style={styles.addBankBtn} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={20} color={BRAND_COLORS.primaryGreenLight} />
                <Text style={styles.addBankText}>Add Another Bank Account / Card</Text>
            </TouchableOpacity>
        </View>
    );
};