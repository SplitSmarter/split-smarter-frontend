import {BasicUserDetails} from "@/src/api/dto/user/user";
import {BasicImage} from "@/src/api/dto/user/asset";
import {ExpenseItemSource} from "@/src/api/dto/constants";

export interface AddExpenseItemRequest {
    title: string;
    description?: string | null;
    cost: number;
    icon_asset_id: string; // UUID
}

export interface AddExpenseItemResponse {
    id: number;
    title: string;
    description: string | null;
    cost: number;
    item_type: string;
    owner_id: BasicUserDetails | null;
    icon: BasicImage;
    created_on: string; // ISO Date string
}

export interface UpdateExpenseItemRequest {
    title?: string;
    description?: string;
    cost?: number;
    icon_asset_id?: string; // UUID
}

export interface ExpenseItemResponse {
    id: number;
    title: string;
    description: string | null;
    cost: number;
    item_type: ExpenseItemSource;
    owner: BasicUserDetails | null;
    icon: BasicImage;
    created_on: string; // ISO Date string
}