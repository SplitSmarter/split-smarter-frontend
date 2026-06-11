// src/api/user/customUserApi.ts

import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    CustomUserDetails,
    AddCustomUserRequest,
    AddCustomUserResponse,
    UpdateCustomUserRequest,
    UpdateCustomUserResponse
} from "@/src/api/dto/user/custom_user";

const BASE_PATH = "/user/custom/v1"; // Custom Users Router Prefix

/**
 * List all custom users created by the authenticated user
 */
export const listCustomUsersApi = async (params: { offset?: number; limit?: number } = {}) => {
    const {offset = 0, limit = 100} = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<CustomUserDetails[]>>(
            `${BASE_PATH}/`,
            {params: {offset, limit}}
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Create a new custom user and link them to a relationship
 */
export const createCustomUserApi = async (data: AddCustomUserRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddCustomUserResponse>>(
            `${BASE_PATH}/`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Get detailed information for a specific custom user (including groups and relations)
 */
export const getCustomUserDetailsApi = async (customUserId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<CustomUserDetails>>(
            `${BASE_PATH}/${customUserId}`
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Update custom user details (e.g., change name)
 */
export const updateCustomUserApi = async (customUserId: number, data: UpdateCustomUserRequest) => {
    try {
        // Note: Backend currently returns raw JSON for update, mapping to consistent SuccessResponse locally
        const res = await axiosUserInstance.patch<UpdateCustomUserResponse>(
            `${BASE_PATH}/${customUserId}`,
            data
        );

        if (res.data) {
            return {
                message: "Custom user updated successfully",
                data: res.data
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};