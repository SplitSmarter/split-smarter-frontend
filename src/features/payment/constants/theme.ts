type GradientColors = readonly [string, string, ...string[]];

export interface ThemeColors {
    bgCanvas: string;
    bgGradient: GradientColors;
    orbPrimary: string;
    orbSecondary: string;
    glassBorder: string;
    glassBorderSelected: string;
    glassGradient: GradientColors;
    glassGradientSelected: GradientColors;
    navBtnBg: string;
    amountCardBg: string;
    amountCardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textSubtle: string;
    footerBorder: string;
    unselectedIcon: string;
    blurTint: "dark" | "light";
}

export const THEME: { dark: ThemeColors; light: ThemeColors } = {
    dark: {
        bgCanvas: "#090D16",
        bgGradient: ["#111827", "#0F172A", "#090D16"],
        orbPrimary: "rgba(99, 102, 241, 0.18)", // Indigo glow
        orbSecondary: "rgba(14, 165, 233, 0.12)", // Sky blue glow
        glassBorder: "rgba(255, 255, 255, 0.08)",
        glassBorderSelected: "#38BDF8", // Vibrant Sky Blue highlight for selected items
        glassGradient: ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.02)"],
        glassGradientSelected: ["rgba(56, 189, 248, 0.12)", "rgba(14, 165, 233, 0.03)"],
        navBtnBg: "rgba(255, 255, 255, 0.06)",
        amountCardBg: "rgba(15, 23, 42, 0.65)",
        amountCardBorder: "rgba(255, 255, 255, 0.10)",
        textPrimary: "#F9FAFB",
        textSecondary: "#E5E7EB",
        textMuted: "#9CA3AF",
        textSubtle: "#6B7280",
        footerBorder: "rgba(255, 255, 255, 0.08)",
        unselectedIcon: "rgba(255, 255, 255, 0.25)",
        blurTint: "dark",
    },
    light: {
        bgCanvas: "#F8FAFC",
        bgGradient: ["#FFFFFF", "#F1F5F9", "#E2E8F0"],
        orbPrimary: "rgba(99, 102, 241, 0.08)",
        orbSecondary: "rgba(14, 165, 233, 0.06)",
        glassBorder: "rgba(0, 0, 0, 0.06)",
        glassBorderSelected: "#0284C7",
        glassGradient: ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.60)"],
        glassGradientSelected: ["rgba(14, 165, 233, 0.10)", "rgba(14, 165, 233, 0.02)"],
        navBtnBg: "rgba(0, 0, 0, 0.04)",
        amountCardBg: "rgba(255, 255, 255, 0.80)",
        amountCardBorder: "rgba(0, 0, 0, 0.08)",
        textPrimary: "#0F172A",
        textSecondary: "#334155",
        textMuted: "#64748B",
        textSubtle: "#94A3B8",
        footerBorder: "rgba(0, 0, 0, 0.06)",
        unselectedIcon: "rgba(0, 0, 0, 0.25)",
        blurTint: "light",
    },
};

export const BRAND_COLORS = {
    // Reserved for Call To Action (Pay Button) & Success state only
    primaryGreen: "#10B981",
    primaryGreenDark: "#059669",
    primaryGreenLight: "#34D399",
    accentBlue: "#38BDF8",
    greenIncrease: "#10B981",
};