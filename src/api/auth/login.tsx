import axiosAuthInstance from "@/src/api/axiosAuthInstance";
import {CredentialsLoginForm, GoogleLoginForm} from "@/src/types/auth";

export const CredentialLoginApi = async (data: CredentialsLoginForm) => {
    try {
        const res = await axiosAuthInstance.post("/login/credentials", data);
        if (res.status === 200) {
            const rawHeader = res.headers.authorization || "";
            const access_token = rawHeader.replace(/^Bearer\s+/i, "");
            return {message: "Logged in successfully",
                    tag: "UserLoggedIn",
                    username: res.data.username,
                    access_token: access_token,
                    email: res.data.email};
        }
        return Promise.reject({message: "Unexcepted error", status: res.status, tag: "Unexpected"});
    } catch (error: any) {
        if (error.response) {
            const {status, data} = error.response;
            if (status === 204 && data?.tag === "UserDeleted") {
                return Promise.reject({message: "User deleted", tag: "UserDeleted"});
            } else if (status === 403) {
                if (data?.field === "InvalidField" && data?.field === "password") {
                    return Promise.reject({
                        message: "Password did not match",
                        tag: "InvalidField",
                        field: "password"
                    });
                } else if (data?.tag === "UserBlocked") {
                    return Promise.reject({message: "User is blocked", tag: "UserBlocked"});
                }
            } else if (status === 404 && data?.tag === "InvalidField" && data?.field === "emailOrUsername") {
                return Promise.reject({
                    message: "Invalid username or email",
                    tag: "InvalidField",
                    field: "emailOrUsername"
                });
            } else if (status === 422) {
                return Promise.reject({message: data?.message || "Invalid input", tag: "InvalidField"});
            }
            return Promise.reject({message: data?.message || "Something went wrong", status, tag: "Unexpected"});
        }
        return Promise.reject({message: error.message || "Network error", "tag": "NetworkError"});
    }
};

export const GoogleLoginApi = async (data: GoogleLoginForm) => {
    try {
        const res = await axiosAuthInstance.post("/login/google", data);
        if (res.status === 200) {
            return {message: "Logged in successfully", tag: "UserLoggedIn"};
        }
        return Promise.reject({message: "Unexcepted error", status: res.status, tag: "Unexpected"});
    } catch (error: any) {
        if (error.response) {
            const {status, data} = error.response;
            if (status === 204 && data?.tag === "UserDeleted") {
                return Promise.reject({message: "User deleted", tag: "UserDeleted"});
            } else if (status === 403) {
                if (data?.field === "InvalidField" && data?.field === "idToken") {
                    return Promise.reject({
                        message: "Google login is invalid",
                        tag: "InvalidField",
                        field: "idToken"
                    });
                } else if (data?.tag === "UserBlocked") {
                    return Promise.reject({
                        message: "User is blocked", tag: "UserBlocked"
                    });
                }
            } else if (status === 404 && data?.tag === "UserNotFound") {
                return Promise.reject({
                    message: "User does not found", tag: "UserNotFound",
                });
            } else if (status === 422) {
                return Promise.reject({message: data?.message || "Invalid input", tag: "InvalidField"});
            }
            return Promise.reject({message: data?.message || "Something went wrong", status, tag: "Unexpected"});
        }
        return Promise.reject({message: error.message || "Network error", "tag": "NetworkError"});
    }
};
