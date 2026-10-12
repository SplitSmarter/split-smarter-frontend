import {Currency, RelationWithUserType} from "@/src/api/dto/constants";
import {
    ExpenseComponentType,
    ExpenseExtraDetailType,
    ExpenseRecurringPeriod,
    ExpenseStatus,
    Month,
    PaidTowards,
    Weekday
} from "@/src/api/dto/expense/constant";
import {BasicUserDetails} from "@/src/api/dto/user/user";
import {BasicImage} from "@/src/api/dto/user/asset";
import {BaseGroupDetails} from "@/src/api/dto/user/group";
import {MemoryBasicDetails} from "@/src/api/dto/user/memory";
import {LocationDetails} from "@/src/api/dto/user/place";

export interface ExpenseSharersDto {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
    shared_towards: PaidTowards;
    shared_item_id: number | null;
}

export interface ExpensePaidByDto {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
}

export interface ExpenseItemSharer {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
}

export interface ExpenseExtraFields {
    details_type: ExpenseExtraDetailType;
    key: string;
    place_id: number | null;
    text_details: string | null;
    list_details: string[] | null;
}

export interface TransferComponentUsers {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
}

export interface TransferComponent {
    type: ExpenseComponentType.TRANSFER;
    users: TransferComponentUsers[];
    amount: number;
    currency: Currency;
}

// ============================================================================
// Date Layout Component Polymorphic Unions
// ============================================================================
export interface DateWeekly {
    weekday: Weekday;
}

export interface DateMonthly {
    day: number;
}

export interface DateYearly {
    day: number;
    month: Month;
}

export interface DateCustom {
    day: number;
}

export type DateComponentUnion = DateWeekly | DateMonthly | DateYearly | DateCustom;

export interface RecurringDateComponent {
    recurring_period: ExpenseRecurringPeriod;
    custom_period_duration: number | null;
    interval: number;
    selected_values: DateComponentUnion[];
    start_date: string | null; // ISO Date String: YYYY-MM-DD
    end_date: string | null;   // ISO Date String: YYYY-MM-DD
}

export interface DateComponent {
    expense_date: string | null;       // ISO Date String: YYYY-MM-DD
    is_recurring: boolean;
    recurring_details: RecurringDateComponent | null;
}

// ============================================================================
// Line items (matches backend ItemComponent / AddExpenseRequest.line_items)
// ============================================================================
export interface ItemComponent {
    /** Catalog / user expense item id — prefer expense_item_id; backend aliases either. */
    id?: number | null;
    expense_item_id?: number | null;
    quantity: number;
    unit_cost?: number | null;
    unit_price?: number | null;
    currency: Currency;
    shared_between: ExpenseItemSharer[] | null; // unused for now — always null
}

/** @deprecated Prefer flat line_items on AddExpenseRequest */
export interface ItemsComponent {
    type: ExpenseComponentType.ITEM;
    items: ItemComponent[];
}

export type ComponentTypeUnion = TransferComponent | ItemsComponent;
// ============================================================================
// Main Payload Request / Response Operations
// ============================================================================
export interface AddExpenseRequest {
    name: string; // TitleField constraint
    description: string | null; // DescriptionField constraint
    total_cost: number;
    category_id: number | null;
    default_category_id: number;
    group_id: number | null;
    place_id: number | null;
    paid_by_users: ExpensePaidByDto[];
    sharers: ExpenseSharersDto[];
    currency: Currency;
    date_details: DateComponent;
    extra_fields: ExpenseExtraFields[];
    line_items: ItemComponent[];
    assets: string[] | null; // UUID mapped to standard strings arrays
    /** When true with group_id, server adds non-member participants before create. */
    add_missing_members_to_group?: boolean;
}

export interface AddExpenseResponse {
    id: number;
    name: string;
    total_cost: number;
}

export interface ExpenseCategoryBasicResponse {
    id: number;
    title: string;
    icon: BasicImage;
}

export interface ExchangeRateDetails {
    INR: number;
    USD: number;
    EUR: number;
    CAD: number;
    GBP: number;
}

export interface ExpenseDetailsBasicResponse {
    id: number;
    name: string;
    status: ExpenseStatus;
    expense_type: ExpenseComponentType;
    expense_date: string;
    total_amount: number;
    currency: Currency;
    category: ExpenseCategoryBasicResponse;
    exchange_rate: ExchangeRateDetails | null;
    memory: MemoryBasicDetails | null;
    paid_by_users: ExpensePaidByDetail[];
    sharers: ExpenseSharerDetail[];
    /** Viewer's sharer amount (split share / spend). */
    user_share: number | null;
    /** Viewer's paid_by amount (cash put in). */
    user_paid: number | null;
    /** Signed position: user_paid - user_share. */
    user_net: number | null;
    group: BaseGroupDetails | null;
    place: LocationDetails | null;
    is_scheduled_blueprint: boolean;
    has_attachment: boolean;
    is_user_settled: boolean;
}

export interface ExpensePaidByDetail extends BasicUserDetails {
    amount: number;
}

export interface ExpenseSharerDetail extends BasicUserDetails {
    amount: number;
}

// Discriminator types organizing custom backend payload expansions
export interface ExpenseFieldPlaceDetails {
    detail_type: ExpenseExtraDetailType.PLACE;
    place_id: number;
    description: string;
}

export interface ExpenseFieldTextDetails {
    detail_type: ExpenseExtraDetailType.TEXT;
    description: string;
}

export interface ExpenseFieldListDetails {
    detail_type: ExpenseExtraDetailType.LIST;
    details: string[];
    description: string;
}

export type ExpenseFieldUnion = ExpenseFieldPlaceDetails | ExpenseFieldTextDetails | ExpenseFieldListDetails;

export interface ExpenseExtraFieldDetail {
    detail_type: ExpenseExtraDetailType;
    key: string;
    details: ExpenseFieldUnion | null;
}

export interface ScheduledBlueprintDetail {
    recurring_period: ExpenseRecurringPeriod;
    custom_period_duration: number | null;
    interval: number;
    selected_values: Record<string, any>[] | null;
    start_date: string;
    end_date: string | null;
    next_run_date: string | null;
    last_expenses: ExpenseDetailsBasicResponse[] | null;
    is_active: boolean;
}

// Master Response Structure
export interface ExpenseDetailsResponse extends ExpenseDetailsBasicResponse {
    description: string | null;
    assets: BasicImage[];
    created_by: BasicUserDetails;
    created_at: string; // ISO DateTime footprint
    updated_at: string; // ISO DateTime footprint

    extra_details: ExpenseExtraFieldDetail[];
    schedule_blueprint: ScheduledBlueprintDetail | null;
}
