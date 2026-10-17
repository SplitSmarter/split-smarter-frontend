import axiosUserInstance from '@/src/api/axiosUserServiceInstance';
import { SuccessResponse, PaginationResponse } from '@/src/api/dto/ApiResponse';
import { handleApiError } from '@/src/api/utils/mapper';
import { MCCResponse } from '@/src/api/dto/expense/merchant';

const BASE_PATH = '/expense/merchant/mcc/v1';

export type ListMccCodesParams = {
    offset?: number;
    limit?: number;
    query?: string;
    group_category?: string;
};

/**
 * Lists ISO MCC codes (optional search / category filter).
 * GET /expense/merchant/mcc/v1/
 */
export const ListMccCodesApi = async (params?: ListMccCodesParams) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<MCCResponse[]>>(
            `${BASE_PATH}/`,
            { params },
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
