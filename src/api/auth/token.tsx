import axiosGatewayInstance from "@/src/api/axiosGatewayInstance";
import { AxiosError } from "axios";

export const refreshAccessTokenApi = async () => {
    try {
        const res = await axiosGatewayInstance.get("/token/access");
        const newAccessToken = res?.headers['authorization'];
        if (newAccessToken) {
            const access_token = newAccessToken.replace(/^Bearer\s+/i, "");
            return Promise.resolve({success: true, message: "Token received", access_token: access_token});
        }
        return Promise.reject({success: false, message: "An unknown error occurred", tag: "Unknown"});
    } catch (err) {
        const axiosError = err as AxiosError<any>;
        const tag = axiosError?.response?.data?.tag || "Unknown";
        const status = axiosError?.response?.data?.status;
        if (status === 401 && tag === "InvalidToken") {
            return Promise.reject({success:false, message: "Session has expired", "tag": "SessionExpired"})
        }
        if (status === 401 && tag === "Unauthorized") {
            return Promise.reject({success:false, message: "User is Unauthorized", "tag": "Unauthorized"})
        }
        return Promise.reject({success: false, message: "An unknown error occurred", tag: "Unknown"});
    }
};
