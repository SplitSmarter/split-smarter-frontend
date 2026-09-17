import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import { handleApiError } from "@/src/api/utils/mapper";
import {
    SystemDefaultKey,
    SystemDefaultsResponse,
    GetSystemDefaultsParams
} from "@/src/api/dto/system/defaults";

const BASE_PATH = "/system-defaults/v1"; // Matches router.prefix = "/v1"

/**
 * Retrieves system defaults, optionally filtered by specific keys.
 */
export const GetSystemDefaultsApi = async (params?: GetSystemDefaultsParams) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<SystemDefaultsResponse, null>>(
            `${BASE_PATH}/`,
            {
                params: {
                    // Axios handles array parameters correctly as ?keys=relationship&keys=category
                    keys: params?.keys
                }
            }
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