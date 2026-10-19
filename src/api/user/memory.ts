import axiosUserInstance from '@/src/api/axiosUserServiceInstance';
import {SuccessResponse, PaginationResponse} from '@/src/api/dto/ApiResponse';
import {handleApiError} from '@/src/api/utils/mapper';
import {
    ActivateMemoryRequest,
    ActiveMemoryContextResponse,
    CompleteMemoryRequest,
    CreateMemoryRequest,
    DeactivateMemoryRequest,
    ListMemoriesParams,
    MemoryActivationLogResponse,
    MemoryResponse,
    ShareMemoryRequest,
    UnshareMemoryRequest,
    UpdateMemoryRequest,
} from '@/src/api/dto/user/memory';

const BASE_PATH = '/user-memory/v1';

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
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Retrieves paginated list of user memories.
 */
export const GetMemoriesApi = async (params: ListMemoriesParams = {}) => {
    const {
        offset = 0,
        limit = 20,
        source,
        group_id,
        scope,
        status,
        covering_date,
    } = params;

    try {
        const res = await axiosUserInstance.get<SuccessResponse<MemoryResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    offset,
                    limit,
                    ...(source?.length ? {source} : {}),
                    ...(group_id != null ? {group_id} : {}),
                    ...(scope ? {scope} : {}),
                    ...(status?.length ? {status} : {}),
                    ...(covering_date ? {covering_date} : {}),
                },
            }
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Current active memory context for a group (group + personal).
 */
export const GetActiveMemoryContextApi = async (groupId: number) => {
    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<ActiveMemoryContextResponse>
        >(`${BASE_PATH}/active`, {
            params: {group_id: groupId},
        });

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
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
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Activation / deactivation history for a memory.
 */
export const GetMemoryActivationHistoryApi = async (
    memoryId: number,
    params: {offset?: number; limit?: number; group_id?: number} = {}
) => {
    const {offset = 0, limit = 20, group_id} = params;

    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<MemoryActivationLogResponse[]>
        >(`${BASE_PATH}/${memoryId}/activation-history`, {
            params: {
                offset,
                limit,
                ...(group_id != null ? {group_id} : {}),
            },
        });

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination as PaginationResponse,
            };
        }
        throw new Error('Invalid Response Schema');
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
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Sets this memory as the current active context.
 */
export const ActivateMemoryApi = async (
    memoryId: number,
    data: ActivateMemoryRequest = {}
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/activate`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Clears this memory as the current active context without archiving.
 */
export const DeactivateMemoryApi = async (
    memoryId: number,
    data: DeactivateMemoryRequest = {}
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/deactivate`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Share a SHARED-scope memory with additional users (owner only).
 */
export const ShareMemoryApi = async (
    memoryId: number,
    data: ShareMemoryRequest
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/share`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Remove users from a SHARED-scope memory share list (owner only).
 */
export const UnshareMemoryApi = async (
    memoryId: number,
    data: UnshareMemoryRequest
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/unshare`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
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
        throw new Error('Invalid Response Schema');
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
            {asset_ids: assetIds}
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Removes image asset IDs from an existing memory.
 */
export const RemoveAssetsFromMemoryApi = async (
    memoryId: number,
    assetIds: string[]
) => {
    try {
        const res = await axiosUserInstance.delete<SuccessResponse<MemoryResponse>>(
            `${BASE_PATH}/${memoryId}/assets`,
            {data: {asset_ids: assetIds}}
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
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
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};
