import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    GetUserPaymentAccountsQueryParams, MerchantPaymentAccountListDTO,
    PaymentAccountAddOptionsDTO,
    UserPaymentAccountListDTO
} from "@/src/api/dto/user_payments/account";

const BASE_PATH = "/accounts/v1";

/**
 * Retrieves dynamic options and payment rail providers for linking a new payment account
 * based on the authenticated user's region.
 */
export const GetPaymentAccountAddOptionsApi = async () => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<PaymentAccountAddOptionsDTO>>(
            `${BASE_PATH}/add/options`
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
 * Retrieves linked payment accounts for the specified user (or authenticated user if omitted).
 */
export const GetUserPaymentAccountsApi = async (
    params?: GetUserPaymentAccountsQueryParams
) => {
    try {
        const res = await axiosUserInstance.get<
            SuccessResponse<UserPaymentAccountListDTO>
        >(`${BASE_PATH}/user`, {params});

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
 * Retrieves linked payment accounts for the specified merchant ID.
 */
export const GetMerchantPaymentAccountsApi = async (merchantId: number) => {
    try {
        const res = await axiosUserInstance.get<SuccessResponse<MerchantPaymentAccountListDTO>>(
            `${BASE_PATH}/merchant/${merchantId}`
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