import {BasicUserDetails} from "@/src/api/dto/user/user";
import {SearchScope} from "@/src/api/dto/expense/constant";
import {ExpenseItemSource} from "@/src/api/dto/constants";
import {BasicImage} from "@/src/api/dto/user/asset";

export type Currency = string; // Replaced with your app's standard Currency string/enum

// Request DTOs
export interface AddExpenseItemRequest {
    title: string;
    description?: string | null;
    cost: number;
    currency?: Currency;
    category_ref: string;
    is_quantifiable?: boolean;
    unit_of_measure?: string | null;
    icon_asset_id?: string | null;
}

export interface SearchExpenseItemRequest {
    query: string;
    scope?: SearchScope;
    limit?: number;
    offset?: number;
}

export interface UpdateExpenseItemRequest {
    title?: string | null;
    description?: string | null;
    cost?: number | null;
    currency?: Currency | null;
    is_quantifiable?: boolean | null;
    unit_of_measure?: string | null;
    icon_asset_id?: string | null;
}

export interface ListUserExpenseItemsQueryParams {
    source_type?: ExpenseItemSource[];
    offset?: number;
    limit?: number;
}

// Response DTOs
export interface AddExpenseItemResponse {
    id: number;
    item_ref?: string | null;
    category_ref: string;
    parent_item_id?: number | null;
    title: string;
    description?: string | null;
    cost: number;
    currency: Currency;
    is_quantifiable: boolean;
    unit_of_measure?: string | null;
    item_type: ExpenseItemSource;
    owner_id?: number | null;
    icon?: BasicImage | null;
    created_on: string; // ISO DateTime string
}

export interface ExpenseItemResponse {
    id: number;
    item_ref?: string | null;
    category_ref: string;
    title: string;
    description?: string | null;
    cost: number;
    currency: Currency;
    is_quantifiable: boolean;
    unit_of_measure?: string | null;
    item_type: ExpenseItemSource;
    owner?: BasicUserDetails | null;
    icon?: BasicImage | null;
    created_on: string; // ISO DateTime string
}

export interface SearchExpenseItemResult {
    id?: number | null;
    item_ref: string;
    category_ref: string;
    title: string;
    description?: string | null;
    cost: number;
    currency: Currency;
    unit_of_measure?: string | null;
    source_type: ExpenseItemSource;
    icon?: BasicImage | null;
}

export interface SearchExpenseItemResponse {
    custom_items: SearchExpenseItemResult[];
    master_items: SearchExpenseItemResult[];
    total_custom_count: number;
    total_master_count: number;
}