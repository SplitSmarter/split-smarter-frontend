import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {AddExpenseItemRequest, AddExpenseItemResponse, ExpenseItemResponse, UpdateExpenseItemRequest} from "@/src/api/dto/expense/item";
import {ExpenseItemSource} from "@/src/api/dto/constants";

const BASE_PATH = "/expense/item/v1";

/**
 * Creates a new custom expense item
 */
export const CreateExpenseItemApi = async (data: AddExpenseItemRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddExpenseItemResponse>>(
            `${BASE_PATH}/`,
            data
        );

        if (res.data?.success) {
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
 * Retrieves expense items based on source type (Default/Custom)
 */
export const GetExpenseItemsApi = async (
    source_type: ExpenseItemSource[] = [ExpenseItemSource.DEFAULT, ExpenseItemSource.CUSTOM],
    offset = 0,
    limit = 100
) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseItemResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    source_type, // Backend expects source_type as Query List
                    offset,
                    limit
                },
                // Use bracket-less serialization to match FastAPI Query list: ?source_type=custom&source_type=default
                paramsSerializer: { indexes: null }
            }
        );

        if (res.data?.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination // Backend returns pagination object
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Retrieves a specific expense item by ID
 */
export const GetExpenseItemByIdApi = async (itemId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseItemResponse>>(
            `${BASE_PATH}/${itemId}`
        );

        if (res.data?.success) {
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
 * Updates an existing expense item (Custom items only)
 */
export const UpdateExpenseItemApi = async (itemId: number, data: UpdateExpenseItemRequest) => {
    try {
        const res = await axiosUserInstance.patch<SuccessResponse<null>>(
            `${BASE_PATH}/${itemId}`,
            data
        );

        if (res.data?.success) {
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