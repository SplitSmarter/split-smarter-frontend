import {AddSettlementLinkRequest, AddSettlementLinkResponse} from "@/src/api/dto/expense/transfer";
import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";

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