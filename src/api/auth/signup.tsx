import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import {CredentialSignupForm, GoogleSignupForm} from "@/src/types/auth/auth";
import * as Keychain from 'react-native-keychain';

export const CredentialSignupApi = async (data: CredentialSignupForm) => {
    try {
        const res = await axiosAuthInstance.post("/signup/credentials", data);
        if (res.status === 201) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            return {message: "Signed up successfully", tag: "UserCreated", access_token: access_token};
        }
        return Promise.reject({message: "Unexpected response", status: res.status, tag: "Unexpected"});
    } catch (error: any) {
        if (error.response) {
            const {status, data} = error.response;
            if (status === 409) {
                if (data?.tag === "InvalidField" && data?.field === "username") {
                    return Promise.reject({message: "Username already taken", tag: "InvalidField", field: "username"});
                } else if (data?.tag === "UserActive" || data?.tag === "UserInactive") {
                    return Promise.reject({message: "You are already registered", tag: "UserExists"});
                }
            } else if (status === 204 && data?.tag === "UserDeleted") {
                return Promise.reject({message: "User deleted", tag: "UserDeleted"});
            } else if (status === 422) {
                return Promise.reject({message: data?.message || "Invalid input", tag: "InvalidField", field: data?.field});
            } else if (status === 403 && data?.tag === "UserBlocked") {
                return Promise.reject({message: "User is blocked", tag: "UserBlocked"});
            }
            return Promise.reject({message: data?.message || "Something went wrong", status});
        }
        console.info(error);
        return Promise.reject({message: error.message || "Network error"});
    }
};

export const GoogleSignupApi = async (data: GoogleSignupForm) => {
    try {
        const res = await axiosAuthInstance.post("/signup/google", data);
        if (res.status === 201) {
            const authorization_header = res.headers['authorization'].toString();
            const access_token = authorization_header?.replace(/^Bearer\s+/i, "");
            console.log(access_token);
            await Keychain.setGenericPassword(
                "access-token", 'acoolpassword', {
                    service: 'Access-Token',
                }
            )
            return {message: "Signed up successfully", tag: "UserCreated"};
        }
        return Promise.reject({message: "Unexpected error", status: res.status, tag: "Unexpected"});
    } catch (error: any) {
        if (error.response) {
            const {status, data} = error.response;
            if (status === 409) {
                if (data?.tag === "InvalidField" && data?.field === "username") {
                    return Promise.reject({
                        message: "Username is already taken",
                        tag: "InvalidField",
                        field: "username"
                    });
                } else if (data?.tag === "UserActive" || data?.tag === "UserInactive") {
                    return Promise.reject({message: "You are already registered", tag: "UserExists"});
                }
            } else if (status === 422) {
                return Promise.reject({message: data?.message || "Invalid input", tag: "InvalidField", field: data?.field});
            } else if (status === 403) {
                if (data?.tag === "UserBlocked") {
                    return Promise.reject({message: "User is blocked", tag: "UserBlocked"});
                } else if (data?.tag === "TokenInvalid") {
                    return Promise.reject({message: "Invalid google login", tag: "TokenInvalid"});
                }
            } else if (status === 204) {
                if (data?.tag === "UserDeleted") {
                    return Promise.reject({message: "User deleted", tag: "UserDeleted"});
                }
            }
            return Promise.reject({message: data?.message || "Something went wrong", status, tag: "Unexpected"});
        }

        return Promise.reject({message: error.message || "Network error", tag: "Unexpected"});
    }
}
