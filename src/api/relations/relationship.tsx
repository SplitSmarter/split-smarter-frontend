import axiosUserInstance from "@/src/api/axiosUserServiceInstance";
import { GetMyRelationshipsResponse } from "@/src/interfaces/relationship";

export const getMyRelationshipsApi = async (
    offset: number = 0,
    limit: number = 50
): Promise<{
    message: string;
    tag: string;
    data: GetMyRelationshipsResponse;
}> => {
    try {
        const res = await axiosUserInstance.get("/user/relationship/my", {
            params: { offset, limit },
        });

        if (res.status === 200 && res.data?.data) {
            return {
                message: res.data?.message || "Relationships fetched successfully",
                tag: "RelationshipsFetched",
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
