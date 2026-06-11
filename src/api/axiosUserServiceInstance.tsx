import { refreshAccessTokenApi } from "@/src/api/auth/token";
import { BACKEND_HOSTNAME } from "@/src/config/config";
import { authStore } from "@/src/store/authStore";
import { getAccessToken, setAccessToken } from "@/src/utils/token";
import axios from "axios";

export const getLogoutHandler = () => {
    const {logout} = authStore.getState();
    return logout;
};

const axiosUserInstance = axios.create({
    baseURL: BACKEND_HOSTNAME + "/api/internal/users",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 60000,
});

axiosUserInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.info(`[User Request] method=${config.method?.toUpperCase()} url=${fullUrl} payload=`, config.data || '{}');

        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
    console.info(`[Auth Queue] Processing sub-requests queue. Count=${failedQueue.length} Status=${error ? 'REJECT' : 'RESOLVE'}`);
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
        const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`;
        console.info(`[User Response] method=${response.config.method?.toUpperCase()} url=${fullUrl} code=${response.status} payload=`, response.data || '{}');
        return response;
    },
    async (error) => {
        const originalRequest = error?.config;
        const fullUrl = originalRequest ? `${originalRequest.baseURL || ''}${originalRequest.url || ''}` : 'UNKNOWN';
        if (error.response?.data) {
            console.warn(`[User Response Error] url=${fullUrl} status=${error.response?.status} payload=`, error.response.data);
        } else {
            console.error(`[User Network/Runtime Error] message=${error.message} url=${fullUrl}`);
        }
        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                console.info(`[Auth Interceptor] 401 detected for url=${fullUrl}. Token refresh already in progress. Queueing request.`);
                // if first request is fetching the updated token then this is for subsequent requests
                return await new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axiosUserInstance(originalRequest); // Retry with updated token
                    })
                    .catch(async (err) => {
                        const logout = getLogoutHandler();
                        if (logout) await logout();
                        return Promise.reject({
                            "success": false,
                            "message": "Session Expired",
                            "tag": "session expired"
                        });
                    });
            } else {

                originalRequest._retry = true; // keeps track of original request
                isRefreshing = true; // so subsequent request hits queue

                try {
                    const result = await refreshAccessTokenApi();
                    if (result.success && result.access_token) {
                        const {access_token} = result;
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
                        return Promise.reject({success: false, tag: knownErr.tag, message: knownErr.message});
                    }

                    return Promise.reject({success: false, tag: "Unknown", message: "Unexpected error"});
                } finally {
                    isRefreshing = false;
                }
            }
        } else {
            console.log("⚠️ Not a 401 or already retried. Forwarding error.");
        }
        return Promise.reject(error);
    }
);

export default axiosUserInstance;