// ============================================================================
// Enums & String Literal Fallbacks (Mirrored from python src.constants)
// ============================================================================
export enum PaidTowards {
    TOTAL = "total",
    ITEM = "item",
    // Add other backend enum keys as per your layout
}

/** Matches backend `ExpenseRecurringPeriod` string values (lowercase). */
export enum ExpenseRecurringPeriod {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly",
    CUSTOM = "custom",
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


/** Matches backend `Weekday` enum values (lowercase). */
export type Weekday =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

/** Matches backend `Month` enum values (lowercase). */
export type Month =
    | "january"
    | "february"
    | "march"
    | "april"
    | "may"
    | "june"
    | "july"
    | "august"
    | "september"
    | "october"
    | "november"
    | "december";

/** Matches backend TransferMode (lowercase string values). */
export enum TransferMode {
    UPI = 'upi',
    CARD = 'card',
    NET_BANKING = 'net_banking',
    CASH = 'cash',
    OTHER = 'other',
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

export enum BudgetPeriod {
    DAILY = "daily",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly",
}

export enum BudgetAudienceType {
    USER = "user",
    USER_SHARED = "user_shared",
    GROUP = "group",
}

export enum BudgetMemberRole {
    OWNER = "owner",
    EDITOR = "editor",
    VIEWER = "viewer",
}

export enum BudgetCapMode {
    SOFT = "soft",
    HARD = "hard",
}

export enum AnalyticsBucket {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
}

export enum AnalyticsGroupBy {
    NONE = "none",
    CATEGORY = "category",
}
