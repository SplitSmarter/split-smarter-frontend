import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import {AddExpenseForm} from "@/src/interfaces/expense";

export const AddExpenseApi = async (data: AddExpenseForm) => {
    try {
        const res = await axiosUserInstance.post("/expense/", data);

        if (res.status === 201) {
            return {
                message: "Expense created successfully",
                tag: "ExpenseCreated",
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
            const {status, data} = error.response;
            const detail = data?.detail || data;

            switch (status) {
                case 404:
                    if (detail?.error === "user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "User not found",
                            tag: "UserNotFound",
                            field: detail?.field,
                        });
                    } else if (detail?.error === "paid_by_user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Paid-by user not found",
                            tag: "PaidByUserNotFound",
                            field: detail?.field,
                        });
                    } else if (detail?.error === "category_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Category not found",
                            tag: "CategoryNotFound",
                            field: detail?.field,
                        });
                    } else if (detail?.error === "group_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Group not found",
                            tag: "GroupNotFound",
                            field: detail?.field,
                        });
                    } else if (detail?.error === "service_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Service not found",
                            tag: "ServiceNotFound",
                            field: detail?.field,
                        });
                    } else if (detail?.error === "item_not_found") {
                        return Promise.reject({
                            message: detail?.message || "Item not found",
                            tag: "ItemNotFound",
                            field: detail?.field,
                        });
                    }
                    break;

                case 409:
                    if (detail?.error === "name_exists") {
                        return Promise.reject({
                            message: detail?.message || "Expense with this name already exists",
                            tag: "NameExists",
                            field: detail?.field,
                        });
                    }
                    break;

                case 422:
                    if (detail?.error === "invalid_contribution_value") {
                        return Promise.reject({
                            message: detail?.message || "Invalid contribution value",
                            tag: "InvalidContribution",
                            field: detail?.field,
                        });
                    }
                    break;

                case 400:
                    if (detail?.error === "math_precision_error") {
                        return Promise.reject({
                            message: detail?.message || "Contribution must sum to 1.0",
                            tag: "MathPrecisionError",
                        });
                    }
                    break;

                case 500:
                    return Promise.reject({
                        message: detail?.message || "Server error",
                        tag: "ServerError",
                    });
            }

            return Promise.reject({
                message: detail?.message || "Something went wrong",
                status,
                tag: "Unexpected",
            });
        }

        return Promise.reject({
            message: error.message || "Network error",
            tag: "Unexpected",
        });
    }
};
