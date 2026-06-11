import {RelationWithUserType} from '@/src/constants/expense';
import {
    ExpenseComponentType,
    ExpenseExtraDetailType,
    ExpenseRecurringPeriod,
    Month,
    PaidTowards,
    Weekday
} from "@/src/api/dto/expense/constant";
import {Currency} from "@/src/api/dto/constants";

export interface ExpensePaidByDto {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
}

export interface ExpenseSharersDto {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
    shared_towards: PaidTowards;
    shared_item_id?: number | null;
}

export interface ExpenseExtraFields {
    details_type: ExpenseExtraDetailType;
    key: string;
    place_id?: number | null;
    text_details?: string | null;
    list_details?: string[] | null;
}

// 3. Date Component Hierarchies (Fixed structural handling)
export interface DateWeekly { weekday: Weekday; }
export interface DateMonthly { day: number; }
export interface DateYearly { day: number; month: Month; }
export interface DateCustom { day: number; }

export type DateComponentUnion = DateWeekly | DateMonthly | DateYearly | DateCustom;

export interface RecurringDateComponent {
    recurring_period: ExpenseRecurringPeriod;
    custom_period_duration?: number | null;
    interval: number;
    selected_values: DateComponentUnion[];
    start_date?: string | null; // ISO Date slice string: YYYY-MM-DD
    end_date?: string | null;   // ISO Date slice string: YYYY-MM-DD
}

export interface DateComponent {
    date?: string | null; // ISO Date slice string: YYYY-MM-DD
    is_recurring: boolean;
    recurring_details?: RecurringDateComponent | null;
}

// 4. Structural Component Implementations
export interface TransferComponentUsers {
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
}

export interface TransferComponentDto {
    type: ExpenseComponentType.transfer; // 👈 Ensure capitalization matches python enum boundaries exactly
    users: TransferComponentUsers[];
    amount: number;
    currency: Currency;
}

export interface ItemComponent {
    id: number;
    quantity: number;
    unit_cost: number;
    currency: Currency;
    shared_between?: ExpenseSharersDto[] | null;
}

export interface ItemsBaseComponentDto {
    type: ExpenseComponentType.item; // 👈 Ensure capitalization matches python enum boundaries exactly
    items: ItemComponent[];
}

export type ComponentTypeUnion =
    | TransferComponentDto
    | ItemsBaseComponentDto;

// 5. Consolidated Parent Target Payload Contract Form Request
export interface AddExpenseRequest {
    expense_type: ExpenseComponentType;
    name: string;
    description?: string | null;
    total_cost: number; // 👈 Fixed: Added required total parameters metrics
    category_id?: number | null;
    default_category_id: number; // 👈 Fixed: Added required fallback context field
    group_id?: number | null;
    place_id?: number | null;
    paid_by_users: ExpensePaidByDto[];
    sharers: ExpenseSharersDto[]; // 👈 Fixed: Synchronized back from contributors structure
    currency: Currency;
    date_details: DateComponent; // 👈 Fixed: Structured nested payload entity block
    extra_fields: ExpenseExtraFields[]; // 👈 Fixed: Appended explicit collection parameter array
    components: ComponentTypeUnion;
    assets?: string[] | null; // Array of UUID strings
}