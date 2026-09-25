import { COLORS } from "@/src/constants/colors";

export const ADD_TRANSACTION_THEME = {
    light: {
        iconColor: COLORS.light.text.contrast,
        brandPrimary: COLORS.light.brand.primary,
        hudBackground: "rgba(0, 0, 0, 0.7)",
    },
    dark: {
        iconColor: COLORS.dark.text.contrast,
        brandPrimary: COLORS.dark.brand.primary,
        hudBackground: "rgba(0, 0, 0, 0.75)",
    },
};

export const TRANSACTION_TABS = [
    { id: 'expense', label: 'Expense' },
    { id: 'transfer', label: 'Transfer' },
] as const;

export type TransactionTabType = typeof TRANSACTION_TABS[number]['id'];