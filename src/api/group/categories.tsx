import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { expense_category } from "@/src/constants/expense";
import {
    SaveGroupCategoryRequest,
    SaveGroupCategoryResponse,
} from "@/src/interfaces/group"; // <-- define request/response interfaces

export const saveGroupCategoryApi = async (
    payload: SaveGroupCategoryRequest
): Promise<{
    message: string;
    tag: string;
    data: SaveGroupCategoryResponse;
}> => {
    try {
        const res = await axiosUserInstance.post("/group/category/", payload);

        if (res.status === 201 && res.data?.success) {
            return {
                message: res.data?.message || "Category created successfully",
                tag: "CategoryCreated",
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
                    if (detail?.error === "duplicate_category") {
                        return Promise.reject({
                            message: detail?.message || "Duplicate category",
                            tag: "DuplicateCategory",
                        });
                    }
                    return Promise.reject({
                        message: detail?.message || "Bad request",
                        tag: "BadRequest",
                    });

                case 403:
                    return Promise.reject({
                        message: detail?.message || "Forbidden",
                        tag: "Forbidden",
                    });

                case 404:
                    if (detail?.error === "owner_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Owner not found",
                            tag: "OwnerNotFound",
                        });
                    }
                    return Promise.reject({
                        message: detail?.message || "Resource not found",
                        tag: "NotFound",
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
