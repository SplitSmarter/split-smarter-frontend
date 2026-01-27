import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {CredentialsSignupRequest, GoogleSignupRequest} from "@/src/api/dto/auth/signup";

export const CredentialSignupApi = async (data: CredentialsSignupRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse>("/signup/credentials", data);

        if (res.data && res.data.success) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            return {
                message: res.data.message,
                tag: (res.data.data as any)?.tag || "SignedIn",
                meta: {
                    access_token: access_token,
                    username: res.data.data.username,
                    avatar_id: res.data.data.avatar_id,
                    avatar_url: res.data.data.avatar_url,
                }
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export const GoogleSignupApi = async (data: GoogleSignupRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse>("/signup/google", data);

        if (res.data && res.data.success) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            return {
                message: res.data.message,
                tag: (res.data.data as any)?.tag || "GoogleSignedIn",
                meta: {
                    access_token: access_token,
                }
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};
