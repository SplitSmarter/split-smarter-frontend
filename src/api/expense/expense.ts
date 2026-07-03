import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    AddExpenseRequest,
    AddExpenseResponse,
    ExpenseDetailsBasicResponse,
    ExpenseDetailsResponse
} from "@/src/api/dto/expense/expense";
import qs from 'qs'; // Recommended for handling clean array serialization

const BASE_PATH = "/expense/v1"; // Adjust path if you append API versions like /expense/v1

/**
 * Creates a new expense entry (Supports both ITEM and TRANSFER types)
 */
export const AddExpenseApi = async (data: AddExpenseRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddExpenseResponse>>(
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
 * Fetches a single detailed expense layout record by its specific context identity
 */
export const getExpenseByIdApi = async (expenseId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseDetailsResponse>>(
            `${BASE_PATH}/${expenseId}`
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data
            };
        }
        throw new Error("Invalid Response Schema encountered during single expense extraction.");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export interface ListExpensesQueryParams {
    start_date?: string; // YYYY-MM-DD
    end_date?: string;   // YYYY-MM-DD
    is_scheduled?: boolean;
    status?: string[];   // Maps directly to API alias="status"
    expense_type?: string[];
    group_id?: number[];
    category_id?: number[];
    place_id?: number[];
    offset?: number;
    limit?: number;
}

/**
 * Retrieves a paginated matrix tracking historical expenses the authenticated user is involved in
 */
export const listUserExpensesApi = async (params: ListExpensesQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<ExpenseDetailsBasicResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date,
                    is_scheduled: params.is_scheduled,
                    status: params.status,
                    expense_type: params.expense_type,
                    group_id: params.group_id,
                    category_id: params.category_id,
                    place_id: params.place_id,
                    offset: params.offset ?? 0,
                    limit: params.limit ?? 20
                },
                paramsSerializer: (p) => {
                    return qs.stringify(p, { arrayFormat: 'repeat' });
                }
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination
            };
        }
        throw new Error("Invalid Response Schema returned during historical expenses listing parsing.");
    } catch (error: any) {
        return handleApiError(error);
    }
};