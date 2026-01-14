import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {
    SaveGroupRequest,
    SaveGroupResponse,
} from "@/src/interfaces/group";

export const saveGroupApi = async (
    payload: SaveGroupRequest
): Promise<{
    message: string;
    tag: string;
    data: SaveGroupResponse;
}> => {
    try {
        const res = await axiosUserInstance.post("/group/", payload);

        if (res.status === 201 && res.data?.success) {
            return {
                message: res.data?.message || "Group created successfully",
                tag: "GroupCreated",
                data: res.data.data,
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
                case 400:
                    return Promise.reject({
                        message: detail?.message || "Bad request",
                        tag: "BadRequest",
                    });

                case 404:
                    if (detail?.error === "user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "User not found",
                            tag: "UserNotFound",
                        });
                    }
                    if (detail?.error === "category_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Category not found",
                            tag: "CategoryNotFound",
                        });
                    }
                    return Promise.reject({
                        message: detail?.message || "Resource not found",
                        tag: "NotFound",
                    });

                case 409:
                    if (detail?.error === "title_conflict") {
                        return Promise.reject({
                            message: detail?.message || "Group title already exists",
                            tag: "TitleConflict",
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
