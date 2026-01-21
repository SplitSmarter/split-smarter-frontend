import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import {ResendOtpRequest, SendOtpRequest, VerifyOtpRequest} from "@/src/api/dto/auth/otp";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";

export const OtpSendApi = async (data: SendOtpRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse>("/otp/send", data);

        // Ensure the schema mapping is valid
        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                tag: (res.data.data as any)?.tag || "OtpSentSuccess"
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export const OtpVerifyApi = async (data: VerifyOtpRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse>("/otp/verify", data);

        if (res.data && res.data.success) {
            return {
                message: res.data.message,
                tag: "OtpVerified"
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export const OtpResendApi = async (data: ResendOtpRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse>("/otp/resend", data);

        if (res.data && res.data.success) {
            return {
                message: res.data.message || "OTP resent successfully",
                tag: "OtpResent"
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};