import axios from "axios";
import {BACKEND_HOSTNAME} from "@/src/config/config"
import { getAccessToken } from "@/src/utils/token";

const axiosInternalInstance = axios.create({
    baseURL: BACKEND_HOSTNAME + "/api/internal",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

axiosInternalInstance.interceptors.request.use(
    async (config) => {
        const accessToken = await getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        config.headers["X-Time-Zone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.info("Internal Request URL:", fullUrl);
        if (config.data) console.info("Internal Request Payload:", config.data);
        if (config.headers["Authorization"])console.info("Internal Request Authorization:", config.headers["Authorization"]);

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInternalInstance.interceptors.response.use(
    async (response) => {
        console.info(`Internal Response Status: ${response.status} `);
        if (response.data) console.info("Internal Response Payload:", response.data);
        if (response.headers["Authorization"])console.info("Internal Response Authorization:", response.headers["Authorization"]);

        return response;
    },
    (error) => {
        // console.error("Internal Error:", "baseURL:[", error.baseURL,"] status:[", error.status, "]data:[", error.data, "]");
        console.error("Internal Error:", "baseURL:[", error.config["baseURL"],"] status:[", error.config["status"], "]data:[", error.config["data"], "]");

        if (error.response) {
            console.error(`Internal Response : status${error.response.status} data[${error.response.data}]`);
            // console.info(`Response ${error.response.status}`);
            // if (error.response.data) console.info("Response Payload:", error.response.data);
        } else if (error.request) {
            console.warn("Internal No response received from server");
        } else {
            console.error("Network Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInternalInstance;