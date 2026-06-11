import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";
import {CredentialsSignupRequest, GoogleSignupRequest, SignupResponse} from "@/src/api/dto/auth/signup";

export const CredentialSignupApi = async (data: CredentialsSignupRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse<SignupResponse>>("/signup/credentials", data);

        if (res.data && res.data.success) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            const loginData = res.data.data;
            return {
                message: res.data.message,
                tag: (res.data.data as any)?.tag || "SignedIn",
                meta: {
                    id: loginData.id,
                    access_token: access_token,
                    username: loginData.username,
                    profile: loginData.profile,
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
        const res = await axiosAuthInstance.post<SuccessResponse<SignupResponse>>("/signup/google", data);

        if (res.data && res.data.success) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            const loginData = res.data.data;
            return {
                message: res.data.message,
                tag: (res.data.data as any)?.tag || "GoogleSignedIn",
                meta: {
                    id: loginData.id,
                    access_token: access_token,
                    username: loginData.username,
                    profile: loginData.profile,
                }
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};
