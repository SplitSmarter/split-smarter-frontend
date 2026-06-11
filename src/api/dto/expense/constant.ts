// ============================================================================
// Enums & String Literal Fallbacks (Mirrored from python src.constant)
// ============================================================================
export enum PaidTowards {
    TOTAL = "total",
    ITEM = "item",
    // Add other backend enum keys as per your layout
}

export enum ExpenseRecurringPeriod {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
    CUSTOM = "CUSTOM"
}

export enum ExpenseComponentType {
    ITEM = "ITEM",
    TRANSFER = "TRANSFER"
}

export enum ExpenseExtraDetailType {
    LOCATION = "LOCATION",
    METADATA = "METADATA",
    NOTES = "NOTES"
}

export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type Month = "JANUARY" | "FEBRUARY" | "MARCH" | "APRIL" | "MAY" | "JUNE" | "JULY" | "AUGUST" | "SEPTEMBER" | "OCTOBER" | "NOVEMBER" | "DECEMBER";
export type Currency = string; // e.g., "INR", "USD"

