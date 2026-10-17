import { COLORS, PLATINUM_HEADER } from '@/src/constants/colors';

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
        bgCanvas: COLORS.dark.bg.primary,
        bgGradient: [COLORS.dark.bg.darker, PLATINUM_HEADER.dark, COLORS.dark.bg.primary],
        orbPrimary: "rgba(99, 102, 241, 0.18)", // Indigo glow
        orbSecondary: "rgba(14, 165, 233, 0.12)", // Sky blue glow
        glassBorder: "rgba(255, 255, 255, 0.08)",
        glassBorderSelected: COLORS.dark.accent.sky,
        glassGradient: ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.02)"],
        glassGradientSelected: ["rgba(56, 189, 248, 0.12)", "rgba(14, 165, 233, 0.03)"],
        navBtnBg: "rgba(255, 255, 255, 0.06)",
        amountCardBg: "rgba(15, 23, 42, 0.65)",
        amountCardBorder: "rgba(255, 255, 255, 0.10)",
        textPrimary: COLORS.dark.text.primary,
        textSecondary: COLORS.dark.icon.lighter,
        textMuted: COLORS.dark.text.lighter,
        textSubtle: COLORS.dark.icon.darker,
        footerBorder: "rgba(255, 255, 255, 0.08)",
        unselectedIcon: "rgba(255, 255, 255, 0.25)",
        blurTint: "dark",
    },
    light: {
        bgCanvas: COLORS.light.bg.primary,
        bgGradient: [COLORS.light.bg.canvas, COLORS.light.bg.primary, COLORS.light.bg.darker],
        orbPrimary: "rgba(99, 102, 241, 0.08)",
        orbSecondary: "rgba(14, 165, 233, 0.06)",
        glassBorder: "rgba(0, 0, 0, 0.06)",
        glassBorderSelected: COLORS.light.accent.sky,
        glassGradient: ["rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.60)"],
        glassGradientSelected: ["rgba(14, 165, 233, 0.10)", "rgba(14, 165, 233, 0.02)"],
        navBtnBg: "rgba(0, 0, 0, 0.04)",
        amountCardBg: "rgba(255, 255, 255, 0.80)",
        amountCardBorder: "rgba(0, 0, 0, 0.08)",
        textPrimary: COLORS.light.text.primary,
        textSecondary: COLORS.light.icon.darker,
        textMuted: COLORS.light.text.lighter,
        textSubtle: COLORS.light.text.placeholder,
        footerBorder: "rgba(0, 0, 0, 0.06)",
        unselectedIcon: "rgba(0, 0, 0, 0.25)",
        blurTint: "light",
    },
};

export const BRAND_COLORS = {
    // CTA slate fill (legacy key name; keep in sync with COLORS.brand — NOT emerald)
    primaryGreen: COLORS.light.brand.primary,
    primaryGreenDark: COLORS.light.brand.darker,
    primaryGreenLight: COLORS.light.brand.lighter,
    // Selection / sky accent (use for VPA / UPI checkmarks — not primaryGreen)
    accentBlue: COLORS.light.accent.sky,
    accentBlueDark: COLORS.dark.accent.sky,
    // True emerald success status
    greenIncrease: COLORS.light.status.success,
};
