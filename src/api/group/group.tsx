import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse, PaginationResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {AddGroupRequest, AddGroupResponse, GroupDetails} from "@/src/api/dto/user/group";
import {GroupStatus} from "@/src/api/dto/constants";

const BASE_PATH = "/group/v1"; // Matching your backend router logic

/**
 * Retrieves all groups for the authenticated user with filters and pagination
 */
export const GetGroupsApi = async (
    params: {
        offset?: number;
        limit?: number;
        statuses?: GroupStatus[];
    } = {}
) => {
    const {
        offset = 0,
        limit = 100,
        statuses = [GroupStatus.ACTIVE]
    } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<GroupDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    offset,
                    limit,
                    statuses
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
 * Retrieves a specific group by its internal ID
 */
export const GetGroupByIdApi = async (groupId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<GroupDetails>>(
            `${BASE_PATH}/${groupId}`
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
 * Creates a new group
 */
export const CreateGroupApi = async (data: AddGroupRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddGroupResponse>>(
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