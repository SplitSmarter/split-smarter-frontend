import axios from "axios";
import {BACKEND_HOSTNAME} from "@/src/config/config"
import { getAccessToken, setAccessToken } from "@/src/utils/token";
import {refreshAccessTokenApi} from "@/src/api/auth/token";
import {useAuthStore} from "@/src/store/authStore";


export const getLogoutHandler = () => {
    const { logout } = useAuthStore.getState();
    return logout;
};

const axiosUserInstance = axios.create({
    baseURL: BACKEND_HOSTNAME + "/api/internal/users",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

axiosUserInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        config.headers["X-Time-Zone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.info("User Request URL:", fullUrl);
        if (config.data) console.info("User Request Payload:", config.data);
        if (config.headers["Authorization"])console.info("User Request Authorization:", config.headers["Authorization"]);

        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

axiosUserInstance.interceptors.response.use(
    async (response) => {

        console.info(`User Response Status: ${response.status} `);
        if (response.data) console.info("User Response Payload:", response.data);
        if (response.headers["Authorization"])console.info("User Response Authorization:", response.headers["Authorization"]);

        return response;
    },
    async (error) => {
        const originalRequest = error?.config;
        if (error.response?.data) console.info("User Response Error Payload:", error.response.data);
        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // if first request is fetching the updated token then this is for subsequent requests
                return await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axiosUserInstance(originalRequest); // Retry with updated token
                    })
                    .catch(async (err) => {
                        const logout = getLogoutHandler();
                        if (logout) await logout();
                        return Promise.reject({"success": false, "message": "Session Expired", "tag": "session expired"});
                    });
            }
            else{

                originalRequest._retry = true; // keeps track of original request
                isRefreshing = true; // so subsequent request hits queue

                try {
                    const result = await refreshAccessTokenApi();
                    if (result.success && result.access_token) {
                        const { access_token } = result;
                        await setAccessToken(access_token);
                        processQueue(null, access_token);
                        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                        return axiosUserInstance(originalRequest);
                    }
                    return Promise.reject({"success": false, message: result.message});
                } catch (err) {
                    console.error("Error getting access token: ", err);

                    const logout = getLogoutHandler();
                    if (logout) await logout();

                    processQueue(err, null);

                    if (typeof err === "object" && err !== null && "tag" in err && "message" in err) {
                        const knownErr = err as { tag: string; message: string };
                        return Promise.reject({ success: false, tag: knownErr.tag, message: knownErr.message });
                    }

                    return Promise.reject({ success: false, tag: "Unknown", message: "Unexpected error" });
                } finally {
                    isRefreshing = false;
                }
            }
        } else {
            console.log("⚠️ Not a 401 or already retried. Forwarding error.");
        }

        // if (error.response) {
        //     console.error(`User Response Error : status ${error.response?.status}, data: ${JSON.stringify(error.response?.data)}`);
        //     // console.error(`User Response Error : status ${error.response.status}, data: ${error.response.data}`);
        // } else if (error.request) {
        //     console.warn("User No response received from server");
        // } else {
        //     console.warn("User Network Error:", error.message);
        // }

        return Promise.reject(error);
    }
);

export default axiosUserInstance;