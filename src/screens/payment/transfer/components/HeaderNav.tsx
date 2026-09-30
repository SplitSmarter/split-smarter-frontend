import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface HeaderNavProps {
    colors: ThemeColors;
    onCancel: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ colors, onCancel }) => {
    const styles = createStyles(colors);

    const handleCancelPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onCancel();
    };

    return (
        <View style={styles.headerNav}>
            <TouchableOpacity onPress={handleCancelPress} style={styles.iconBtn}>
                <BlurView intensity={30} tint={colors.blurTint} style={styles.cancelBtnBlur}>
                    <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                </BlurView>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Checkout</Text>

            <TouchableOpacity style={styles.iconBtn}>
                <BlurView intensity={30} tint={colors.blurTint} style={styles.iconBlur}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.textPrimary} />
                </BlurView>
            </TouchableOpacity>
        </View>
    );
};