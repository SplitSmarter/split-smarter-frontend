import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse, PaginationResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    UserMerchantCreate,
    UserMerchantResponse,
    UserMerchantDetails,
    UserMerchantUpdate,
    SearchMerchantsQueryParams,
} from "@/src/api/dto/expense/merchant";

const BASE_PATH = "/expense/merchant/v1"; // Update prefix if using a specific route like /expense/v1/merchants

/**
 * Creates a new merchant for the authenticated user.
 */
export const CreateMerchantApi = async (data: UserMerchantCreate) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<UserMerchantResponse>>(
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
 * Searches and lists merchants (both custom and system catalog).
 */
export const SearchMerchantsApi = async (params?: SearchMerchantsQueryParams) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<UserMerchantDetails[]>>(
            `${BASE_PATH}/`,
            { params }
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
 * Retrieves details for a specific merchant by ID.
 */
export const GetMerchantByIdApi = async (merchantId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<UserMerchantDetails>>(
            `${BASE_PATH}/${merchantId}`
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
 * Updates an existing merchant's details by ID.
 */
export const UpdateMerchantApi = async (
    merchantId: number,
    data: UserMerchantUpdate
) => {
    try {
        const res = await axiosUserInstance.put<SuccessResponse<UserMerchantDetails>>(
            `${BASE_PATH}/${merchantId}`,
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
 * Deletes a merchant by ID.
 */
export const DeleteMerchantApi = async (merchantId: number) => {
    try {
        const res = await axiosUserInstance.delete<SuccessResponse<null>>(
            `${BASE_PATH}/${merchantId}`
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