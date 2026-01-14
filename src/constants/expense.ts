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

export const ExpenseComponentType = {
    service: "SERVICE",
    transfer: "TRANSFER",
    item: "ITEM",
} as const;
export type ExpenseComponentType = typeof ExpenseComponentType[keyof typeof ExpenseComponentType];

export const expense_category = {
    custom: "CUSTOM",
    default: "DEFAULT",
} as const;
export type ExpenseCategoryType = (typeof expense_category)[keyof typeof expense_category];

export const expense_service = {
    custom: "CUSTOM",
    default: "DEFAULT",
} as const;
export type ExpenseServiceType = (typeof expense_service)[keyof typeof expense_service];

export const expense_items = {
    custom: "CUSTOM",
    default: "DEFAULT",
} as const;
export type ExpenseItemType = (typeof expense_items)[keyof typeof expense_items];
