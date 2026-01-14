import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import { SendOtpForm, VerifyOtpForm, ResendOtpForm } from "@/src/types/auth";

export const OtpSendApi = async (data: SendOtpForm) => {
    try {
        const res = await axiosAuthInstance.post("/otp/send", data);
        if (res.status === 200) {
            return { message: res.data.message, tag: res.data.tag };
        }
        return Promise.reject({ message: "Unexpected response", tag: "Unexpected" });
    } catch (error: any) {
        const { response } = error;
        if (response) {
            const { status, data } = response;
            switch (status) {
                case 423:
                    return Promise.reject({ message: "Sending OTP is locked, please try again later", tag: "OtpLocked" });
                case 409:
                    if (data?.tag === "UserExists") {
                        return Promise.reject({ message: "You are already registered, please login", tag: "UserExists" });
                    }
                    return Promise.reject({ message: "OTP already verified", tag: "OtpAlreadyVerified" });
                case 502:
                    return Promise.reject({ message: "Failed to send OTP", tag: "MailError" });
                default:
                    return Promise.reject({ message: data?.message || "Something went wrong", tag: data?.tag || "Error" });
            }
        }
        return Promise.reject({ message: error.message || "Network error", tag: "NetworkError" });
    }
};

export const OtpVerifyApi = async (data: VerifyOtpForm) => {
    try {
        const res = await axiosAuthInstance.post("/otp/verify", data);
        if (res.status === 200) {
            return { message: res.data.message, tag: "OtpVerified" };
        }
        return Promise.reject({ message: "Unexpected response", tag: "Unexpected" });
    } catch (error: any) {
        const { response } = error;
        if (response) {
            const { status, data } = response;
            switch (status) {
                case 409:
                    if (data?.tag === "UserExists") {
                        return Promise.reject({ message: "You are already registered", tag: "UserExists" });
                    }
                    return Promise.reject({
                        message: data?.message || "Conflict occurred",
                        tag: data?.tag || "Conflict"
                    });
                case 423:
                    return Promise.reject({ message: "OTP is locked", tag: "OtpLocked" });
                case 401:
                    if (data.tag === "UserChanged") {
                        return Promise.reject({ message: "User changed", tag: "UserChanged" });
                    }
                    return Promise.reject({ message: "Invalid OTP", tag: "InvalidOtp" });
                case 410:
                    return Promise.reject({ message: "OTP expired", tag: "OtpExpired" });
                case 429:
                    return Promise.reject({ message: "Max attempts reached", tag: "AttemptsExceeded" });
                case 404:
                    return Promise.reject({ message: "OTP not found", tag: "OtpNotFound" });
                default:
                    return Promise.reject({ message: data?.message || "Something went wrong", tag: data?.tag || "Error" });
            }
        }
        return Promise.reject({ message: error.message || "Network error", tag: "NetworkError" });
    }
};

export const OtpResendApi = async (data: ResendOtpForm) => {
    try {
        const res = await axiosAuthInstance.post("/otp/resend", data);
        if (res.status === 200) {
            return { message: "OTP resent successfully", tag: "OtpResent" };
        }
        return Promise.reject({ message: "Unexpected response", tag: "Unexpected" });
    } catch (error: any) {
        const { response } = error;
        if (response) {
            const { status, data } = response;
            switch (status) {
                case 409:
                    if (data?.tag === "UserExists") {
                        return Promise.reject({ message: "You are already registered", tag: "UserExists" });
                    }
                    return Promise.reject({
                        message: data?.message || "Conflict occurred",
                        tag: data?.tag || "Conflict"
                    });
                case 404:
                    return Promise.reject({ message: "OTP not found", tag: "OtpNotFound" });
                case 423:
                    return Promise.reject({ message: "OTP resend locked", tag: "OtpLocked" });
                case 429:
                    return Promise.reject({ message: "Resend limit reached", tag: "ResendLimitReached" });
                case 502:
                    return Promise.reject({ message: "Failed to resend OTP", tag: "MailError" });
                default:
                    return Promise.reject({ message: data?.message || "Unknown error", tag: data?.tag || "Error" });
            }
        }
        return Promise.reject({ message: error.message || "Network error", tag: "NetworkError" });
    }
};

