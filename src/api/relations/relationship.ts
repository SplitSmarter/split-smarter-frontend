// src/api/user/relationshipApi.ts

import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    RelationshipDetails,
    AddRelationshipRequest,
    AddRelationshipResponse,
    UpdateRelationshipRequest,
    UpdateRelationshipResponse
} from "@/src/api/dto/user/relationship";

const BASE_PATH = "/user/relationship/v1"; // Prefix from your APIRouter

/**
 * Fetch all relationship types (Default + Custom)
 */
export const getRelationshipsApi = async (params: { offset?: number; limit?: number } = {}) => {
    const { offset = 0, limit = 10 } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<RelationshipDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: { offset, limit }
            }
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
 * Create a new custom relationship type
 */
export const createRelationshipApi = async (data: AddRelationshipRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddRelationshipResponse>>(
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
 * Update an existing custom relationship type
 */
export const updateRelationshipApi = async (relationshipId: number, data: UpdateRelationshipRequest) => {
    try {
        const res = await axiosUserInstance.patch<SuccessResponse<UpdateRelationshipResponse>>(
            `${BASE_PATH}/${relationshipId}`,
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