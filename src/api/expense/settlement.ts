import axiosUserInstance from '@/src/api/axiosUserServiceInstance';
import {SuccessResponse} from '@/src/api/dto/ApiResponse';
import {handleApiError} from '@/src/api/utils/mapper';
import {
    AddSettlementLinkRequest,
    AddSettlementLinkResponse,
    BaseSettlementDetails,
} from '@/src/api/dto/expense/settlement';

const BASE_PATH = '/settlement/v1';

/**
 * Upsert a settlement link: peer transfer clears expense debt.
 * POST /settlement/v1/
 */
export const linkSettlementApi = async (data: AddSettlementLinkRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddSettlementLinkResponse>>(
            `${BASE_PATH}/`,
            data,
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema Encountered during Settlement Link bind.');
    } catch (error: any) {
        return handleApiError(error);
    }
};

export interface ListSettlementLinksQueryParams {
    expense_id?: number;
    transfer_id?: number;
    offset?: number;
    limit?: number;
}

/**
 * List settlement links for the authenticated user.
 * GET /settlement/v1/
 */
export const listSettlementLinksApi = async (params: ListSettlementLinksQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<BaseSettlementDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    expense_id: params.expense_id,
                    transfer_id: params.transfer_id,
                    offset: params.offset ?? 0,
                    limit: params.limit ?? 20,
                },
            },
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
                pagination: res.data.pagination,
            };
        }
        throw new Error('Invalid Response Schema returned during settlement links listing.');
    } catch (error: any) {
        return handleApiError(error);
    }
};
