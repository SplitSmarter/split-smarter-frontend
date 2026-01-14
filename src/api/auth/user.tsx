import axiosAuthInstance from "@/src/api/axiosAuthInstance";

export const getUsernameApi = async (): Promise<{ username: string }> => {
    try {
        const res = await axiosAuthInstance.get("/username");
        if (res.status === 200 && res.data?.username) {
            return { username: res.data.username };
        }
        return Promise.reject({ message: "Unexpected response", tag: "Unexpected" });
    } catch (error: any) {
        const { response } = error;
        if (response) {
            const { data } = response;
            return Promise.reject({
                message: data?.message || "Something went wrong",
                tag: data?.tag || `Error`,
            });
        }
        return Promise.reject({ message: error.message || "Network error", tag: "NetworkError" });
    }
};
