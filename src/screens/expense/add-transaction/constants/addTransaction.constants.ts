export const TRANSACTION_TABS = [
    { id: 'expense', label: 'Add Expense' },
    { id: 'transfer', label: 'Add Transfer' },
] as const;

export type TransactionTabType = typeof TRANSACTION_TABS[number]['id'];