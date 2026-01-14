import axios from "axios";
import {BACKEND_HOSTNAME} from "@/src/config/config"
import { getAccessToken } from "@/src/utils/token";

const axiosGatewayInstance = axios.create({
    baseURL: BACKEND_HOSTNAME + "/api/gateway",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000,
});

axiosGatewayInstance.interceptors.request.use(
    async (config) => {
        config.headers["X-Time-Zone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
        console.info("Gateway Request URL:", fullUrl);
        if (config.data) console.info("Gateway Request Payload:", config.data);
        if (config.headers["Authorization"])console.info("Gateway Request Authorization:", config.headers["Authorization"]);

        return config;
    },
    (error) => Promise.reject(error)
);

axiosGatewayInstance.interceptors.response.use(
    async (response) => {

        console.info(`Gateway Response Status: ${response.status} `);
        if (response.data) console.info("Gateway Response Payload:", response.data);
        if (response.headers["Authorization"])console.info("Gateway Response Authorization:", response.headers["Authorization"]);

        return response;
    },
    (error) => {

        console.info("Gateway Error:", "baseURL:[", error.config.baseURL,"] status:[", error.config.status, "]data:[", error.data, "]");
        if (error.response) {
            console.error(`Gateway Response Error : status ${error.response?.status}, data: ${JSON.stringify(error.response?.data)}`);
            // console.error(`Gateway Response Error : status ${error.response?.status}, data: ${error.response?.data}`);
        } else if (error.request) {
            console.warn("Gateway No response received from server");
        } else {
            console.warn("Gateway Network Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosGatewayInstance;