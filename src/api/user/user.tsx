import axiosUserServiceInstance from "@/src/api/axiosUserServiceInstance";

export const GetMyDetailsApi = async () => {
    try {
        const res = await axiosUserServiceInstance.get("/user/me");

        if (res.status === 200 && res.data.success) {
            return res.data.data.user;
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
