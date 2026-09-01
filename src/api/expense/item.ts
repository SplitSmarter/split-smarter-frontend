import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse, PaginationResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddExpenseItemRequest,
    AddExpenseItemResponse,
    ExpenseItemResponse,
    ListUserExpenseItemsQueryParams,
    SearchExpenseItemRequest,
    SearchExpenseItemResponse,
    UpdateExpenseItemRequest,
} from "@/src/api/dto/expense/item";

const BASE_PATH = "expense/item/v1"; // Update prefix if using a specific route like /expense/v1

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
            {params}
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