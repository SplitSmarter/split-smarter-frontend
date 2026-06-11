import axiosUserInstance from "@/src/api/axiosUserServiceInstance"; // Adjust instance name as per your setup
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    AddExpenseCategoryRequest,
    ExpenseCategoryResponse
} from "@/src/api/dto/expense/category";
import {ExpenseCategorySource} from "@/src/api/dto/constants";

const BASE_PATH = "/expense/category/v1"; // Adjust path based on your backend router prefix

/**
 * Creates a new custom expense category
 */
export const CreateExpenseCategoryApi = async (data: AddExpenseCategoryRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<ExpenseCategoryResponse>>(
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
 * Retrieves all expense categories (Default and Custom)
 */
export const GetExpenseCategoriesApi = async (
    category_type: ExpenseCategorySource[] = [ExpenseCategorySource.DEFAULT, ExpenseCategorySource.CUSTOM],
    offset = 0,
    limit = 100
) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseCategoryResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    category_type, // Axios handles array serialization for Query params
                    offset,
                    limit
                }
            }
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
 * Retrieves a specific expense category by ID
 */
export const GetExpenseCategoryByIdApi = async (categoryId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseCategoryResponse>>(
            `${BASE_PATH}/${categoryId}`
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