import React from "react";
import { View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface GlassCardProps {
    children: React.ReactNode;
    colors: ThemeColors;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    isSelected?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
                                                        children,
                                                        colors,
                                                        style,
                                                        contentStyle,
                                                        isSelected,
                                                    }) => {
    const styles = createStyles(colors);

    return (
        <View style={[styles.glassBase, isSelected && styles.glassSelected, style]}>
            <BlurView intensity={35} tint={colors.blurTint} style={{ width: "100%" }}>
                <LinearGradient
                    colors={isSelected ? colors.glassGradientSelected : colors.glassGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.glassContent, contentStyle]}
                >
                    {children}
                </LinearGradient>
            </BlurView>
        </View>
    );
};