import axiosUserInstance from '@/src/api/axiosUserServiceInstance';
import {SuccessResponse} from '@/src/api/dto/ApiResponse';
import {handleApiError} from '@/src/api/utils/mapper';
import {
    AddPaymentLinkRequest,
    AddPaymentLinkResponse,
    PaymentLinkDetails,
} from '@/src/api/dto/expense/payment_link';

const BASE_PATH = '/expense/payment-link/v1';

/**
 * Upsert a payment link: transfer covers the viewer's expense_paid_by row.
 * POST /expense/payment-link/v1/
 */
export const linkPaymentApi = async (data: AddPaymentLinkRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddPaymentLinkResponse>>(
            `${BASE_PATH}/`,
            data,
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema Encountered during Payment Link bind.');
    } catch (error: any) {
        return handleApiError(error);
    }
};

export interface ListPaymentLinksQueryParams {
    expense_id?: number;
    transfer_id?: number;
    expense_paid_by_id?: number;
    offset?: number;
    limit?: number;
}

/**
 * List payment links for the authenticated user.
 * GET /expense/payment-link/v1/
 */
export const listPaymentLinksApi = async (params: ListPaymentLinksQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<PaymentLinkDetails[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    expense_id: params.expense_id,
                    transfer_id: params.transfer_id,
                    expense_paid_by_id: params.expense_paid_by_id,
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
        throw new Error('Invalid Response Schema returned during payment links listing.');
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Delete a payment link by id.
 * DELETE /expense/payment-link/v1/{link_id}
 */
export const deletePaymentLinkApi = async (linkId: number) => {
    try {
        const res = await axiosUserInstance.delete<SuccessResponse<null>>(
            `${BASE_PATH}/${linkId}`,
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema returned during payment link delete.');
    } catch (error: any) {
        return handleApiError(error);
    }
};
