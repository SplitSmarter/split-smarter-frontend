import { COLORS } from "@/src/constants/colors";

export const ADD_TRANSACTION_THEME = {
    light: {
        // Header sits on bg-primary canvas — not a green CTA bar
        iconColor: COLORS.light.icon.primary,
        brandPrimary: COLORS.light.brand.primary,
        hudBackground: "rgba(0, 0, 0, 0.7)",
    },
    dark: {
        iconColor: COLORS.dark.icon.primary,
        brandPrimary: COLORS.dark.brand.primary,
        hudBackground: "rgba(0, 0, 0, 0.75)",
    },
};

export const TRANSACTION_TABS = [
    { id: 'expense', label: 'Add Expense' },
    { id: 'transfer', label: 'Add Transfer' },
] as const;

export type TransactionTabType = typeof TRANSACTION_TABS[number]['id'];