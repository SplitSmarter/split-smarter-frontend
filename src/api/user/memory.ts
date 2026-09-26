import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse, PaginationResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    CreateMemoryRequest,
    UpdateMemoryRequest,
    CompleteMemoryRequest,
    MemoryResponse,
} from "@/src/api/dto/user/memory";

const BASE_PATH = "/v1";

/**
 * Creates a new memory record.
 */
export const CreateMemoryApi = async (data: CreateMemoryRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
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
 * Retrieves paginated list of user memories.
 */
export const GetMemoriesApi = async (
    params: { offset?: number; limit?: number } = {}
) => {
    const { offset = 0, limit = 20 } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<MemoryResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: { offset, limit },
            }
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
 * Retrieves a single memory by ID.
 */
export const GetMemoryByIdApi = async (memoryId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}`
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
 * Partially updates an existing memory.
 */
export const UpdateMemoryApi = async (
    memoryId: number,
    data: UpdateMemoryRequest
) => {
    try {
        const res = await axiosUserInstance.patch<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}`,
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
 * Completes/ends a memory session.
 */
export const CompleteMemoryApi = async (
    memoryId: number,
    data: CompleteMemoryRequest
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/complete`,
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
 * Attaches array of UUID asset IDs to an existing memory.
 */
export const AddAssetsToMemoryApi = async (
    memoryId: number,
    assetIds: string[]
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/assets`,
            { asset_ids: assetIds }
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
 * Deletes/soft-deletes a memory by ID.
 */
export const DeleteMemoryApi = async (memoryId: number) => {
    try {
        const res = await axiosUserInstance.delete<SuccessResponse<boolean>>(
            `${BASE_PATH}/${memoryId}`
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