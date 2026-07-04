import qs from 'qs';
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddTransferRequest,
    AddTransferResponse,
    TransferDetailsBasicResponse,
    TransferDetailsResponse
} from "@/src/api/dto/expense/transfer";
import {TransferMode} from "@/src/api/dto/expense/constant";

const BASE_PATH = "/transfer/v1";

/**
 * Dispatches an asynchronous transmission requesting a new transfer entity creation
 */
export const createTransferApi = async (data: AddTransferRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddTransferResponse>>(
            `${BASE_PATH}/`,
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data
            };
        }
        throw new Error("Invalid Response Schema Encountered during Transfer registration.");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export interface ListTransfersQueryParams {
    start_date?: string;    // YYYY-MM-DD
    end_date?: string;      // YYYY-MM-DD
    mode?: TransferMode[];  // Maps directly to API query parameter alias="mode"
    is_settled?: boolean;
    group_id?: number[];    // Maps directly to API query parameter alias="group_id"
    offset?: number;
    limit?: number;
}

/**
 * Fetches a single detailed peer-to-peer transfer or settlement layout by its specific context identity
 */
export const getTransferByIdApi = async (transferId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<TransferDetailsResponse>>(
            `${BASE_PATH}/${transferId}`
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data
            };
        }
        throw new Error("Invalid Response Schema encountered during single transfer extraction.");
    } catch (error: any) {
        return handleApiError(error);
    }
};

/**
 * Retrieves a paginated matrix tracking historical transfers or group settlements the user is involved in
 */
export const listUserTransfersApi = async (params: ListTransfersQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<TransferDetailsBasicResponse[]>>(
            `${BASE_PATH}/`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date,
                    mode: params.mode,
                    is_settled: params.is_settled,
                    group_id: params.group_id,
                    offset: params.offset ?? 0,
                    limit: params.limit ?? 20
                },
                // Replicates array parameters as multiple keys: ?mode=CASH&mode=UPI&group_id=1&group_id=2
                paramsSerializer: (p) => {
                    return qs.stringify(p, {arrayFormat: 'repeat'});
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
        throw new Error("Invalid Response Schema returned during historical transfers listing parsing.");
    } catch (error: any) {
        return handleApiError(error);
    }
};