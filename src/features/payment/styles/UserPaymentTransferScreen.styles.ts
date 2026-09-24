import { StyleSheet } from "react-native";
import { BRAND_COLORS, ThemeColors } from "@/src/features/payment/constants/theme";

export const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bgCanvas,
        },
        gradientBg: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        orbTopRight: {
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 110,
            opacity: 0.8,
            top: -40,
            right: -40,
            backgroundColor: colors.orbPrimary,
        },
        orbBottomLeft: {
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 110,
            opacity: 0.8,
            top: 220,
            left: -60,
            backgroundColor: colors.orbSecondary,
        },
        contentContainer: {
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
        },
        sectionTitle: {
            fontSize: 11,
            fontWeight: "700",
            color: colors.textMuted,
            letterSpacing: 1,
            marginBottom: 10,
            paddingLeft: 4,
        },
        // GlassCard Styles
        glassBase: {
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.glassBorder,
            marginBottom: 12,
        },
        glassSelected: {
            borderColor: colors.glassBorderSelected,
            shadowColor: BRAND_COLORS.primaryGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
        },
        glassContent: {
            padding: 16,
        },
        // Header Navigation
        headerNav: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        iconBtn: {
            borderRadius: 20,
            overflow: "hidden",
        },
        iconBlur: {
            padding: 10,
            borderRadius: 20,
            backgroundColor: colors.navBtnBg,
        },
        headerTitle: {
            fontSize: 17,
            fontWeight: "700",
            color: colors.textPrimary,
            letterSpacing: 0.3,
        },
        // Recipient Header Card
        avatarContainer: {
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
        },
        avatarText: {
            fontSize: 26,
            fontWeight: "800",
            color: "#FFFFFF",
        },
        recipientNameText: {
            fontSize: 21,
            fontWeight: "700",
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: 16,
        },
        amountBadge: {
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 18,
            backgroundColor: colors.amountCardBg,
            borderWidth: 1,
            borderColor: colors.amountCardBorder,
            minWidth: 180,
        },
        amountLabel: {
            fontSize: 10,
            fontWeight: "700",
            color: colors.textMuted,
            letterSpacing: 1.2,
            textAlign: "center",
            marginBottom: 4,
        },
        amountValue: {
            fontSize: 32,
            fontWeight: "800",
            color: colors.textPrimary,
            textAlign: "center",
        },
        // List Card Common Row
        cardRow: {
            flexDirection: "row",
            alignItems: "center",
        },
        iconCheckWrapper: {
            marginRight: 12,
            justifyContent: "center",
        },
        primaryCardText: {
            fontSize: 15,
            fontWeight: "600",
            color: colors.textPrimary,
        },
        subCardRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
        },
        subCardText: {
            fontSize: 12,
            color: colors.textMuted,
        },
        addBankBtn: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 6,
        },
        addBankText: {
            fontSize: 13,
            fontWeight: "600",
            color: BRAND_COLORS.primaryGreenLight,
            marginLeft: 8,
        },
        // Footer
        footerContainer: {
            borderTopWidth: 1,
            borderTopColor: colors.footerBorder,
            overflow: "hidden",
        },
        footerBlur: {
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 24,
        },
        securityRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 4,
        },
        securityText: {
            fontSize: 11,
            fontWeight: "600",
            color: colors.textSecondary,
            marginLeft: 6,
        },
        policyText: {
            fontSize: 10,
            color: colors.textSubtle,
            textAlign: "center",
            marginBottom: 14,
        },
        payBtnGradient: {
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: BRAND_COLORS.primaryGreen,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
        },
        payBtnTextWrapper: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
        },
        payBtnText: {
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "700",
            letterSpacing: 0.5,
        },
    });