import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import {CredentialsLoginRequest, CredentialsLoginResponse, GoogleLoginRequest} from "@/src/api/dto/auth/login";
import {SuccessResponse} from "@/src/api/dto/ApiResponse";
import {handleApiError} from "@/src/api/utils/mapper";

export const CredentialLoginApi = async (data: CredentialsLoginRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse<CredentialsLoginResponse>>(
            "/login/credentials",
            data
        );

        if (res.data && res.data.success) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");

            // This is the LoginResponse object from your Java code
            const loginData = res.data.data;

            return {
                message: res.data.message,
                meta: {
                    id: loginData.id,
                    access_token: access_token,
                    username: loginData.username,
                    profile: loginData.profile, // RemoteUserProfileResponse
                }
            };
        }
        throw new Error("Invalid Schema");
    } catch (error: any) {
        return handleApiError(error);
    }
};

export const GoogleLoginApi = async (data: GoogleLoginRequest) => {
    try {
        const res = await axiosAuthInstance.post<SuccessResponse>("/login/google", data);

        if (res.data && res.data.success) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            const loginData = res.data.data;
            return {
                message: res.data.message,
                tag: (res.data.data as any)?.tag || "GoogleLoggedIn",
                meta: {
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
