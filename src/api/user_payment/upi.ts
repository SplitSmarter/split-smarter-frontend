import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {
    AddUPIAccountRequest,
    AddUPIAccountResponse,
    SearchUPIAccountRequest,
    SearchUPIAccountDTO,
    VerifyVPAQueryRequest,
    VerifyVPAResponse,
    VerifyAndLookupUPIAccountRequest,
    VerifyAndLookupUPIAccountDTO,
} from "@/src/api/dto/user_payments/upi";

const BASE_PATH = "/upi/v1"; // Match the APIRouter prefix

/**
 * Registers and links a UPI VPA/Account for the authenticated user.
 */
export const AddUPIAccountApi = async (data: AddUPIAccountRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<AddUPIAccountResponse>>(
            `${BASE_PATH}/account/add`,
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
 * Searches for candidates associated with a specified UPI VPA.
 */
export const SearchUPIAccountApi = async (data: SearchUPIAccountRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<SearchUPIAccountDTO>>(
            `${BASE_PATH}/account/search`,
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
 * Verifies the format and external validity of a UPI VPA handle.
 */
export const VerifyVPAHandleApi = async (data: VerifyVPAQueryRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<VerifyVPAResponse>>(
            `${BASE_PATH}/account/verify`,
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
 * Verifies VPA handle validity and retrieves saved user mappings.
 */
export const VerifyAndLookupVPAApi = async (data: VerifyAndLookupUPIAccountRequest) => {
    try {
        const res = await axiosUserInstance.post<SuccessResponse<VerifyAndLookupUPIAccountDTO>>(
            `${BASE_PATH}/account/verify-and-lookup`,
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