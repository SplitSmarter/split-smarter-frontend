import axiosGatewayInstance from "@/src/api/axiosGatewayInstance";
import {setAccessToken} from "@/src/utils/token";
import {authStore} from "@/src/store/authStore";

export const getLogoutHandler = () => {
    const { logout } = authStore.getState();
    return logout;
};

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

export const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

export const setupInterceptor = (axiosInstance: any) => {
    axiosInstance.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
            console.error("🛑 Interceptor caught error:", error);
            const originalRequest = error?.config;

            if (!originalRequest) {
                return Promise.reject(error); // Bail early
            }

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return await new Promise(function (resolve, reject) {
                            failedQueue.push({ resolve, reject });
                        })
                        .then((token) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return axiosInstance(originalRequest); // ✅ Retry with correct instance
                        })
                        .catch(async err => {
                            const logout = getLogoutHandler();
                            if (logout) {
                                await logout(); // 👈 Logout if refresh fails
                            }
                            return Promise.reject(err);
                        });

                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const res = await axiosGatewayInstance.get("/token/access");
                    const newAccessToken = res.headers['authorization'];
                    console.log("New Access token received");
                    if (newAccessToken) {
                        const access_token = newAccessToken.replace(/^Bearer\s+/i, "");
                        await setAccessToken(access_token);
                        processQueue(null, access_token);
                        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                        return axiosInstance(originalRequest);
                    } else {
                        throw new Error("No access token in refresh response");
                    }
                } catch (err) {
                    const logout = getLogoutHandler();
                    if (logout) {
                        await logout();
                    }
                    console.error("Error getting refresh token: ", err);
                    processQueue(err, null);
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }
            else {
                console.log("⚠️ Not a 401 or already retried. Forwarding error.");
            }
            return Promise.reject(error);
        }
    );
};
