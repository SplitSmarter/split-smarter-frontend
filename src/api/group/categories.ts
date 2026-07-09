import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse, PaginationResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {GroupCategorySource} from "@/src/api/dto/constants";
import {
    AddCategoryResponse,
    AddGroupCategoryRequest,
    GroupCategoryDetails
} from "@/src/api/dto/user/addGroupCategoryRequest";

const BASE_PATH = "/group/category/v1"; // Assuming this follows your group router prefix

/**
 * Retrieve categories accessible to the authenticated user.
 */
export const GetGroupCategoriesApi = async (
    params: {
        category_type?: GroupCategorySource[];
        offset?: number;
        limit?: number;
    } = {}
) => {
    const {
        category_type = [GroupCategorySource.CUSTOM, GroupCategorySource.DEFAULT],
        offset = 0,
        limit = 100
    } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<GroupCategoryDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    category_type,
                    offset,
                    limit
                }
            }
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

/**
 * Creates a new custom group category for the authenticated user
 */
export const CreateGroupCategoryApi = async (data: AddGroupCategoryRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddCategoryResponse>>(
            `${BASE_PATH}/`,
            {
                title: data.title.trim(),
                description: data.description,
                icon_asset_id: data.icon_asset_id
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
        // This will catch the 409 Conflict for duplicate titles
        // as well as other validation errors
        return handleApiError(error);
    }
};