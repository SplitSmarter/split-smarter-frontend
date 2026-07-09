import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse, PaginationResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddGroupRequest,
    AddGroupResponse,
    BaseGroupDetails,
    GroupDetails,
    GroupMemberDetails
} from "@/src/api/dto/user/group";
import {GroupStatus} from "@/src/api/dto/constants";
import {BaseSettlementDetails} from "@/src/api/dto/expense/settlement";

const BASE_PATH = "/group/v1"; // Matching your backend router logic

export interface GetGroupsParams {
    group_ids?: number[]; // Added specific group filter array parameter
    offset?: number;
    limit?: number;
    statuses?: GroupStatus[];
}

/**
 * Retrieves groups for the authenticated user with optional ID structural filtering
 */
export const GetGroupsApi = async (params: GetGroupsParams = {}) => {
    const {
        group_ids,
        offset = 0,
        limit = 100,
        statuses = [GroupStatus.ACTIVE]
    } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<BaseGroupDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    group_id: group_ids, // Maps array to ?group_id=X&group_id=Y automatically
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


/**
 * Retrieves a list of memberships/members assigned to a specific group context identity
 */
export const GetGroupMembershipsApi = async (groupId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<GroupMemberDetails[]>>(
            `${BASE_PATH}/${groupId}/members`
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error("Invalid Response Schema encountered during group members layout fetching.");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export interface GetGroupSettlementsQueryParams {
    offset?: number;
    limit?: number;
}

/**
 * Retrieves a paginated list of verified base settlement links for a specific group
 */
export const GetGroupSettlementsApi = async (groupId: number, params: GetGroupSettlementsQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<BaseSettlementDetails[]>>(
            `${BASE_PATH}/${groupId}/settlements`,
            {
                params: {
                    offset: params.offset ?? 0,
                    limit: params.limit ?? 20
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
        throw new Error("Invalid Response Schema returned during group settlement links fetching.");
    } catch (error: any) {
        return handleApiError(error);
    }
};