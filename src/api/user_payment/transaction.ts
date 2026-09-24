import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    CancelTransactionRequest,
    InitiateTransactionRequest,
    TransactionResponse,
    UpdateTransactionStepRequest,
    VerifyPaymentReturnRequest,
} from "@/src/api/dto/user_payments/transaction";

const BASE_PATH = "/user-payment/v1";

/**
 * Initiates a new payment transaction or returns an existing one if client_reference_id matches.
 */
export const InitiateTransactionApi = async (data: InitiateTransactionRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<TransactionResponse>>(
            `${BASE_PATH}/initiate`,
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
 * Records an intermediate checkout step or state change during the transaction lifecycle.
 */
export const RecordTransactionStepApi = async (
    transactionId: string,
    data: UpdateTransactionStepRequest
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<TransactionResponse>>(
            `${BASE_PATH}/${transactionId}/step`,
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
 * Cancels an ongoing transaction with a specified failure reason.
 */
export const CancelTransactionApi = async (
    transactionId: string,
    data: CancelTransactionRequest
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<TransactionResponse>>(
            `${BASE_PATH}/${transactionId}/cancel`,
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
 * Verifies gateway payload signatures and finalizes the payment status.
 */
export const VerifyTransactionApi = async (
    transactionId: string,
    data: VerifyPaymentReturnRequest
) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<TransactionResponse>>(
            `${BASE_PATH}/${transactionId}/verify`,
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
 * Fetches the current status and details of a transaction by ID.
 */
export const GetTransactionStatusApi = async (transactionId: string) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<TransactionResponse>>(
            `${BASE_PATH}/${transactionId}`
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