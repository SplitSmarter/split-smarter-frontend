import {ErrorResponse} from "@/src/api/dto/ApiResponse";
import {ErrorCode} from "@/src/api/dto/defaults/gateway/ErrorCode";

/**
 * Standardized Error Handler
 * Maps backend ErrorResponse to a rejected promise.
 */
export const handleApiError = (error: any) => {
    // TODO: make sure to catch exceptions across all api calls
    const {response} = error;

    // If we have a response from the server and it matches our schema
    if (response?.data && typeof response.data.success !== 'undefined') {
        const errorData: ErrorResponse = response.data;
        return Promise.reject({
            message: errorData.message || "common.error.unknown_error",
            tag: errorData.error || ErrorCode.UNKNOWN_ERROR,
            status: response.status,
            meta: response.meta || "common.error.unknown_error"
        });
    }

    // Fallback for network issues or malformed responses
    return Promise.reject({
        message: error.message || "common.error.network_error",
        tag: "NetworkError",
        status: response?.status || 500
    });
};