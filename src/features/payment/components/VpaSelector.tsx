import React from "react";
import {View, Text, TouchableOpacity} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {GlassCard} from "./GlassCard";
import {UserPaymentAccountItemDTO, UPIRegistrySummaryDTO} from "@/src/api/dto/user_payments/account";
import {BRAND_COLORS, ThemeColors} from "../constants/theme";
import {createStyles} from "../styles/UserPaymentTransferScreen.styles";

interface VpaSelectorProps {
    accounts: UserPaymentAccountItemDTO[];
    selectedAccount: UserPaymentAccountItemDTO | null;
    colors: ThemeColors;
    onSelect: (account: UserPaymentAccountItemDTO) => void;
}

export const VpaSelector: React.FC<VpaSelectorProps> = ({
                                                            accounts,
                                                            selectedAccount,
                                                            colors,
                                                            onSelect,
                                                        }) => {
    const styles = createStyles(colors);

    if (!accounts || accounts.length === 0) return null;

    return (
        <View style={{marginBottom: 16}}>
            <Text style={styles.sectionTitle}>SELECT RECEIVING ACCOUNT</Text>
            {accounts.map((account) => {
                const isSelected = selectedAccount?.mapping_id === account.mapping_id;
                const upiData = account.registry_details as UPIRegistrySummaryDTO;
                const providerName = account.provider?.display_name || "UPI Account";
                const vpa = upiData?.vpa || "N/A";

                return (
                    <TouchableOpacity
                        key={account.mapping_id}
                        onPress={() => onSelect(account)}
                        activeOpacity={0.9}
                    >
                        <GlassCard
                            colors={colors}
                            isSelected={isSelected}
                            style={{marginBottom: 10}}
                            contentStyle={styles.cardRow}
                        >
                            <View style={styles.iconCheckWrapper}>
                                <Ionicons
                                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                    size={22}
                                    color={isSelected ? BRAND_COLORS.primaryGreen : colors.unselectedIcon}
                                />
                            </View>
                            <View style={{flex: 1, justifyContent: "center"}}>
                                <Text style={styles.primaryCardText}>{providerName}</Text>
                                <View style={styles.subCardRow}>
                                    <Text style={styles.subCardText}>VPA: {vpa}</Text>
                                    {account.is_active && (
                                        <MaterialCommunityIcons
                                            name="check-decagram"
                                            size={15}
                                            color={BRAND_COLORS.greenIncrease}
                                            style={{marginLeft: 4}}
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