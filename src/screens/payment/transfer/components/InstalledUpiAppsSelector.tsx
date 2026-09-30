import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "./GlassCard";
import { UPIInstalledApp } from "@/src/utils/upiNativeModule";
import { BRAND_COLORS, ThemeColors } from "../constants/theme";
import { createStyles } from "../styles/UserPaymentTransferScreen.styles";

interface InstalledUpiAppsSelectorProps {
    upiApps: UPIInstalledApp[];
    selectedApp: UPIInstalledApp | null;
    colors: ThemeColors;
    onSelectApp: (app: UPIInstalledApp) => void;
}

export const InstalledUpiAppsSelector: React.FC<InstalledUpiAppsSelectorProps> = ({
                                                                                      upiApps,
                                                                                      selectedApp,
                                                                                      colors,
                                                                                      onSelectApp,
                                                                                  }) => {
    const styles = createStyles(colors);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>SELECT UPI PAYMENT APP</Text>
            {upiApps.length === 0 ? (
                <GlassCard colors={colors}>
                    <View style={styles.emptyUpiContainer}>
                        <Text style={styles.emptyUpiText}>
                            No supported UPI payment apps found on this device.
                        </Text>
                    </View>
                </GlassCard>
            ) : (
                upiApps.map((app) => {
                    const isSelected = selectedApp?.packageName === app.packageName;
                    return (
                        <TouchableOpacity
                            key={app.packageName}
                            onPress={() => onSelectApp(app)}
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
                                {app.icon ? (
                                    <Image
                                        source={{ uri: app.icon }}
                                        style={[styles.appIconImage, { marginRight: 12 }]}
                                    />
                                ) : (
                                    <View style={[styles.appIconPlaceholder, { marginRight: 12 }]} />
                                )}
                                <View style={{ flex: 1, justifyContent: "center" }}>
                                    <Text style={styles.primaryCardText}>{app.name}</Text>
                                    <Text style={styles.subCardText}>Tap to pay with {app.name}</Text>
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    );
                })
            )}
        </View>
    );
};