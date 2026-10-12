import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse, PaginationResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {AddMembershipRequest, AllGroupMembershipsDetails} from "@/src/api/dto/user/group/membership";
import {
    BatchAddMembershipRequest,
    BatchAddMembershipResponse,
} from "@/src/api/dto/user/group/batchAddMembership";
import {GroupJoinMethod} from "@/src/api/dto/constants";

const BASE_PATH = "/group/membership/v1";

export interface GetGroupMembershipsParams {
    offset?: number;
    limit?: number;
}

/**
 * Retrieve all memberships/users bound to a specified group
 * Maps directly to GET /group/v1/group/{group_id}
 */
export const GetGroupMembershipsApi = async (
    groupId: number,
    params: GetGroupMembershipsParams = {}
) => {
    const { offset = 0, limit = 100 } = params; // Setting a default upper limit safely

    try {
        const res = await axiosUserInstance.get<SuccessResponse<AllGroupMembershipsDetails[]>>(
            `${BASE_PATH}/group/${groupId}`,
            {
                params: {
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

export const JoinGroupApi = async (
    data: AddMembershipRequest,
    mode: GroupJoinMethod
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<null, null>>(
            `${BASE_PATH}/`,
            data,
            {
                params: {
                    mode
                }
            }
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
 * Add multiple users to a group in one request
 * POST /group/membership/v1/batch
 */
export const BatchAddGroupMembershipsApi = async (data: BatchAddMembershipRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<BatchAddMembershipResponse>>(
            `${BASE_PATH}/batch`,
            data
        );

        if (res.data && res.data.success && res.data.data) {
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