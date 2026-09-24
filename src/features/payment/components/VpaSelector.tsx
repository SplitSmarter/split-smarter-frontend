import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { VpaOption } from "../types/payment";
import { BRAND_COLORS, ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface VpaSelectorProps {
    vpas: VpaOption[];
    selectedVpaId: string;
    colors: ThemeColors;
    onSelect: (id: string) => void;
}

export const VpaSelector: React.FC<VpaSelectorProps> = ({
                                                            vpas,
                                                            selectedVpaId,
                                                            colors,
                                                            onSelect,
                                                        }) => {
    const styles = createStyles(colors);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>SELECT RECIPIENT VPA / UPI ID</Text>
            {vpas.map((vpaItem) => {
                const isSelected = selectedVpaId === vpaItem.id;
                return (
                    <TouchableOpacity
                        key={vpaItem.id}
                        onPress={() => onSelect(vpaItem.id)}
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
                                <Text style={styles.primaryCardText}>{vpaItem.vpa}</Text>
                                <View style={styles.subCardRow}>
                                    <Text style={styles.subCardText}>
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
    );
};