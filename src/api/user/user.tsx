import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse, PaginationResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {UserProfileResponse, UserSearchResponse} from "@/src/api/dto/user/user";

const BASE_PATH = "/user/v1"; // Match your backend router prefix

/**
 * Searches for users by name, email, or phone
 */
export const SearchUsersApi = async (params: {
    q: string;
    offset?: number;
    limit?: number;
}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<UserSearchResponse[]>>(
            `${BASE_PATH}/search`,
            { params }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse
            };
        }
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};


export const UserInfoApi = async () => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<UserProfileResponse>>(
            `${BASE_PATH}/`,
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