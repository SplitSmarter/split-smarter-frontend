export const CurrencyType = {
    inr: "INR",
    usd: "USD",
    eur: "EUR",
} as const;
export type CurrencyType = typeof CurrencyType[keyof typeof CurrencyType];

export const RelationWithUserType = {
    user: "USERS",
    custom: "CUSTOM",
} as const;
export type RelationWithUserType = typeof RelationWithUserType[keyof typeof RelationWithUserType];

export const expense_category = {
    custom: "CUSTOM",
    default: "DEFAULT",
} as const;
export type ExpenseCategoryType = (typeof expense_category)[keyof typeof expense_category];

export const expense_items = {
    custom: "CUSTOM",
    default: "DEFAULT",
} as const;
export type ExpenseItemType = (typeof expense_items)[keyof typeof expense_items];

