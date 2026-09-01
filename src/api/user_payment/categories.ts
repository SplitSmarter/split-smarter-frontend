import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {ConsumerPaymentCategorySummaryResponse} from "@/src/api/dto/user_payments/categories";

const BASE_PATH = "/payment-categories/v1";

/**
 * Retrieves the summary list of consumer payment categories.
 */
export const GetConsumerPaymentCategorySummariesApi = async () => {
    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<ConsumerPaymentCategorySummaryResponse[]>
        >(`${BASE_PATH}/categories`);

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