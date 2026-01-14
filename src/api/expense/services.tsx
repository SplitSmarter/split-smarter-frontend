import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { expense_service } from "@/src/constants/expense";
import {
    GetExpenseServicesParams,
    GetExpenseServicesResponse,
    GetExpenseServiceByIdResponse
} from "@/src/interfaces/expense";

export const getExpenseServicesApi = async (
    params: GetExpenseServicesParams = {}
): Promise<{
    message: string;
    tag: string;
    data: GetExpenseServicesResponse;
}> => {
    try {
        const {
            category_type = [
                expense_service.custom,
                expense_service.default,
            ],
            offset = 0,
            limit = 100,
        } = params;

        const res = await axiosUserInstance.get("/expense/service/", {
            params: {
                category_type,
                offset,
                limit,
            },
            paramsSerializer: {
                indexes: null, // so `category_type=custom&category_type=default`
            },
        });

        if (res.status === 200 && res.data?.success) {
            return {
                message: "Services fetched successfully",
                tag: "ServicesFetched",
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

export const getExpenseServiceByIdApi = async (
    serviceId: number
): Promise<{
    message: string;
    tag: string;
    data: GetExpenseServiceByIdResponse;
}> => {
    try {
        const res = await axiosUserInstance.get(`/expense/service/${serviceId}`);

        if (res.status === 200 && res.data?.success) {
            return {
                message: "Service fetched successfully",
                tag: "ServiceFetched",
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
                    if (detail?.error === "service_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Service not found",
                            tag: "ServiceNotFound",
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
