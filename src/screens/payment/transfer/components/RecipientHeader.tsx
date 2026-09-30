import React from "react";
import {View, Text, Image} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {GlassCard} from "./GlassCard";
import {PayeeEntity} from "../types/payment";
import {BRAND_COLORS, ThemeColors} from "../constants/theme";
import {createStyles} from "../styles/UserPaymentTransferScreen.styles";

interface RecipientHeaderProps {
    payeeEntity: PayeeEntity | null;
    amount: string;
    transactionId: string;
    colors: ThemeColors;
}

export const RecipientHeader: React.FC<RecipientHeaderProps> = ({
                                                                    payeeEntity,
                                                                    amount,
                                                                    transactionId,
                                                                    colors,
                                                                }) => {
    const styles = createStyles(colors);
    const name = payeeEntity?.name || "Paying Recipient";
    const initials = name.charAt(0).toUpperCase();

    return (
        <GlassCard
            colors={colors}
            style={{marginTop: 8, marginBottom: 20, width: "100%"}}
            contentStyle={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 24,
            }}
        >
            <View style={styles.avatarContainer}>
                {payeeEntity?.iconUrl ? (
                    <Image source={{uri: payeeEntity.iconUrl}} style={styles.payeeAvatarImage}/>
                ) : (
                    <>
                        <LinearGradient
                            colors={[BRAND_COLORS.primaryGreen, BRAND_COLORS.primaryGreenDark]}
                            style={{position: "absolute", left: 0, right: 0, top: 0, bottom: 0}}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                        />
                        <Text style={styles.avatarText}>{initials}</Text>
                    </>
                )}
            </View>

            <Text style={styles.recipientNameText}>{name}</Text>

            <View style={styles.amountBadge}>
                <Text style={styles.amountLabel}>TOTAL PAYABLE AMOUNT</Text>
                <Text style={styles.amountValue}>₹{parseFloat(amount).toFixed(2)}</Text>
                {transactionId ? <Text style={styles.txnRefText}>Ref ID: {transactionId}</Text> : null}
            </View>
        </GlassCard>
    );
};