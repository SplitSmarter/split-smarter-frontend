import {AddSettlementLinkRequest, AddSettlementLinkResponse} from "@/src/api/dto/expense/transfer";
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {BaseSettlementDetails} from "@/src/api/dto/expense/settlement";

const BASE_PATH = "/settlement/v1";

/**
 * Links an unmapped standalone transfer against an outstanding line-item record context
 */
export const linkSettlementApi = async (data: AddSettlementLinkRequest) => {
    try {
        // Appends settlement linking path targets over top standard routing rules
        const res = await axiosUserInstance.post<SuccessResponse<AddSettlementLinkResponse>>(
            `${BASE_PATH}/settlement`, // Adjust this suffix path if your backend uses a separate route structure
            data
        );

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data
            };
        }
        throw new Error("Invalid Response Schema Encountered during Settlement Link bind.");
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
 * Retrieves a paginated list of settlement links with optional expense or transfer filters
 */
export const listSettlementLinksApi = async (params: ListSettlementLinksQueryParams = {}) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<BaseSettlementDetails[]>>(
            `${BASE_PATH}/`, // Verify if this should be `${BASE_PATH}/settlements` depending on your routing setup
            {
                params: {
                    expense_id: params.expense_id,
                    transfer_id: params.transfer_id,
                    offset: params.offset ?? 0,
                    limit: params.limit ?? 20
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
        throw new Error("Invalid Response Schema returned during settlement links listing.");
    } catch (error: any) {
        return handleApiError(error);
    }
};