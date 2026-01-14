import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { RelationWithUserType } from "@/src/constants/expense";
import { GetRelationsResponse } from "@/src/interfaces/relation";

export const getRelationsApi = async (
    params?: {
        relation_type?: RelationWithUserType[];
        offset?: number;
        limit?: number;
    }
): Promise<{
    message: string;
    tag: string;
    data: GetRelationsResponse;
}> => {
    try {
        const res = await axiosUserInstance.get("/user/relation/my", {
            params,
        });

        if (res.status === 200 && res.data?.data) {
            return {
                message: res.data?.message || "Relations fetched successfully",
                tag: "RelationsFetched",
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
                    if (detail?.error === "with_user_not_found") {
                        return Promise.reject({
                            message: detail?.message || "With user not found",
                            tag: "WithUserNotFound",
                        });
                    }
                    return Promise.reject({
                        message: detail?.message || "Not found",
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
