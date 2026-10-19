import axiosUserInstance from '@/src/api/axiosUserServiceInstance';
import {SuccessResponse} from '@/src/api/dto/ApiResponse';
import {handleApiError} from '@/src/api/utils/mapper';
import type {
    UserMerchantLocationCreate,
    UserMerchantLocationResponse,
} from '@/src/api/dto/expense/merchant_location';

const BASE_PATH = '/expense/merchant-locations/v1';

/**
 * Links an owned user place to a merchant (POST /expense/merchant-locations/v1/).
 */
export const CreateMerchantLocationApi = async (
    data: UserMerchantLocationCreate
) => {
    try {
        const res = await axiosUserInstance.post<
            SuccessResponse<UserMerchantLocationResponse>
        >(`${BASE_PATH}/`, data);

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                data: res.data.data,
            };
        }
        throw new Error('Invalid Response Schema');
    } catch (error: any) {
        return handleApiError(error);
    }
};
