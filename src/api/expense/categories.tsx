import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {expense_category} from "@/src/constants/expense";
import {GetExpenseCategoriesResponse, GetExpenseCategoriesParams, GetExpenseCategoryByIdResponse} from "@/src/interfaces/expense";

export const getExpenseCategoriesApi = async (
    params: GetExpenseCategoriesParams = {}
): Promise<{
    message: string;
    tag: string;
    data: GetExpenseCategoriesResponse;
}> => {
    try {
        console.info(params);
        const {
            category_type = [expense_category.custom, expense_category.default],
            offset = 0,
            limit = 100,
        } = params;

        const res = await axiosUserInstance.get("/expense/category/", {
            params: {
                category_type,
                offset,
                limit,
            },
            paramsSerializer: {
                indexes: null,
            },
        });

        if (res.status === 200 && res.data?.success) {
            return {
                message: "Categories fetched successfully",
                tag: "CategoriesFetched",
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

export const getExpenseCategoryByIdApi = async (
    categoryId: number
): Promise<{
    message: string;
    tag: string;
    data: GetExpenseCategoryByIdResponse;
}> => {
    try {
        const res = await axiosUserInstance.get(`/expense/category/${categoryId}`);

        if (res.status === 200 && res.data?.success) {
            return {
                message: "Category fetched successfully",
                tag: "CategoryFetched",
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
                    if (detail?.error === "category_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Category not found",
                            tag: "CategoryNotFound",
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
