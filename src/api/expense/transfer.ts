import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    AddTransferRequest,
    AddTransferResponse,
    AddSettlementLinkRequest,
    AddSettlementLinkResponse
} from "@/src/api/dto/expense/transfer";

const BASE_PATH = "/transfer/v1"; // Linked securely to your upstream service routing rules

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