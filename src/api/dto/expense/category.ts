import {BasicImage} from "@/src/api/dto/user/asset";
import {ExpenseCategorySource} from "@/src/api/dto/constants"; // Or just use string

export interface AddExpenseCategoryRequest {
    title: string;
    description?: string;
    icon_asset_id: string; // UUID string
}

export interface ExpenseCategoryResponse {
    id: number;
    title: string;
    description?: string;
    source_type: ExpenseCategorySource;
    owner_id: number | null;
    expense_count: number;
    icon: BasicImage | null;
}

/** Backend SYSTEM / CUSTOM values used by browse + search. */
export type ExpenseCategorySourceApi = 'SYSTEM' | 'CUSTOM';

export interface ExpenseCategoryDescendantItem {
    id: number;
    title: string;
    description?: string | null;
    category_ref?: string | null;
    source_type: ExpenseCategorySourceApi | string;
    level?: number | null;
    icon?: BasicImage | null;
}

export interface ExpenseCategoryCoicopBrowseResponse {
    level: number;
    parents: string[];
    match: string;
    categories: ExpenseCategoryDescendantItem[];
}

export type SearchExpenseCategoryScope = 'ALL' | 'CUSTOM' | 'GLOBAL';

export interface SearchExpenseCategoryRequest {
    query: string;
    scope?: SearchExpenseCategoryScope;
    limit?: number;
    offset?: number;
}

export interface SearchExpenseCategoryResult {
    id: number;
    category_ref?: string | null;
    title: string;
    description?: string | null;
    source_type: ExpenseCategorySourceApi | string;
    icon?: BasicImage | null;
}

export interface SearchExpenseCategoryResponse {
    custom_categories: SearchExpenseCategoryResult[];
    master_categories: SearchExpenseCategoryResult[];
    total_custom_count: number;
    total_master_count: number;
}

export interface BrowseCoicopCategoriesParams {
    level: number;
    parents?: string[];
    match?: 'any' | 'all';
    offset?: number;
    limit?: number;
}