import {
    BudgetAudienceType,
    BudgetCapMode,
    BudgetMemberRole,
    BudgetPeriod,
} from "@/src/api/dto/expense/constant";

export interface BudgetMemberInput {
    user_id: number;
    role?: BudgetMemberRole;
}

export interface AddBudgetRuleRequest {
    name: string;
    amount: number;
    audience_type?: BudgetAudienceType;
    group_id?: number | null;
    cap_mode?: BudgetCapMode;
    /** When true, scope id lists must be empty — budget matches all expenses. */
    applies_to_all?: boolean;
    period?: BudgetPeriod | null;
    /** Multiplier for period (e.g. 1 = every month). Required by API when period is set. */
    period_value?: number | null;
    start_date?: string | null; // YYYY-MM-DD
    end_date?: string | null; // YYYY-MM-DD
    category_ids?: number[];
    merchant_ids?: number[];
    place_ids?: number[];
    memory_ids?: number[];
    members?: BudgetMemberInput[];
}

export interface AddBudgetRuleResponse {
    id: number;
}

export interface UpdateBudgetRuleRequest {
    name?: string | null;
    amount?: number | null;
    cap_mode?: BudgetCapMode | null;
    applies_to_all?: boolean | null;
    update_instances?: boolean | null;
    category_ids?: number[] | null;
    merchant_ids?: number[] | null;
    place_ids?: number[] | null;
    memory_ids?: number[] | null;
}

export interface UpdateBudgetRuleResponse {
    id: number;
    updated_fields: string[];
}

export interface ReplaceBudgetMembersRequest {
    members: BudgetMemberInput[];
}

export interface BudgetMemberItem {
    user_id: number;
    role: BudgetMemberRole;
}

export interface BudgetInstanceDetails {
    id: number;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    amount: number;
}

export interface BudgetFairShareItem {
    user_id: number;
    contribution: number;
    equal_share: number;
    delta: number;
}

/**
 * Breakdown maps are keyed by id. JSON object keys are strings, so numeric ids arrive as strings.
 */
export interface BudgetProgressDetails {
    spent: number;
    remaining: number;
    percent: number;
    by_category: Record<string, number>;
    by_merchant: Record<string, number>;
    by_place: Record<string, number>;
    by_memory: Record<string, number>;
    by_user: Record<string, number>;
    fair_share: BudgetFairShareItem[];
    warnings: string[];
}

export interface BudgetRuleListItem {
    id: number;
    name: string;
    amount: number;
    period: BudgetPeriod | null;
    period_value: number | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    audience_type: BudgetAudienceType;
    group_id: number | null;
    cap_mode: BudgetCapMode;
    applies_to_all?: boolean;
}

export interface BudgetRuleDetails extends BudgetRuleListItem {
    category_ids: number[];
    merchant_ids: number[];
    place_ids: number[];
    memory_ids: number[];
    members: BudgetMemberItem[];
    current_instance: BudgetInstanceDetails | null;
    progress: BudgetProgressDetails | null;
    created_by_id: number;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
}

/** Body for POST /budget/v1/rules/applicable */
export interface ApplicableBudgetsRequest {
    expense_date: string; // ISO datetime
    group_id?: number | null;
    category_id?: number | null;
    place_id?: number | null;
    memory_ids?: number[];
    amount?: number | null;
    currency?: string | null;
}

/** Matching budget rule for a draft expense, with progress + hard-cap projection */
export interface ApplicableBudgetItem extends BudgetRuleListItem {
    current_instance: BudgetInstanceDetails;
    progress: BudgetProgressDetails;
    projected_spent?: number | null;
    would_exceed_hard: boolean;
}
