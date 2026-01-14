import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {
    AddCustomUserRequest,
    AddCustomUserResponse,
} from "@/src/interfaces/customUser";

export const addCustomUserApi = async (
    payload: AddCustomUserRequest
): Promise<{
    message: string;
    tag: string;
    data: AddCustomUserResponse;
}> => {
    try {
        const res = await axiosUserInstance.post("/user/custom/", payload);

        if (res.status === 201) {
            return {
                message: "Custom user created successfully",
                tag: "CustomUserCreated",
                data: res.data,
            };
        }

        return Promise.reject({
            message: "Unexpected response",
            status: res.status,
            tag: "Unexpected",
        });
    } catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            const detail = data?.detail || data;

            switch (status) {
                case 404:
                    if (detail?.error === "user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "User not found",
                            tag: "UserNotFound",
                        });
                    }
                    if (detail?.error === "relationship_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Relationship not found",
                            tag: "RelationshipNotFound",
                        });
                    }
                    return Promise.reject({
                        message: detail?.message || "Resource not found",
                        tag: "NotFound",
                    });

                case 409:
                    if (detail?.error === "user_already_exists") {
                        return Promise.reject({
                            message: detail?.message || "Custom user already exists",
                            tag: "UserAlreadyExists",
                        });
                    }
                    return Promise.reject({
                        message: detail?.message || "Conflict",
                        tag: "Conflict",
                    });

                case 500:
                    return Promise.reject({
                        message: detail?.message || "Server error",
                        tag: "ServerError",
                    });

                default:
                    return Promise.reject({
                        message: detail?.message || "Something went wrong",
                        status,
                        tag: "Unexpected",
                    });
            }
        }

        return Promise.reject({
            message: error.message || "Network error",
            tag: "Unexpected",
        });
    }
};
