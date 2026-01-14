import axiosUserInstance from "@/src/api/axiosUserServiceInstance";

export const testApi = async () => {
    try {
        const res = await axiosUserInstance.get("/test");
        console.info("Test api res: ", res);
        if (res.status === 200) {
            return { message: "success" };
        }
        console.info("Test Api response data: " , res.data);
        return Promise.reject({ message: "Unexpected response", tag: "Unexpected" });
    } catch (error: any) {
        console.error("Test Api error", error);
        const { response } = error;
        console.error("Test Api response:", response);
        if (response) {
            const { data } = response;
            return Promise.reject({
                message: data?.message || "Something went wrong",
                tag: data?.tag || `Error`,
            });
        }
        return Promise.reject({ message: error.message || "Network error", tag: "NetworkError" });
    }
}