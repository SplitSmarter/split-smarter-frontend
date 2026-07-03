import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {AddRelationRequest, AddRelationResponse, RelationDetails} from "@/src/api/dto/user/relation";
import { RelationWithUserType } from "@/src/api/dto/constants";

const BASE_PATH = "/user/relation/v1"; // Update based on your actual router prefix

export const AddRelationApi = async (data: AddRelationRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddRelationResponse>>(
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
 * Fetches user relations (friends/contacts) with filters
 */
export const GetRelationsApi = async (
    params: {
        relation_types?: RelationWithUserType[];
        offset?: number;
        limit?: number;
    } = {}
) => {
    const {
        relation_types = [RelationWithUserType.USER, RelationWithUserType.CUSTOM],
        offset = 0,
        limit = 10
    } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<RelationDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    relation_type: relation_types, // Axios handles array to multiple query params
                    offset,
                    limit
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
        throw new Error("Invalid Response Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};