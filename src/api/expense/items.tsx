import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {
    GetExpenseItemsParams,
    GetExpenseItemsResponse,
    GetExpenseItemByIdResponse
} from "@/src/interfaces/expense";

export const getExpenseItemsApi = async (
    params: GetExpenseItemsParams = {}
): Promise<{
    message: string;
    tag: string;
    data: GetExpenseItemsResponse;
}> => {
    try {
        const {
            category_type = ["custom", "default"],
            offset = 0,
            limit = 100,
        } = params;

        const res = await axiosUserInstance.get("/expense/item/", {
            params: {
                category_type,
                offset,
                limit,
            },
            paramsSerializer: {
                indexes: null, // produces ?category_type=custom&category_type=default
            },
        });

        if (res.status === 200 && res.data?.success) {
            return {
                message: "Items fetched successfully",
                tag: "ItemsFetched",
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
                case 404:
                    if (detail?.error === "user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "User not found",
                            tag: "UserNotFound",
                        });
                    }
                    break;
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

export const getExpenseItemByIdApi = async (
    itemId: number
): Promise<{
    message: string;
    tag: string;
    data: GetExpenseItemByIdResponse;
}> => {
    try {
        const res = await axiosUserInstance.get(`/expense/item/${itemId}`);

        if (res.status === 200 && res.data?.success) {
            return {
                message: "Item fetched successfully",
                tag: "ItemFetched",
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
                case 404:
                    if (detail?.error === "item_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Item not found",
                            tag: "ItemNotFound",
                        });
                    } else if (detail?.error === "user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "User not found",
                            tag: "UserNotFound",
                        });
                    }
                    break;
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
