import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import { AddExpenseRequest, AddExpenseResponse } from "@/src/api/dto/expense/expense";

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