// ============================================================================
// Enums & String Literal Fallbacks (Mirrored from python src.constants)
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

export enum ExpenseItemSource {
    CUSTOM = "CUSTOM",
    SYSTEM = "SYSTEM",
}

export enum SearchScope {
    ALL = "ALL",
    CUSTOM = "CUSTOM",
    GLOBAL = "GLOBAL",
}


export enum ExpenseComponentType {
    ITEM = "ITEM",
    TRANSFER = "TRANSFER"
}

export enum ExpenseExtraDetailType {
    PLACE = "PLACE",
    TEXT = "TEXT",
    LIST = "LIST"
}


export enum ExpenseStatus {
    ACTIVE = "ACTIVE",
    DELETED = "DELETED",
}


export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type Month = "JANUARY" | "FEBRUARY" | "MARCH" | "APRIL" | "MAY" | "JUNE" | "JULY" | "AUGUST" | "SEPTEMBER" | "OCTOBER" | "NOVEMBER" | "DECEMBER";

export enum TransferMode {
    CASH = "CASH",
    UPI = "UPI",
    CARD = "CARD",
    NET_BANKING = "NET_BANKING",
    OTHER = "OTHER"
}

export enum UserMerchantSource {
    MANUAL = "MANUAL",
    BANK_SYNC = "BANK_SYNC",
    OCR = "OCR",
    SYSTEM = "SYSTEM",
}

export enum UserMerchantLocationSource {
    MANUAL = "MANUAL",
    SYSTEM = "SYSTEM"
}
