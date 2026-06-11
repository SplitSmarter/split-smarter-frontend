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