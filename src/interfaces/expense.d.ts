import {
    ExpenseCategoryType,
    CurrencyType,
    RelationWithUserType,
    ExpenseComponentType,
    ExpenseServiceType,
    ExpenseItemType
} from '@/src/constants/expense'
import {IconIdentifierType} from "@/src/constants/icons";
import {ImageHostType} from "@/src/constants/images";

export interface UserPaidByDto {
    user_id: number;
    user_type: RelationWithUserType;
    contribution_pct: number;
}

export interface UserContributorsDto {
    user_id: number;
    user_type: RelationWithUserType;
    contribution_pct: number;
}

export interface ServiceComponentDto {
    type: ExpenseComponentType.service;
    id: number;
    currency: CurrencyType;
    cost: number;
}

export interface TransferComponentDto {
    type: ExpenseComponentType.transfer;
    user_id: number;
    user_type: RelationWithUserType;
    amount: number;
    currency: CurrencyType;
}

export interface ItemsComponentDto {
    id: number;
    quantity: number;
    unit_cost: number;
    currency: CurrencyType;
}

export type ItemsBaseComponentDto = {
    type: ExpenseComponentType.item,
    items: ItemsComponentDto[];
}

export type ComponentTypeUnion =
    | ServiceComponentDto
    | TransferComponentDto
    | ItemsBaseComponentDto;

export interface AddExpenseForm {
    name: string;
    expense_type: ExpenseComponentType;
    description?: string;
    paid_by_users: UserPaidByDto[];
    category_id: number;
    group_id?: number;
    currency: CurrencyType;
    dated?: string; // should be UTC format ISO string
    contributors: UserContributorsDto[];
    components: ComponentTypeUnion;
}


export interface GetExpenseCategoryByIdResponse {
    id: number;
    title: string;
    description?: string;
    category_type: ExpenseCategoryType;
    owner_id: number | null;
    icon_name: string;
    icon_identifier: IconIdentifierType;
    expense_count: number;
}

export interface ExpenseCategory {
    id: number;
    title: string;
    description?: string;
    category_type: ExpenseCategoryType;
    owner_id: number | null;
    icon_name: string;
    icon_identifier: IconIdentifierType;
    expense_count: number;
}

export interface Pagination {
    total: number;
    returned: number;
    offset: number;
    limit: number;
}

export interface GetExpenseCategoriesResponse {
    categories: ExpenseCategory[];
    pagination: Pagination;
}

export interface GetExpenseCategoriesParams {
    category_type?: ExpenseCategoryType[];
    offset?: number;
    limit?: number;
}

// expense services
export interface GetExpenseServicesParams {
    category_type?: string[];
    offset?: number;
    limit?: number;
}

export interface ExpenseServiceItem {
    id: number;
    title: string;
    description?: string;
    cost: number;
    service_type: ExpenseServiceType,
    created_on: string;
    icon_name: string;
    icon_identifier: IconIdentifierType;
}

export interface GetExpenseServicesResponse {
    services: ExpenseServiceItem[];
    pagination: {
        total: number;
        returned: number;
        offset: number;
        limit: number;
    };
}

export interface GetExpenseServiceByIdResponse {
    id: number;
    title: string;
    description: string | null;
    cost: number;
    service_type: ExpenseServiceType;
    owner: {
        name: string | null;
    };
    icon_name: string;
    icon_identifier: IconIdentifierType;
    created_on: string;
}

// Expense items

export interface GetExpenseItemsParams {
    category_type?: ExpenseItemType[]; // e.g. ["custom", "default"]
    offset?: number;
    limit?: number;
}

export interface GetExpenseItemsResponse {
    items: ExpenseItem[];
    pagination: {
        total: number;
        returned: number;
        offset: number;
        limit: number;
    };
}

export interface GetExpenseItemByIdResponse {
    id: number;
    title: string;
    description: string;
    cost: number;
    icon_name: string;
    icon_identifier: IconIdentifierType;
    item_type: ExpenseItemType;
    created_on: string;
    owner: {
        name: string | null;
    };
}

export interface ExpenseItem {
    id: number;
    title: string;
    description: string;
    cost: number;
    icon_name: string;
    icon_identifier: IconIdentifierType;
    item_type: ExpenseItemType;
    icon_url: string,
    icon_host: string,
    icon_host_type: ImageHostType,
    created_on: string;
    owner: {
        name: string | null;
    };
}