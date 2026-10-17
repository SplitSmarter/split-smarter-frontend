import qs from "qs";
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse, PaginationResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddExpenseItemRequest,
    AddExpenseItemResponse,
    ExpenseItemResponse,
    ListUserExpenseItemsQueryParams,
    SearchClassificationsRequest,
    SearchClassificationsResponse,
    SearchExpenseItemRequest,
    SearchExpenseItemResponse,
    UpdateExpenseItemRequest,
} from "@/src/api/dto/expense/item";
import {ExpenseItemSource} from "@/src/api/dto/constants";

const BASE_PATH = "/expense/item/v1";

/** @deprecated Use ListUserExpenseItemsApi */
export const GetExpenseItemsApi = async (
    source_type: ExpenseItemSource[] = [ExpenseItemSource.SYSTEM, ExpenseItemSource.CUSTOM],
    offset = 0,
    limit = 100,
) => ListUserExpenseItemsApi({source_type, offset, limit});

/**
 * Creates a new custom expense item for the authenticated user.
 */
export const AddExpenseItemApi = async (data: AddExpenseItemRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddExpenseItemResponse>>(
            `${BASE_PATH}/`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Checks and syncs a default expense item by catalog reference.
 */
export const CheckAndSyncExpenseItemByRefApi = async (itemRef: string) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseItemResponse>>(
            `${BASE_PATH}/exists`,
            {params: {item_ref: itemRef}}
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Lists expense items accessible to the authenticated user.
 */
export const ListUserExpenseItemsApi = async (
    params?: ListUserExpenseItemsQueryParams
) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseItemResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    source_type: params?.source_type ?? [
                        ExpenseItemSource.SYSTEM,
                        ExpenseItemSource.CUSTOM,
                    ],
                    offset: params?.offset ?? 0,
                    limit: params?.limit ?? 100,
                },
                paramsSerializer: (query) => qs.stringify(query, {arrayFormat: "repeat"}),
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Searches local SYSTEM COICOP/CPC taxonomy projections for classification pickers.
 */
export const SearchClassificationsApi = async (data: SearchClassificationsRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<SearchClassificationsResponse>>(
            `${BASE_PATH}/classifications/search`,
            {
                query: data.query ?? '',
                taxonomy_type: data.taxonomy_type,
                limit: data.limit,
                offset: data.offset,
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Searches for custom and/or global master catalog expense items.
 */
export const SearchExpenseItemsApi = async (data: SearchExpenseItemRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<SearchExpenseItemResponse>>(
            `${BASE_PATH}/search`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Fetches an expense item by its unique ID.
 */
export const GetExpenseItemByIdApi = async (itemId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseItemResponse>>(
            `${BASE_PATH}/${itemId}`
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Updates an expense item by its unique ID.
 */
export const UpdateExpenseItemByIdApi = async (
    itemId: number,
    data: UpdateExpenseItemRequest
) => {
    try {
        const res = await axiosUserInstance.patch<SuccessResponse<null>>(
            `${BASE_PATH}/${itemId}`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};