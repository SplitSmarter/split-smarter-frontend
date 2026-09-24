import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface HeaderNavProps {
    colors: ThemeColors;
    onBack: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ colors, onBack }) => {
    const styles = createStyles(colors);

    const handleBackPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onBack();
    };

    return (
        <View style={styles.headerNav}>
            <TouchableOpacity onPress={handleBackPress} style={styles.iconBtn}>
                <BlurView intensity={30} tint={colors.blurTint} style={styles.iconBlur}>
                    <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                </BlurView>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Send Money</Text>

            <TouchableOpacity style={styles.iconBtn}>
                <BlurView intensity={30} tint={colors.blurTint} style={styles.iconBlur}>
                    <Ionicons name="help-circle-outline" size={20} color={colors.textPrimary} />
                </BlurView>
            </TouchableOpacity>
        </View>
    );
};