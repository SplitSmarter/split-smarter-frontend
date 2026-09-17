import {RelationshipDetails} from "@/src/api/dto/user/relationship";
import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";
import {ExpenseItemResponse} from "@/src/api/dto/expense/item";

export enum SystemDefaultKey {
    RELATIONSHIP = "relationship",
    CATEGORY = "category",
    EXPENSE_ITEM = "expense_item",
}

export interface GetSystemDefaultsParams {
    keys?: SystemDefaultKey[];
}

// Update this interface based on the actual fields returned by your SystemDefaultsResponse backend model
export interface SystemDefaultsResponse {
    relationship?: RelationshipDetails;
    category?: GroupCategoryDetails;
    expense_item?: ExpenseItemResponse;
}