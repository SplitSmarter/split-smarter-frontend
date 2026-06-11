// ============================================================================
// Sub-DTO Core Interface Schemas
// ============================================================================
import {RelationWithUserType} from "@/src/api/dto/constants";
import {
    Currency,
    ExpenseComponentType,
    ExpenseExtraDetailType,
    ExpenseRecurringPeriod,
    Month,
    PaidTowards,
    Weekday
} from "@/src/api/dto/expense/constant";

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
// Item Components Structs
// ============================================================================
export interface ItemComponent {
    id: number;
    quantity: number;
    unit_cost: number;
    currency: Currency;
    shared_between: ExpenseItemSharer[] | null; // we are not using it currently so ensure we pass null always
}

export interface ItemsComponent {
    type: ExpenseComponentType.ITEM;
    items: ItemComponent[];
}

export type ComponentTypeUnion = TransferComponent | ItemsComponent;
// ============================================================================
// Main Payload Request / Response Operations
// ============================================================================
export interface AddExpenseRequest {
    expense_type: ExpenseComponentType;
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
    components: ComponentTypeUnion;
    assets: string[] | null; // UUID mapped to standard strings arrays
}

// Group Framework Error Schemas
export interface BasicGroupDetails {
    id: number;
    title: string;
    avatar_url?: string;
}

export interface BasicUserDetails {
    id: number;
    name: string;
    email?: string;
}

export interface InvalidGroupMembershipDetails {
    group: BasicGroupDetails;
    invalid_users: BasicUserDetails[];
}

export interface AddExpenseResponse {
    id: number;
    name: string;
    total_cost: number;
}