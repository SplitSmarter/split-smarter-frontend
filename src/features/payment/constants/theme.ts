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
        bgCanvas: "#0C0C0C",
        bgGradient: ["#1A1A1A", "#121212", "#0C0C0C"],
        orbPrimary: "rgba(43, 135, 97, 0.25)",
        orbSecondary: "rgba(34, 108, 78, 0.18)",
        glassBorder: "rgba(255, 255, 255, 0.10)",
        glassBorderSelected: "#32966E",
        glassGradient: ["rgba(255, 255, 255, 0.07)", "rgba(255, 255, 255, 0.02)"],
        glassGradientSelected: ["rgba(43, 135, 97, 0.28)", "rgba(34, 108, 78, 0.10)"],
        navBtnBg: "rgba(255, 255, 255, 0.05)",
        amountCardBg: "rgba(0, 0, 0, 0.35)",
        amountCardBorder: "rgba(255, 255, 255, 0.12)",
        textPrimary: "#F3F4F6",
        textSecondary: "#E5E7EB",
        textMuted: "#9CA3AF",
        textSubtle: "#6B7280",
        footerBorder: "rgba(255, 255, 255, 0.08)",
        unselectedIcon: "rgba(255, 255, 255, 0.3)",
        blurTint: "dark",
    },
    light: {
        bgCanvas: "#F8FAFC",
        bgGradient: ["#FFFFFF", "#F1F5F9", "#E2E8F0"],
        orbPrimary: "rgba(43, 135, 97, 0.12)",
        orbSecondary: "rgba(50, 150, 110, 0.08)",
        glassBorder: "rgba(0, 0, 0, 0.06)",
        glassBorderSelected: "#2B8761",
        glassGradient: ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.60)"],
        glassGradientSelected: ["rgba(43, 135, 97, 0.12)", "rgba(43, 135, 97, 0.04)"],
        navBtnBg: "rgba(0, 0, 0, 0.04)",
        amountCardBg: "rgba(255, 255, 255, 0.70)",
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
    primaryGreen: "#2B8761",
    primaryGreenDark: "#226C4E",
    primaryGreenLight: "#32966E",
    greenIncrease: "#289F32",
};